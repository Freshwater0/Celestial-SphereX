// server.js

const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./src/routes/authRoutes');  // Corrected path to authRoutes
const siteAuthRoutes = require('./src/routes/siteAuthRoutes');
const WebSocket = require('ws');
const app = express();

dotenv.config();  // Load environment variables

app.use(express.json());  // Middleware to parse JSON request bodies

// Use the routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', siteAuthRoutes);

const PORT = process.env.PORT || 5556;

const wss = new WebSocket.Server({ noServer: true });

app.server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'login') {
      // Handle login logic
      // For example, validate credentials and send back a token
      ws.send(JSON.stringify({ success: true, token: 'your_token' }));
    }
  });
});
