const axios = require('axios');

// Fetch news data from NewsAPI
const fetchNewsData = async (keywords, timePeriod, customDateRange) => {
  const apiKey = process.env.NEWS_API_KEY;
  const query = keywords.join(' ');
  const from = customDateRange[0] ? customDateRange[0].toISOString() : undefined;
  const to = customDateRange[1] ? customDateRange[1].toISOString() : undefined;

  const response = await axios.get('https://newsapi.org/v2/everything', {
    params: {
      q: query,
      from,
      to,
      sortBy: 'relevancy',
      apiKey
    }
  });

  return response.data.articles;
};

// Fetch financial data from Alpha Vantage
const fetchFinancialData = async (symbol, timePeriod) => {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  const interval = timePeriod === 'Last 24 Hours' ? '60min' : 'daily';

  const response = await axios.get('https://www.alphavantage.co/query', {
    params: {
      function: 'TIME_SERIES_INTRADAY',
      symbol,
      interval,
      apiKey
    }
  });

  return response.data;
};

// Fetch cryptocurrency data from CoinGecko
const fetchCryptoData = async (symbol, timePeriod) => {
  const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${symbol}/market_chart`, {
    params: {
      vs_currency: 'usd',
      days: timePeriod === 'Last 24 Hours' ? 1 : 7
    }
  });

  return response.data;
};

module.exports = {
  fetchNewsData,
  fetchFinancialData,
  fetchCryptoData
};
