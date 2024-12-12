// Public API keys and configurations for various crypto data providers
module.exports = {
  // Binance public API (no key needed for basic data)
  binance: {
    restBaseUrl: 'https://api.binance.com/api/v3',
    wsBaseUrl: 'wss://stream.binance.com:9443/ws',
    weight: 1 // Priority weight (lower is higher priority)
  },

  // CoinGecko public API (free tier)
  coingecko: {
    restBaseUrl: 'https://api.coingecko.com/api/v3',
    weight: 2
  },

  // CryptoCompare public API
  cryptocompare: {
    restBaseUrl: 'https://min-api.cryptocompare.com/data',
    apiKey: '4d002e87c9dfb4afd5c35f8848c10e4398e0bb7cbc2c70676055ec111a8c2872', // Free API key
    weight: 3
  },

  // Coinbase public API
  coinbase: {
    restBaseUrl: 'https://api.coinbase.com/v2',
    wsBaseUrl: 'wss://ws-feed.pro.coinbase.com',
    weight: 4
  },

  // Kraken public API
  kraken: {
    restBaseUrl: 'https://api.kraken.com/0/public',
    wsBaseUrl: 'wss://ws.kraken.com',
    weight: 5
  },

  // KuCoin public API
  kucoin: {
    restBaseUrl: 'https://api.kucoin.com/api/v1',
    weight: 6
  }
};
