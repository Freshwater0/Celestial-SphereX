const axios = require('axios');

// Using CoinGecko's free API endpoint
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Create axios instance with retry logic and longer timeout
const axiosInstance = axios.create({
    baseURL: COINGECKO_API,
    timeout: 15000,
});

// Common coins mapping (for fallback)
const COMMON_COINS = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'USDT': 'tether',
    'BNB': 'binancecoin',
    'SOL': 'solana',
    'XRP': 'ripple',
    'USDC': 'usd-coin',
    'ADA': 'cardano',
    'DOGE': 'dogecoin',
    'TRX': 'tron',
    'DOT': 'polkadot',
    'MATIC': 'matic-network',
    'DAI': 'dai',
    'LTC': 'litecoin',
    'BCH': 'bitcoin-cash',
    'LINK': 'chainlink',
    'SHIB': 'shiba-inu',
    'ATOM': 'cosmos',
    'XLM': 'stellar',
    'UNI': 'uniswap',
    'AVAX': 'avalanche-2',
    'ETC': 'ethereum-classic',
    'FIL': 'filecoin',
    'NEAR': 'near',
    'APE': 'apecoin',
    'ALGO': 'algorand',
    'VET': 'vechain',
    'ICP': 'internet-computer',
    'MANA': 'decentraland',
    'SAND': 'the-sandbox'
};

// Add response interceptor for rate limiting
axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 429) {
            // Rate limit exceeded, wait for a bit and retry
            await new Promise(resolve => setTimeout(resolve, 2000));
            return axiosInstance.request(error.config);
        }
        return Promise.reject(error);
    }
);

// Helper function to normalize coin ID
const normalizeCoinId = (coinId) => {
    // Convert to lowercase and remove special characters
    const normalized = coinId.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    // Check if it's a common symbol that needs mapping
    const upperCoin = coinId.toUpperCase();
    if (COMMON_COINS[upperCoin]) {
        return COMMON_COINS[upperCoin];
    }
    
    return normalized;
};

const cryptoService = {
    // Get list of supported coins
    getSupportedCoins: async () => {
        try {
            const response = await axiosInstance.get('/coins/list');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch supported coins:', error);
            return Object.values(COMMON_COINS).map(id => ({ id, symbol: id, name: id }));
        }
    },

    // Search for cryptocurrencies with improved error handling
    searchCoins: async (query) => {
        try {
            // First try direct search
            const response = await axiosInstance.get('/search', {
                params: { query }
            });
            
            if (response.data.coins.length > 0) {
                return response.data.coins.slice(0, 10);
            }

            // If no results, try searching in common coins
            const upperQuery = query.toUpperCase();
            const commonMatches = Object.entries(COMMON_COINS)
                .filter(([symbol, id]) => 
                    symbol.includes(upperQuery) || 
                    id.includes(query.toLowerCase())
                )
                .map(([symbol, id]) => ({
                    id,
                    symbol,
                    name: symbol,
                    thumb: '', // Will be filled by subsequent API call
                    large: ''
                }));

            return commonMatches.slice(0, 10);
        } catch (error) {
            console.error('Search error:', error);
            // Return common coins as fallback
            return Object.entries(COMMON_COINS)
                .slice(0, 10)
                .map(([symbol, id]) => ({
                    id,
                    symbol,
                    name: symbol,
                    thumb: '',
                    large: ''
                }));
        }
    },

    // Get simple price data with improved error handling
    getSimplePrice: async (coinId) => {
        try {
            const normalizedId = normalizeCoinId(coinId);
            const response = await axiosInstance.get('/simple/price', {
                params: {
                    ids: normalizedId,
                    vs_currencies: 'usd',
                    include_24hr_change: true,
                    include_24hr_vol: true,
                    include_market_cap: true,
                    include_last_updated_at: true
                }
            });
            
            const data = response.data[normalizedId];
            if (!data) {
                throw new Error('No price data available');
            }
            
            return data;
        } catch (error) {
            console.error('Price fetch error:', error);
            throw new Error('Unable to fetch price data');
        }
    },

    // Get detailed coin data with improved error handling
    getCoinData: async (coinId) => {
        try {
            const normalizedId = normalizeCoinId(coinId);
            
            // Try to get simple price data first
            const simpleData = await cryptoService.getSimplePrice(normalizedId)
                .catch(() => null);
            
            // Then try to get full coin data
            const response = await axiosInstance.get(`/coins/${normalizedId}`, {
                params: {
                    localization: false,
                    tickers: false,
                    market_data: true,
                    community_data: false,
                    developer_data: false,
                    sparkline: false
                }
            });

            // Combine the data
            return {
                ...response.data,
                market_data: {
                    ...response.data.market_data,
                    current_price: {
                        usd: simpleData?.usd || response.data.market_data.current_price.usd
                    },
                    price_change_percentage_24h: 
                        simpleData?.usd_24h_change || 
                        response.data.market_data.price_change_percentage_24h
                }
            };
        } catch (error) {
            console.error('Coin data fetch error:', error);
            
            // If we have simple price data, return that
            try {
                const simpleData = await cryptoService.getSimplePrice(normalizeCoinId(coinId));
                return {
                    id: coinId,
                    name: coinId,
                    symbol: coinId.toUpperCase(),
                    image: { 
                        small: `https://assets.coingecko.com/coins/images/1/small/${coinId.toLowerCase()}.png`,
                        large: `https://assets.coingecko.com/coins/images/1/large/${coinId.toLowerCase()}.png`
                    },
                    market_data: {
                        current_price: { usd: simpleData.usd },
                        price_change_percentage_24h: simpleData.usd_24h_change,
                        market_cap: { usd: simpleData.usd_market_cap },
                        total_volume: { usd: simpleData.usd_24h_vol }
                    }
                };
            } catch (e) {
                throw new Error(`Unable to fetch data for ${coinId}. Please try another cryptocurrency.`);
            }
        }
    },

    // Get price history with improved error handling
    getPriceHistory: async (coinId, days = 7) => {
        try {
            const normalizedId = normalizeCoinId(coinId);
            const response = await axiosInstance.get(
                `/coins/${normalizedId}/market_chart`,
                {
                    params: {
                        vs_currency: 'usd',
                        days,
                        interval: days > 30 ? 'daily' : 'hourly'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Price history fetch error:', error);
            return { 
                prices: [], 
                market_caps: [], 
                total_volumes: [],
                error: 'Historical data temporarily unavailable'
            };
        }
    },

    // Format price with appropriate decimals
    formatPrice: (price) => {
        if (typeof price !== 'number' || isNaN(price)) return '$0.00';
        
        if (price >= 1) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(price);
        } else {
            // For prices less than $1, show more decimal places
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 6,
                maximumFractionDigits: 6
            }).format(price);
        }
    },

    // Format percentage with improved error handling
    formatPercentage: (percentage) => {
        if (typeof percentage !== 'number' || isNaN(percentage)) return '0.00%';
        return `${percentage.toFixed(2)}%`;
    }
};

module.exports = cryptoService;
