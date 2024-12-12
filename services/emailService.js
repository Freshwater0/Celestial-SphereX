const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const { User } = require('../models/User');
const crypto = require('crypto');  // For token generation
const dns = require('dns').promises;  // For email domain validation

// Disposable email domains to block
const DISPOSABLE_DOMAINS = [
  'tempmail.com', 'throwawaymail.com', 'guerrillamail.com', 
  'mailinator.com', '10minutemail.com', 'yopmail.com'
];

// Email validation utility
class EmailValidator {
  // Basic regex for email format
  static emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validate email format
  static validateFormat(email) {
    if (!this.emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }

  // Check against disposable email domains
  static validateDomain(email) {
    const domain = email.split('@')[1].toLowerCase();
    if (DISPOSABLE_DOMAINS.includes(domain)) {
      throw new Error('Disposable email addresses are not allowed');
    }
  }

  // Verify email domain's MX record
  static async validateDNS(email) {
    try {
      const domain = email.split('@')[1];
      await dns.resolveMx(domain);
      return true;
    } catch (error) {
      throw new Error('Invalid email domain');
    }
  }
}

// Monitoring and alerting utility
class EmailMonitor {
  static failureCache = new Map();

  // Track and alert on repeated email failures
  static trackEmailFailure(email, type) {
    const now = Date.now();
    const failures = this.failureCache.get(email) || [];
    
    // Remove old failures (last 24 hours)
    const recentFailures = failures.filter(time => now - time < 86400000);
    
    // Add current failure
    recentFailures.push(now);
    this.failureCache.set(email, recentFailures);

    // Alert if too many failures
    if (recentFailures.length > 3) {
      this.sendAdminAlert(email, type);
    }
  }

  // Send alert to admin (placeholder - replace with actual alerting mechanism)
  static sendAdminAlert(email, type) {
    logger.error(`ALERT: Multiple email failures`, {
      email,
      type,
      timestamp: new Date().toISOString()
    });
    
    // TODO: Implement actual alerting (e.g., Slack, PagerDuty, etc.)
    // Example:
    // slackNotification.send(`Multiple email failures for ${email} (${type})`);
  }
}

// Email templates
const emailTemplates = {
  verification: (verificationUrl) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Verify Your Email - Celestial Sphere</h1>
      <p>Click the link below to verify your account:</p>
      <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>This link will expire in 24 hours. If you didn't create an account, please ignore this email.</p>
    </div>
  `,
  passwordReset: (resetUrl) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Password Reset - Celestial Sphere</h1>
      <p>You requested a password reset. Click the link below to proceed:</p>
      <a href="${resetUrl}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
    </div>
  `
};

class EmailService {
  constructor() {
    // Create transporter for sending emails
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true', // Use secure connection (TLS/SSL)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Rate limiting tracking
    this.emailSendAttempts = new Map();
  }

  // Prevent email spamming
  async preventEmailSpamming(email, type) {
    const now = Date.now();
    const attempts = this.emailSendAttempts.get(email) || [];
    
    // Remove attempts older than 1 hour
    const recentAttempts = attempts.filter(time => now - time < 3600000);
    
    // Limit to 5 emails per hour for each type
    if (recentAttempts.length >= 5) {
      logger.warn(`Rate limit exceeded for email: ${email}, type: ${type}`);
      throw new Error('Too many email attempts. Please wait before trying again.');
    }

    recentAttempts.push(now);
    this.emailSendAttempts.set(email, recentAttempts);
  }

  // Generate a random token for email verification and password reset
  generateToken() {
    return crypto.randomBytes(32).toString('hex'); // Generate a random 64-character hex token
  }

  // Comprehensive email validation
  async validateEmail(email) {
    try {
      // Format validation
      EmailValidator.validateFormat(email);
      
      // Disposable domain check
      EmailValidator.validateDomain(email);
      
      // DNS MX record validation (optional, can be resource-intensive)
      await EmailValidator.validateDNS(email);
    } catch (error) {
      logger.warn('Email validation failed', {
        email,
        errorMessage: error.message
      });
      throw error;
    }
  }

  // Send verification email
  async sendVerificationEmail(userId, email, token) {
    try {
      // Validate email
      await this.validateEmail(email);

      // Rate limit check
      await this.preventEmailSpamming(email, 'verification');

      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
      
      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Verify your email address - Celestial Sphere',
        html: emailTemplates.verification(verificationUrl)
      };

      // Send the email
      await this.transporter.sendMail(mailOptions);
      
      // Enhanced logging
      logger.info('Verification Email Sent', {
        userId,
        email,
        timestamp: new Date().toISOString()
      });
      
      return token;
    } catch (error) {
      // Track email failure
      EmailMonitor.trackEmailFailure(email, 'verification');

      // Detailed error logging
      logger.error('Error sending verification email', {
        userId,
        email,
        errorMessage: error.message,
        errorStack: error.stack
      });
      throw error;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email, token) {
    try {
      // Validate email
      await this.validateEmail(email);

      // Rate limit check
      await this.preventEmailSpamming(email, 'password-reset');

      // Find user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new Error('User not found');
      }

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      
      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Reset your password - Celestial Sphere',
        html: emailTemplates.passwordReset(resetUrl)
      };

      // Send the password reset email
      await this.transporter.sendMail(mailOptions);
      
      // Enhanced logging
      logger.info('Password Reset Email Sent', {
        email,
        timestamp: new Date().toISOString()
      });
      
      return token;
    } catch (error) {
      // Track email failure
      EmailMonitor.trackEmailFailure(email, 'password-reset');

      // Detailed error logging
      logger.error('Error sending password reset email', {
        email,
        errorMessage: error.message,
        errorStack: error.stack
      });
      throw error;
    }
  }

  // Store the token and send the verification email
  async generateAndSendVerificationEmail(userId, email) {
    try {
      const token = this.generateToken();
      // Store token and token sent time in the user's record
      const user = await User.findByPk(userId);
      if (user) {
        user.verification_token = token;
        user.verification_sent_at = new Date();
        await user.save();
      }

      // Send the verification email
      await this.sendVerificationEmail(userId, email, token);
    } catch (error) {
      logger.error('Error during verification email process', {
        userId,
        email,
        errorMessage: error.message,
        errorStack: error.stack
      });
      throw error;
    }
  }

  // Store the token and send the reset email
  async generateAndSendPasswordResetEmail(email) {
    try {
      const token = this.generateToken();
      // Store token and token sent time in the user's record
      const user = await User.findOne({ where: { email } });
      if (user) {
        user.reset_token = token;
        user.reset_token_sent_at = new Date();
        await user.save();
      }

      // Send the password reset email
      await this.sendPasswordResetEmail(email, token);
    } catch (error) {
      logger.error('Error during password reset email process', {
        email,
        errorMessage: error.message,
        errorStack: error.stack
      });
      throw error;
    }
  }
}

module.exports = new EmailService();
