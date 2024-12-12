const express = require('express');
const router = express.Router();
const VerificationService = require('../../services/verification/VerificationService');
const { authenticate } = require('../../middleware/auth');

// Verify email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const user = await VerificationService.verifyEmail(token);

    res.json({
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        is_verified: user.is_verified
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(400).json({
      error: error.message || 'Failed to verify email'
    });
  }
});

// Resend verification email
router.post('/resend-verification', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    await VerificationService.resendVerification(userId);

    res.json({
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(400).json({
      error: error.message || 'Failed to resend verification email'
    });
  }
});

// Get verification status
router.get('/status', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const status = await VerificationService.getVerificationStatus(userId);

    res.json(status);
  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(400).json({
      error: error.message || 'Failed to get verification status'
    });
  }
});

module.exports = router;
