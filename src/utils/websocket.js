class WebSocketManager {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.subscribers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second delay
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.notifySubscribers(data);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
        this.reconnectAttempts++;
        this.reconnectDelay *= 2; // Exponential backoff
        this.connect();
      }, this.reconnectDelay);
    }
  }

  subscribe(channel, callback) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel).add(callback);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'subscribe', channel }));
    }

    return () => this.unsubscribe(channel, callback);
  }

  unsubscribe(channel, callback) {
    if (this.subscribers.has(channel)) {
      this.subscribers.get(channel).delete(callback);
      if (this.subscribers.get(channel).size === 0) {
        this.subscribers.delete(channel);
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ action: 'unsubscribe', channel }));
        }
      }
    }
  }

  notifySubscribers(data) {
    const { channel, payload } = data;
    if (this.subscribers.has(channel)) {
      this.subscribers.get(channel).forEach(callback => callback(payload));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribers.clear();
  }
}

// Create singleton instances for different data types
const cryptoWS = new WebSocketManager('wss://your-crypto-websocket-url');
const stockWS = new WebSocketManager('wss://your-stock-websocket-url');
const socialWS = new WebSocketManager('wss://your-social-websocket-url');
const analyticsWS = new WebSocketManager('wss://your-analytics-websocket-url');
const weatherWS = new WebSocketManager('wss://your-weather-websocket-url');
const calendarWS = new WebSocketManager('wss://your-calendar-websocket-url');

export { 
  cryptoWS, 
  stockWS, 
  socialWS, 
  analyticsWS,
  weatherWS,
  calendarWS
};
