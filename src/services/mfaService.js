const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');

class MFAService {
  // Generate MFA secret
  generateSecret(userId) {
    const secret = speakeasy.generateSecret({ 
      name: `CelestialSphere:${userId}` 
    });

    return {
      secret: secret.base32,
      otpAuthUrl: secret.otpauth_url
    };
  }

  // Generate QR Code for MFA setup
  async generateQRCode(otpAuthUrl) {
    return new Promise((resolve, reject) => {
      QRCode.toDataURL(otpAuthUrl, (err, data_url) => {
        if (err) reject(err);
        resolve(data_url);
      });
    });
  }

  // Verify MFA token
  verifyToken(secret, token) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token
    });
  }

  // Enable MFA for user
  async enableMFA(userId, secret) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await user.update({
      mfaSecret: secret,
      mfaEnabled: true
    });

    return true;
  }

  // Disable MFA for user
  async disableMFA(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await user.update({
      mfaSecret: null,
      mfaEnabled: false
    });

    return true;
  }

  // Generate backup codes
  generateBackupCodes(count = 5) {
    const backupCodes = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-digit backup codes
      const code = Math.floor(10000000 + Math.random() * 90000000).toString();
      backupCodes.push(code);
    }
    return backupCodes;
  }
}

module.exports = new MFAService();
