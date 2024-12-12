const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { 
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
  getNotifications,
  updateNotificationSettings,
  markNotificationRead,
  registerUser,
  verifyEmail
} = require('../controllers/UserController');

// Auth routes
router.post('/register', registerUser);
router.get('/verify-email', verifyEmail);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.get('/preferences', authenticate, getPreferences);
router.put('/preferences', authenticate, updatePreferences);
router.get('/notifications', authenticate, getNotifications);
router.put('/notifications/settings', authenticate, updateNotificationSettings);
router.put('/notifications/:id/read', authenticate, markNotificationRead);

module.exports = router;
