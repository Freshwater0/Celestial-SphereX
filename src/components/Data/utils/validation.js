/**
 * Data validation utilities
 * Provides comprehensive validation rules and error checking
 */

/**
 * Validate a single cell value
 * @param {any} value - Value to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result
 */
export const validateCell = (value, rules) => {
  if (!rules) return { valid: true };

  const errors = [];

  // Required check
  if (rules.required && (value == null || value === '')) {
    errors.push('This field is required');
  }

  // Type-specific validation
  if (value != null && value !== '') {
    switch (rules.type) {
      case 'number':
        if (isNaN(Number(value))) {
          errors.push('Must be a number');
        } else {
          const num = Number(value);
          if ('min' in rules && num < rules.min) {
            errors.push(`Must be at least ${rules.min}`);
          }
          if ('max' in rules && num > rules.max) {
            errors.push(`Must be at most ${rules.max}`);
          }
          if (rules.integer && !Number.isInteger(num)) {
            errors.push('Must be an integer');
          }
        }
        break;

      case 'string':
        if (typeof value !== 'string') {
          errors.push('Must be text');
        } else {
          if ('minLength' in rules && value.length < rules.minLength) {
            errors.push(`Must be at least ${rules.minLength} characters`);
          }
          if ('maxLength' in rules && value.length > rules.maxLength) {
            errors.push(`Must be at most ${rules.maxLength} characters`);
          }
          if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
            errors.push(rules.patternError || 'Invalid format');
          }
        }
        break;

      case 'date':
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          errors.push('Must be a valid date');
        } else {
          if (rules.minDate && date < new Date(rules.minDate)) {
            errors.push(`Must be after ${rules.minDate}`);
          }
          if (rules.maxDate && date > new Date(rules.maxDate)) {
            errors.push(`Must be before ${rules.maxDate}`);
          }
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push('Must be a valid email address');
        }
        break;

      case 'url':
        try {
          new URL(value);
        } catch {
          errors.push('Must be a valid URL');
        }
        break;

      case 'custom':
        if (typeof rules.validate === 'function') {
          const customError = rules.validate(value);
          if (customError) {
            errors.push(customError);
          }
        }
        break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate multiple cells
 * @param {Array} cells - Array of cells to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation results
 */
export const validateCells = (cells, rules) => {
  const results = {};
  let isValid = true;

  cells.forEach(cell => {
    const result = validateCell(cell.value, rules[cell.field]);
    results[cell.field] = result;
    if (!result.valid) {
      isValid = false;
    }
  });

  return {
    valid: isValid,
    results,
  };
};

/**
 * Create a validation rule
 * @param {Object} config - Rule configuration
 * @returns {Object} Validation rule
 */
export const createRule = (config) => {
  return {
    type: config.type || 'string',
    required: config.required || false,
    ...config,
  };
};

/**
 * Common validation rules
 */
export const CommonRules = {
  required: createRule({
    required: true,
    type: 'string',
  }),

  email: createRule({
    type: 'email',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternError: 'Invalid email address',
  }),

  phone: createRule({
    type: 'string',
    pattern: /^\+?[\d\s-]{10,}$/,
    patternError: 'Invalid phone number',
  }),

  url: createRule({
    type: 'url',
  }),

  integer: createRule({
    type: 'number',
    integer: true,
  }),

  decimal: createRule({
    type: 'number',
    pattern: /^\d*\.?\d+$/,
    patternError: 'Must be a decimal number',
  }),

  date: createRule({
    type: 'date',
  }),
};

/**
 * Format validation error messages
 * @param {Array} errors - Array of error messages
 * @returns {string} Formatted error message
 */
export const formatErrors = (errors) => {
  if (!errors || errors.length === 0) return '';
  return errors.join('. ');
};
