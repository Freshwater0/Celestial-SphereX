const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient = null;

try {
  if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL);
    
    redisClient.on('error', (err) => {
      logger.error('Redis client error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });
  } else {
    logger.warn('Redis URL not provided, running without Redis');
  }
} catch (error) {
  logger.error('Redis initialization error:', error);
}

module.exports = redisClient;
