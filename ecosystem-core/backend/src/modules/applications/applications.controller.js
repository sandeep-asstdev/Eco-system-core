import prisma from '../../config/db.js';
import http from 'http';
import https from 'https';
import crypto from 'crypto';
import { validateAppManifest, REGISTERED_EVENT_SCHEMAS } from '@automobile-ecosystem/sdk';

const BROKER_HTTP_URL = process.env.BROKER_HTTP_URL || 'http://localhost:15672';

/**
 * SSRF Safe URL Fetcher for Manifests
 * Restricts access to cloud metadata services and enforces limits on timeouts, payload sizes, and redirects.
 */
async function fetchSafeManifest(targetUrlStr, redirectCount = 0) {
  if (redirectCount > 2) {
    throw new Error('Too many redirects while fetching manifest (max 2 allowed).');
  }

  let parsed;
  try {
    parsed = new URL(targetUrlStr);
  } catch (_) {
    throw new Error(`Invalid manifest URL: '${targetUrlStr}'.`);
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`Forbidden protocol '${parsed.protocol}'. Only http and https are permitted.`);
  }

  const hostname = parsed.hostname.toLowerCase();

  // Cloud metadata and dangerous hostnames
  const BLOCKED_HOSTS = [
    '169.254.169.254',
    'metadata.google.internal',
    'metadata.azure.com',
    '100.100.100.200',
    'instance-data'
  ];
  if (BLOCKED_HOSTS.includes(hostname)) {
    throw new Error(`Access to metadata address '${hostname}' is strictly blocked for security.`);
  }

  // Private IP checks in non-development environments
  const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  if (!isDev) {
    // Block RFC 1918 private subnets in production
    const isPrivate = /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|127\.|0\.)/.test(hostname) || hostname === 'localhost';
    if (isPrivate) {
      throw new Error(`Access to private IP space '${hostname}' is prohibited in production mode.`);
    }
  }

  const client = parsed.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const req = client.request(parsed, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AutomobileEcosystem-AppRegistry/1.0'
      },
      timeout: 5000
    }, (res) => {
      // Handle redirects securely
      if (res.statusCode >= 301 && res.statusCode <= 308 && res.headers.location) {
        const nextUrl = new URL(res.headers.location, parsed).toString();
        res.resume();
        return resolve(fetchSafeManifest(nextUrl, redirectCount + 1));
      }

      if (res.statusCode < 200 || res.statusCode >= 300) {
        res.resume();
        return reject(new Error(`Server responded with HTTP status ${res.statusCode}`));
      }

      let rawData = '';
      let bytesCount = 0;
      const MAX_BYTES = 100 * 1024; // 100 KB max payload size

      res.on('data', (chunk) => {
        bytesCount += chunk.length;
        if (bytesCount > MAX_BYTES) {
          req.destroy();
          return reject(new Error(`Manifest payload exceeded maximum permitted size of 100 KB.`));
        }
        rawData += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(rawData);
          resolve(json);
        } catch (e) {
          reject(new Error(`Failed to parse manifest JSON: ${e.message}`));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timed out fetching application manifest (limit: 5s).'));
    });

    req.on('error', (err) => {
      reject(new Error(`Network error while fetching manifest: ${err.message}`));
    });

    req.end();
  });
}

/**
 * Helper to dynamically declare queue and bindings on broker
 */
async function provisionBrokerSubscriptions(appKey, subscribes = []) {
  if (!subscribes || subscribes.length === 0) return;
  const queueName = `${appKey}.events`;

  try {
    // 1. Declare Queue
    await fetch(`${BROKER_HTTP_URL}/api/queues/declare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queueName, options: { durable: true } })
    });

    // 2. Bind each subscription pattern
    for (const pattern of subscribes) {
      await fetch(`${BROKER_HTTP_URL}/api/bindings/declare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queueName,
          exchange: 'automobile.events.topic',
          pattern: pattern.trim()
        })
      });
    }
  } catch (err) {
    console.warn(`[REGISTRY] Note: Could not auto-provision broker bindings: ${err.message}`);
  }
}

/**
 * Fetch and validate manifest from external URL with SSRF protections.
 * POST /api/v1/applications/manifest/fetch
 */
