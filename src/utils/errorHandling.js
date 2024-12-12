// Error types
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  API: 'API_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  AUTH: 'AUTHENTICATION_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  WEBSOCKET: 'WEBSOCKET_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Error messages
export const ErrorMessages = {
  [ErrorTypes.NETWORK]: 'Network connection error. Please check your internet connection.',
  [ErrorTypes.API]: 'API request failed. Please try again later.',
  [ErrorTypes.RATE_LIMIT]: 'Rate limit exceeded. Please wait before making more requests.',
  [ErrorTypes.AUTH]: 'Authentication failed. Please check your credentials.',
  [ErrorTypes.VALIDATION]: 'Invalid data provided. Please check your input.',
  [ErrorTypes.TIMEOUT]: 'Request timed out. Please try again.',
  [ErrorTypes.WEBSOCKET]: 'WebSocket connection error. Attempting to reconnect...',
  [ErrorTypes.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

// Error handler class
export class AppError extends Error {
  constructor(type, message, originalError = null) {
    super(message || ErrorMessages[type]);
    this.type = type;
    this.originalError = originalError;
    this.timestamp = new Date();
  }
}

// API error handler
export const handleApiError = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    
    switch (response.status) {
      case 401:
        throw new AppError(ErrorTypes.AUTH, errorData?.message);
      case 403:
        throw new AppError(ErrorTypes.AUTH, 'Access denied');
      case 404:
        throw new AppError(ErrorTypes.API, 'Resource not found');
      case 429:
        throw new AppError(ErrorTypes.RATE_LIMIT, errorData?.message);
      case 500:
        throw new AppError(ErrorTypes.API, 'Internal server error');
      default:
        throw new AppError(ErrorTypes.UNKNOWN, errorData?.message);
    }
  }
  return response;
};

// WebSocket error handler
export const handleWebSocketError = (error) => {
  if (error instanceof Event) {
    return new AppError(ErrorTypes.WEBSOCKET, 'WebSocket connection failed');
  }
  return new AppError(ErrorTypes.WEBSOCKET, error.message, error);
};

// Network error handler
export const handleNetworkError = (error) => {
  if (error.name === 'AbortError') {
    return new AppError(ErrorTypes.TIMEOUT, 'Request timed out');
  }
  return new AppError(ErrorTypes.NETWORK, error.message, error);
};

// API request wrapper with timeout
export const fetchWithTimeout = async (url, options = {}, timeout = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return await handleApiError(response);
  } catch (error) {
    clearTimeout(timeoutId);
    throw handleNetworkError(error);
  }
};

// Retry mechanism for failed requests
export const retryOperation = async (operation, maxAttempts = 3, delay = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) break;
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
};

// Rate limiting
const rateLimits = new Map();

export const checkRateLimit = (key, limit = 10, window = 60000) => {
  const now = Date.now();
  const timestamps = rateLimits.get(key) || [];
  
  // Remove old timestamps
  const validTimestamps = timestamps.filter(ts => now - ts < window);
  
  if (validTimestamps.length >= limit) {
    throw new AppError(
      ErrorTypes.RATE_LIMIT,
      `Rate limit of ${limit} requests per ${window/1000}s exceeded`
    );
  }
  
  validTimestamps.push(now);
  rateLimits.set(key, validTimestamps);
};

// Error logger
export const logError = (error, context = {}) => {
  const errorLog = {
    type: error.type || 'UNKNOWN',
    message: error.message,
    timestamp: new Date().toISOString(),
    stack: error.stack,
    context,
    originalError: error.originalError
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorLog);
  }

  // Here you would typically send to your error tracking service
  // e.g., Sentry, LogRocket, etc.
};
