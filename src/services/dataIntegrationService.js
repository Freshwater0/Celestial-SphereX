import {
  cryptoService,
  weatherService,
  newsService,
  stockService,
  additionalCryptoService,
  additionalWeatherService,
  additionalNewsService,
  additionalFinanceService,
} from './apiServices';

// Data source configurations
const DATA_SOURCES = {
  CRYPTO: {
    primary: cryptoService,
    fallback: additionalCryptoService,
    retryAttempts: 3,
    cacheTime: 5 * 60 * 1000, // 5 minutes
  },
  WEATHER: {
    primary: weatherService,
    fallback: additionalWeatherService,
    retryAttempts: 2,
    cacheTime: 30 * 60 * 1000, // 30 minutes
  },
  NEWS: {
    primary: newsService,
    fallback: additionalNewsService,
    retryAttempts: 2,
    cacheTime: 15 * 60 * 1000, // 15 minutes
  },
  STOCKS: {
    primary: stockService,
    fallback: additionalFinanceService,
    retryAttempts: 3,
    cacheTime: 5 * 60 * 1000, // 5 minutes
  },
};

// Cache management
const dataCache = new Map();

const isCacheValid = (cacheEntry) => {
  if (!cacheEntry) return false;
  return Date.now() - cacheEntry.timestamp < cacheEntry.cacheTime;
};

// Data fetching with retry and fallback
const fetchWithRetry = async (source, method, params, attempts = 0) => {
  try {
    const result = await source.primary[method](...params);
    return result;
  } catch (error) {
    if (attempts < source.retryAttempts) {
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempts) * 1000)
      );
      return fetchWithRetry(source, method, params, attempts + 1);
    }
    
    // Try fallback service
    if (source.fallback && source.fallback[method]) {
      try {
        return await source.fallback[method](...params);
      } catch (fallbackError) {
        throw new Error('Both primary and fallback services failed');
      }
    }
    
    throw error;
  }
};

// Data normalization functions
const normalizeData = (data, sourceType) => {
  switch (sourceType) {
    case 'CRYPTO':
      return data.map(item => ({
        timestamp: new Date(item.last_updated).getTime(),
        price: parseFloat(item.current_price),
        volume: parseFloat(item.total_volume),
        change24h: parseFloat(item.price_change_percentage_24h),
        marketCap: parseFloat(item.market_cap),
        symbol: item.symbol.toUpperCase(),
        name: item.name,
      }));

    case 'WEATHER':
      return {
        timestamp: new Date(data.dt * 1000).getTime(),
        temperature: data.main.temp,
        humidity: data.main.humidity,
        conditions: data.weather[0].main,
        windSpeed: data.wind.speed,
        location: data.name,
        coordinates: {
          lat: data.coord.lat,
          lon: data.coord.lon,
        },
      };

    case 'NEWS':
      return data.map(item => ({
        timestamp: new Date(item.publishedAt).getTime(),
        title: item.title,
        description: item.description,
        source: item.source.name,
        url: item.url,
        sentiment: analyzeSentiment(item.title + ' ' + item.description),
      }));

    case 'STOCKS':
      return Object.entries(data['Time Series (Daily)']).map(([date, values]) => ({
        timestamp: new Date(date).getTime(),
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseFloat(values['5. volume']),
      }));

    default:
      return data;
  }
};

// Simple sentiment analysis
const analyzeSentiment = (text) => {
  const positiveWords = ['increase', 'gain', 'growth', 'positive', 'up', 'rise'];
  const negativeWords = ['decrease', 'loss', 'decline', 'negative', 'down', 'fall'];
  
  const words = text.toLowerCase().split(/\W+/);
  let score = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) score++;
    if (negativeWords.includes(word)) score--;
  });
  
  return score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
};

// Data merging function
const mergeDataSets = (dataSets) => {
  const merged = {};
  
  dataSets.forEach(({ data, type }) => {
    if (Array.isArray(data)) {
      data.forEach(item => {
        const timestamp = item.timestamp;
        if (!merged[timestamp]) {
          merged[timestamp] = {};
        }
        merged[timestamp][type] = item;
      });
    } else {
      const timestamp = data.timestamp;
      if (!merged[timestamp]) {
        merged[timestamp] = {};
      }
      merged[timestamp][type] = data;
    }
  });
  
  return Object.entries(merged)
    .map(([timestamp, data]) => ({
      timestamp: parseInt(timestamp),
      ...data,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
};

// Main data integration service
export const dataIntegrationService = {
  async fetchData(sources, params = {}) {
    const results = [];
    
    for (const [sourceType, sourceConfig] of Object.entries(sources)) {
      const cacheKey = JSON.stringify({ sourceType, params });
      const cachedData = dataCache.get(cacheKey);
      
      if (isCacheValid(cachedData)) {
        results.push({
          type: sourceType,
          data: cachedData.data,
        });
        continue;
      }
      
      try {
        const rawData = await fetchWithRetry(
          DATA_SOURCES[sourceType],
          sourceConfig.method,
          sourceConfig.params
        );
        
        const normalizedData = normalizeData(rawData, sourceType);
        
        dataCache.set(cacheKey, {
          data: normalizedData,
          timestamp: Date.now(),
          cacheTime: DATA_SOURCES[sourceType].cacheTime,
        });
        
        results.push({
          type: sourceType,
          data: normalizedData,
        });
      } catch (error) {
        console.error(`Error fetching ${sourceType} data:`, error);
        // Continue with other sources even if one fails
      }
    }
    
    return mergeDataSets(results);
  },
  
  // Process CSV data
  async processCSVData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const text = event.target.result;
          const lines = text.split('\n');
          const headers = lines[0].split(',').map(header => header.trim());
          
          const data = lines.slice(1)
            .filter(line => line.trim())
            .map(line => {
              const values = line.split(',');
              return headers.reduce((obj, header, index) => {
                obj[header] = values[index]?.trim();
                return obj;
              }, {});
            });
            
          resolve(data);
        } catch (error) {
          reject(new Error('Error processing CSV file: ' + error.message));
        }
      };
      
      reader.onerror = () => reject(new Error('Error reading CSV file'));
      reader.readAsText(file);
    });
  },
  
  // Clear cache
  clearCache() {
    dataCache.clear();
  },
  
  // Clear specific cache entry
  clearCacheEntry(sourceType, params = {}) {
    const cacheKey = JSON.stringify({ sourceType, params });
    dataCache.delete(cacheKey);
  },
};

export default dataIntegrationService;
