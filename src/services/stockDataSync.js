import { UPDATE_FREQUENCIES, API_ENDPOINTS, API_KEYS } from '../config/api';

class StockDataSync {
  constructor() {
    this.cache = new Map();
    this.subscribers = new Map();
    this.lastUpdate = new Map();
    this.updateInterval = null;
    this.CACHE_DURATION = 1000 * 60 * 5; // 5 minutes
  }

  async subscribe(symbol, callback) {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
    }
    this.subscribers.get(symbol).add(callback);

    // Initialize or update cache
    await this.updateCache(symbol);

    return () => this.unsubscribe(symbol, callback);
  }

  unsubscribe(symbol, callback) {
    const subscribers = this.subscribers.get(symbol);
    if (subscribers) {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.cache.delete(symbol);
        this.lastUpdate.delete(symbol);
      }
    }
  }

  async updateCache(symbol) {
    try {
      const lastUpdate = this.lastUpdate.get(symbol);
      if (!lastUpdate || Date.now() - lastUpdate > this.CACHE_DURATION) {
        const [quote, profile, intraday] = await Promise.all([
          this.fetchQuote(symbol),
          this.fetchCompanyProfile(symbol),
          this.fetchIntradayData(symbol)
        ]);

        const data = {
          quote,
          profile,
          intraday,
          timestamp: Date.now()
        };

        this.cache.set(symbol, data);
        this.lastUpdate.set(symbol, Date.now());
        this.notifySubscribers(symbol, data);
      }
    } catch (error) {
      console.error(`Error updating cache for ${symbol}:`, error);
      this.notifyError(symbol, error);
    }
  }

  async fetchQuote(symbol) {
    const response = await fetch(
      `${API_ENDPOINTS.FINNHUB_REST}/quote?symbol=${symbol}&token=${API_KEYS.FINNHUB}`
    );
    if (!response.ok) throw new Error('Failed to fetch quote');
    return response.json();
  }

  async fetchCompanyProfile(symbol) {
    const response = await fetch(
      `${API_ENDPOINTS.FINNHUB_REST}/stock/profile2?symbol=${symbol}&token=${API_KEYS.FINNHUB}`
    );
    if (!response.ok) throw new Error('Failed to fetch company profile');
    return response.json();
  }

  async fetchIntradayData(symbol) {
    const response = await fetch(
      `${API_ENDPOINTS.ALPHA_VANTAGE}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${API_KEYS.ALPHA_VANTAGE}`
    );
    if (!response.ok) throw new Error('Failed to fetch intraday data');
    return response.json();
  }

  notifySubscribers(symbol, data) {
    const subscribers = this.subscribers.get(symbol);
    if (subscribers) {
      subscribers.forEach(callback => callback({ type: 'update', data }));
    }
  }

  notifyError(symbol, error) {
    const subscribers = this.subscribers.get(symbol);
    if (subscribers) {
      subscribers.forEach(callback => callback({ type: 'error', error }));
    }
  }

  getCachedData(symbol) {
    return this.cache.get(symbol);
  }

  startAutoUpdate() {
    this.updateInterval = setInterval(() => {
      this.subscribers.forEach((_, symbol) => {
        this.updateCache(symbol);
      });
    }, UPDATE_FREQUENCIES.MEDIUM);
  }

  stopAutoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  cleanup() {
    this.stopAutoUpdate();
    this.cache.clear();
    this.subscribers.clear();
    this.lastUpdate.clear();
  }
}

const stockDataSync = new StockDataSync();
export default stockDataSync;
