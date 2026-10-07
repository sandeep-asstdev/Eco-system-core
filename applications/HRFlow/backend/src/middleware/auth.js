const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const http = require('http');
const prisma = require('../config/db');
const { errorResponse } = require('../utils/apiResponse');

/**
 * JIT-sync tenant from Ecosystem Core if not found locally
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
            const newT = await prisma.$transaction(async (tx) => {
              const created = await tx.tenant.upsert({
                where: { code: d.code },
                update: {
                  centralTenantId: d.id,
                  organizationName: d.name,
                  legalName: d.legalName || d.name,
                  status: d.status || 'ACTIVE'
                },
                create: {
                  centralTenantId: d.id,
                  code: d.code,
                  organizationName: d.name,
                  legalName: d.legalName || d.name,
                  status: d.status || 'ACTIVE',
                  subscriptionPlan: 'ENTERPRISE'
                }
              });

              // Create Corporate HQ Branch if none exists
              const existingBranch = await tx.branch.findFirst({ where: { tenantId: created.id } });
              if (!existingBranch) {
                await tx.branch.create({
                  data: {
                    tenantId: created.id,
                    code: `${d.code}-HQ`,
                    name: `${d.name} Corporate HQ`,
                    city: d.city || 'Headquarters',
                    state: d.state || 'Headquarters',
                    address: d.addressLine1 || 'Head Office',
                    active: true
                  }
                });
              }
              return created;
            });
            resolve(newT);
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
async function verifyCoreSubscription(tenantIdOrCentralId, appKey = 'hrflow') {
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
          resolve(true); // Graceful resilience if core is temporarily restarting
        }
      });
    });
    req.on('error', () => resolve(true));
    req.on('timeout', () => { req.destroy(); resolve(true); });
    req.end();
  });
}


// Keycloak JWKS client
const KEYCLOAK_JWKS_URI = process.env.KEYCLOAK_JWKS_URI || 'http://localhost:8080/realms/automobile-ecosystem/protocol/openid-connect/certs';
const KEYCLOAK_ISSUER = process.env.KEYCLOAK_ISSUER || 'http://localhost:8080/realms/automobile-ecosystem';

const client = jwksClient({
  jwksUri: KEYCLOAK_JWKS_URI,
  cache: true,
  cacheMaxEntries: 10,
  rateLimit: true,
  jwksRequestsPerMinute: 20,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err, null);
    const signingKey = key.getPublicKey ? key.getPublicKey() : (key.publicKey || key.rsaPublicKey);
    callback(null, signingKey);
  });
}

function deriveRolePermissions(role) {
  if (role === 'PLATFORM_ADMIN') {
    return ['*', 'hr.employee.read', 'hr.employee.create', 'hr.employee.update', 'hr.employee.delete', 'hr.attendance.manage', 'hr.leave.approve', 'hr.payroll.manage', 'hr.recruitment.manage'];
  }
  if (role === 'HR') {
    return ['hr.employee.read', 'hr.employee.create', 'hr.employee.update', 'hr.employee.delete', 'hr.attendance.manage', 'hr.attendance.correct', 'hr.leave.approve', 'hr.payroll.manage', 'hr.payroll.process', 'hr.recruitment.manage'];
  }
  if (role === 'BM') {
    return ['hr.employee.read', 'hr.leave.approve', 'hr.attendance.correct', 'hr.attendance.manage'];
  }
  return ['hr.employee.read', 'hr.attendance.punch'];
}

const authenticate = async (req, res, next) => {
  try {
    // 0. Trusted Internal Service-to-Service Authentication
    const internalServiceKey = req.headers['x-internal-service-key'];
    if (internalServiceKey && internalServiceKey === (process.env.INTERNAL_SERVICE_KEY || 'ecosystem-internal-service-sync-key')) {
      const targetTenantId = req.headers['x-tenant-id'] || null;
      req.user = {
        id: 'system-service',
        email: 'system-sync@ecosystem.internal',
        role: 'PLATFORM_ADMIN',
        isPlatformAdmin: true,
      };
      req.userId = 'system-service';
      req.isPlatformAdmin = true;
      req.permissions = ['*'];
      req.tenantId = targetTenantId;
      req.authType = 'INTERNAL_SERVICE';
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication required. Please provide a valid token.', 401);
    }

    const token = authHeader.split(' ')[1];
    let decodedHeader = null;
    try {
      decodedHeader = jwt.decode(token, { complete: true });
    } catch {
      return errorResponse(res, 'Invalid authentication token.', 401);
    }

    if (!decodedHeader) {
      return errorResponse(res, 'Invalid authentication token.', 401);
    }

    const isKeycloakToken = decodedHeader.header.alg === 'RS256' || (decodedHeader.payload && decodedHeader.payload.iss && decodedHeader.payload.iss.includes('automobile-ecosystem'));

    if (isKeycloakToken) {
      // -------------------------------------------------------------
      // 1. Central Keycloak OIDC Token Verification (RS256)
      // -------------------------------------------------------------
      return jwt.verify(
        token,
        getKey,
        {
          issuer: KEYCLOAK_ISSUER,
          algorithms: ['RS256'],
        },
        async (err, decoded) => {
          if (err) {
            if (err.name === 'TokenExpiredError') {
              return errorResponse(res, 'Session expired. Please log in again.', 401);
            }
            return errorResponse(res, 'Invalid or untrusted Keycloak OIDC token: ' + err.message, 401);
          }

          // Validate Audience
          const expectedAudiences = ['hrflow-api', 'ecosystem-core-api', 'ecosystem-portal', 'hrflow-web', 'account'];
          const tokenAudiences = Array.isArray(decoded.aud) ? decoded.aud : [decoded.aud];
          const hasValidAud = tokenAudiences.some((a) => expectedAudiences.includes(a));
          if (!hasValidAud) {
            return errorResponse(res, 'Token audience is not authorized for HRFlow API.', 403);
          }

          // Check for suspended account directly in token claims
          if (decoded.status === 'SUSPENDED') {
            return errorResponse(res, 'User account is suspended.', 403);
          }

          // Resolve User in local HRFlow database
          let user = await prisma.user.findFirst({
            where: {
              OR: [
                { centralUserId: decoded.sub },
                { email: (decoded.email || '').toLowerCase().trim() },
              ],
            },
            include: {
              tenant: true,
              branch: true,
              employee: {
                select: {
                  id: true,
                  employeeCode: true,
                  firstName: true,
                  lastName: true,
                  department: true,
                  designation: true,
                  status: true,
                  branchId: true,
                  tenantId: true,
                  photoUrl: true,
                  centralTenantId: true,
                  centralBranchId: true,
                },
              },
            },
          });

          // Link centralUserId if missing
          if (user && !user.centralUserId && decoded.sub) {
            try {
              user = await prisma.user.update({
                where: { id: user.id },
                data: { centralUserId: decoded.sub },
                include: { tenant: true, branch: true, employee: true },
              });
            } catch (e) {
              // Ignore unique constraint race condition
            }
          }

          // Enforce Ecosystem Core Application Subscription
          if (decoded.tenantId && !decoded.isPlatformAdmin) {
            const isSubscribed = await verifyCoreSubscription(decoded.tenantId, 'hrflow');
            if (!isSubscribed) {
              return errorResponse(res, 'Access denied: Dealership is not subscribed to HRFlow in Ecosystem Core.', 403);
            }
          }

          // Resolve Local Tenant from central canonical tenant ID or code
          let localTenant = null;
          if (decoded.tenantId) {
            localTenant = await prisma.tenant.findFirst({
              where: {
                OR: [
                  { centralTenantId: decoded.tenantId },
                  { code: decoded.tenant_code || '' }
                ],
              },
            });
            if (!localTenant) {
              localTenant = await syncTenantFromCore(decoded.tenantId);
            }
          }

          let assignedRole = 'EMPLOYEE';
          const roles = decoded.realm_access?.roles || [];
          if (decoded.isPlatformAdmin || roles.includes('PLATFORM_ADMIN') || roles.includes('SUPER_ADMIN')) {
            assignedRole = 'PLATFORM_ADMIN';
          } else if (roles.includes('TENANT_ADMIN') || roles.includes('ADMIN') || roles.includes('DEALER_PRINCIPAL') || roles.includes('HR_OFFICER') || roles.includes('HR_MANAGER')) {
            assignedRole = 'HR';
          } else if (roles.includes('BRANCH_MANAGER') || roles.includes('BM') || roles.includes('FIRM_ADMIN')) {
            assignedRole = 'BM';
          }

          // Just-In-Time Provisioning / Mapping if user doesn't exist locally
          if (!user) {
            try {
              user = await prisma.user.create({
                data: {
                  email: decoded.email.toLowerCase().trim(),
                  passwordHash: '$2a$10$OIDC_MANAGED_KEYCLOAK_ACCOUNT_NO_PASSWORD_LOGIN',
                  role: assignedRole,
                  centralUserId: decoded.sub,
                  tenantId: localTenant ? localTenant.id : null,
                  status: 'ACTIVE',
                },
                include: { tenant: true, branch: true, employee: true },
              });
            } catch (createErr) {
              user = await prisma.user.findFirst({
                where: { email: decoded.email.toLowerCase().trim() },
                include: { tenant: true, branch: true, employee: true },
              });
            }
          } else {
            // Keep existing user role and tenant in sync with active identity token
            const updates = {};
            if (!user.centralUserId && decoded.sub) updates.centralUserId = decoded.sub;
            if (localTenant && user.tenantId !== localTenant.id && !decoded.isPlatformAdmin && user.role !== 'PLATFORM_ADMIN') {
              updates.tenantId = localTenant.id;
              user.tenantId = localTenant.id;
              user.tenant = localTenant;
            }
            if (user.role === 'EMPLOYEE' && assignedRole === 'HR') {
              updates.role = 'HR';
              user.role = 'HR';
            }
            if (Object.keys(updates).length > 0) {
              await prisma.user.update({
                where: { id: user.id },
                data: updates
              }).catch(() => {});
            }
          }

          if (!user || user.status !== 'ACTIVE') {
            return errorResponse(res, 'User account is inactive, suspended, or no longer exists.', 403);
          }

          const effectiveTenant = localTenant || user.tenant;
          const effectiveTenantId = effectiveTenant ? effectiveTenant.id : user.tenantId;

          if (effectiveTenant && effectiveTenant.status !== 'ACTIVE') {
            return errorResponse(
              res,
              `Dealership account (${effectiveTenant.organizationName}) is currently ${effectiveTenant.status.toLowerCase()}. Contact platform support.`,
              403
            );
          }

          const permissions = Array.isArray(decoded.permissions) && decoded.permissions.length > 0
            ? decoded.permissions
            : deriveRolePermissions(user.role);

          req.user = user;
          req.user.tenant = effectiveTenant;
          req.user.tenantId = effectiveTenantId;
          req.user.permissions = permissions;
          req.user.memberships = decoded.memberships || [];
          req.user.isPlatformAdmin = Boolean(decoded.isPlatformAdmin || user.role === 'PLATFORM_ADMIN');
          req.userId = user.id;
          req.centralUserId = decoded.sub;
          req.tenantId = effectiveTenantId;
          req.tenant = effectiveTenant;
          req.centralTenantId = decoded.tenantId || effectiveTenant?.centralTenantId;
          req.isPlatformAdmin = req.user.isPlatformAdmin;
          req.permissions = permissions;
          req.memberships = decoded.memberships || [];
          req.authType = 'KEYCLOAK_OIDC';

          return next();
        }
      );
    }

    // -------------------------------------------------------------
    // 2. Legacy / Central Ecosystem Core HMAC Token Verification
    // -------------------------------------------------------------
    let decoded = null;
    const coreSecret = process.env.CORE_JWT_SECRET || 'ecosystem_core_master_jwt_secret_key_2026';
    const localSecret = process.env.JWT_SECRET || 'hrflow_super_secret_jwt_key_2026_secure';

    try {
      decoded = jwt.verify(token, localSecret);
    } catch (e1) {
      try {
        decoded = jwt.verify(token, coreSecret);
      } catch (e2) {
        if (e1.name === 'TokenExpiredError' || e2.name === 'TokenExpiredError') {
          return errorResponse(res, 'Session expired. Please log in again.', 401);
        }
        return errorResponse(res, 'Invalid authentication token.', 401);
      }
    }

    // 2.1 Central Platform Admin handling
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
        include: { tenant: true, branch: true, employee: true }
      });

      if (!adminUser) {
        try {
          adminUser = await prisma.user.create({
            data: {
              email: adminEmail,
              passwordHash: '$2a$10$PLATFORM_ADMIN_MGD',
              role: 'PLATFORM_ADMIN',
              centralUserId: decoded.userId || decoded.sub || 'platform-admin',
              status: 'ACTIVE'
            },
            include: { tenant: true, branch: true, employee: true }
          });
        } catch (_) {
          adminUser = await prisma.user.findFirst({
            where: { email: adminEmail },
            include: { tenant: true, branch: true, employee: true }
          });
        }
      }

      req.user = adminUser || {
        id: decoded.userId || decoded.id || 'core-platform-admin',
        email: adminEmail,
        role: 'PLATFORM_ADMIN',
        isPlatformAdmin: true
      };
      req.user.permissions = ['*'];
      req.userId = req.user.id;
      req.isPlatformAdmin = true;
      req.permissions = ['*'];
      req.tenantId = null;
      req.centralTenantId = null;
      req.memberships = [];
      req.authType = 'CORE_PLATFORM_ADMIN';
      return next();
    }

    // 2.2 Central Application Subscription Verification
    if (decoded.tenantId && !decoded.isDemo) {
      const isSubscribed = await verifyCoreSubscription(decoded.tenantId, 'hrflow');
      if (!isSubscribed) {
        return errorResponse(res, 'Access denied: Dealership is not subscribed to HRFlow in Ecosystem Core.', 403);
      }
    }

    // 2.3 User Lookup & JIT Provisioning
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
        branch: true,
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            department: true,
            designation: true,
            status: true,
            branchId: true,
            tenantId: true,
            photoUrl: true,
            centralTenantId: true,
            centralBranchId: true,
          },
        },
      },
    });

    if (!user && decoded.tenantId) {
      let localTenant = await prisma.tenant.findFirst({
        where: {
          OR: [
            { centralTenantId: decoded.tenantId },
            { code: decoded.tenant_code || '' }
          ]
        }
      });
      if (!localTenant) {
        localTenant = await syncTenantFromCore(decoded.tenantId);
      }

      let assignedRole = 'HR';
      const roles = decoded.roles || [];
      if (roles.includes('PLATFORM_ADMIN')) assignedRole = 'PLATFORM_ADMIN';
      else if (roles.includes('TENANT_ADMIN') || roles.includes('ADMIN')) assignedRole = 'HR';
      else if (roles.includes('BRANCH_MANAGER') || roles.includes('BM')) assignedRole = 'BM';

      try {
        user = await prisma.user.create({
          data: {
            email: userEmail,
            passwordHash: '$2a$10$CORE_MANAGED_ACCOUNT_NO_LOCAL_PASSWORD',
            role: assignedRole,
            centralUserId: centralUserId,
            tenantId: localTenant ? localTenant.id : null,
            status: 'ACTIVE',
          },
          include: {
            tenant: true,
            branch: true,
            employee: true
          },
        });
      } catch (_) {
        user = await prisma.user.findFirst({
          where: { email: userEmail },
          include: { tenant: true, branch: true, employee: true },
        });
      }
    }

    if (!user || user.status !== 'ACTIVE') {
      return errorResponse(res, 'User account is inactive or no longer exists.', 401);
    }

    if (user.tenantId && user.tenant) {
      if (user.tenant.status !== 'ACTIVE') {
        return errorResponse(
          res,
          `Dealership account (${user.tenant.organizationName}) is currently ${user.tenant.status.toLowerCase()}. Contact platform support.`,
          403
        );
      }
    }

    const permissions = deriveRolePermissions(user.role);

    req.user = user;
    req.user.permissions = permissions;
    req.user.isPlatformAdmin = user.role === 'PLATFORM_ADMIN';
    req.userId = user.id;
    req.centralUserId = user.centralUserId || centralUserId;
    req.tenantId = user.tenantId;
    req.centralTenantId = user.tenant?.centralTenantId || decoded.tenantId;
    req.isPlatformAdmin = user.role === 'PLATFORM_ADMIN';
    req.permissions = permissions;
    req.memberships = [];
    req.authType = 'LEGACY_JWT';

    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Session expired. Please log in again.', 401);
    }
    return errorResponse(res, 'Invalid authentication token.', 401);
  }
};

module.exports = authenticate;
