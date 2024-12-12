const verificationEmailTemplate = (username, verificationLink) => `
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
      <h1>Welcome to Celestial Sphere!</h1>
    </div>
    
    <p>Hello ${username},</p>
    
    <p>Thank you for signing up for Celestial Sphere! We're excited to have you join our community of cryptocurrency enthusiasts and traders.</p>
    
    <p>To get started, please verify your email address by clicking the button below:</p>
    
    <div style="text-align: center;">
      <a href="${verificationLink}" class="button">Verify Email Address</a>
    </div>
    
    <p>This verification link will expire in 24 hours. If you don't verify your email within this time, you'll need to request a new verification link.</p>
    
    <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
    <p style="word-break: break-all; font-size: 0.9em; color: #666;">
      ${verificationLink}
    </p>
    
    <p><strong>What's next?</strong></p>
    <ul>
      <li>After verification, you'll have full access to your 7-day free trial</li>
      <li>Explore real-time cryptocurrency data and analytics</li>
      <li>Set up custom alerts and notifications</li>
      <li>Create your personalized dashboard</li>
    </ul>
    
    <div class="footer">
      <p>If you didn't create an account with Celestial Sphere, please ignore this email.</p>
      <p>© ${new Date().getFullYear()} Celestial Sphere. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

module.exports = verificationEmailTemplate;
