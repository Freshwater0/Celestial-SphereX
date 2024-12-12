const CryptoProviderManager = require('./CryptoProviderManager');
const { EventEmitter } = require('events');

class CryptoDataService extends EventEmitter {
  constructor() {
    super();
    this.manager = CryptoProviderManager;
    this.subscriptions = new Map();
    this.cache = new Map();
    this.cacheTTL = 60000; // 1 minute

    // Listen for provider updates
    this.manager.on('price_update', this.handlePriceUpdate.bind(this));
    this.manager.on('provider_switch', this.handleProviderSwitch.bind(this));
  }

  async getPrice(symbol) {
    const normalizedSymbol = symbol.toUpperCase();
    
    // Check cache first
    const cached = this.cache.get(normalizedSymbol);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    try {
      const price = await this.manager.getPrice(normalizedSymbol);
      
      // Update cache
      this.cache.set(normalizedSymbol, {
        data: price,
        timestamp: Date.now()
      });

      return price;
    } catch (error) {
      console.error(`Failed to get price for ${normalizedSymbol}:`, error);
      throw error;
    }
  }

  async getMarketOverview() {
    try {
      const topSymbols = [
        'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'DOGEUSDT',
        'XRPUSDT', 'DOTUSDT', 'UNIUSDT', 'LINKUSDT', 'SOLUSDT'
      ];

      const prices = await Promise.allSettled(
        topSymbols.map(symbol => this.getPrice(symbol))
      );

      return prices
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
    } catch (error) {
      console.error('Failed to get market overview:', error);
      throw error;
    }
  }

  subscribe(clientId, symbol) {
    const normalizedSymbol = symbol.toUpperCase();
    const key = `${clientId}-${normalizedSymbol}`;

    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, {
        symbol: normalizedSymbol,
        clientId,
        timestamp: Date.now()
      });

      // Setup WebSocket connection if this is the first subscriber
      if (this.getSymbolSubscriberCount(normalizedSymbol) === 1) {
        this.manager.setupWebSocket(normalizedSymbol, clientId);
      }
    }

    return true;
  }

  unsubscribe(clientId, symbol) {
    const normalizedSymbol = symbol.toUpperCase();
    const key = `${clientId}-${normalizedSymbol}`;

    if (this.subscriptions.has(key)) {
      this.subscriptions.delete(key);

      // If no more subscribers for this symbol, cleanup WebSocket
      if (this.getSymbolSubscriberCount(normalizedSymbol) === 0) {
        // Cleanup will be handled by the manager
      }
    }

    return true;
  }

  getSymbolSubscriberCount(symbol) {
    let count = 0;
    for (const sub of this.subscriptions.values()) {
      if (sub.symbol === symbol) count++;
    }
    return count;
  }

  handlePriceUpdate(update) {
    // Notify all subscribers for this symbol
    for (const [key, subscription] of this.subscriptions.entries()) {
      if (subscription.symbol === update.symbol) {
        this.emit('price_update', {
          clientId: subscription.clientId,
          ...update
        });
      }
    }

    // Update cache
    this.cache.set(update.symbol, {
      data: update,
      timestamp: Date.now()
    });
  }

  handleProviderSwitch(newProvider) {
    // Notify all subscribers about the provider change
    this.emit('provider_switch', {
      provider: newProvider,
      timestamp: Date.now()
    });

    // Resubscribe all active symbols with the new provider
    const activeSymbols = new Set(
      Array.from(this.subscriptions.values()).map(sub => sub.symbol)
    );

    for (const symbol of activeSymbols) {
      // Re-establish WebSocket connections for each unique symbol
      const firstSubscriber = Array.from(this.subscriptions.values())
        .find(sub => sub.symbol === symbol);
        
      if (firstSubscriber) {
        this.manager.setupWebSocket(symbol, firstSubscriber.clientId);
      }
    }
  }

  cleanup() {
    this.subscriptions.clear();
    this.cache.clear();
    this.manager.cleanup();
  }
}

module.exports = new CryptoDataService();
