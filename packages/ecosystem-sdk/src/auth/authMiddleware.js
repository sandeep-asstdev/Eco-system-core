import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import { AuthenticationError, ForbiddenError } from '../errors/ecosystemErrors.js';

let jwksClientInstance = null;

function getJwksClient(jwksUri) {
  if (!jwksClientInstance && jwksUri) {
    jwksClientInstance = jwksRsa({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 30,
      jwksUri
    });
  }
  return jwksClientInstance;
}

function getSigningKey(jwksUri, kid) {
  return new Promise((resolve, reject) => {
    const client = getJwksClient(jwksUri);
    if (!client) return reject(new Error('JWKS client not configured.'));
    client.getSigningKey(kid, (err, key) => {
      if (err) return reject(err);
      resolve(key.getPublicKey());
    });
  });
}

/**
 * Creates standardized ecosystem authentication middleware.
 */
export function createAuthMiddleware(config = {}) {
  const {
    jwksUri = process.env.KEYCLOAK_JWKS_URI || 'http://localhost:8080/realms/automobile-ecosystem/protocol/openid-connect/certs',
    issuer = process.env.KEYCLOAK_ISSUER || 'http://localhost:8080/realms/automobile-ecosystem',
    audience = process.env.KEYCLOAK_AUDIENCE || ['account', 'ecosystem-core-api', 'hrflow-api', 'maintly-api', 'demo-api'],
    internalServiceKey = process.env.INTERNAL_SERVICE_KEY || 'ecosystem-internal-service-secret-key-2026',
    allowDevFallback = process.env.NODE_ENV !== 'production',
    devJwtSecret = process.env.DEV_JWT_SECRET || process.env.JWT_SECRET || 'ecosystem_core_master_jwt_secret_key_2026',
    userResolver = null
  } = config;

  return async function authenticate(req, res, next) {
    try {
      // 1. Correlation ID tracing
      req.correlationId = req.headers['x-correlation-id'] || req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      res.setHeader('X-Correlation-ID', req.correlationId);

      // 2. Service-to-Service (S2S) internal service key authentication
      const serviceKey = req.headers['x-internal-service-key'];
      if (serviceKey && serviceKey === internalServiceKey) {
        req.user = {
          id: 'system-service',
          email: 'system@ecosystem.internal',
          isPlatformAdmin: true,
          roles: ['PLATFORM_ADMIN'],
          permissions: ['*'],
          tenantId: req.headers['x-tenant-id'] || null
        };
        req.tenantId = req.headers['x-tenant-id'] || null;
        req.branchIds = req.headers['x-branch-ids'] ? req.headers['x-branch-ids'].split(',') : [];
        req.isPlatformAdmin = true;
        return next();
      }

      // 3. Extract Bearer token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AuthenticationError('Authorization Bearer token required.');
      }
      const token = authHeader.split(' ')[1];

      // 4. Decode header to inspect algorithm and kid
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded) {
        throw new AuthenticationError('Malformed authorization token.');
      }

      let payload;

      // RS256 Keycloak verification
      if (decoded.header.alg === 'RS256' && decoded.header.kid) {
        const signingKey = await getSigningKey(jwksUri, decoded.header.kid);
        payload = jwt.verify(token, signingKey, {
          algorithms: ['RS256'],
          issuer: issuer
        });
      } else if (allowDevFallback && decoded.header.alg === 'HS256') {
        // Dev fallback for local unit tests
        payload = jwt.verify(token, devJwtSecret, { algorithms: ['HS256'] });
      } else {
        throw new AuthenticationError(`Unsupported token algorithm '${decoded.header.alg}'.`);
      }

      // 5. Extract standard claims
      const isPlatformAdmin = Boolean(
        payload.isPlatformAdmin ||
        payload.realm_access?.roles?.includes('PLATFORM_ADMIN') ||
        payload.roles?.includes('PLATFORM_ADMIN')
      );

      const tenantId = payload.tenant_id || payload.tenantId || null;
      const branchIds = payload.branch_ids || payload.branchIds || [];
      const permissions = payload.permissions || payload.resource_access?.account?.roles || [];
      const roles = payload.roles || payload.realm_access?.roles || [];

      req.user = {
        id: payload.sub || payload.id,
        email: payload.email || payload.preferred_username,
        firstName: payload.given_name || payload.firstName,
        lastName: payload.family_name || payload.lastName,
        tenantId,
        branchIds,
        roles,
        permissions,
        isPlatformAdmin
      };

      req.tenantId = tenantId;
      req.branchIds = branchIds;
      req.isPlatformAdmin = isPlatformAdmin;

      // Optional custom user resolution hook
      if (userResolver) {
        await userResolver(req);
      }

      next();
    } catch (err) {
      if (err instanceof AuthenticationError || err instanceof ForbiddenError) {
        return next(err);
      }
      if (err.name === 'TokenExpiredError') {
        return next(new AuthenticationError('Authorization token has expired.'));
      }
      if (err.name === 'JsonWebTokenError') {
        return next(new AuthenticationError('Invalid token signature or payload.'));
      }
      return next(new AuthenticationError(err.message));
    }
  };
}

/**
 * Declarative permission guard middleware.
 */
export function requirePermission(requiredPermission) {
  return (req, res, next) => {
    if (req.isPlatformAdmin) return next();
    const perms = req.user?.permissions || [];
    if (perms.includes('*') || perms.includes(requiredPermission)) {
      return next();
    }
    next(new ForbiddenError(`Missing required permission: '${requiredPermission}'.`));
  };
}

/**
 * Declarative role guard middleware.
 */
export function requireRole(allowedRoles) {
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req, res, next) => {
    if (req.isPlatformAdmin) return next();
    const userRoles = req.user?.roles || [];
    const hasRole = rolesArray.some(r => userRoles.includes(r));
    if (hasRole) return next();
    next(new ForbiddenError(`Access restricted to roles: [${rolesArray.join(', ')}].`));
  };
}

/**
 * Ensures valid tenant context is present on request.
 */
export function requireTenant(req, res, next) {
  if (req.isPlatformAdmin) return next();
  if (!req.tenantId) {
    return next(new ForbiddenError('Tenant context is required for this action.'));
  }
  next();
}
