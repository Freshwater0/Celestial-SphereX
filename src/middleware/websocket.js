const WebSocket = require('ws');
const cryptoWebSocket = require('../services/websocket/cryptoWebSocket');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  // Initialize Binance WebSocket connection
  cryptoWebSocket.connect();

  wss.on('connection', async (ws, req) => {
    try {
      // Extract token from query parameters
      const url = new URL(req.url, 'ws://localhost');
      const token = url.searchParams.get('token');

      if (!token) {
        ws.close(4001, 'Authentication required');
        return;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded) {
        ws.close(4002, 'Invalid token');
        return;
      }

      // Generate client ID
      const clientId = uuidv4();
      
      // Add connection to crypto WebSocket service
      cryptoWebSocket.addConnection(clientId, ws);

      // Handle incoming messages
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          
          switch (data.type) {
            case 'subscribe':
              if (data.symbol) {
                cryptoWebSocket.subscribe(clientId, data.symbol);
                ws.send(JSON.stringify({
                  type: 'subscribed',
                  symbol: data.symbol
                }));
              }
              break;

            case 'unsubscribe':
              if (data.symbol) {
                cryptoWebSocket.unsubscribe(clientId, data.symbol);
                ws.send(JSON.stringify({
                  type: 'unsubscribed',
                  symbol: data.symbol
                }));
              }
              break;

            case 'get_subscriptions':
              const activeSymbols = cryptoWebSocket.getActiveSymbols(clientId);
              ws.send(JSON.stringify({
                type: 'subscriptions',
                symbols: activeSymbols
              }));
              break;

            default:
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Unknown message type'
              }));
          }
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format'
          }));
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        cryptoWebSocket.removeConnection(clientId);
      });

      // Send initial connection success message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Successfully connected to WebSocket server'
      }));

    } catch (error) {
      console.error('WebSocket connection error:', error);
      ws.close(4003, 'Connection error');
    }
  });

  return wss;
}

module.exports = setupWebSocket;
