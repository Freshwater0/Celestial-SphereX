// Data validation utilities
export const validateNumber = (value, fallback = 0) => {
  const num = Number(value);
  return !isNaN(num) ? num : fallback;
};

export const validateString = (value, fallback = '') => {
  return typeof value === 'string' ? value : String(fallback);
};

export const validateArray = (value, fallback = []) => {
  return Array.isArray(value) ? value : fallback;
};

// Format utilities
export const formatNumber = (value, options = {}) => {
  const num = validateNumber(value);
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    style = 'decimal',
  } = options;

  try {
    return new Intl.NumberFormat('en-US', {
      style,
      minimumFractionDigits,
      maximumFractionDigits,
      ...options,
    }).format(num);
  } catch (error) {
    console.error('Number formatting error:', error);
    return String(num);
  }
};

export const formatCurrency = (value, currency = 'USD') => {
  return formatNumber(value, {
    style: 'currency',
    currency,
  });
};

export const formatPercentage = (value) => {
  return formatNumber(value, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
};

// Date utilities
export const formatDate = (date, options = {}) => {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) throw new Error('Invalid date');
    
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      ...options,
    }).format(d);
  } catch (error) {
    console.error('Date formatting error:', error);
    return String(date);
  }
};

// Chart data utilities
export const validateChartData = (data = [], requiredKeys = []) => {
  if (!Array.isArray(data)) return [];
  
  return data.filter(item => {
    if (!item || typeof item !== 'object') return false;
    return requiredKeys.every(key => key in item);
  });
};

// Color utilities
export const adjustAlpha = (color, alpha) => {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
};

// Error handling utilities
export const createErrorMessage = (error) => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

// Data transformation utilities
export const transformTimeSeriesData = (data = [], timeKey = 'time', valueKeys = []) => {
  return validateArray(data).map(item => {
    const transformed = { [timeKey]: item[timeKey] };
    valueKeys.forEach(key => {
      transformed[key] = validateNumber(item[key]);
    });
    return transformed;
  });
};

// Template-specific utilities
export const calculateGrowthRate = (current, previous) => {
  const curr = validateNumber(current);
  const prev = validateNumber(previous);
  
  if (prev === 0) return 0;
  return ((curr - prev) / prev) * 100;
};

export const aggregateMetrics = (data = [], key) => {
  return validateArray(data).reduce((sum, item) => {
    return sum + validateNumber(item[key]);
  }, 0);
};

// Memoization utility
export const memoize = (fn) => {
  const cache = new Map();
  
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
};

// Performance optimization utilities
export const debounce = (fn, delay) => {
  let timeoutId;
  
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
};

export const throttle = (fn, limit) => {
  let inThrottle;
  
  return (...args) => {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
