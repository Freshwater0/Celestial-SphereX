// API endpoints and configurations
export const API_CONFIG = {
  CRYPTO: {
    BINANCE_WS: 'wss://stream.binance.com:9443/ws',
    COINGECKO: 'https://api.coingecko.com/api/v3',
  },
  STOCK: {
    ALPHA_VANTAGE: 'https://www.alphavantage.co/query',
  },
  SHOPIFY: {
    BASE_URL: '/api/shopify', // Your backend endpoint for Shopify API
  },
};

// Time frames for data fetching
export const TIME_FRAMES = {
  DAY: '24h',
  WEEK: '7d',
  MONTH: '30d',
  YEAR: '1y',
};

// Chart types
export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  AREA: 'area',
  CANDLESTICK: 'candlestick',
};

// Data sources
export const DATA_SOURCES = {
  CRYPTO: 'crypto',
  STOCK: 'stock',
  SOCIAL: 'social',
  SHOPIFY: 'shopify',
};

// Widget types
export const WIDGET_TYPES = {
  CRYPTO: 'crypto',
  STOCK: 'stock',
  GRAPH: 'graph',
  CALENDAR: 'calendar',
};

// Error messages
export const ERROR_MESSAGES = {
  FETCH_FAILED: 'Failed to fetch data',
  CONNECTION_ERROR: 'Connection error',
  INVALID_API_KEY: 'Invalid API key',
  RATE_LIMIT: 'Rate limit exceeded',
};

// Utility functions
export const formatCurrency = (value, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
};

export const formatNumber = (value) => {
  return new Intl.NumberFormat('en-US').format(value);
};

export const formatPercentage = (value) => {
  return `${(value * 100).toFixed(2)}%`;
};

// Color schemes
export const COLORS = {
  positive: '#4caf50',
  negative: '#f44336',
  neutral: '#9e9e9e',
  primary: '#1976d2',
  secondary: '#dc004e',
  chart: {
    line: '#8884d8',
    area: '#82ca9d',
    bar: '#8884d8',
  },
};
