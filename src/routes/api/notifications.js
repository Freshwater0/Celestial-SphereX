const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/notificationController');
const { authenticate } = require('../../middleware/auth');

router.use(authenticate);

// Get all notifications with pagination
router.get('/', notificationController.getNotifications);

// Get unread notifications count
router.get('/unread/count', notificationController.getUnreadCount);

// Mark notification as read
router.put('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.put('/read/all', notificationController.markAllAsRead);

// Delete a notification
router.delete('/:id', notificationController.deleteNotification);

// Delete all notifications
router.delete('/', notificationController.deleteAllNotifications);

module.exports = router;
