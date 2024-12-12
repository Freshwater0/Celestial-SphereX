const CryptoDataService = require('../services/crypto/CryptoDataService');

const cryptoController = {
  async getPrice(req, res) {
    try {
      const { symbol } = req.params;
      const price = await CryptoDataService.getPrice(symbol);
      res.json(price);
    } catch (error) {
      console.error('Error getting price:', error);
      res.status(500).json({ error: 'Failed to fetch price data' });
    }
  },

  async getMarketOverview(req, res) {
    try {
      const overview = await CryptoDataService.getMarketOverview();
      res.json(overview);
    } catch (error) {
      console.error('Error getting market overview:', error);
      res.status(500).json({ error: 'Failed to fetch market overview' });
    }
  },

  async getHistoricalData(req, res) {
    try {
      const { symbol, interval = '1d', limit = 30 } = req.params;
      const historicalData = await CryptoDataService.getHistoricalData(symbol, interval, limit);
      res.json(historicalData);
    } catch (error) {
      console.error('Error getting historical data:', error);
      res.status(500).json({ error: 'Failed to fetch historical data' });
    }
  },

  async searchSymbols(req, res) {
    try {
      const { query } = req.query;
      const symbols = await CryptoDataService.searchSymbols(query);
      res.json(symbols);
    } catch (error) {
      console.error('Error searching symbols:', error);
      res.status(500).json({ error: 'Failed to search symbols' });
    }
  },

  handleWebSocket(ws, req) {
    const clientId = req.clientId;

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);

        switch (data.type) {
          case 'subscribe':
            CryptoDataService.subscribe(clientId, data.symbol);
            break;

          case 'unsubscribe':
            CryptoDataService.unsubscribe(clientId, data.symbol);
            break;

          default:
            ws.send(JSON.stringify({ error: 'Unknown message type' }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ error: 'Invalid message format' }));
      }
    });

    // Handle price updates
    const priceUpdateHandler = (update) => {
      if (update.clientId === clientId) {
        ws.send(JSON.stringify({
          type: 'price_update',
          data: update
        }));
      }
    };

    // Handle provider switches
    const providerSwitchHandler = (update) => {
      ws.send(JSON.stringify({
        type: 'provider_switch',
        data: update
      }));
    };

    CryptoDataService.on('price_update', priceUpdateHandler);
    CryptoDataService.on('provider_switch', providerSwitchHandler);

    // Cleanup on connection close
    ws.on('close', () => {
      CryptoDataService.removeListener('price_update', priceUpdateHandler);
      CryptoDataService.removeListener('provider_switch', providerSwitchHandler);
    });
  }
};

module.exports = cryptoController;
