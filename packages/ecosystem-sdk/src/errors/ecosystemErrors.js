export class EcosystemError extends Error {
  constructor(message, code = 'INTERNAL_ERROR', statusCode = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends EcosystemError {
  constructor(message, details = null) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class AuthenticationError extends EcosystemError {
  constructor(message = 'Authentication required.') {
    super(message, 'AUTHENTICATION_REQUIRED', 401);
  }
}

export class ForbiddenError extends EcosystemError {
  constructor(message = 'Insufficient permissions.') {
    super(message, 'INSUFFICIENT_PERMISSIONS', 403);
  }
}

export class NotFoundError extends EcosystemError {
  constructor(message = 'Requested resource not found.') {
    super(message, 'RESOURCE_NOT_FOUND', 404);
  }
}

export class ConflictError extends EcosystemError {
  constructor(message = 'Resource already exists or conflict occurred.') {
    super(message, 'RESOURCE_CONFLICT', 409);
  }
}

export class IntegrationError extends EcosystemError {
  constructor(message, details = null) {
    super(message, 'INTEGRATION_ERROR', 502, details);
  }
}

export class WorkflowError extends EcosystemError {
  constructor(message, details = null) {
    super(message, 'WORKFLOW_ERROR', 422, details);
  }
}

/**
 * Standard Express Error Handler producing unified API envelopes.
 */
export function createErrorHandler({ serviceName = 'ecosystem-service', logger = console } = {}) {
  return (err, req, res, next) => {
    const statusCode = err.statusCode || (err.status >= 400 && err.status < 600 ? err.status : 500);
    const errorCode = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'API_ERROR');
    
    if (statusCode >= 500) {
      logger.error(`[${serviceName}] Unhandled Server Error:`, err);
    }

    res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message: err.message || 'An unexpected error occurred.',
        details: err.details || undefined,
        service: serviceName,
        correlationId: req.headers['x-correlation-id'] || req.correlationId || undefined
      }
    });
  };
}
