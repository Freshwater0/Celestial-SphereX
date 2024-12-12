const jwt = require('jsonwebtoken');
const { User, Profile, Settings, Widget } = require('../../models');
const redisClient = require('../../config/redis');
const logger = require('../../utils/logger');

class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.activeUsers = new Set();
    this.useRedis = !!redisClient;
    
    if (!this.useRedis) {
      logger.warn('Running SessionManager without Redis - using in-memory storage');
    }
  }

  async createSession(user) {
    try {
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Load user data
      const userData = await User.findByPk(user.id, {
        include: [
          { model: Profile },
          { model: Settings },
          { model: Widget }
        ]
      });

      if (!userData) {
        throw new Error('User not found');
      }

      const sessionData = {
        token,
        userId: user.id,
        email: userData.email,
        profile: userData.Profile,
        settings: userData.Settings,
        widgets: userData.Widgets,
        createdAt: Date.now(),
        lastActive: Date.now()
      };

      // Store session in memory and Redis
      this.sessions.set(token, sessionData);
      if (this.useRedis) {
        await this.saveToRedis(token, sessionData);
      }

      // Track active user
      this.activeUsers.add(user.id);

      return sessionData;
    } catch (error) {
      logger.error('Session creation error:', error);
      throw error;
    }
  }

  async validateSession(token) {
    try {
      if (!token) {
        return null;
      }

      // Verify JWT
      try {
        jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        logger.warn('JWT validation failed:', error.message);
        return null;
      }

      // Check memory cache first
      let session = this.sessions.get(token);
      
      if (!session && this.useRedis) {
        // Try to recover from Redis
        session = await this.getFromRedis(token);
        if (session) {
          this.sessions.set(token, session);
        }
      }

      if (!session) {
        return null;
      }

      // Update last active timestamp
      session.lastActive = Date.now();
      if (this.useRedis) {
        await this.saveToRedis(token, session);
      }

      return session;
    } catch (error) {
      logger.error('Session validation error:', error);
      return null;
    }
  }

  async saveToRedis(token, data) {
    if (!this.useRedis) return;
    
    try {
      await redisClient.set(
        `session:${token}`,
        JSON.stringify(data),
        'EX',
        24 * 60 * 60 // 24 hours
      );
    } catch (error) {
      logger.error('Redis save error:', error);
    }
  }

  async getFromRedis(token) {
    if (!this.useRedis) return null;
    
    try {
      const data = await redisClient.get(`session:${token}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Redis get error:', error);
      return null;
    }
  }

  async invalidateSession(token) {
    try {
      const session = this.sessions.get(token);
      if (session) {
        this.sessions.delete(token);
        this.activeUsers.delete(session.userId);
        if (this.useRedis) {
          await redisClient.del(`session:${token}`);
        }
      }
    } catch (error) {
      logger.error('Session invalidation error:', error);
    }
  }

  getActiveUserCount() {
    return this.activeUsers.size;
  }
}

module.exports = new SessionManager();
