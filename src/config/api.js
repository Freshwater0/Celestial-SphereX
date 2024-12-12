// API Keys
export const API_KEYS = {
    ALPHA_VANTAGE: '7820NPV20CHR2G24',
    FINNHUB: 'ct11en9r01qkcukbjt30ct11en9r01qkcukbjt3g',
};

// API Endpoints
export const API_ENDPOINTS = {
    ALPHA_VANTAGE: 'https://www.alphavantage.co/query',
    FINNHUB_WS: 'wss://ws.finnhub.io',
    FINNHUB_REST: 'https://finnhub.io/api/v1',
    BINANCE_WS: 'wss://ws-api.binance.com:443/ws-api/v3',
    BINANCE_TESTNET_WS: 'wss://testnet.binance.vision/ws-api/v3',
    BINANCE_REST: 'https://api.binance.com/api/v3',
};

// WebSocket Channels
export const WS_CHANNELS = {
    BINANCE: {
        TRADE: '@trade',
        KLINE: '@kline',
        TICKER: '@ticker',
    },
    FINNHUB: {
        TRADE: 'trade',
        QUOTE: 'quote',
    },
};

// Time Intervals
export const INTERVALS = {
    ONE_MINUTE: '1m',
    FIVE_MINUTES: '5m',
    FIFTEEN_MINUTES: '15m',
    ONE_HOUR: '1h',
    FOUR_HOURS: '4h',
    ONE_DAY: '1d',
};

// Update Frequencies (in milliseconds)
export const UPDATE_FREQUENCIES = {
    FAST: 1000,    // 1 second
    MEDIUM: 5000,  // 5 seconds
    SLOW: 60000,   // 1 minute
};

// Error Messages
export const API_ERRORS = {
    CONNECTION_FAILED: 'Failed to establish connection',
    INVALID_SYMBOL: 'Invalid symbol',
    RATE_LIMIT: 'Rate limit exceeded',
    AUTHENTICATION: 'Authentication failed',
};

// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5555';

export const endpoints = {
  auth: {
    login: `${API_URL}/api/auth/login`,
    register: `${API_URL}/api/auth/register`,
    me: `${API_URL}/api/auth/me`,
    verifyEmail: `${API_URL}/api/auth/verify-email`,
    resetPassword: `${API_URL}/api/auth/reset-password`,
    googleAuth: `${API_URL}/api/auth/google`
  },
  dashboard: {
    getData: `${API_URL}/api/dashboard/data`,
    updateSettings: `${API_URL}/api/dashboard/settings`
  }
};

// Utility Functions
export const formatNumber = (number, decimals = 2) => {
    if (typeof number !== 'number' || isNaN(number)) return '0';
    return number.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};

export const formatCurrency = (amount, currency = 'USD', decimals = 2) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(amount);
};

export const formatPercentage = (value, decimals = 2) => {
    if (typeof value !== 'number' || isNaN(value)) return '0%';
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

export default API_URL;
