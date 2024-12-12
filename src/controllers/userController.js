// controllers/userController.js

const bcrypt = require('bcrypt');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Settings = require('../models/Settings');
const ActivityLog = require('../models/ActivityLog');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function generateToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: '24h'
  });
}

const registerUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // For testing: delete existing user if it exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      // Delete associated settings and activity logs first
      await Settings.destroy({ where: { userId: existingUser.id } });
      await ActivityLog.destroy({ where: { userId: existingUser.id } });
      await existingUser.destroy();
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'USER',
      isVerified: false
    });

    // Create default settings
    await Settings.create({
      user_id: newUser.id,
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
      userId: newUser.id,
      action: 'ACCOUNT_CREATED',
      description: 'User account created',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    const token = generateToken(newUser.id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        isVerified: newUser.isVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error registering user', 
      error: error.message 
    });
  }
};

async function verifyEmail(req, res) {
  try {
    const { token } = req.query;

    const user = await User.findOne({ where: { verificationToken: token } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid token or user not found' });
    }

    const tokenAge = new Date() - new Date(user.verificationSentAt);
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return res.status(400).json({ message: 'Token expired' });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Error verifying email', error: error.message });
  }
}

async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'isVerified', 'createdAt', 'updatedAt']
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email } = req.body;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    
    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
}

async function getPreferences(req, res) {
  try {
    const userId = req.user.id;
    const settings = await Settings.findOne({ where: { userId: userId } });
    
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Preferences error:', error);
    res.status(500).json({ message: 'Error fetching preferences', error: error.message });
  }
}

async function updatePreferences(req, res) {
  try {
    const userId = req.user.id;
    const { theme, language, timezone, emailNotifications, pushNotifications, subscriptionAlerts, securityAlerts } = req.body;
    
    const settings = await Settings.findOne({ where: { userId: userId } });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    
    if (theme) settings.theme = theme;
    if (language) settings.language = language;
    if (timezone) settings.timezone = timezone;
    if (emailNotifications !== undefined) settings.emailNotifications = emailNotifications;
    if (pushNotifications !== undefined) settings.pushNotifications = pushNotifications;
    if (subscriptionAlerts !== undefined) settings.subscriptionAlerts = subscriptionAlerts;
    if (securityAlerts !== undefined) settings.securityAlerts = securityAlerts;
    
    await settings.save();
    
    res.json({ message: 'Preferences updated successfully', settings });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Error updating preferences', error: error.message });
  }
}

async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const notifications = await Notification.findAll({
      where: { userId: userId },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(notifications);
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
}

async function updateNotificationSettings(req, res) {
  try {
    const userId = req.user.id;
    const { emailNotifications, pushNotifications, subscriptionAlerts, securityAlerts } = req.body;
    
    const settings = await Settings.findOne({ where: { userId: userId } });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    
    if (emailNotifications !== undefined) settings.emailNotifications = emailNotifications;
    if (pushNotifications !== undefined) settings.pushNotifications = pushNotifications;
    if (subscriptionAlerts !== undefined) settings.subscriptionAlerts = subscriptionAlerts;
    if (securityAlerts !== undefined) settings.securityAlerts = securityAlerts;
    
    await settings.save();
    
    res.json({ message: 'Notification settings updated successfully', settings });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ message: 'Error updating notification settings', error: error.message });
  }
}

async function markNotificationRead(req, res) {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;
    
    const notification = await Notification.findOne({
      where: { id: notificationId, userId: userId }
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    notification.read = true;
    await notification.save();
    
    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
}

module.exports = { 
  registerUser, 
  verifyEmail,
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
  getNotifications,
  updateNotificationSettings,
  markNotificationRead
};
