const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const { sessionMiddleware } = require('../../middleware/session');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/validate-token', sessionMiddleware, authController.validateToken);

// Protected routes
router.use(sessionMiddleware);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshSession);
router.put('/password', authController.updatePassword);

module.exports = router;
