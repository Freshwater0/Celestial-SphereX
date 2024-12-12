const welcomeEmailTemplate = (username) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 30px;
      margin: 20px 0;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #2c3e50;
      margin: 0;
    }
    .feature-box {
      background-color: white;
      border-radius: 4px;
      padding: 15px;
      margin: 15px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #3498db;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      font-size: 0.9em;
      color: #666;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to Celestial Sphere! 🎉</h1>
    </div>
    
    <p>Congratulations ${username}!</p>
    
    <p>Your email has been successfully verified, and your account is now fully activated. Your 7-day free trial starts now!</p>
    
    <div class="feature-box">
      <h3>🚀 Getting Started</h3>
      <ul>
        <li>Set up your personalized dashboard</li>
        <li>Track your favorite cryptocurrencies</li>
        <li>Configure price alerts</li>
        <li>Access detailed market analytics</li>
      </ul>
    </div>
    
    <div class="feature-box">
      <h3>💡 Pro Tips</h3>
      <ul>
        <li>Use widgets to customize your dashboard layout</li>
        <li>Set up email notifications for price movements</li>
        <li>Check out our market analysis tools</li>
        <li>Join our community forums</li>
      </ul>
    </div>
    
    <p style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
    </p>
    
    <p>During your free trial, you'll have access to all premium features. Make sure to explore everything Celestial Sphere has to offer!</p>
    
    <p>If you have any questions or need assistance, our support team is here to help. Just reply to this email.</p>
    
    <div class="footer">
      <p>Follow us on social media for updates and crypto insights:</p>
      <p>
        <a href="#" style="color: #3498db; margin: 0 10px;">Twitter</a> |
        <a href="#" style="color: #3498db; margin: 0 10px;">Discord</a> |
        <a href="#" style="color: #3498db; margin: 0 10px;">LinkedIn</a>
      </p>
      <p>© ${new Date().getFullYear()} Celestial Sphere. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

module.exports = welcomeEmailTemplate;
