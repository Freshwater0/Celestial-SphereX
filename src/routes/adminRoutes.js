const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const AdminController = require('../controllers/adminController');

// User Management Routes
router.get('/users', adminAuth, AdminController.getUsers);
router.patch('/users/:userId/status', adminAuth, AdminController.updateUserStatus);

// Subscription Management Routes
router.post('/subscriptions/:userId/manage', adminAuth, AdminController.manageSubscription);

// Reporting Routes
router.get('/reports', adminAuth, AdminController.generateReports);

module.exports = router;
