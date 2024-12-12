import { fetchWithTimeout, retryOperation, AppError, ErrorTypes } from './errorHandling';

/**
 * Fetch stock data with error handling and retries
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Object>} Stock data
 */
export const fetchStockData = async (symbol) => {
  try {
    const response = await retryOperation(async () => {
      return await fetchWithTimeout(
        `${process.env.REACT_APP_FINNHUB_API_URL}/quote?symbol=${symbol}&token=${process.env.REACT_APP_FINNHUB_API_KEY}`,
        { method: 'GET' },
        5000
      );
    });

    const data = await response.json();
    if (data.error) {
      throw new AppError(ErrorTypes.API, data.error);
    }
    
    return {
      ...data,
      lastUpdated: Date.now()
    };
  } catch (error) {
    throw new AppError(
      ErrorTypes.API,
      `Failed to fetch stock data for ${symbol}: ${error.message}`,
      error
    );
  }
};

/**
 * Fetch company profile data
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Object>} Company profile data
 */
export const fetchCompanyProfile = async (symbol) => {
  try {
    const response = await retryOperation(async () => {
      return await fetchWithTimeout(
        `${process.env.REACT_APP_FINNHUB_API_URL}/stock/profile2?symbol=${symbol}&token=${process.env.REACT_APP_FINNHUB_API_KEY}`,
        { method: 'GET' },
        5000
      );
    });

    const data = await response.json();
    if (data.error) {
      throw new AppError(ErrorTypes.API, data.error);
    }
    
    return data;
  } catch (error) {
    throw new AppError(
      ErrorTypes.API,
      `Failed to fetch company profile for ${symbol}: ${error.message}`,
      error
    );
  }
};

/**
 * Fetch historical candle data
 * @param {string} symbol - Stock symbol
 * @param {number} from - Start timestamp
 * @param {number} to - End timestamp
 * @param {string} resolution - Candle resolution
 * @returns {Promise<Object>} Historical candle data
 */
export const fetchCandles = async (symbol, from, to, resolution = 'D') => {
  try {
    const response = await retryOperation(async () => {
      return await fetchWithTimeout(
        `${process.env.REACT_APP_FINNHUB_API_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${process.env.REACT_APP_FINNHUB_API_KEY}`,
        { method: 'GET' },
        5000
      );
    });

    const data = await response.json();
    if (data.error || data.s === 'no_data') {
      throw new AppError(
        ErrorTypes.API,
        data.error || 'No data available for the specified period'
      );
    }
    
    return data;
  } catch (error) {
    throw new AppError(
      ErrorTypes.API,
      `Failed to fetch candle data for ${symbol}: ${error.message}`,
      error
    );
  }
};

/**
 * Fetch company news
 * @param {string} symbol - Stock symbol
 * @param {number} from - Start timestamp
 * @param {number} to - End timestamp
 * @returns {Promise<Array>} Company news articles
 */
export const fetchCompanyNews = async (symbol, from, to) => {
  try {
    const response = await retryOperation(async () => {
      return await fetchWithTimeout(
        `${process.env.REACT_APP_FINNHUB_API_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${process.env.REACT_APP_FINNHUB_API_KEY}`,
        { method: 'GET' },
        5000
      );
    });

    const data = await response.json();
    if (data.error) {
      throw new AppError(ErrorTypes.API, data.error);
    }
    
    return data;
  } catch (error) {
    throw new AppError(
      ErrorTypes.API,
      `Failed to fetch news for ${symbol}: ${error.message}`,
      error
    );
  }
};

/**
 * Fetch company financials
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Object>} Company financials
 */
export const fetchFinancials = async (symbol) => {
  try {
    const response = await retryOperation(async () => {
      return await fetchWithTimeout(
        `${process.env.REACT_APP_FINNHUB_API_URL}/stock/metric?symbol=${symbol}&metric=all&token=${process.env.REACT_APP_FINNHUB_API_KEY}`,
        { method: 'GET' },
        5000
      );
    });

    const data = await response.json();
    if (data.error) {
      throw new AppError(ErrorTypes.API, data.error);
    }
    
    return data;
  } catch (error) {
    throw new AppError(
      ErrorTypes.API,
      `Failed to fetch financials for ${symbol}: ${error.message}`,
      error
    );
  }
};

/**
 * Check if market is open
 * @param {string} exchange - Exchange name
 * @returns {Promise<boolean>} Whether market is open
 */
export const isMarketOpen = async (exchange = 'US') => {
  try {
    const response = await retryOperation(async () => {
      return await fetchWithTimeout(
        `${process.env.REACT_APP_FINNHUB_API_URL}/stock/market-status?exchange=${exchange}&token=${process.env.REACT_APP_FINNHUB_API_KEY}`,
        { method: 'GET' },
        5000
      );
    });

    const data = await response.json();
    if (data.error) {
      throw new AppError(ErrorTypes.API, data.error);
    }
    
    return data.isOpen;
  } catch (error) {
    throw new AppError(
      ErrorTypes.API,
      `Failed to check market status: ${error.message}`,
      error
    );
  }
};
