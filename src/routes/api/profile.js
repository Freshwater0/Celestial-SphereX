const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/profileController');
const { authenticate } = require('../../middleware/auth');
const upload = require('../../middleware/upload');

router.use(authenticate);

// Get user profile
router.get('/', profileController.getProfile);

// Update user profile
router.put('/', profileController.updateProfile);

// Upload avatar
router.post('/avatar', upload.single('avatar'), profileController.uploadAvatar);

// Delete avatar
router.delete('/avatar', profileController.deleteAvatar);

module.exports = router;
