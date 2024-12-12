import axios from 'axios';
import DOMPurify from 'dompurify';

// CoinGecko API for crypto data
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
// OpenWeatherMap API for weather data
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
// NewsAPI for news data
const NEWS_BASE_URL = 'https://newsapi.org/v2';
// Alpha Vantage for stock market data
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

// Free API Keys (in production, these should be environment variables)
const WEATHER_API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
const NEWS_API_KEY = process.env.REACT_APP_NEWS_API_KEY;
const ALPHA_VANTAGE_API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;

// Function to sanitize user inputs
const sanitizeInput = (input) => {
  return DOMPurify.sanitize(input);
};

// Crypto Data Services
export const cryptoService = {
  // Get list of top cryptocurrencies
  getTopCoins: async (limit = 10) => {
    try {
      const response = await axios.get(`${COINGECKO_BASE_URL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: limit,
          page: 1,
          sparkline: false,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top coins:', error);
      throw error;
    }
  },

  // Get historical data for a specific coin
  getCoinHistory: async (coinId, days = 30) => {
    try {
      const sanitizedCoinId = sanitizeInput(coinId);
      const response = await axios.get(
        `${COINGECKO_BASE_URL}/coins/${sanitizedCoinId}/market_chart`,
        {
          params: {
            vs_currency: 'usd',
            days: days,
            interval: 'daily',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching coin history:', error);
      throw error;
    }
  },

  // Search for coins
  searchCoins: async (query) => {
    try {
      const sanitizedQuery = sanitizeInput(query);
      const response = await axios.get(`${COINGECKO_BASE_URL}/search`, {
        params: { query: sanitizedQuery },
      });
      return response.data.coins;
    } catch (error) {
      console.error('Error searching coins:', error);
      throw error;
    }
  },
};

// Weather Data Services
export const weatherService = {
  // Get current weather for a city
  getCurrentWeather: async (city) => {
    try {
      const sanitizedCity = sanitizeInput(city);
      const response = await axios.get(`${WEATHER_BASE_URL}/weather`, {
        params: {
          q: sanitizedCity,
          appid: WEATHER_API_KEY,
          units: 'metric',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw error;
    }
  },

  // Get weather forecast
  getForecast: async (city, days = 5) => {
    try {
      const sanitizedCity = sanitizeInput(city);
      const response = await axios.get(`${WEATHER_BASE_URL}/forecast`, {
        params: {
          q: sanitizedCity,
          appid: WEATHER_API_KEY,
          units: 'metric',
          cnt: days * 8, // 8 forecasts per day
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      throw error;
    }
  },
};

// News Data Services
export const newsService = {
  // Get top headlines
  getTopHeadlines: async (category = 'business', country = 'us') => {
    try {
      const response = await axios.get(`${NEWS_BASE_URL}/top-headlines`, {
        params: {
          category,
          country,
          apiKey: NEWS_API_KEY,
        },
      });
      return response.data.articles;
    } catch (error) {
      console.error('Error fetching top headlines:', error);
      throw error;
    }
  },

  // Search news articles
  searchNews: async (query, from, to) => {
    try {
      const sanitizedQuery = sanitizeInput(query);
      const response = await axios.get(`${NEWS_BASE_URL}/everything`, {
        params: {
          q: sanitizedQuery,
          from,
          to,
          sortBy: 'publishedAt',
          apiKey: NEWS_API_KEY,
        },
      });
      return response.data.articles;
    } catch (error) {
      console.error('Error searching news:', error);
      throw error;
    }
  },
};

// Stock Market Data Services
export const stockService = {
  // Get daily time series for a symbol
  getDailyTimeSeries: async (symbol) => {
    try {
      const sanitizedSymbol = sanitizeInput(symbol);
      const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: sanitizedSymbol,
          apikey: ALPHA_VANTAGE_API_KEY,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching stock time series:', error);
      throw error;
    }
  },

  // Search for stocks
  searchStocks: async (keywords) => {
    try {
      const sanitizedKeywords = sanitizeInput(keywords);
      const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords: sanitizedKeywords,
          apikey: ALPHA_VANTAGE_API_KEY,
        },
      });
      return response.data.bestMatches;
    } catch (error) {
      console.error('Error searching stocks:', error);
      throw error;
    }
  },
};

// Additional News APIs
export const additionalNewsService = {
  // Currents API (No API key required for limited requests)
  getCurrentsNews: async (query) => {
    try {
      const sanitizedQuery = sanitizeInput(query);
      const response = await axios.get(`https://api.currentsapi.services/v1/latest-news`, {
        params: { keywords: sanitizedQuery },
      });
      return response.data.news;
    } catch (error) {
      console.error('Error fetching news from Currents API:', error);
      throw error;
    }
  },

  // The New York Times RSS Feeds
  getNYTimesRSS: async () => {
    try {
      const response = await axios.get('https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml');
      // Parse XML response here
      return response.data;
    } catch (error) {
      console.error('Error fetching NY Times RSS:', error);
      throw error;
    }
  },

  // BBC RSS Feeds
  getBBCNewsRSS: async () => {
    try {
      const response = await axios.get('http://feeds.bbci.co.uk/news/rss.xml');
      // Parse XML response here
      return response.data;
    } catch (error) {
      console.error('Error fetching BBC RSS:', error);
      throw error;
    }
  },
};