export async function fetchManifestEndpoint(req, res, next) {
  try {
    const url = req.body.url || req.body.manifestUrl;
    if (!url) {
      return res.status(400).json({ success: false, error: { message: 'URL is required.' } });
    }

    const rawManifest = await fetchSafeManifest(url.trim());
    const validation = validateAppManifest(rawManifest);

    if (!validation.valid) {
      return res.status(422).json({
        success: false,
        error: {
          message: 'Fetched manifest failed validation.',
          details: validation.errors
        },
        data: { raw: rawManifest }
      });
    }

    res.json({
      success: true,
      data: {
        sourceUrl: url.trim(),
        manifest: validation.sanitized
      }
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: { message: error.message } });
  }
}

/**
 * Validate manifest payload directly (e.g. from JSON file upload).
 * POST /api/v1/applications/manifest/validate
 */
export async function validateManifestEndpoint(req, res, next) {
  try {
    const manifest = req.body.manifest || req.body;
    const validation = validateAppManifest(manifest);

    if (!validation.valid) {
      return res.status(422).json({
        success: false,
        error: {
          message: 'Manifest schema validation failed.',
          details: validation.errors
        }
      });
    }

    res.json({
      success: true,
      data: {
        valid: true,
        manifest: validation.sanitized
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Lists registered applications with tenant subscription status and capabilities.
 * GET /api/v1/applications
 */
export async function getApplications(req, res, next) {
  try {
    const { category, status } = req.query;
    const where = {};
    if (category) where.category = category.toUpperCase();
    if (status) where.status = status.toUpperCase();

    const apps = await prisma.application.findMany({
      where,
      include: {
        tenantApplications: {
          include: { tenant: { select: { id: true, name: true, code: true } } }
        },
        permissions: { select: { id: true, code: true, domain: true, resource: true, action: true } }
      },
      orderBy: { name: 'asc' }
    });

    const enriched = apps.map(app => {
      const tenantSub = req.tenantId 
        ? app.tenantApplications?.find(ta => ta.tenantId === req.tenantId)
        : null;

      const isSubscribed = req.isPlatformAdmin 
        ? true 
        : Boolean(tenantSub && tenantSub.status === 'ACTIVE');

      return {
        id: app.id,
        appKey: app.appKey,
        code: app.code || app.appKey.toUpperCase(),
        name: app.name,
        description: app.description,
        icon: app.icon || 'AppWindow',
        baseUrl: app.baseUrl,
        apiUrl: app.apiUrl,
        version: app.version,
        apiVersion: app.apiVersion || 'v1',
        category: app.category,
        capabilities: app.capabilities || [],
        requiredPermissions: app.requiredPermissions || [],
        supportedEvents: app.supportedEvents || [],
        subscribes: app.settings?.subscribes || [],
        auth: app.settings?.auth || { type: 'OIDC', redirectUris: [`${app.baseUrl}/callback`] },
        status: app.status || (app.isActive ? 'ACTIVE' : 'INACTIVE'),
        isActive: app.isActive && app.status === 'ACTIVE',
        isPublic: app.isPublic,
        availableTiers: app.availableTiers || ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'],
        healthEndpoint: app.healthEndpoint || '/api/health',
        isSubscribed,
        subscription: tenantSub || null,
        tenantSubscriptions: app.tenantApplications || [],
        declaredPermissions: app.permissions || []
      };
    });

    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieves single application by ID or appKey.
 * GET /api/v1/applications/:id
 */
export async function getApplication(req, res, next) {
  try {
    const { id } = req.params;
    const app = await prisma.application.findFirst({
      where: {
        OR: [{ id }, { appKey: id.toLowerCase() }, { code: id.toUpperCase() }]
      },
      include: {
        tenantApplications: {
          include: { tenant: { select: { id: true, name: true, code: true } } }
        },
        permissions: true
      }
    });

    if (!app) {
      return res.status(404).json({ success: false, error: { message: `Application '${id}' not found.` } });
    }

    const tenantSub = req.tenantId 
      ? app.tenantApplications?.find(ta => ta.tenantId === req.tenantId)
      : null;

    res.json({
      success: true,
      data: {
        ...app,
        code: app.code || app.appKey.toUpperCase(),
        subscribes: app.settings?.subscribes || [],
        auth: app.settings?.auth || { type: 'OIDC', redirectUris: [`${app.baseUrl}/callback`] },
        isSubscribed: req.isPlatformAdmin ? true : Boolean(tenantSub && tenantSub.status === 'ACTIVE'),
        subscription: tenantSub,
        tenantSubscriptions: app.tenantApplications
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Registers a new dynamic application via manifest or structured payload.
 * POST /api/v1/applications
 */
export async function registerApplication(req, res, next) {
  try {
    let payload = req.body;
    let manifestData = null;

    // If manifest object is provided or manifestVersion is present
    if (payload.manifest || payload.manifestVersion) {
      const toValidate = payload.manifest || payload;
      const validation = validateAppManifest(toValidate);
      if (!validation.valid) {
        return res.status(422).json({
          success: false,
          error: { message: 'Manifest validation failed.', details: validation.errors }
        });
      }
      manifestData = validation.sanitized;
    }

    const appKey = (manifestData?.appKey || payload.appKey || '').toLowerCase().trim();
    const name = manifestData?.name || payload.name;
    const baseUrl = manifestData?.frontendUrl || payload.frontendUrl || payload.baseUrl;
    const apiUrl = manifestData?.apiUrl || payload.apiUrl || baseUrl;

    if (!appKey || !name || !baseUrl) {
      return res.status(400).json({
        success: false,
        error: { message: 'appKey, name, and baseUrl (or frontendUrl) are required.' }
      });
    }

    // Check duplicate
    const existing = await prisma.application.findUnique({ where: { appKey } });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { message: `Application with appKey '${appKey}' is already registered.` }
      });
    }

    const category = (manifestData?.category || payload.category || 'OPERATIONS').toUpperCase();
    const version = manifestData?.version || payload.version || '1.0.0';
    const icon = manifestData?.icon || payload.icon || 'AppWindow';
    const permissions = manifestData?.permissions || payload.requiredPermissions || payload.permissions || [];
    const publishes = manifestData?.publishes || payload.supportedEvents || payload.publishes || [];
    const subscribes = manifestData?.subscribes || payload.subscribes || [];
    const authConfig = manifestData?.auth || payload.auth || {
      type: 'OIDC',
      redirectUris: [`${baseUrl.replace(/\/+$/, '')}/callback`]
    };

    const settings = {
      ...(payload.settings || {}),
      auth: authConfig,
      subscribes,
      registeredVia: manifestData ? 'MANIFEST' : 'MANUAL',
      registeredAt: new Date().toISOString()
    };

    // 1. Create Application
    const app = await prisma.application.create({
      data: {
        appKey,
        code: (payload.code || appKey).toUpperCase().trim(),
        name: name.trim(),
        description: manifestData?.description || payload.description || null,
        icon,
        baseUrl: baseUrl.trim(),
        apiUrl: apiUrl.trim(),
        version,
        apiVersion: payload.apiVersion || 'v1',
        category,
        capabilities: Array.isArray(payload.capabilities) ? payload.capabilities : ['sso', 'multi_tenant', 'event_driven'],
        requiredPermissions: permissions,
        supportedEvents: publishes,
        status: payload.status || 'ACTIVE',
        isPublic: payload.isPublic !== false,
        healthEndpoint: manifestData?.healthUrl ? new URL(manifestData.healthUrl).pathname : (payload.healthEndpoint || '/api/health'),
        isActive: payload.status !== 'INACTIVE',
        settings
      }
    });

    // 2. Provision Granular Permissions
    for (const permCode of permissions) {
      const parts = permCode.split('.');
      const domain = parts[0] || appKey;
      const resource = parts[1] || 'general';
      const action = parts[2] || 'access';

      await prisma.permission.upsert({
        where: { code: permCode },
        update: { applicationId: app.id },
        create: {
          code: permCode,
          domain,
          resource,
          action,
          description: `${name} ${domain} ${resource} ${action} permission`,
          applicationId: app.id
        }
      });
    }

    // 3. Auto-provision RabbitMQ Queue & Bindings
    if (subscribes.length > 0) {
      await provisionBrokerSubscriptions(appKey, subscribes);
    }

    // 4. Subscribe Specified Tenants (or current tenant)
    const targetTenantIds = Array.isArray(payload.tenantIds) && payload.tenantIds.length > 0
      ? payload.tenantIds
      : (req.tenantId && payload.autoSubscribe !== false ? [req.tenantId] : []);

    for (const tId of targetTenantIds) {
      await prisma.tenantApplication.upsert({
        where: { tenantId_applicationId: { tenantId: tId, applicationId: app.id } },
        update: { status: 'ACTIVE' },
        create: { tenantId: tId, applicationId: app.id, status: 'ACTIVE', planName: 'ENTERPRISE' }
      });
    }

    // 5. Audit Log
    if (req.user?.tenantId || req.tenantId) {
      await prisma.auditLog.create({
        data: {
          tenantId: req.user?.tenantId || req.tenantId,
          userId: req.user?.id || null,
          action: 'APPLICATION_REGISTERED',
          entityType: 'Application',
          entityId: app.id,
          newValue: { appKey, name, version, category, permissionsCount: permissions.length }
        }
      }).catch(() => {});
    }

    res.status(201).json({
      success: true,
      message: `Application '${app.name}' registered successfully with ${permissions.length} permissions and ${subscribes.length} event subscriptions.`,
      data: app
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Updates application metadata, lifecycle status, endpoints, or permissions.
 * PATCH /api/v1/applications/:id
 */
export async function updateApplication(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.application.findFirst({
      where: { OR: [{ id }, { appKey: id.toLowerCase() }] }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: { message: `Application '${id}' not found.` } });
    }

    const {
      name, description, icon, baseUrl, apiUrl, version, apiVersion,
      category, capabilities, requiredPermissions, supportedEvents,
      status, isPublic, healthEndpoint, settings, isActive, subscribes, auth
    } = req.body;

    const mergedSettings = {
      ...(existing.settings || {}),
      ...(settings || {})
    };
    if (subscribes !== undefined) mergedSettings.subscribes = subscribes;
    if (auth !== undefined) mergedSettings.auth = auth;

    const updated = await prisma.application.update({
      where: { id: existing.id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        description: description !== undefined ? description : undefined,
        icon: icon !== undefined ? icon : undefined,
        baseUrl: baseUrl !== undefined ? baseUrl.trim() : undefined,
        apiUrl: apiUrl !== undefined ? apiUrl.trim() : undefined,
        version: version !== undefined ? version : undefined,
        apiVersion: apiVersion !== undefined ? apiVersion : undefined,
        category: category !== undefined ? category.toUpperCase() : undefined,
        capabilities: Array.isArray(capabilities) ? capabilities : undefined,
        requiredPermissions: Array.isArray(requiredPermissions) ? requiredPermissions : undefined,
        supportedEvents: Array.isArray(supportedEvents) ? supportedEvents : undefined,
        status: status !== undefined ? status : undefined,
        isActive: isActive !== undefined ? isActive : (status ? status === 'ACTIVE' : undefined),
        isPublic: isPublic !== undefined ? isPublic : undefined,
        healthEndpoint: healthEndpoint !== undefined ? healthEndpoint : undefined,
        settings: mergedSettings
      }
    });

    // Update broker bindings if subscribes changed
    if (subscribes && Array.isArray(subscribes)) {
      await provisionBrokerSubscriptions(existing.appKey, subscribes);
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

/**
 * Unregisters an application from the ecosystem.
 * DELETE /api/v1/applications/:id
 */
export async function deleteApplication(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.application.findFirst({
      where: { OR: [{ id }, { appKey: id.toLowerCase() }] }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: { message: `Application '${id}' not found.` } });
    }

    // Protect core system apps from accidental deletion
    if (['hrflow', 'maintly'].includes(existing.appKey)) {
      return res.status(403).json({
        success: false,
        error: { message: `Core application '${existing.appKey}' cannot be deleted. You may suspend it instead.` }
      });
    }

    // Delete associated permissions and subscriptions first
    await prisma.rolePermission.deleteMany({
      where: { permission: { applicationId: existing.id } }
    });
    await prisma.permission.deleteMany({
      where: { applicationId: existing.id }
    });
    await prisma.tenantApplication.deleteMany({
      where: { applicationId: existing.id }
    });

    await prisma.application.delete({
      where: { id: existing.id }
    });

    res.json({
      success: true,
      message: `Application '${existing.name}' (${existing.appKey}) successfully unregistered and cleaned up.`
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Returns all Dealership Tenants with their subscription status for an application.
 * GET /api/v1/applications/:id/tenants
 */
export async function getApplicationTenants(req, res, next) {
  try {
    const { id } = req.params;
    const app = await prisma.application.findFirst({
      where: { OR: [{ id }, { appKey: id.toLowerCase() }] },
      include: { tenantApplications: true }
    });

    if (!app) {
      return res.status(404).json({ success: false, error: { message: `Application '${id}' not found.` } });
    }

    const allTenants = await prisma.tenant.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        legalName: true,
        city: true,
        state: true,
        status: true,
        subscriptionTier: true
      },
      orderBy: { name: 'asc' }
    });

    const tenantList = allTenants.map(t => {
      const sub = app.tenantApplications.find(ta => ta.tenantId === t.id);
      return {
        tenantId: t.id,
        code: t.code,
        name: t.name,
        legalName: t.legalName,
        city: t.city,
        state: t.state,
        tenantStatus: t.status,
        isSubscribed: Boolean(sub && sub.status === 'ACTIVE'),
        subscriptionStatus: sub ? sub.status : 'NOT_SUBSCRIBED',
        subscribedAt: sub?.createdAt || null
      };
    });

    res.json({
      success: true,
      data: {
        application: { id: app.id, appKey: app.appKey, name: app.name },
        tenants: tenantList
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Toggles or updates a tenant's subscription status for an application.
 * POST /api/v1/applications/:id/tenants/:tenantId/toggle
 */
export async function toggleTenantSubscription(req, res, next) {
  try {
    const { id, tenantId } = req.params;
    const { enable } = req.body;

    const app = await prisma.application.findFirst({
      where: { OR: [{ id }, { appKey: id.toLowerCase() }] }
    });
    if (!app) {
      return res.status(404).json({ success: false, error: { message: `Application '${id}' not found.` } });
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      return res.status(404).json({ success: false, error: { message: `Tenant '${tenantId}' not found.` } });
    }

    const existingSub = await prisma.tenantApplication.findUnique({
      where: { tenantId_applicationId: { tenantId, applicationId: app.id } }
    });

    let newStatus = 'ACTIVE';
    if (enable !== undefined) {
      newStatus = enable ? 'ACTIVE' : 'SUSPENDED';
    } else if (existingSub) {
      newStatus = existingSub.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    }

    const sub = await prisma.tenantApplication.upsert({
      where: { tenantId_applicationId: { tenantId, applicationId: app.id } },
      update: { status: newStatus },
      create: {
        tenantId,
        applicationId: app.id,
        status: newStatus,
        planName: 'ENTERPRISE'
      }
    });

    res.json({
      success: true,
      data: {
        applicationId: app.id,
        tenantId,
        status: sub.status,
        isSubscribed: sub.status === 'ACTIVE'
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Returns event integration details (publishes, subscribes, catalog, broker status).
 * GET /api/v1/applications/:id/events
 */
export async function getApplicationEvents(req, res, next) {
  try {
    const { id } = req.params;
    const app = await prisma.application.findFirst({
      where: { OR: [{ id }, { appKey: id.toLowerCase() }] }
    });

    if (!app) {
      return res.status(404).json({ success: false, error: { message: `Application '${id}' not found.` } });
    }

    // Fetch all declared ecosystem events from all applications
    const allApps = await prisma.application.findMany({
      select: { appKey: true, name: true, supportedEvents: true }
    });

    const catalog = [];
    allApps.forEach(a => {
      (a.supportedEvents || []).forEach(ev => {
        catalog.push({
          eventType: ev,
          publisherAppKey: a.appKey,
          publisherName: a.name,
          schema: REGISTERED_EVENT_SCHEMAS[ev] || null
        });
      });
    });

    // Also include canonical contracts in catalog
    Object.keys(REGISTERED_EVENT_SCHEMAS).forEach(ev => {
      if (!catalog.some(c => c.eventType === ev)) {
        catalog.push({
          eventType: ev,
          publisherAppKey: ev.split('.')[0] || 'ecosystem',
          publisherName: `${ev.split('.')[0]?.toUpperCase()} Service`,
          schema: REGISTERED_EVENT_SCHEMAS[ev]
        });
      }
    });

    res.json({
      success: true,
      data: {
        application: { id: app.id, appKey: app.appKey, name: app.name },
        publishes: app.supportedEvents || [],
        subscribes: app.settings?.subscribes || [],
        queueName: `${app.appKey}.events`,
        availableCatalog: catalog
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Updates an application's event subscriptions and binds them on the broker.
 * POST /api/v1/applications/:id/events/subscriptions
 */
export async function updateApplicationSubscriptions(req, res, next) {
  try {
    const { id } = req.params;
    const { subscribes } = req.body;

    if (!Array.isArray(subscribes)) {
      return res.status(400).json({ success: false, error: { message: "'subscribes' must be an array of event pattern strings." } });
    }

    const app = await prisma.application.findFirst({
      where: { OR: [{ id }, { appKey: id.toLowerCase() }] }
    });

    if (!app) {
      return res.status(404).json({ success: false, error: { message: `Application '${id}' not found.` } });
    }

    const cleanSubscribes = [...new Set(subscribes.map(s => String(s).trim()))];
    const settings = {
      ...(app.settings || {}),
      subscribes: cleanSubscribes
    };

    await prisma.application.update({
      where: { id: app.id },
      data: { settings }
    });

    // Provision queue and bindings on broker
    await provisionBrokerSubscriptions(app.appKey, cleanSubscribes);

    res.json({
      success: true,
      message: `Updated subscriptions for '${app.name}'. Active on queue '${app.appKey}.events'.`,
      data: { subscribes: cleanSubscribes }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Live health check test for a registered application.
 * GET/POST /api/v1/applications/:id/health
 */
export async function checkApplicationHealth(req, res, next) {
  try {
    const { id } = req.params;
    const app = await prisma.application.findFirst({
      where: { OR: [{ id }, { appKey: id.toLowerCase() }] }
    });

    if (!app) {
      return res.status(404).json({ success: false, error: { message: `Application '${id}' not found.` } });
    }

    const endpoint = app.healthEndpoint?.startsWith('/') ? app.healthEndpoint : `/${app.healthEndpoint || 'api/health'}`;
    const healthUrl = `${app.apiUrl.replace(/\/+$/, '')}${endpoint}`;
    const startTime = Date.now();

    try {
      const response = await fetch(healthUrl, { method: 'GET', signal: AbortSignal.timeout(3000) });
      const latencyMs = Date.now() - startTime;
      const isHealthy = response.ok;
      let body = null;
      try { body = await response.json(); } catch (_) {}

      res.json({
        success: true,
        data: {
          appKey: app.appKey,
          healthUrl,
          isHealthy,
          statusCode: response.status,
          latencyMs,
          details: body
        }
      });
    } catch (err) {
      res.json({
        success: true,
        data: {
          appKey: app.appKey,
          healthUrl,
          isHealthy: false,
          error: err.message,
          latencyMs: Date.now() - startTime
        }
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Legacy subscribe endpoint
 */
export async function subscribeApplication(req, res, next) {
  try {
    const applicationId = req.params.id || req.body.applicationId;
    const targetTenantId = req.body.tenantId || req.tenantId;

    if (!applicationId || !targetTenantId) {
      return res.status(400).json({ success: false, error: { message: 'applicationId and tenantId are required.' } });
    }

    const app = await prisma.application.findFirst({
      where: { OR: [{ id: applicationId }, { appKey: applicationId.toLowerCase() }] }
    });

    if (!app) {
      return res.status(404).json({ success: false, error: { message: `Application '${applicationId}' not found.` } });
    }

    const subscription = await prisma.tenantApplication.upsert({
      where: { tenantId_applicationId: { tenantId: targetTenantId, applicationId: app.id } },
      update: { status: 'ACTIVE' },
      create: { tenantId: targetTenantId, applicationId: app.id, status: 'ACTIVE', planName: 'ENTERPRISE' },
      include: { application: true }
    });

    res.json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
}

/**
 * Legacy unsubscribe endpoint
 */
export async function unsubscribeApplication(req, res, next) {
  try {
    const applicationId = req.params.id || req.body.applicationId;
    const targetTenantId = req.body.tenantId || req.tenantId;

    if (!applicationId || !targetTenantId) {
      return res.status(400).json({ success: false, error: { message: 'applicationId and tenantId are required.' } });
    }

    const app = await prisma.application.findFirst({
      where: { OR: [{ id: applicationId }, { appKey: applicationId.toLowerCase() }] }
    });

    if (!app) {
      return res.status(404).json({ success: false, error: { message: `Application '${applicationId}' not found.` } });
    }

    await prisma.tenantApplication.updateMany({
      where: { tenantId: targetTenantId, applicationId: app.id },
      data: { status: 'SUSPENDED' }
    });

    res.json({ success: true, message: `Tenant subscription for application '${app.name}' suspended.` });
  } catch (error) {
    next(error);
  }
}
