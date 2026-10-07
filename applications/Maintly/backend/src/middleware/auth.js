import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import http from 'http';
import { ENV } from '../config/env.js';
import prisma from '../config/db.js';

/**
 * JIT-sync tenant from Ecosystem Core into MAINTLY
 */
async function syncTenantFromCore(centralTenantId) {
  return new Promise((resolve) => {
    const internalKey = process.env.INTERNAL_SERVICE_KEY || 'ecosystem-internal-service-sync-key';
    const req = http.request({
      hostname: '127.0.0.1',
      port: 4000,
      path: `/api/v1/internal/tenants/${centralTenantId}`,
      method: 'GET',
      headers: {
        'X-Internal-Service-Key': internalKey
      },
      timeout: 2500
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', async () => {
        try {
          const json = JSON.parse(body);
          if (json.success && json.data) {
            const d = json.data;
            const normalizedCode = d.code.toUpperCase().trim();
            const slug = (d.code || '').toLowerCase();

            let tenant = await prisma.tenant.findFirst({
              where: {
                OR: [
                  { centralTenantId: d.id },
                  { code: normalizedCode },
                  { slug }
                ]
              }
            });

            if (tenant) {
              tenant = await prisma.tenant.update({
                where: { id: tenant.id },
                data: {
                  centralTenantId: d.id,
                  name: d.name,
                  code: normalizedCode,
                  slug,
                  status: d.status || 'ACTIVE'
                }
              });
            } else {
              tenant = await prisma.tenant.create({
                data: {
                  centralTenantId: d.id,
                  name: d.name,
                  code: normalizedCode,
                  slug,
                  status: d.status || 'ACTIVE',
                  requestPrefix: `${normalizedCode.slice(0, 4)}-MAIN`,
                  timezone: 'Asia/Kolkata',
                  graceHours: 12.0,
                  targetHoursHigh: 24.0,
                  targetHoursMedium: 48.0,
                  targetHoursLow: 72.0,
                  approvalRequired: true
                }
              });
            }
            resolve(tenant);
          } else {
            resolve(null);
          }
        } catch (_) {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.end();
  });
}

/**
 * Verify application subscription with Ecosystem Core
 */
async function verifyCoreSubscription(tenantIdOrCentralId, appKey = 'maintly') {
  if (!tenantIdOrCentralId) return true;

  let lookupId = tenantIdOrCentralId;
  try {
    const local = await prisma.tenant.findFirst({
      where: {
        OR: [
          { id: tenantIdOrCentralId },
          { centralTenantId: tenantIdOrCentralId },
          { code: tenantIdOrCentralId }
        ]
      },
      select: { centralTenantId: true }
    });
    if (local?.centralTenantId) {
      lookupId = local.centralTenantId;
    }
  } catch (_) {}

  return new Promise((resolve) => {
    const internalKey = process.env.INTERNAL_SERVICE_KEY || 'ecosystem-internal-service-sync-key';
    const req = http.request({
      hostname: '127.0.0.1',
      port: 4000,
      path: `/api/v1/internal/tenants/${lookupId}/subscription?appKey=${appKey}`,
      method: 'GET',
      headers: {
        'X-Internal-Service-Key': internalKey
      },
      timeout: 2500
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode === 200 && json.success) {
            resolve(Boolean(json.isSubscribed));
          } else {
            resolve(true); // Don't block local or unmapped test/demo tenants
          }
        } catch (_) {
          resolve(true); // Resilience fallback
        }
      });
    });
    req.on('error', () => resolve(true));
    req.on('timeout', () => { req.destroy(); resolve(true); });
    req.end();
  });
}


// Initialize Keycloak JWKS client for RS256 cryptographic verification
const client = jwksClient({
  jwksUri: ENV.KEYCLOAK_JWKS_URI,
  cache: true,
  cacheMaxEntries: 10,
  rateLimit: true,
  jwksRequestsPerMinute: 20
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err, null);
    const signingKey = key.getPublicKey ? key.getPublicKey() : key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

function verifyKeycloakToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        issuer: `${ENV.KEYCLOAK_URL}/realms/${ENV.KEYCLOAK_REALM}`,
        algorithms: ['RS256']
      },
      (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      }
    );
  });
}

