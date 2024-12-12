const winston = require('winston');
const path = require('path');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, errors } = format;

// Custom log format
const logFormat = combine(
  errors({ stack: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ level, message, timestamp, stack }) => {
    const logMessage = `${timestamp} [${level}]: ${message}`;
    return stack ? `${logMessage}\n${stack}` : logMessage;
  })
);

// Create logger instance with enhanced configuration
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'celestial-sphere-backend' },
  transports: [
    // Console transport with color
    new transports.Console({
      format: combine(
        colorize({ all: true }),
        logFormat
      )
    }),
    // Error log file
    new transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Combined log file
    new transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10
    })
  ]
});

// Add custom logging methods for our services
logger.logScheduleCreation = (scheduleData) => {
  logger.info(`Report Schedule Created: ${JSON.stringify(scheduleData)}`);
};

logger.logScheduleExecution = (scheduleId, status) => {
  logger.info(`Schedule Execution: ID=${scheduleId}, Status=${status}`);
};

logger.logReportTemplateAction = (action, templateData) => {
  logger.info(`Report Template ${action}: ${JSON.stringify(templateData)}`);
};

logger.logDeliveryAttempt = (method, reportId, status) => {
  logger.info(`Report Delivery: Method=${method}, ReportID=${reportId}, Status=${status}`);
};

// Error tracking method
logger.trackError = (context, error) => {
  logger.error(`Error in ${context}`, { 
    error: error.message, 
    stack: error.stack 
  });
};

module.exports = logger;
