import prisma from '../../config/db.js';
import http from 'http';
import https from 'https';

/**
 * Lists registered applications with tenant subscription status and capabilities.
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
        tenantApplications: req.tenantId ? {
          where: { tenantId: req.tenantId }
        } : true
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
        requiredPermissions: app.requiredPermissions || (app.settings?.requiredPermissions || []),
        supportedEvents: app.supportedEvents || (app.settings?.supportedEvents || []),
        webhooks: app.webhooks || null,
        status: app.status || (app.isActive ? 'ACTIVE' : 'INACTIVE'),
        isActive: app.isActive && app.status === 'ACTIVE',
        isPublic: app.isPublic,
        availableTiers: app.availableTiers || ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'],
        healthEndpoint: app.healthEndpoint || '/api/health',
        isSubscribed,
        subscription: tenantSub || null,
        tenantSubscriptions: req.isPlatformAdmin ? app.tenantApplications : undefined
      };
    });

    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieves single application by ID or appKey.
 */
export async function getApplication(req, res, next) {
  try {
    const { id } = req.params;
    const app = await prisma.application.findFirst({
      where: {
        OR: [{ id }, { appKey: id.toLowerCase() }, { code: id.toUpperCase() }]
      },
      include: {
        tenantApplications: req.tenantId ? {
          where: { tenantId: req.tenantId }
        } : true
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
        isSubscribed: req.isPlatformAdmin ? true : Boolean(tenantSub && tenantSub.status === 'ACTIVE'),
        subscription: tenantSub
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Registers a new dynamic application in the registry.
 */
export async function registerApplication(req, res, next) {
  try {
    const {
      appKey, code, name, description, icon, baseUrl, apiUrl,
      version, apiVersion, category, capabilities, requiredPermissions,
      supportedEvents, webhooks, status, isPublic, availableTiers,
      healthEndpoint, settings
    } = req.body;

    if (!appKey || !name || !baseUrl || !apiUrl) {
      return res.status(400).json({
        success: false,
        error: { message: 'appKey, name, baseUrl, and apiUrl are required.' }
      });
    }

    const existing = await prisma.application.findUnique({
      where: { appKey: appKey.toLowerCase().trim() }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: { message: `Application with appKey '${appKey}' already exists.` }
      });
    }

    const app = await prisma.application.create({
      data: {
        appKey: appKey.toLowerCase().trim(),
        code: code ? code.toUpperCase().trim() : appKey.toUpperCase().trim(),
        name,
        description: description || null,
        icon: icon || 'AppWindow',
        baseUrl: baseUrl.trim(),
        apiUrl: apiUrl.trim(),
        version: version || '1.0.0',
        apiVersion: apiVersion || 'v1',
        category: (category || 'OPERATIONS').toUpperCase(),
        capabilities: Array.isArray(capabilities) ? capabilities : [],
        requiredPermissions: Array.isArray(requiredPermissions) ? requiredPermissions : [],
        supportedEvents: Array.isArray(supportedEvents) ? supportedEvents : [],
        webhooks: webhooks || undefined,
        status: status || 'ACTIVE',
        isPublic: isPublic !== false,
        availableTiers: Array.isArray(availableTiers) ? availableTiers : ['STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM'],
        healthEndpoint: healthEndpoint || '/api/health',
        isActive: status !== 'INACTIVE',
        settings: settings || {}
      }
    });

    // If caller provided auto-subscribe for current tenant
    if (req.tenantId && req.body.autoSubscribe !== false) {
      await prisma.tenantApplication.upsert({
        where: {
          tenantId_applicationId: {
            tenantId: req.tenantId,
            applicationId: app.id
          }
        },
        update: { status: 'ACTIVE' },
        create: {
          tenantId: req.tenantId,
          applicationId: app.id,
          status: 'ACTIVE',
          planName: 'ENTERPRISE'
        }
      });
    }

    res.status(201).json({ success: true, data: app });
  } catch (error) {
    next(error);
  }
}

/**
 * Updates application metadata, lifecycle status, endpoints, or permissions.
 */
export async function updateApplication(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name, description, icon, baseUrl, apiUrl, version, apiVersion,
      category, capabilities, requiredPermissions, supportedEvents,
      webhooks, status, isPublic, availableTiers, healthEndpoint, settings, isActive
    } = req.body;

    const existing = await prisma.application.findFirst({
      where: { OR: [{ id }, { appKey: id.toLowerCase() }] }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: { message: `Application '${id}' not found.` } });
    }

    const updated = await prisma.application.update({
      where: { id: existing.id },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        icon: icon !== undefined ? icon : undefined,
        baseUrl: baseUrl !== undefined ? baseUrl : undefined,
        apiUrl: apiUrl !== undefined ? apiUrl : undefined,
        version: version !== undefined ? version : undefined,
        apiVersion: apiVersion !== undefined ? apiVersion : undefined,
        category: category !== undefined ? category.toUpperCase() : undefined,
        capabilities: Array.isArray(capabilities) ? capabilities : undefined,
        requiredPermissions: Array.isArray(requiredPermissions) ? requiredPermissions : undefined,
        supportedEvents: Array.isArray(supportedEvents) ? supportedEvents : undefined,
        webhooks: webhooks !== undefined ? webhooks : undefined,
        status: status !== undefined ? status : undefined,
        isActive: isActive !== undefined ? isActive : (status ? status === 'ACTIVE' : undefined),
        isPublic: isPublic !== undefined ? isPublic : undefined,
        availableTiers: Array.isArray(availableTiers) ? availableTiers : undefined,
        healthEndpoint: healthEndpoint !== undefined ? healthEndpoint : undefined,
        settings: settings !== undefined ? settings : undefined
      }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

/**
 * Unregisters an application from the ecosystem.
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

    await prisma.application.delete({
      where: { id: existing.id }
    });

    res.json({ success: true, message: `Application '${existing.name}' (${existing.appKey}) successfully unregistered.` });
  } catch (error) {
    next(error);
  }
}

/**
 * Subscribes a tenant to an application.
 */
export async function subscribeApplication(req, res, next) {
  try {
    const applicationId = req.params.id || req.body.applicationId;
    const { planName, customConfig, features } = req.body;
    const targetTenantId = req.body.tenantId || req.tenantId;

    if (!applicationId) {
      return res.status(400).json({ success: false, error: { message: 'applicationId is required.' } });
    }
    if (!targetTenantId) {
      return res.status(400).json({ success: false, error: { message: 'tenantId is required.' } });
    }

    const app = await prisma.application.findFirst({
      where: { OR: [{ id: applicationId }, { appKey: applicationId.toLowerCase() }] }
    });

    if (!app) {
      return res.status(404).json({ success: false, error: { message: `Application '${applicationId}' not found.` } });
    }

    const subscription = await prisma.tenantApplication.upsert({
      where: {
        tenantId_applicationId: {
          tenantId: targetTenantId,
          applicationId: app.id
        }
      },
      update: {
        status: 'ACTIVE',
        planName: planName || 'STANDARD',
        customConfig: customConfig || undefined,
        features: features || undefined
      },
      create: {
        tenantId: targetTenantId,
        applicationId: app.id,
        status: 'ACTIVE',
        planName: planName || 'STANDARD',
        customConfig,
        features
      },
      include: { application: true }
    });

    res.json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
}

/**
 * Unsubscribes or suspends a tenant subscription for an application.
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

    const subscription = await prisma.tenantApplication.updateMany({
      where: {
        tenantId: targetTenantId,
        applicationId: app.id
      },
      data: {
        status: 'SUSPENDED'
      }
    });

    res.json({ success: true, message: `Tenant subscription for application '${app.name}' suspended.` });
  } catch (error) {
    next(error);
  }
}

/**
 * Live health check test for a registered application.
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

    const healthUrl = `${app.apiUrl}${app.healthEndpoint || '/api/health'}`;
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