export async function authenticate(req, res, next) {
  try {
    // Trusted Internal Service Key
    const internalServiceKey = req.headers['x-internal-service-key'];
    if (internalServiceKey && internalServiceKey === (process.env.INTERNAL_SERVICE_KEY || 'ecosystem-internal-service-sync-key')) {
      req.user = {
        id: 'system-service',
        email: 'system-sync@ecosystem.internal',
        role: 'PLATFORM_ADMIN',
      };
      req.authMethod = 'INTERNAL_SERVICE';
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Missing or invalid Authorization header.'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded = null;
    let isKeycloak = false;

    // 1. Attempt Keycloak RS256 cryptographic verification
    try {
      const unverified = jwt.decode(token, { complete: true });
      if (unverified && unverified.header && unverified.header.alg === 'RS256') {
        decoded = await verifyKeycloakToken(token);
        isKeycloak = true;
      }
    } catch (kcErr) {
      // If Keycloak RS256 verification failed (expired or invalid signature)
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired Keycloak OIDC token. Signature verification failed.'
      });
    }

    // 2. If not RS256, attempt legacy HMAC verification for local test suites
    if (!isKeycloak) {
      const coreSecret = process.env.CORE_JWT_SECRET || 'ecosystem_core_master_jwt_secret_key_2026';
      try {
        decoded = jwt.verify(token, ENV.JWT_SECRET);
      } catch (err1) {
        try {
          decoded = jwt.verify(token, coreSecret);
        } catch (err2) {
          return res.status(401).json({
            success: false,
            message: 'Session expired or invalid token. Please log in again.'
          });
        }
      }
    }

    // 3. Process Keycloak OIDC Token
    if (isKeycloak) {
      // Validate Audience
      const aud = Array.isArray(decoded.aud) ? decoded.aud : [decoded.aud];
      const validAudiences = ['maintly-api', 'maintly-web', 'ecosystem-core-api', 'ecosystem-portal', 'account'];
      const hasAudience = aud.some(a => validAudiences.includes(a));
      if (!hasAudience) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Token not audience-entitled for MAINTLY.'
        });
      }

      // Validate User Status / Suspension
      if (decoded.status === 'SUSPENDED') {
        return res.status(401).json({
          success: false,
          message: 'Account is suspended in Central Ecosystem. Access denied.'
        });
      }

      const centralUserId = decoded.sub;
      const email = (decoded.email || decoded.preferred_username || '').toLowerCase();

      // Resolve local user in maintly_db
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { centralUserId: centralUserId },
            { email: email }
          ]
        },
        include: {
          tenant: true,
          branchAccesses: { select: { branchId: true, isPrimary: true } }
        }
      });

      // Map central roles to MAINTLY roles
      const roles = decoded.realm_access?.roles || decoded.roles || [];
      let maintlyRole = 'EMPLOYEE';
      if (decoded.isPlatformAdmin || roles.includes('PLATFORM_ADMIN') || roles.includes('SUPER_ADMIN')) {
        maintlyRole = 'PLATFORM_ADMIN';
      } else if (roles.includes('TENANT_ADMIN') || roles.includes('ADMIN')) {
        maintlyRole = 'TENANT_ADMIN';
      } else if (roles.includes('BRANCH_MANAGER') || roles.includes('FIRM_ADMIN') || roles.includes('DEPARTMENT_HEAD') || roles.includes('MAINTENANCE_SUPERVISOR') || roles.includes('MANAGER')) {
        maintlyRole = 'MANAGER';
      } else if (roles.includes('TECHNICIAN') || roles.includes('MAINTENANCE_TECHNICIAN') || roles.includes('MAINTENANCE_USER')) {
        maintlyRole = 'MAINTENANCE_USER';
      } else if (roles.includes('APPROVER') || roles.includes('HR_OFFICER') || roles.includes('HR_MANAGER')) {
        maintlyRole = 'APPROVER';
      } else if (roles.includes('PURCHASE_USER') || roles.includes('PURCHASE_OFFICER')) {
        maintlyRole = 'PURCHASE_USER';
      }

      const centralTenantId = decoded.tenantId || decoded.tenant_id;

      // Enforce Ecosystem Core Application Subscription
      if (centralTenantId && !decoded.isPlatformAdmin) {
        const isSubscribed = await verifyCoreSubscription(centralTenantId, 'maintly');
        if (!isSubscribed) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: Tenant does not have an active subscription for MAINTLY in Ecosystem Core.'
          });
        }
      }

      // Resolve local tenant via centralTenantId or code, with JIT pull sync
      let tenant = null;
      if (centralTenantId) {
        tenant = await prisma.tenant.findFirst({
          where: {
            OR: [
              { centralTenantId },
              { code: decoded.tenant_code || '' }
            ]
          }
        });
        if (!tenant) {
          tenant = await syncTenantFromCore(centralTenantId);
        }
      }

      if (!tenant && !decoded.isPlatformAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Tenant organization not found in MAINTLY.'
        });
      }

      // JIT Provision / Linking if user belongs to central ecosystem
      if (!user) {
        user = await prisma.user.create({
          data: {
            centralUserId,
            tenantId: tenant ? tenant.id : null,
            email,
            passwordHash: 'KEYCLOAK_OIDC_MANAGED',
            firstName: decoded.given_name || (decoded.name ? decoded.name.split(' ')[0] : 'Central'),
            lastName: decoded.family_name || (decoded.name ? decoded.name.split(' ').slice(1).join(' ') : 'User'),
            role: maintlyRole,
            status: 'ACTIVE'
          },
          include: {
            tenant: true,
            branchAccesses: { select: { branchId: true, isPrimary: true } }
          }
        });
      } else {
        // Keep role, centralUserId, and tenant in sync with active identity token
        const updates = {};
        if (!user.centralUserId) updates.centralUserId = centralUserId;
        if (tenant && user.tenantId !== tenant.id) {
          updates.tenantId = tenant.id;
          user.tenantId = tenant.id;
          user.tenant = tenant;
        }
        if (user.role !== maintlyRole && maintlyRole !== 'EMPLOYEE') {
          updates.role = maintlyRole;
          user.role = maintlyRole;
        }
        if (Object.keys(updates).length > 0) {
          await prisma.user.update({
            where: { id: user.id },
            data: updates
          });
        }
      }

      // Check tenant status
      if (user.tenantId && user.tenant && user.tenant.status !== 'ACTIVE') {
        return res.status(403).json({
          success: false,
          message: 'Dealership organization account is inactive or suspended.'
        });
      }

      // Map branch accesses from token memberships
      let accessibleBranchIds = user.branchAccesses.map(b => b.branchId);
      if (Array.isArray(decoded.memberships) && decoded.memberships.length > 0) {
        const centralBranchIds = decoded.memberships.map(m => m.branchId).filter(Boolean);
        if (centralBranchIds.length > 0) {
          const matchedBranches = await prisma.branch.findMany({
            where: { centralBranchId: { in: centralBranchIds } },
            select: { id: true }
          });
          const matchedIds = matchedBranches.map(b => b.id);
          accessibleBranchIds = Array.from(new Set([...accessibleBranchIds, ...matchedIds]));
        }
      }

      const effectiveTenant = tenant || user.tenant;
      const effectiveTenantId = effectiveTenant ? effectiveTenant.id : user.tenantId;

      // Cross-Tenant Spoofing Prevention
      if (!decoded.isPlatformAdmin && user.role !== 'PLATFORM_ADMIN') {
        const requestedTenantId = req.query?.tenantId || req.body?.tenantId || req.headers['x-tenant-id'];
        if (requestedTenantId && requestedTenantId !== effectiveTenantId) {
          return res.status(403).json({
            success: false,
            message: 'Access Denied: Cross-tenant data access or tenant manipulation is strictly prohibited.'
          });
        }
      }

      // If user is admin/manager/approver or has no explicit branch, grant access to all tenant branches
      if (effectiveTenantId && (accessibleBranchIds.length === 0 || ['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER'].includes(user.role))) {
        const allTenantBranches = await prisma.branch.findMany({
          where: { tenantId: effectiveTenantId },
          select: { id: true }
        });
        accessibleBranchIds = Array.from(new Set([...accessibleBranchIds, ...allTenantBranches.map(b => b.id)]));
      }

      req.user = user;
      req.userId = user.id;
      req.centralUserId = centralUserId;
      req.tenantId = effectiveTenantId;
      req.tenant = effectiveTenant;
      if (effectiveTenant) {
        req.user.tenant = effectiveTenant;
        req.user.tenantId = effectiveTenantId;
      }
      req.role = user.role;
      req.branchIds = accessibleBranchIds;
      req.permissions = decoded.permissions || [];
      req.isOidc = true;

      return next();
    }

    // 4. Process Legacy HMAC Token / Ecosystem Core HMAC Token
    if (decoded.isPlatformAdmin || (Array.isArray(decoded.roles) && decoded.roles.includes('PLATFORM_ADMIN'))) {
      const adminEmail = (decoded.email || 'admin@ecosystem.com').toLowerCase().trim();
      let adminUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: adminEmail },
            { centralUserId: decoded.userId || decoded.sub || 'platform-admin' },
            ...(decoded.id ? [{ id: decoded.id }] : [])
          ]
        },
        include: {
          tenant: true,
          branchAccesses: { select: { branchId: true, isPrimary: true } }
        }
      });

      if (!adminUser) {
        try {
          adminUser = await prisma.user.create({
            data: {
              email: adminEmail,
              passwordHash: '$2a$10$PLATFORM_ADMIN_MGD',
              role: 'PLATFORM_ADMIN',
              centralUserId: decoded.userId || decoded.sub || 'platform-admin',
              firstName: 'Platform',
              lastName: 'Administrator',
              status: 'ACTIVE'
            },
            include: {
              tenant: true,
              branchAccesses: { select: { branchId: true, isPrimary: true } }
            }
          });
        } catch (_) {
          adminUser = await prisma.user.findFirst({
            where: { email: adminEmail },
            include: {
              tenant: true,
              branchAccesses: { select: { branchId: true, isPrimary: true } }
            }
          });
        }
      }

      req.user = adminUser || {
        id: decoded.userId || decoded.id || 'core-platform-admin',
        email: adminEmail,
        role: 'PLATFORM_ADMIN',
        firstName: 'Platform',
        lastName: 'Admin'
      };
      req.userId = req.user.id;
      req.tenantId = null;
      req.role = 'PLATFORM_ADMIN';
      req.branchIds = [];
      req.permissions = ['*'];
      req.isOidc = false;
      return next();
    }

    const centralTenantId = decoded.tenantId || decoded.tenant_id;

    // Enforce Ecosystem Core Application Subscription
    if (centralTenantId && !decoded.isPlatformAdmin) {
      const isSubscribed = await verifyCoreSubscription(centralTenantId, 'maintly');
      if (!isSubscribed) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Tenant does not have an active subscription for MAINTLY in Ecosystem Core.'
        });
      }
    }

    // Resolve local tenant via centralTenantId or code, with JIT pull sync
    let tenant = null;
    if (centralTenantId) {
      tenant = await prisma.tenant.findFirst({
        where: {
          OR: [
            { centralTenantId },
            { code: decoded.tenant_code || '' }
          ]
        }
      });
      if (!tenant) {
        tenant = await syncTenantFromCore(centralTenantId);
      }
    }

    const userEmail = (decoded.email || '').toLowerCase().trim();
    const centralUserId = decoded.userId || decoded.sub || null;

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(decoded.id ? [{ id: decoded.id }] : []),
          ...(centralUserId ? [{ centralUserId }] : []),
          ...(userEmail ? [{ email: userEmail }] : [])
        ]
      },
      include: {
        tenant: true,
        branchAccesses: {
          select: { branchId: true, isPrimary: true }
        }
      }
    });

    if (!user && centralTenantId && tenant) {
      const roles = decoded.roles || [];
      let maintlyRole = 'EMPLOYEE';
      if (roles.includes('TENANT_ADMIN') || roles.includes('ADMIN')) maintlyRole = 'TENANT_ADMIN';
      else if (roles.includes('MANAGER') || roles.includes('BRANCH_MANAGER')) maintlyRole = 'MANAGER';

      try {
        user = await prisma.user.create({
          data: {
            centralUserId: centralUserId,
            tenantId: tenant.id,
            email: userEmail,
            passwordHash: 'CORE_MANAGED_ACCOUNT_NO_LOCAL_PASSWORD',
            firstName: (userEmail ? userEmail.split('@')[0] : 'Central'),
            lastName: 'User',
            role: maintlyRole,
            status: 'ACTIVE'
          },
          include: {
            tenant: true,
            branchAccesses: { select: { branchId: true, isPrimary: true } }
          }
        });
      } catch (_) {
        user = await prisma.user.findFirst({
          where: { email: userEmail },
          include: {
            tenant: true,
            branchAccesses: { select: { branchId: true, isPrimary: true } }
          }
        });
      }
    }

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive or no longer exists.'
      });
    }

    if (user.tenantId && user.tenant && user.tenant.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Organization account is inactive or suspended.'
      });
    }

    let accessibleBranchIds = (user.branchAccesses || []).map(b => b.branchId);
    if (user.tenantId && (accessibleBranchIds.length === 0 || ['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER'].includes(user.role))) {
      const allTenantBranches = await prisma.branch.findMany({
        where: { tenantId: user.tenantId },
        select: { id: true }
      });
      accessibleBranchIds = Array.from(new Set([...accessibleBranchIds, ...allTenantBranches.map(b => b.id)]));
    }

    req.user = user;
    req.userId = user.id;
    req.tenantId = user.tenantId;
    req.role = user.role;
    req.branchIds = accessibleBranchIds;
    req.permissions = [];
    req.isOidc = false;

    next();
  } catch (error) {
    console.error('[MAINTLY_AUTH_ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Internal authentication error.'
    });
  }
}