// Additional Finance APIs
export const additionalFinanceService = {
  // Yahoo Finance (Unofficial)
  getYahooFinanceData: async (symbol) => {
    try {
      const sanitizedSymbol = sanitizeInput(symbol);
      const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${sanitizedSymbol}`);
      return response.data.chart.result;
    } catch (error) {
      console.error('Error fetching Yahoo Finance data:', error);
      throw error;
    }
  },

  // Trading Economics
  getTradingEconomicsData: async (indicator) => {
    try {
      const sanitizedIndicator = sanitizeInput(indicator);
      const response = await axios.get(`https://api.tradingeconomics.com/historical/${sanitizedIndicator}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Trading Economics data:', error);
      throw error;
    }
  },
};

// Additional Cryptocurrency APIs
export const additionalCryptoService = {
  // Binance Public API
  getBinanceData: async (symbol) => {
    try {
      const sanitizedSymbol = sanitizeInput(symbol);
      const response = await axios.get(`https://api.binance.com/api/v3/ticker/24hr`, {
        params: { symbol: sanitizedSymbol },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Binance data:', error);
      throw error;
    }
  },

  // Bitstamp Public API
  getBitstampData: async (symbol) => {
    try {
      const sanitizedSymbol = sanitizeInput(symbol);
      const response = await axios.get(`https://www.bitstamp.net/api/v2/ticker/${sanitizedSymbol}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Bitstamp data:', error);
      throw error;
    }
  },
};

// Additional Weather APIs
export const additionalWeatherService = {
  // National Weather Service
  getNWSData: async (location) => {
    try {
      const sanitizedLocation = sanitizeInput(location);
      const response = await axios.get(`https://api.weather.gov/points/${sanitizedLocation}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching NWS data:', error);
      throw error;
    }
  },

  // Open-Meteo
  getOpenMeteoData: async (latitude, longitude) => {
    try {
      const sanitizedLatitude = sanitizeInput(latitude);
      const sanitizedLongitude = sanitizeInput(longitude);
      const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
        params: { latitude: sanitizedLatitude, longitude: sanitizedLongitude, daily: 'temperature_2m_max' },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Open-Meteo data:', error);
      throw error;
    }
  },

  // wttr.in
  getWttrData: async (location) => {
    try {
      const sanitizedLocation = sanitizeInput(location);
      const response = await axios.get(`https://wttr.in/${sanitizedLocation}`, {
        params: { format: 'j1' },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching wttr.in data:', error);
      throw error;
    }
  },
};

// Helper function to format date ranges
export const getDateRange = (range) => {
  const end = new Date();
  const start = new Date();

  switch (range) {
    case '1d':
      start.setDate(end.getDate() - 1);
      break;
    case '7d':
      start.setDate(end.getDate() - 7);
      break;
    case '1m':
      start.setMonth(end.getMonth() - 1);
      break;
    case '3m':
      start.setMonth(end.getMonth() - 3);
      break;
    case '6m':
      start.setMonth(end.getMonth() - 6);
      break;
    case '1y':
      start.setFullYear(end.getFullYear() - 1);
      break;
    default:
      start.setMonth(end.getMonth() - 1); // Default to 1 month
  }

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
};
