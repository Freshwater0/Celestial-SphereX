const { body, validationResult } = require('express-validator');
const validator = require('validator');
const sanitizeHtml = require('sanitize-html');
const zxcvbn = require('zxcvbn');

class AuthValidation {
  // Sanitize and validate input
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    // Remove HTML tags and potential script injections
    return sanitizeHtml(input, {
      allowedTags: [],
      allowedAttributes: {}
    }).trim();
  }

  // Comprehensive password strength validation
  static validatePasswordStrength(password) {
    const result = zxcvbn(password);
    
    // Require minimum score of 3 (out of 4)
    if (result.score < 3) {
      throw new Error('Password is too weak. Please use a stronger password.');
    }

    // Additional custom checks
    if (password.length < 12) {
      throw new Error('Password must be at least 12 characters long');
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!(hasUppercase && hasLowercase && hasNumbers && hasSpecialChar)) {
      throw new Error('Password must include uppercase, lowercase, numbers, and special characters');
    }

    return true;
  }

  // Email validation middleware
  static validateEmail() {
    return [
      body('email')
        .trim()
        .normalizeEmail()
        .isEmail().withMessage('Invalid email format')
        .custom(email => {
          // Block disposable email domains
          const disposableDomains = [
            'tempmail.com', 'throwawaymail.com', 'guerrillamail.com', 
            'mailinator.com', '10minutemail.com', 'yopmail.com'
          ];
          
          const domain = email.split('@')[1].toLowerCase();
          if (disposableDomains.includes(domain)) {
            throw new Error('Disposable email addresses are not allowed');
          }
          
          return true;
        })
    ];
  }

  // Registration validation middleware
  static validateRegistration() {
    return [
      // Email validation
      ...this.validateEmail(),

      // Password validation
      body('password')
        .isString().withMessage('Password must be a string')
        .custom(password => {
          // Sanitize password input
          const sanitizedPassword = this.sanitizeInput(password);
          
          // Validate password strength
          this.validatePasswordStrength(sanitizedPassword);
          
          return true;
        }),

      // Name validations
      body('firstName')
        .trim()
        .isString().withMessage('First name must be a string')
        .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters')
        .customSanitizer(this.sanitizeInput),

      body('lastName')
        .trim()
        .isString().withMessage('Last name must be a string')
        .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters')
        .customSanitizer(this.sanitizeInput),

      // Validation result middleware
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ 
            success: false, 
            errors: errors.array().map(err => err.msg) 
          });
        }
        next();
      }
    ];
  }

  // Login validation middleware
  static validateLogin() {
    return [
      // Email validation
      ...this.validateEmail(),

      // Password validation
      body('password')
        .isString().withMessage('Password is required')
        .notEmpty().withMessage('Password cannot be empty'),

      // Validation result middleware
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ 
            success: false, 
            errors: errors.array().map(err => err.msg) 
          });
        }
        next();
      }
    ];
  }

  // Rate limiting middleware
  static rateLimiter(type) {
    // In-memory rate limiting cache
    const requestCache = new Map();

    return (req, res, next) => {
      const ip = req.ip;
      const now = Date.now();
      
      // Get or initialize request history for this IP
      const requests = requestCache.get(ip) || [];
      
      // Remove old requests (last 1 hour)
      const recentRequests = requests.filter(time => now - time < 3600000);
      
      // Limit based on request type
      const limits = {
        'registration': 5,   // 5 registrations per hour
        'login': 10,         // 10 login attempts per hour
        'password-reset': 3  // 3 password resets per hour
      };

      if (recentRequests.length >= limits[type]) {
        return res.status(429).json({
          success: false,
          message: `Too many ${type} attempts. Please try again later.`
        });
      }

      // Add current request
      recentRequests.push(now);
      requestCache.set(ip, recentRequests);

      next();
    };
  }

  // Password reset validation middleware
  static validatePasswordReset() {
    return [
      body('token')
        .isString().withMessage('Reset token is required')
        .notEmpty().withMessage('Reset token cannot be empty'),

      body('newPassword')
        .isString().withMessage('New password is required')
        .custom(password => {
          // Sanitize and validate new password
          const sanitizedPassword = this.sanitizeInput(password);
          this.validatePasswordStrength(sanitizedPassword);
          return true;
        }),

      // Validation result middleware
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ 
            success: false, 
            errors: errors.array().map(err => err.msg) 
          });
        }
        next();
      }
    ];
  }
}

module.exports = AuthValidation;
