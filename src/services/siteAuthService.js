const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class SiteAuthService {
  // Generate a secure token for cross-site authentication
  static generateSiteLoginToken(userInfo) {
    // Create a token valid for 15 minutes
    return jwt.sign(
      {
        userId: userInfo.id,
        email: userInfo.email,
        source: 'site_login',
        timestamp: Date.now()
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '15m' }
    );
  }

  // Verify and decode the site login token
  static verifySiteLoginToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  // Create a secure redirect URL for SITe login
  static createSiteLoginRedirectUrl(userInfo) {
    const token = this.generateSiteLoginToken(userInfo);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    return `${frontendUrl}/auth/site-login?token=${token}`;
  }
}

module.exports = SiteAuthService;
