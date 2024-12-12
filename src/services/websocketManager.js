import { UPDATE_FREQUENCIES } from '../config/api';
import { AppError, ErrorTypes, handleWebSocketError, logError, retryOperation } from '../utils/errorHandling';

class WebSocketManager {
  constructor() {
    this.connections = new Map();
    this.subscribers = new Map();
    this.reconnectAttempts = new Map();
    this.messageBuffer = new Map();
    this.connectionStatus = new Map();
    this.MAX_RECONNECT_ATTEMPTS = 5;
    this.RECONNECT_INTERVAL = 3000;
    this.MESSAGE_BUFFER_SIZE = 100;
    this.healthCheckInterval = null;
    this.startHealthCheck();
  }

  getConnectionStatus(symbol) {
    return this.connectionStatus.get(symbol) || 'disconnected';
  }

  async subscribe(symbol, callback) {
    try {
      if (!this.subscribers.has(symbol)) {
        this.subscribers.set(symbol, new Set());
        this.messageBuffer.set(symbol, []);
      }
      
      this.subscribers.get(symbol).add(callback);
      this.connectionStatus.set(symbol, 'connecting');

      // Create connection if it doesn't exist
      if (!this.connections.has(symbol)) {
        await this.createConnection(symbol);
      }

      // Send buffered messages to new subscriber
      const bufferedMessages = this.messageBuffer.get(symbol);
      if (bufferedMessages?.length > 0) {
        bufferedMessages.forEach(msg => callback(msg));
      }

      return () => this.unsubscribe(symbol, callback);
    } catch (error) {
      const appError = handleWebSocketError(error);
      logError(appError, { symbol, action: 'subscribe' });
      throw appError;
    }
  }

  unsubscribe(symbol, callback) {
    try {
      const subscribers = this.subscribers.get(symbol);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.closeConnection(symbol);
        }
      }
    } catch (error) {
      logError(error, { symbol, action: 'unsubscribe' });
    }
  }

  async createConnection(symbol) {
    try {
      await retryOperation(async () => {
        const ws = new WebSocket(`${process.env.REACT_APP_FINNHUB_WS_URL}?token=${process.env.REACT_APP_FINNHUB_API_KEY}`);
        
        ws.onopen = () => {
          console.log(`WebSocket connected for ${symbol}`);
          this.reconnectAttempts.set(symbol, 0);
          this.connectionStatus.set(symbol, 'connected');
          ws.send(JSON.stringify({ type: 'subscribe', symbol }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Buffer message
            const buffer = this.messageBuffer.get(symbol) || [];
            buffer.push(data);
            if (buffer.length > this.MESSAGE_BUFFER_SIZE) {
              buffer.shift();
            }
            this.messageBuffer.set(symbol, buffer);

            // Notify subscribers
            const subscribers = this.subscribers.get(symbol);
            if (subscribers) {
              subscribers.forEach(callback => {
                try {
                  callback(data);
                } catch (error) {
                  logError(error, { symbol, action: 'subscriber callback' });
                }
              });
            }
          } catch (error) {
            logError(error, { symbol, action: 'process message' });
          }
        };

        ws.onerror = (error) => {
          const appError = handleWebSocketError(error);
          this.connectionStatus.set(symbol, 'error');
          logError(appError, { symbol, action: 'websocket error' });
          this.handleConnectionError(symbol);
        };

        ws.onclose = () => {
          this.connectionStatus.set(symbol, 'disconnected');
          console.log(`WebSocket closed for ${symbol}`);
          this.handleConnectionClose(symbol);
        };

        this.connections.set(symbol, ws);
      }, this.MAX_RECONNECT_ATTEMPTS, this.RECONNECT_INTERVAL);
    } catch (error) {
      this.connectionStatus.set(symbol, 'error');
      logError(error, { symbol, action: 'create connection' });
      throw new AppError(ErrorTypes.WEBSOCKET, 'Failed to establish WebSocket connection after multiple attempts');
    }
  }

  closeConnection(symbol) {
    try {
      const ws = this.connections.get(symbol);
      if (ws) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'unsubscribe', symbol }));
        }
        ws.close();
        this.connections.delete(symbol);
        this.subscribers.delete(symbol);
        this.reconnectAttempts.delete(symbol);
        this.messageBuffer.delete(symbol);
        this.connectionStatus.delete(symbol);
      }
    } catch (error) {
      logError(error, { symbol, action: 'close connection' });
    }
  }

  async handleConnectionError(symbol) {
    try {
      const attempts = (this.reconnectAttempts.get(symbol) || 0) + 1;
      this.reconnectAttempts.set(symbol, attempts);

      if (attempts <= this.MAX_RECONNECT_ATTEMPTS) {
        this.connectionStatus.set(symbol, 'reconnecting');
        console.log(`Attempting to reconnect for ${symbol}, attempt ${attempts}`);
        await this.createConnection(symbol);
      } else {
        this.connectionStatus.set(symbol, 'error');
        const error = new AppError(ErrorTypes.WEBSOCKET, 'Max reconnection attempts reached');
        this.notifySubscribersOfError(symbol, error);
      }
    } catch (error) {
      logError(error, { symbol, action: 'handle connection error' });
    }
  }

  handleConnectionClose(symbol) {
    const attempts = this.reconnectAttempts.get(symbol) || 0;
    if (attempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.handleConnectionError(symbol);
    }
  }

  notifySubscribersOfError(symbol, error) {
    const subscribers = this.subscribers.get(symbol);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback({ type: 'error', error });
        } catch (callbackError) {
          logError(callbackError, { symbol, action: 'notify error' });
        }
      });
    }
  }

  startHealthCheck() {
    this.healthCheckInterval = setInterval(() => {
      this.connections.forEach((ws, symbol) => {
        if (ws.readyState === WebSocket.CLOSED) {
          console.log(`Health check: Reconnecting ${symbol}`);
          this.handleConnectionClose(symbol);
        }
      });
    }, UPDATE_FREQUENCIES.MEDIUM);
  }

  stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }

  cleanup() {
    try {
      this.stopHealthCheck();
      this.connections.forEach((_, symbol) => {
        this.closeConnection(symbol);
      });
    } catch (error) {
      logError(error, { action: 'cleanup' });
    }
  }
}

const websocketManager = new WebSocketManager();
export default websocketManager;
