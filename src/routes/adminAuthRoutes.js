const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const MFAService = require('../services/mfaService');
const AuditLogService = require('../services/auditLogService');

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, mfaToken } = req.body;

    // Find admin user
    const user = await User.findOne({ 
      where: { 
        email, 
        role: 'admin' 
      } 
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await AuditLogService.logAdminAction(
        user.id, 
        'LOGIN_ATTEMPT', 
        { email }, 
        'failure'
      );
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // If MFA is enabled, verify token
    if (user.mfaEnabled) {
      if (!mfaToken) {
        return res.status(400).json({ 
          message: 'MFA token required',
          requiresMFA: true 
        });
      }

      const isValidToken = MFAService.verifyToken(
        user.mfaSecret, 
        mfaToken
      );

      if (!isValidToken) {
        return res.status(401).json({ message: 'Invalid MFA token' });
      }
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Log successful login
    await AuditLogService.logAdminAction(
      user.id, 
      'LOGIN', 
      { email },
      'success'
    );

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        mfaEnabled: user.mfaEnabled 
      } 
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// MFA Setup
router.post('/mfa/setup', async (req, res) => {
  try {
    const { userId } = req.body;

    // Generate MFA secret
    const { secret, otpAuthUrl } = MFAService.generateSecret(userId);
    const qrCode = await MFAService.generateQRCode(otpAuthUrl);

    res.json({ 
      secret, 
      qrCode 
    });
  } catch (error) {
    console.error('MFA Setup Error:', error);
    res.status(500).json({ message: 'MFA setup failed' });
  }
});

// Verify and Enable MFA
router.post('/mfa/verify', async (req, res) => {
  try {
    const { userId, secret, token } = req.body;

    // Verify token
    const isValid = MFAService.verifyToken(secret, token);
    
    if (isValid) {
      await MFAService.enableMFA(userId, secret);
      
      await AuditLogService.logAdminAction(
        userId, 
        'MFA_ENABLED', 
        {},
        'success'
      );

      res.json({ message: 'MFA successfully enabled' });
    } else {
      res.status(400).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('MFA Verification Error:', error);
    res.status(500).json({ message: 'MFA verification failed' });
  }
});

module.exports = router;
