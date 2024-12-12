const express = require('express');
const router = express.Router();
const settingsController = require('../../controllers/settingsController');
const { authenticate } = require('../../middleware/auth');

router.use(authenticate);

// Get user settings
router.get('/', settingsController.getSettings);

// Update user settings
router.put('/', settingsController.updateSettings);

// Update notification settings
router.put('/notifications', settingsController.updateNotificationSettings);

// Update security settings
router.put('/security', settingsController.updateSecuritySettings);

// Update widgets
router.put('/widgets', settingsController.updateWidgets);

module.exports = router;
