const { validationResult, body, param, query } = require('express-validator');
const createError = require('http-errors');

// Validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format validation errors
    const formattedErrors = errors.array().reduce((acc, error) => {
      if (!acc[error.param]) {
        acc[error.param] = [];
      }
      acc[error.param].push(error.msg);
      return acc;
    }, {});

    next(createError(400, 'Validation Error', { errors: formattedErrors }));
  };
};

// Common validation rules
const commonValidations = {
  // User validations
  username: body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores and hyphens'),

  email: body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  password: body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter'),

  // ID validation
  id: param('id')
    .isInt()
    .withMessage('ID must be an integer'),

  // Pagination validations
  page: query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  limit: query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  // Search validation
  search: query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query cannot be empty'),

  // Sort validation
  sort: query('sort')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort must be either asc or desc')
};

module.exports = {
  validate,
  commonValidations
};
