// Chart colors
export const CHART_COLORS = {
  PRIMARY: '#1976d2',
  SECONDARY: '#dc004e',
  SUCCESS: '#4caf50',
  WARNING: '#ff9800',
  ERROR: '#f44336',
  INFO: '#2196f3',
};

// Chart gradients
export const CHART_GRADIENTS = {
  PRIMARY: [
    { offset: '0%', color: '#1976d2', opacity: 0.8 },
    { offset: '100%', color: '#1976d2', opacity: 0 },
  ],
  SECONDARY: [
    { offset: '0%', color: '#dc004e', opacity: 0.8 },
    { offset: '100%', color: '#dc004e', opacity: 0 },
  ],
};

// Chart defaults
export const CHART_DEFAULTS = {
  ANIMATION_DURATION: 300,
  TOOLTIP_OFFSET: 10,
  LEGEND_OFFSET: 20,
  MIN_HEIGHT: 300,
};

// Data refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  FAST: 5000,    // 5 seconds
  MEDIUM: 15000, // 15 seconds
  SLOW: 60000,   // 1 minute
};

// Error messages
export const ERROR_MESSAGES = {
  DATA_FETCH: 'Failed to fetch data',
  INVALID_DATA: 'Invalid data format',
  CHART_RENDER: 'Failed to render chart',
  NETWORK: 'Network error occurred',
};

// Loading states
export const LOADING_STATES = {
  INITIAL: 'initial',
  FETCHING: 'fetching',
  SUCCESS: 'success',
  ERROR: 'error',
};

// Template types
export const TEMPLATE_TYPES = {
  NEWS: 'news',
  TRADING: 'trading',
  CRYPTO: 'crypto',
  WEATHER: 'weather',
  SOCIAL: 'social',
};

// Data validation schemas
export const VALIDATION_SCHEMAS = {
  NEWS: {
    required: ['headline', 'source', 'date'],
    optional: ['summary', 'image', 'url'],
  },
  TRADING: {
    required: ['symbol', 'price', 'change'],
    optional: ['volume', 'marketCap'],
  },
  CRYPTO: {
    required: ['name', 'price', 'change24h'],
    optional: ['marketCap', 'volume24h'],
  },
};

// Chart types
export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  AREA: 'area',
  PIE: 'pie',
  SCATTER: 'scatter',
  RADAR: 'radar',
};

// Time periods
export const TIME_PERIODS = {
  DAY: '24H',
  WEEK: '7D',
  MONTH: '30D',
  QUARTER: '90D',
  YEAR: '1Y',
  ALL: 'ALL',
};

// Number formats
export const NUMBER_FORMATS = {
  CURRENCY: {
    style: 'currency',
    currency: 'USD',
  },
  PERCENTAGE: {
    style: 'percent',
    minimumFractionDigits: 2,
  },
  COMPACT: {
    notation: 'compact',
    compactDisplay: 'short',
  },
};

// Date formats
export const DATE_FORMATS = {
  SHORT: { dateStyle: 'short' },
  MEDIUM: { dateStyle: 'medium' },
  LONG: { dateStyle: 'long' },
  WITH_TIME: { dateStyle: 'medium', timeStyle: 'short' },
};

// Animation configurations
export const ANIMATIONS = {
  CHART: {
    duration: 300,
    easing: 'ease-in-out',
  },
  TRANSITION: {
    duration: 200,
    easing: 'ease',
  },
};

// Breakpoints
export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};
