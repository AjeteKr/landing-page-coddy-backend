/**
 * Error Handler Middleware
 * Centralized error handling for all endpoints
 */

export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  // Log error
  console.error(`[Error] ${status}: ${message}`, {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    body: req.body,
    stack: err.stack
  });

  // Don't expose internal error details in production
  const response = {
    status: 'error',
    code: status,
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred. Please try again later.' 
      : message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(status).json(response);
};

/**
 * Not Found Handler Middleware
 * Handles routes that don't exist
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: 'error',
    code: 404,
    message: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
