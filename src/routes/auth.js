const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); 
const SubscriptionService = require('../services/subscription/SubscriptionService');
const VerificationService = require('../services/verification/VerificationService');
const EmailService = require('../services/email/EmailService');
const { sequelize } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const UserActivityService = require('../services/user/UserActivityService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token is required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Validation middleware
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least one uppercase letter, one number, and one special character'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters long'),
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters long')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
];

const loginValidation = [
  body('email').trim().isEmail(),
  body('password').exists()
];

const changePasswordValidation = [
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
];

// Public routes
// Removed direct register route to ensure registration goes through PayPal
// router.post('/register', registerValidation, async (req, res) => {
//   console.log('=== Starting registration process ===');
//   console.log('Request body:', req.body);
//   console.log('Request headers:', req.headers);
//   
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       console.log('Validation errors:', errors.array());
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { email, password, name, username } = req.body;
//     console.log('Creating user with:', { email, name, username });

//     // Start transaction
//     const result = await sequelize.transaction(async (t) => {
//       // Create user
//       const user = await User.create({
//         email,
//         password,
//         username,
//         is_verified: false
//       }, { transaction: t });
//       console.log('User created successfully:', { userId: user.id });

//       // Start free trial
//       console.log('Starting free trial for user:', user.id);
//       await SubscriptionService.startTrial(user.id, t);
//       console.log('Free trial started successfully');

//       // Create verification record
//       console.log('Creating verification record...');
//       await VerificationService.createVerification(user.id, t);
//       console.log('Verification record created successfully');

//       // Generate token
//       console.log('Generating JWT token...');
//       const token = jwt.sign(
//         { userId: user.id },
//         JWT_SECRET,
//         { expiresIn: '7d' }
//       );
//       console.log('JWT token generated successfully');

//       return { user, token };
//     });

//     console.log('=== Registration completed successfully ===');
//     res.status(201).json({
//       message: 'Registration successful! Please check your email to verify your account.',
//       user: {
//         id: result.user.id,
//         username: result.user.username,
//         email: result.user.email
//       },
//       token: result.token
//     });

//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(400).json({ 
//       error: 'Registration failed',
//       details: error.message
//     });
//   }
// });

// Test registration route (temporary, for testing)
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'USER',
      isVerified: false
    });

    // Create default settings
    await Settings.create({
      userId: user.id,
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      emailNotifications: true,
      pushNotifications: true,
      subscriptionAlerts: true,
      securityAlerts: true
    });

    // Log activity
    await ActivityLog.create({
      userId: user.id,
      action: 'ACCOUNT_CREATED',
      description: 'User account created',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Route to complete registration with token
router.post('/complete-registration', async (req, res) => {
  try {
    const { registrationToken, email, password, name, username } = req.body;

    // Validate input
    if (!registrationToken || !email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Complete registration
    const user = await SubscriptionService.completeRegistration(registrationToken, {
      email,
      password,
      name,
      username
    });

    res.status(201).json({
      message: 'Registration completed successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Complete Registration Error:', error);
    res.status(400).json({ error: 'Registration completion failed', details: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.accountLocked) {
      if (user.lockExpiresAt && new Date() < user.lockExpiresAt) {
        return res.status(403).json({
          message: 'Account is temporarily locked. Please try again later.'
        });
      } else {
        // Reset lock if expired
        await User.update({
          where: { id: user.id },
          data: {
            accountLocked: false,
            lockExpiresAt: null,
            failedLoginAttempts: 0
          }
        });
      }
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      // Increment failed attempts
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const updates = {
        failedLoginAttempts: failedAttempts
      };

      // Lock account after 5 failed attempts
      if (failedAttempts >= 5) {
        const lockExpiry = new Date();
        lockExpiry.setMinutes(lockExpiry.getMinutes() + 30); // Lock for 30 minutes
        updates.accountLocked = true;
        updates.lockExpiresAt = lockExpiry;
      }

      await User.update({
        where: { id: user.id },
        data: updates
      });

      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Reset failed attempts on successful login
    await User.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lastLoginAt: new Date()
      }
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log activity
    await ActivityLog.create({
      userId: user.id,
      action: 'LOGIN',
      description: 'User logged in',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.userId },
      include: {
        settings: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
        settings: user.settings
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

// Protected routes
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        lastLogin: user.last_login
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.post('/change-password', authenticateToken, changePasswordValidation, async (req, res) => {
  try {
    // Log the incoming request body
    console.log('Change password request body:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user_id = req.user.user_id;

    // Find user
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await user.validatePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    user.password = newPassword; // Password will be hashed by the model hooks
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

router.post('/logout', authenticateToken, async (req, res) => {
  // ... logout route implementation
});

module.exports = router;
