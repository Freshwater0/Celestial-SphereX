const logger = require('../utils/logger');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Monitor middleware to track API usage and performance
const monitor = async (req, res, next) => {
  const startTime = process.hrtime();
  const originalSend = res.send;
  const originalJson = res.json;

  // Capture request details
  const requestData = {
    method: req.method,
    path: req.path,
    query: req.query,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id
  };

  // Log incoming request
  logger.info('Incoming request', requestData);

  // Override send
  res.send = function (body) {
    const diff = process.hrtime(startTime);
    const responseTime = parseFloat((diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2));
    
    // Log response details
    logger.info('Response sent', {
      ...requestData,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`
    });

    // Store API usage metrics if user is authenticated
    if (req.user?.id) {
      prisma.apiUsage.create({
        data: {
          userId: req.user.id,
          endpoint: req.path,
          method: req.method,
          statusCode: res.statusCode,
          responseTime: responseTime,
          userAgent: req.get('User-Agent')
        }
      }).catch(err => {
        logger.error('Error storing API usage', err);
      });
    }

    return originalSend.call(this, body);
  };

  // Override json
  res.json = function (body) {
    const diff = process.hrtime(startTime);
    const responseTime = parseFloat((diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2));
    
    // Log response details
    logger.info('Response sent', {
      ...requestData,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`
    });

    // Store API usage metrics if user is authenticated
    if (req.user?.id) {
      prisma.apiUsage.create({
        data: {
          userId: req.user.id,
          endpoint: req.path,
          method: req.method,
          statusCode: res.statusCode,
          responseTime: responseTime,
          userAgent: req.get('User-Agent')
        }
      }).catch(err => {
        logger.error('Error storing API usage', err);
      });
    }

    return originalJson.call(this, body);
  };

  next();
};

// Health check middleware with detailed status
const healthCheck = async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'running'
      }
    });
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: error.message,
        api: 'running'
      }
    });
  }
};

module.exports = {
  monitor,
  healthCheck
};
