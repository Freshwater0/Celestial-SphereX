const WebSocket = require('ws');
const http = require('http');
const app = require('../../src/app');
const { createTestUser, generateTestToken } = require('../utils/testHelpers');

describe('WebSocket Tests', () => {
  let server;
  let ws;
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Create test server
    server = http.createServer(app);
    server.listen(0); // Use random available port
    const port = server.address().port;

    // Create test user and get auth token
    testUser = await createTestUser();
    authToken = generateTestToken(testUser);

    // WebSocket server URL
    const wsUrl = `ws://localhost:${port}`;
    ws = new WebSocket(wsUrl, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
  });

  afterAll((done) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
    server.close(done);
  });

  it('should establish WebSocket connection', (done) => {
    ws.on('open', () => {
      expect(ws.readyState).toBe(WebSocket.OPEN);
      done();
    });
  });

  it('should receive welcome message', (done) => {
    ws.on('message', (data) => {
      const message = JSON.parse(data);
      expect(message).toHaveProperty('type', 'welcome');
      expect(message).toHaveProperty('user_id', testUser.id);
      done();
    });

    // Trigger welcome message
    ws.send(JSON.stringify({ type: 'connect' }));
  });

  it('should handle ping/pong', (done) => {
    ws.on('message', (data) => {
      const message = JSON.parse(data);
      if (message.type === 'pong') {
        expect(message).toHaveProperty('timestamp');
        done();
      }
    });

    ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
  });

  it('should broadcast notifications', (done) => {
    const testNotification = {
      type: 'notification',
      data: {
        title: 'Test Notification',
        message: 'This is a test notification'
      }
    };

    ws.on('message', (data) => {
      const message = JSON.parse(data);
      if (message.type === 'notification') {
        expect(message.data).toEqual(testNotification.data);
        done();
      }
    });

    // Simulate sending notification
    ws.send(JSON.stringify(testNotification));
  });

  it('should handle connection errors', (done) => {
    // Create new connection with invalid token
    const invalidWs = new WebSocket(`ws://localhost:${server.address().port}`, {
      headers: { Authorization: 'Bearer invalid-token' }
    });

    invalidWs.on('error', (error) => {
      expect(error).toBeTruthy();
      done();
    });
  });
});
