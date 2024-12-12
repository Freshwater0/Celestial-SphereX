const axios = require('axios');
const WebSocket = require('ws');
const EventEmitter = require('events');
const apiKeys = require('../../config/apiKeys');

class CryptoProviderManager extends EventEmitter {
  constructor() {
    super();
    this.providers = new Map();
    this.activeProvider = null;
    this.wsConnections = new Map();
    this.healthChecks = new Map();
    this.setupProviders();
  }

  setupProviders() {
    // Sort providers by weight
    const sortedProviders = Object.entries(apiKeys)
      .sort(([, a], [, b]) => a.weight - b.weight);

    for (const [name, config] of sortedProviders) {
      this.providers.set(name, {
        ...config,
        status: 'ready',
        failureCount: 0,
        lastCheck: Date.now()
      });
    }

    // Set initial active provider
    this.activeProvider = this.providers.keys().next().value;
  }

  async getPrice(symbol) {
    const normalizedSymbol = symbol.toUpperCase();
    let error = null;

    for (const [providerName, provider] of this.providers) {
      try {
        const price = await this[`getPrice${providerName.charAt(0).toUpperCase() + providerName.slice(1)}`](normalizedSymbol);
        this.updateProviderHealth(providerName, true);
        return price;
      } catch (err) {
        error = err;
        this.updateProviderHealth(providerName, false);
        continue;
      }
    }

    throw error || new Error('All providers failed');
  }

  async getPriceBinance(symbol) {
    const { data } = await axios.get(`${apiKeys.binance.restBaseUrl}/ticker/24hr`, {
      params: { symbol }
    });
    return this.normalizePrice(data, 'binance');
  }

  async getPriceCoingecko(symbol) {
    // Convert symbol to coingecko format (e.g., BTCUSDT -> bitcoin)
    const id = await this.getCoingeckoId(symbol);
    const { data } = await axios.get(`${apiKeys.coingecko.restBaseUrl}/simple/price`, {
      params: {
        ids: id,
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_24hr_vol: true
      }
    });
    return this.normalizePrice(data[id], 'coingecko');
  }

  async getPriceCryptocompare(symbol) {
    const baseSymbol = symbol.slice(0, -4); // Remove USDT
    const { data } = await axios.get(`${apiKeys.cryptocompare.restBaseUrl}/pricemultifull`, {
      params: {
        fsyms: baseSymbol,
        tsyms: 'USD',
        api_key: apiKeys.cryptocompare.apiKey
      }
    });
    return this.normalizePrice(data.RAW[baseSymbol].USD, 'cryptocompare');
  }

  async getPriceCoinbase(symbol) {
    // Convert symbol to coinbase format (e.g., BTCUSDT -> BTC-USD)
    const coinbaseSymbol = `${symbol.slice(0, -4)}-USD`;
    const { data } = await axios.get(`${apiKeys.coinbase.restBaseUrl}/prices/${coinbaseSymbol}/spot`);
    return this.normalizePrice(data.data, 'coinbase');
  }

