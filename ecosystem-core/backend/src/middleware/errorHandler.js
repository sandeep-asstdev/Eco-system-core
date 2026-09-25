export function errorHandler(err, req, res, next) {
  console.error('[ECOSYSTEM_ERROR]', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'SERVER_ERROR',
      message: message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
}
