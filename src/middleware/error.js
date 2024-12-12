const createError = require('http-errors');
const winston = require('winston');

// Create Winston logger
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
    body: req.body,
    query: req.query
  });

  // If headers are already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle specific error types
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Resource already exists',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Set locals, only providing error in development
  const error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err.details || err.errors
    })
  };

  // Send error response
  res.status(error.status).json({
    error: {
      message: error.message,
      ...(error.stack && { stack: error.stack }),
      ...(error.details && { details: error.details })
    }
  });
};

// 404 handler
const notFoundHandler = (req, res, next) => {
  next(createError(404, 'Resource not found'));
};

// Validation error handler
const validationErrorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }
  next(err);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  validationErrorHandler,
  logger
};
