const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

// Rate limiting configuration
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: {
      message: 'Too many requests, please try again later.',
      status: 429
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',   // Main frontend
    'http://localhost:5173',   // Development site
    'https://celestialsphere.com'  // Production site
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 600 // 10 minutes
};

// Security middleware setup
const setupSecurity = (app) => {
  // Use Helmet for security headers
  app.use(helmet());

  // Enable CORS
  app.use(cors(corsOptions));

  // Apply rate limiting to all routes
  app.use('/api/', rateLimiter);

  // Set security-related headers
  app.use((req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    // Enable XSS filter
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Enforce HTTPS
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });
};

module.exports = {
  setupSecurity,
  rateLimiter,
  corsOptions
};
