const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Settings = require('../models/Settings');
const SessionManager = require('../services/session/SessionManager');
const { validateEmail, validatePassword, validateName } = require('../utils/validation');
const sequelize = require('../models/db'); // assuming you have a db.js file that exports the sequelize instance

const authController = {
  async register(req, res) {
    try {
      console.log('Registration request body:', req.body);
      const { email, password, firstName, lastName } = req.body;

      // Validate required fields
      const missingFields = {
        email: !email,
        password: !password,
        firstName: !firstName,
        lastName: !lastName
      };

      if (Object.values(missingFields).some(missing => missing)) {
        console.log('Missing required fields:', missingFields);
        return res.status(400).json({ 
          success: false,
          message: 'All fields are required',
          details: {
            email: !email ? 'Email is required' : null,
            password: !password ? 'Password is required' : null,
            firstName: !firstName ? 'First name is required' : null,
            lastName: !lastName ? 'Last name is required' : null
          }
        });
      }

      // Validate name format
      if (!validateName(firstName) || !validateName(lastName)) {
        console.log('Invalid name format:', { firstName, lastName });
        return res.status(400).json({ 
          success: false,
          message: 'Name must be 2-50 characters long and can only contain letters, spaces, apostrophes, and hyphens'
        });
      }

      // Validate email format
      if (!validateEmail(email)) {
        console.log('Invalid email format:', email);
        return res.status(400).json({ 
          success: false,
          message: 'Invalid email format'
        });
      }

      // Validate password requirements
      if (!validatePassword(password)) {
        // Check specific password requirements
        const errors = [];
        if (password.length < 8) {
          errors.push('Password must be at least 8 characters long');
        }
        if (!/[A-Z]/.test(password)) {
          errors.push('Password must contain at least one uppercase letter');
        }
        if (!/\d/.test(password)) {
          errors.push('Password must contain at least one number');
        }
        if (!/[!@#$%^&*]/.test(password)) {
          errors.push('Password must contain at least one special character (!@#$%^&*)');
        }
        if (!/^[A-Za-z\d!@#$%^&*]+$/.test(password)) {
          errors.push('Password contains invalid characters');
        }

        return res.status(400).json({
          success: false,
          message: 'Invalid password format',
          errors: errors.map(msg => ({
            field: 'password',
            message: msg
          }))
        });
      }

      // Generate username from email
      const username = email.split('@')[0];
      console.log('Generated username:', username);

      // Check if user exists
      const existingUser = await User.findOne({ 
        where: { 
          [Op.or]: [
            { email },
            { username }
          ]
        }
      });

      if (existingUser) {
        console.log('User already exists:', {
          email: existingUser.email === email,
          username: existingUser.username === username
        });

        return res.status(400).json({
          success: false,
          message: 'Email or username is already registered',
          errors: [
            { 
              field: 'email', 
              msg: 'Email already exists' 
            }
          ]
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      console.log('Creating user with data:', {
        email,
        firstName,
        lastName,
        username,
        hasPassword: !!hashedPassword
      });

      // Use transaction to ensure all related records are created
      const result = await sequelize.transaction(async (t) => {
        const user = await User.create({
          email,
          password: hashedPassword,
          firstName,
          lastName,
          username,
          isActive: true,
          lastLoginAt: new Date()
        }, { transaction: t });

        console.log('User created:', user.id);

        // Create associated profile
        console.log('Creating profile for user:', user.id);
        await Profile.create({
          user_id: user.id,
          displayName: `${firstName} ${lastName}`
        }, { transaction: t });

        // Create default settings
        console.log('Creating settings for user:', user.id);
        await Settings.create({
          user_id: user.id,
          theme: 'light',
          notifications: true
        }, { transaction: t });

        return user;
      });

      // Generate session token
      console.log('Generating session token');
      const token = await SessionManager.createSession(result);

      // Return success response
      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        token,
        user: result.toJSON()
      });

    } catch (error) {
      console.error('Registration error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        errors: error.errors
      });
      console.error('Registration error details:', error);
      
      // Check if it's a validation error
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map(err => ({
            field: err.path,
            message: err.message
          }))
        });
      }

      // Check if it's a unique constraint error
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Email or username is already taken',
          errors: error.errors.map(err => ({
            field: err.path,
            message: err.message
          }))
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ 
          success: false,
          message: 'Email and password are required' 
        });
      }

      // Find user
      const user = await User.findOne({ 
        where: { email },
        attributes: { include: ['password'] }
      });

      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid credentials' 
        });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid credentials' 
        });
      }

      // Create session
      const deviceInfo = {
        userAgent: req.headers['user-agent'],
        ip: req.ip
      };

      const token = await SessionManager.createSession(user);

      // Update last login
      user.lastLoginAt = new Date();
      await user.save();

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Login failed',
        error: error.message 
      });
    }
  },

  async logout(req, res) {
    try {
      await SessionManager.endSession(req.sessionToken);
      res.json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  },

  async refreshSession(req, res) {
    try {
      const { userId, session } = await SessionManager.validateSession(req.sessionToken);
      
      // Get fresh user data
      const user = await User.findById(userId)
        .populate('profile')
        .populate('settings')
        .populate('widgets');

      if (!user) {
        throw new Error('User not found');
      }

      // Create new session
      const deviceInfo = {
        userAgent: req.headers['user-agent'],
        ip: req.ip
      };

      const newSession = await SessionManager.createSession(user._id, deviceInfo);

      // End old session
      await SessionManager.endSession(req.sessionToken);

      res.json({
        message: 'Session refreshed',
        ...newSession
      });
    } catch (error) {
      console.error('Session refresh error:', error);
      res.status(401).json({ error: 'Session refresh failed' });
    }
  },

  async validateToken(req, res) {
    try {
      const { userId, session } = await SessionManager.validateSession(req.sessionToken);
      
      const user = await User.findById(userId)
        .populate('profile')
        .populate('settings')
        .populate('widgets');

      if (!user) {
        throw new Error('User not found');
      }

      res.json({
        valid: true,
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          settings: user.settings,
          widgets: user.widgets
        }
      });
    } catch (error) {
      console.error('Token validation error:', error);
      res.status(401).json({ valid: false, error: 'Invalid token' });
    }
  },

  async updatePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.userId).select('+password');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Validate new password
      if (!validatePassword(newPassword)) {
        return res.status(400).json({
          error: 'New password must be at least 8 characters long and contain at least one number, one uppercase letter, and one special character'
        });
      }

      // Update password
      user.password = await bcrypt.hash(newPassword, 12);
      await user.save();

      // End all sessions except current one
      const sessions = await SessionManager.getUserSessions(req.userId);
      await Promise.all(
        sessions
          .filter(session => session.token !== req.sessionToken)
          .map(session => SessionManager.endSession(session.token))
      );

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Password update error:', error);
      res.status(500).json({ error: 'Failed to update password' });
    }
  }
};

module.exports = authController;
