import { useCallback, useMemo } from 'react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

const isValidDateFormat = (dateString, format) => {
  // Basic format validation - can be extended based on requirements
  const formatRegex = {
    'YYYY-MM-DD': /^\d{4}-\d{2}-\d{2}$/,
    'MM/DD/YYYY': /^\d{2}\/\d{2}\/\d{4}$/,
    'DD-MM-YYYY': /^\d{2}-\d{2}-\d{4}$/,
  };
  return formatRegex[format]?.test(dateString) ?? false;
};

export const useDataValidation = (rules = {}) => {
  const memoizedRules = useMemo(() => rules, [rules]);

  const validateNumber = useCallback((value, rule) => {
    const num = Number(value);
    if (Number.isNaN(num)) return false;
    if ('min' in rule && num < rule.min) return false;
    if ('max' in rule && num > rule.max) return false;
    if (rule.precision !== undefined) {
      const decimalPlaces = (num.toString().split('.')[1] || '').length;
      if (decimalPlaces > rule.precision) return false;
    }
    return true;
  }, []);

  const validateDate = useCallback((value, rule) => {
    if (!isValidDate(value)) return false;
    const date = new Date(value);
    
    try {
      if (rule.format && !isValidDateFormat(value, rule.format)) return false;
      if (rule.minDate && date < new Date(rule.minDate)) return false;
      if (rule.maxDate && date > new Date(rule.maxDate)) return false;
      return true;
    } catch (error) {
      console.error('Date validation error:', error);
      return false;
    }
  }, []);

  const validateText = useCallback((value, rule) => {
    if (typeof value !== 'string') return false;
    if (rule.minLength && value.length < rule.minLength) return false;
    if (rule.maxLength && value.length > rule.maxLength) return false;
    if (rule.pattern) {
      try {
        const regex = new RegExp(rule.pattern);
        if (!regex.test(value)) return false;
      } catch (error) {
        console.error('Invalid regex pattern:', error);
        return false;
      }
    }
    return true;
  }, []);

  const validateCell = useCallback((value, type) => {
    if (value === null || value === undefined) return true;
    
    const rule = memoizedRules[type];
    if (!rule) return true;

    try {
      switch (type) {
        case 'number':
          return validateNumber(value, rule);
        case 'date':
          return validateDate(value, rule);
        case 'text':
          return validateText(value, rule);
        case 'email':
          return typeof value === 'string' && EMAIL_REGEX.test(value);
        case 'custom':
          return typeof rule.validate === 'function' ? rule.validate(value) : true;
        default:
          return true;
      }
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  }, [memoizedRules, validateNumber, validateDate, validateText]);

  const getValidationError = useCallback((value, type) => {
    if (!validateCell(value, type)) {
      const rule = memoizedRules[type];
      switch (type) {
        case 'number':
          if (Number.isNaN(Number(value))) return 'Invalid number format';
          if ('min' in rule && Number(value) < rule.min) return `Value must be at least ${rule.min}`;
          if ('max' in rule && Number(value) > rule.max) return `Value must be at most ${rule.max}`;
          if (rule.precision) return `Value must have at most ${rule.precision} decimal places`;
          break;
        case 'date':
          if (!isValidDate(value)) return 'Invalid date format';
          if (rule.format) return `Date must be in ${rule.format} format`;
          if (rule.minDate && new Date(value) < new Date(rule.minDate)) return `Date must be after ${rule.minDate}`;
          if (rule.maxDate && new Date(value) > new Date(rule.maxDate)) return `Date must be before ${rule.maxDate}`;
          break;
        case 'text':
          if (rule.minLength && value.length < rule.minLength) return `Text must be at least ${rule.minLength} characters`;
          if (rule.maxLength && value.length > rule.maxLength) return `Text must be at most ${rule.maxLength} characters`;
          if (rule.pattern) return 'Text does not match required pattern';
          break;
        case 'email':
          return 'Invalid email format';
        case 'custom':
          return rule.errorMessage || 'Invalid value';
      }
    }
    return null;
  }, [memoizedRules, validateCell]);

  return {
    validateCell,
    getValidationError,
  };
};
