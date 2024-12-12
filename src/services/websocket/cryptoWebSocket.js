const WebSocket = require('ws');
const { EventEmitter } = require('events');

class CryptoWebSocket extends EventEmitter {
  constructor() {
    super();
    this.connections = new Map(); // Store active connections
    this.subscriptions = new Map(); // Track symbol subscriptions
    this.binanceWs = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 5000; // 5 seconds
  }

  connect() {
    this.binanceWs = new WebSocket('wss://stream.binance.com:9443/ws');

    this.binanceWs.on('open', () => {
      console.log('Connected to Binance WebSocket');
      this.reconnectAttempts = 0;
      this.resubscribeAll();
    });

    this.binanceWs.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        if (message.e === 'trade') {
          this.handleTradeMessage(message);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    this.binanceWs.on('close', () => {
      console.log('Binance WebSocket connection closed');
      this.handleReconnect();
    });

    this.binanceWs.on('error', (error) => {
      console.error('Binance WebSocket error:', error);
      this.handleReconnect();
    });
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(), this.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('error', new Error('Unable to maintain WebSocket connection'));
    }
  }

  handleTradeMessage(message) {
    const update = {
      symbol: message.s,
      price: parseFloat(message.p),
      quantity: parseFloat(message.q),
      timestamp: message.T,
      buyerMaker: message.m
    };

    // Emit the update to all subscribed clients
    const subscribers = this.subscriptions.get(update.symbol) || new Set();
    subscribers.forEach(clientId => {
      const connection = this.connections.get(clientId);
      if (connection && connection.readyState === WebSocket.OPEN) {
        connection.send(JSON.stringify({
          type: 'crypto_update',
          data: update
        }));
      }
    });
  }

  subscribe(clientId, symbol) {
    // Normalize symbol
    const normalizedSymbol = symbol.toLowerCase();

    // Add client to symbol subscription
    if (!this.subscriptions.has(normalizedSymbol)) {
      this.subscriptions.set(normalizedSymbol, new Set());
      this.subscribeToBinance(normalizedSymbol);
    }
    this.subscriptions.get(normalizedSymbol).add(clientId);
  }

  unsubscribe(clientId, symbol) {
    const normalizedSymbol = symbol.toLowerCase();
    const subscribers = this.subscriptions.get(normalizedSymbol);
    
    if (subscribers) {
      subscribers.delete(clientId);
      
      // If no more subscribers, unsubscribe from Binance
      if (subscribers.size === 0) {
        this.subscriptions.delete(normalizedSymbol);
        this.unsubscribeFromBinance(normalizedSymbol);
      }
    }
  }

  subscribeToBinance(symbol) {
    if (this.binanceWs && this.binanceWs.readyState === WebSocket.OPEN) {
      const subscribeMsg = {
        method: 'SUBSCRIBE',
        params: [`${symbol}@trade`],
        id: Date.now()
      };
      this.binanceWs.send(JSON.stringify(subscribeMsg));
    }
  }

  unsubscribeFromBinance(symbol) {
    if (this.binanceWs && this.binanceWs.readyState === WebSocket.OPEN) {
      const unsubscribeMsg = {
        method: 'UNSUBSCRIBE',
        params: [`${symbol}@trade`],
        id: Date.now()
      };
      this.binanceWs.send(JSON.stringify(unsubscribeMsg));
    }
  }

  resubscribeAll() {
    // Resubscribe to all active symbols
    for (const symbol of this.subscriptions.keys()) {
      this.subscribeToBinance(symbol);
    }
  }

  addConnection(clientId, connection) {
    this.connections.set(clientId, connection);

    connection.on('close', () => {
      this.removeConnection(clientId);
    });
  }

  removeConnection(clientId) {
    // Remove client from all subscriptions
    for (const [symbol, subscribers] of this.subscriptions.entries()) {
      subscribers.delete(clientId);
      if (subscribers.size === 0) {
        this.subscriptions.delete(symbol);
        this.unsubscribeFromBinance(symbol);
      }
    }

    this.connections.delete(clientId);
  }

  getActiveSymbols(clientId) {
    const activeSymbols = [];
    for (const [symbol, subscribers] of this.subscriptions.entries()) {
      if (subscribers.has(clientId)) {
        activeSymbols.push(symbol);
      }
    }
    return activeSymbols;
  }
}

module.exports = new CryptoWebSocket();