  normalizePrice(data, provider) {
    switch (provider) {
      case 'binance':
        return {
          price: parseFloat(data.lastPrice),
          change24h: parseFloat(data.priceChangePercent),
          volume24h: parseFloat(data.volume),
          high24h: parseFloat(data.highPrice),
          low24h: parseFloat(data.lowPrice),
          provider
        };

      case 'coingecko':
        return {
          price: data.usd,
          change24h: data.usd_24h_change,
          volume24h: data.usd_24h_vol,
          provider
        };

      case 'cryptocompare':
        return {
          price: data.PRICE,
          change24h: data.CHANGEPCT24HOUR,
          volume24h: data.VOLUME24HOUR,
          high24h: data.HIGH24HOUR,
          low24h: data.LOW24HOUR,
          provider
        };

      case 'coinbase':
        return {
          price: parseFloat(data.amount),
          provider
        };

      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  updateProviderHealth(providerName, success) {
    const provider = this.providers.get(providerName);
    if (!provider) return;

    if (success) {
      provider.failureCount = 0;
      provider.status = 'healthy';
    } else {
      provider.failureCount++;
      if (provider.failureCount >= 3) {
        provider.status = 'failing';
        this.switchProvider();
      }
    }

    provider.lastCheck = Date.now();
    this.providers.set(providerName, provider);
  }

  switchProvider() {
    const availableProviders = Array.from(this.providers.entries())
      .filter(([, provider]) => provider.status !== 'failing')
      .sort(([, a], [, b]) => a.weight - b.weight);

    if (availableProviders.length > 0) {
      this.activeProvider = availableProviders[0][0];
      this.emit('provider_switch', this.activeProvider);
    }
  }

  async getCoingeckoId(symbol) {
    // Maintain a cache of symbol to ID mappings
    if (!this.coingeckoIdCache) {
      const { data } = await axios.get(`${apiKeys.coingecko.restBaseUrl}/coins/list`);
      this.coingeckoIdCache = new Map(
        data.map(coin => [coin.symbol.toUpperCase(), coin.id])
      );
    }

    const baseSymbol = symbol.slice(0, -4).toUpperCase(); // Remove USDT
    return this.coingeckoIdCache.get(baseSymbol) || baseSymbol.toLowerCase();
  }

  setupWebSocket(symbol, clientId) {
    const wsKey = `${clientId}-${symbol}`;
    
    // Try to establish WebSocket connections with all providers that support it
    for (const [providerName, config] of Object.entries(apiKeys)) {
      if (config.wsBaseUrl) {
        try {
          const ws = this.connectWebSocket(providerName, symbol, clientId);
          this.wsConnections.set(wsKey, ws);
          break; // Use the first successful connection
        } catch (error) {
          console.error(`Failed to connect to ${providerName} WebSocket:`, error);
          continue;
        }
      }
    }
  }

  connectWebSocket(provider, symbol, clientId) {
    const config = apiKeys[provider];
    let ws;

    switch (provider) {
      case 'binance':
        ws = new WebSocket(`${config.wsBaseUrl}/${symbol.toLowerCase()}@trade`);
        break;
      case 'coinbase':
        ws = new WebSocket(config.wsBaseUrl);
        break;
      case 'kraken':
        ws = new WebSocket(config.wsBaseUrl);
        break;
      default:
        throw new Error(`WebSocket not supported for provider: ${provider}`);
    }

    ws.on('open', () => {
      this.setupWebSocketHandlers(provider, ws, symbol);
    });

    return ws;
  }

  setupWebSocketHandlers(provider, ws, symbol) {
    switch (provider) {
      case 'binance':
        // Binance doesn't need subscription message after connection
        break;

      case 'coinbase':
        ws.send(JSON.stringify({
          type: 'subscribe',
          product_ids: [symbol.slice(0, -4) + '-USD'],
          channels: ['ticker']
        }));
        break;

      case 'kraken':
        ws.send(JSON.stringify({
          event: 'subscribe',
          pair: [symbol.slice(0, -4) + '/USD'],
          subscription: { name: 'ticker' }
        }));
        break;
    }

    ws.on('message', (data) => {
      try {
        const update = this.normalizeWebSocketMessage(provider, data);
        if (update) {
          this.emit('price_update', update);
        }
      } catch (error) {
        console.error(`Error processing ${provider} WebSocket message:`, error);
      }
    });
  }

  normalizeWebSocketMessage(provider, data) {
    const message = JSON.parse(data);

    switch (provider) {
      case 'binance':
        if (message.e === 'trade') {
          return {
            provider,
            symbol: message.s,
            price: parseFloat(message.p),
            timestamp: message.T
          };
        }
        break;

      case 'coinbase':
        if (message.type === 'ticker') {
          return {
            provider,
            symbol: message.product_id.replace('-', ''),
            price: parseFloat(message.price),
            timestamp: new Date(message.time).getTime()
          };
        }
        break;

      case 'kraken':
        // Handle Kraken specific message format
        break;
    }

    return null;
  }

  cleanup() {
    // Close all WebSocket connections
    for (const ws of this.wsConnections.values()) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    }
    this.wsConnections.clear();
  }
}

module.exports = new CryptoProviderManager();
