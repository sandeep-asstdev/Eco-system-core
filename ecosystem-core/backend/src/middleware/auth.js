import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { ENV } from '../config/env.js';
import prisma from '../config/db.js';

let jwksInstance = null;

function getJwksClient() {
  if (!jwksInstance) {
    jwksInstance = jwksClient({
      jwksUri: ENV.KEYCLOAK_JWKS_URI,
      cache: true,
      cacheMaxEntries: 10,
      rateLimit: true,
      jwksRequestsPerMinute: 10
    });
  }
  return jwksInstance;
}

function getKeyForRequest(req) {
  return function (header, callback) {
    // Development / test key injection via header for cross-process integration tests
    if (ENV.NODE_ENV !== 'production' && req.headers['x-test-public-key']) {
      try {
        const rawKey = Buffer.from(req.headers['x-test-public-key'], 'base64').toString('utf8');
        return callback(null, rawKey);
      } catch (e) {
        return callback(e, null);
      }
    }

    if (process.env.TEST_PUBLIC_KEY) {
      return callback(null, process.env.TEST_PUBLIC_KEY);
    }

    const client = getJwksClient();
    client.getSigningKey(header.kid, (err, key) => {
      if (err) return callback(err, null);
      const signingKey = key?.publicKey || key?.rsaPublicKey;
      callback(null, signingKey);
    });
  };
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
      req.isPlatformAdmin = true;
      req.authMethod = 'INTERNAL_SERVICE';
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization Bearer header.' }
      });
    }

    const token = authHeader.split(' ')[1];

    // Decode header without verifying to inspect algorithm
    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Malformed authentication token.' }
      });
    }

    // If token is signed via RS256, verify against Keycloak JWKS
    if (decodedHeader.header.alg === 'RS256') {
      const issuer = (ENV.NODE_ENV !== 'production' && req.headers['x-test-issuer'])
        ? req.headers['x-test-issuer']
        : `${ENV.KEYCLOAK_URL}/realms/${ENV.KEYCLOAK_REALM}`;

      jwt.verify(
        token,
        getKeyForRequest(req),
        {
          issuer,
          algorithms: ['RS256']
        },
        async (err, decoded) => {
          if (err) {
            return res.status(401).json({
              success: false,
              error: { code: 'TOKEN_VERIFICATION_FAILED', message: `RS256 signature verification failed: ${err.message}` }
            });
          }
          await populateUserContext(decoded.sub, decoded.tenant_id, decoded, req, res, next);
        }
      );
    } else {
      // In production mode, strictly prohibit fallback HMAC tokens
      if (ENV.NODE_ENV === 'production') {
        return res.status(401).json({
          success: false,
          error: { code: 'OIDC_REQUIRED', message: 'Production requires valid Keycloak OIDC RS256 token.' }
        });
      }

      // Local development & test fallback HMAC verification
      try {
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        await populateUserContext(decoded.userId || decoded.id, decoded.tenantId, decoded, req, res, next);
      } catch (err) {
        return res.status(401).json({
          success: false,
          error: { code: 'SESSION_EXPIRED', message: 'Authentication session expired or invalid.' }
        });
      }
    }
  } catch (error) {
    next(error);
  }
}

async function populateUserContext(userId, fallbackTenantId, tokenPayload, req, res, next) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },
          { keycloakSub: userId },
          { email: tokenPayload.email }
        ]
      },
      include: {
        tenant: true,
        memberships: {
          include: { branch: true, department: true }
        },
        userRoleAssignments: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true }
                }
              }
            },
            firm: true,
            brand: true,
            branch: true,
            department: true
          }
        }
      }
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        error: { code: 'ACCOUNT_INACTIVE', message: 'User account is inactive or not found.' }
      });
    }

    if (user.tenantId && user.tenant && user.tenant.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: { code: 'TENANT_SUSPENDED', message: `Dealership Group (${user.tenant.name}) is ${user.tenant.status.toLowerCase()}.` }
      });
    }

    // Extract all granted permissions
    const permissions = new Set();
    user.userRoleAssignments.forEach(ura => {
      ura.role?.rolePermissions?.forEach(rp => {
        if (rp.permission?.code) {
          permissions.add(rp.permission.code);
        }
      });
    });

    req.user = user;
    req.userId = user.id;
    req.tenantId = user.tenantId || fallbackTenantId;
    req.isPlatformAdmin = user.isPlatformAdmin || tokenPayload.is_platform_admin === true;
    req.permissions = Array.from(permissions);
    req.memberships = user.memberships;
    req.userRoleAssignments = user.userRoleAssignments;

    next();
  } catch (err) {
    next(err);
  }
}
