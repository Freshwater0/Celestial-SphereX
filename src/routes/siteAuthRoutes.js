const express = require('express');
const router = express.Router();
const SiteAuthService = require('../services/siteAuthService');
const UserService = require('../services/userService'); // Assuming you have a user service

// Endpoint for SITe login authentication
router.post('/site-login', async (req, res) => {
  try {
    const { siteUserId, email } = req.body;

    // Find or create user in Celestial Sphere based on SITe user info
    let user = await UserService.findOrCreateUserBySiteId(siteUserId, email);

    // Generate login token
    const loginToken = SiteAuthService.createSiteLoginRedirectUrl(user);

    res.json({
      success: true,
      redirectUrl: loginToken
    });
  } catch (error) {
    console.error('SITe login error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
});

// Endpoint to validate site login token
router.get('/validate-site-token', (req, res) => {
  const token = req.query.token;
  
  const decodedToken = SiteAuthService.verifySiteLoginToken(token);
  
  if (decodedToken) {
    res.json({
      valid: true,
      user: {
        id: decodedToken.userId,
        email: decodedToken.email
      }
    });
  } else {
    res.status(401).json({
      valid: false,
      message: 'Invalid or expired token'
    });
  }
});

module.exports = router;
