const successResponse = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, error = 'An error occurred', statusCode = 500, details = null) => {
  let errorObj = error;
  if (typeof error === 'string') {
    errorObj = {
      code: details || 'ERROR',
      message: error,
    };
  } else if (typeof error === 'object' && error !== null) {
    if (details && !error.code) error.code = details;
  }
  return res.status(statusCode).json({
    success: false,
    error: errorObj,
    details,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
