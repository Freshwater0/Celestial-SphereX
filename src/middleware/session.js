const SessionManager = require('../services/session/SessionManager');

const sessionMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Validate and get session data
    const { user_id, session } = await SessionManager.validateSession(token);
    
    if (!session || !session.is_active) {
      return res.status(401).json({ error: 'Session is inactive or expired' });
    }

    // Attach session data to request
    req.user_id = user_id;
    req.session = session;
    req.sessionToken = token;

    next();
  } catch (error) {
    console.error('Session middleware error:', error);
    res.status(401).json({ error: 'Invalid session' });
  }
};

// WebSocket session middleware
const wsSessionMiddleware = async (ws, req, next) => {
  try {
    // Extract token from WebSocket upgrade request query
    const token = req.url.split('token=')[1]?.split('&')[0];
    
    if (!token) {
      ws.close(4001, 'No token provided');
      return;
    }

    // Validate and get session data
    const { user_id, session } = await SessionManager.validateSession(token);
    
    if (!session || !session.is_active) {
      ws.close(4001, 'Session is inactive or expired');
      return;
    }

    // Attach session data to WebSocket request
    req.user_id = user_id;
    req.session = session;
    req.sessionToken = token;

    // Restore subscriptions from session
    if (session.activeSubscriptions.size > 0) {
      req.pendingSubscriptions = Array.from(session.activeSubscriptions);
    }

    next();
  } catch (error) {
    console.error('WebSocket session middleware error:', error);
    ws.close(4001, 'Invalid session');
  }
};

module.exports = {
  sessionMiddleware,
  wsSessionMiddleware
};
