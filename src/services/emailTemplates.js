const moment = require('moment');

class EmailTemplates {
  // Base email template structure
  static baseTemplate(content, options = {}) {
    const {
      title = 'Celestial Sphere X',
      preheader = 'Advanced Data Intelligence Platform',
      logoUrl = 'https://celestialspherex.com/assets/logo-professional.png',
      accentColor = '#0A2342', // Deep navy professional color
      backgroundColor = '#F4F7FA',
      textColor = '#2C3E50'
    } = options;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
          
          body, html {
            margin: 0;
            padding: 0;
            font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: ${textColor};
            background-color: ${backgroundColor};
          }
          
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            border-radius: 8px;
            overflow: hidden;
          }
          
          .email-content {
            padding: 30px;
            background-color: white;
          }
          
          .email-content h1 {
            color: ${accentColor};
            font-size: 24px;
            margin-bottom: 20px;
            font-weight: 500;
          }
          
          .cta-button {
            display: inline-block;
            background-color: #2C7BE5;
            color: white !important;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
            text-align: center;
            transition: background-color 0.3s ease;
          }
          
          .cta-button:hover {
            background-color: #1A5F7A;
          }
          
          .email-footer {
            background-color: #F8FAFB;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #E9ECEF;
          }
          
          .footer-links {
            margin-bottom: 15px;
          }
          
          .footer-links a {
            color: #6C757D;
            text-decoration: none;
            margin: 0 10px;
            font-size: 13px;
          }
          
          .footer-social {
            margin-bottom: 15px;
          }
          
          .footer-social a {
            margin: 0 10px;
            text-decoration: none;
            color: #6C757D;
          }
          
          .footer-text {
            color: #6C757D;
            font-size: 12px;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-content">
            ${content}
          </div>
          
          <div class="email-footer">
            <div class="footer-links">
              <a href="https://celestialspherex.com/dashboard">Dashboard</a>
              <a href="https://celestialspherex.com/account">My Account</a>
              <a href="https://celestialspherex.com/support">Support</a>
            </div>
            
            <div class="footer-social">
              <a href="https://linkedin.com/company/celestialspherex">LinkedIn</a>
              <a href="https://twitter.com/celestialspherex">Twitter</a>
              <a href="https://github.com/celestialspherex">GitHub</a>
            </div>
            
            <div class="footer-text">
              <p>  ${new Date().getFullYear()} Celestial Sphere X. All Rights Reserved.</p>
              <p>Transforming Data Intelligence Through Advanced Technology</p>
              <p>Registered Address: 123 Innovation Drive, Tech Park, CA 94000</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Update welcome email with more professional language
  static welcomeEmail(user) {
    const content = `
      <h1>Welcome to the Celestial Sphere X Platform</h1>
      
      <p>Dear ${user.name},</p>
      
      <p>We are pleased to welcome you to Celestial Sphere X, a cutting-edge data intelligence platform designed for researchers, analysts, and technology professionals.</p>
      
      <div class="info-box">
        <strong>Platform Capabilities:</strong>
        <ul>
          <li>Advanced Machine Learning Data Processing</li>
          <li>High-Performance Computational Analytics</li>
          <li>Secure Collaborative Research Environment</li>
        </ul>
      </div>
      
      <a href="https://celestialspherex.com/onboarding" class="cta-button">Access Platform Dashboard</a>
      
      <p>Our dedicated support team is available to assist you in maximizing the platform's potential for your research and analytical needs.</p>
    `;

    return this.baseTemplate(content, { 
      title: 'Welcome to Celestial Sphere X',
      preheader: 'Advanced Data Intelligence Platform',
      headerImageUrl: 'https://celestialspherex.com/assets/header-data-network.jpg'
    });
  }

  // 1. Account Management Emails
  static emailVerificationEmail(user, verificationLink) {
    const content = `
      <h1>Verify Your Email Address</h1>
      
      <p>Hi ${user.name}, please verify your email to activate your Celestial Sphere X account.</p>
      
      <a href="${verificationLink}" class="cta-button">Verify Email Address</a>
      
      <p>This link will expire in 24 hours. If you didn't create an account, please ignore this email.</p>
    `;

    return this.baseTemplate(content, {
      title: 'Verify Your Email',
      preheader: 'Complete your Celestial Sphere X registration'
    });
  }

  static passwordResetEmail(user, resetLink) {
    const content = `
      <h1>Password Reset Request</h1>
      
      <p>You requested a password reset for your Celestial Sphere X account.</p>
      
      <a href="${resetLink}" class="cta-button">Reset Password</a>
      
      <p>This link will expire in 1 hour. If you didn't request this, please contact support.</p>
    `;

    return this.baseTemplate(content, {
      title: 'Password Reset',
      preheader: 'Reset your Celestial Sphere X account password'
    });
  }

  static newDeviceLoginAlert(user, loginDetails) {
    const content = `
      <h1>New Device Login Detected</h1>
      
      <p>A new login was detected on your Celestial Sphere X account:</p>
      
      <ul>
        <li>Device: ${loginDetails.device}</li>
        <li>Location: ${loginDetails.location}</li>
        <li>Time: ${moment(loginDetails.time).format('LLLL')}</li>
      </ul>
      
      <p>If this wasn't you, please <a href="https://celestialspherex.com/security">secure your account</a> immediately.</p>
    `;

    return this.baseTemplate(content, {
      title: 'New Device Login',
      preheader: 'Security alert for your account'
    });
  }

  // 2. Marketing and Engagement Emails
  static newsletterEmail(user, content) {
    const newsletterContent = `
      <h1>Celestial Sphere X Monthly Newsletter</h1>
      
      <p>Hi ${user.name}, here's what's new in the cosmos:</p>
      
      ${content}
      
      <a href="https://celestialspherex.com/blog" class="cta-button">Read More</a>
    `;

    return this.baseTemplate(newsletterContent, {
      title: 'Celestial Sphere X Newsletter',
      preheader: 'Cosmic insights and updates'
    });
  }

  static promotionalEmail(user, offer) {
    const content = `
      <h1>Special Offer for ${user.name}!</h1>
      
      <p>${offer.description}</p>
      
      <a href="${offer.link}" class="cta-button">Claim Offer</a>
      
      <p>Hurry, this offer expires ${moment(offer.expiryDate).fromNow()}!</p>
    `;

    return this.baseTemplate(content, {
      title: 'Exclusive Offer',
      preheader: 'Don\'t miss out on this cosmic deal'
    });
  }

  // 3. Transactional Emails
  static paymentConfirmationEmail(user, paymentDetails) {
    const content = `
      <h1>Payment Confirmed</h1>
      
      <p>Thank you for your subscription, ${user.name}!</p>
      
      <div class="info-box">
        <strong>Payment Details:</strong>
        <p>Amount: $${paymentDetails.amount}</p>
        <p>Date: ${moment(paymentDetails.date).format('LLLL')}</p>
        <p>Plan: ${paymentDetails.plan}</p>
      </div>
      
      <a href="https://celestialspherex.com/billing" class="cta-button">View Billing Details</a>
    `;

    return this.baseTemplate(content, {
      title: 'Payment Confirmation',
      preheader: 'Your subscription is active'
    });
  }

  static subscriptionRenewalReminder(user, renewalDetails) {
    const content = `
      <h1>Subscription Renewal Reminder</h1>
      
      <p>Your Celestial Sphere X subscription will renew ${moment(renewalDetails.date).fromNow()}.</p>
      
      <a href="https://celestialspherex.com/billing" class="cta-button">Manage Subscription</a>
      
      <p>Current Plan: ${renewalDetails.plan}</p>
      <p>Next Billing Date: ${moment(renewalDetails.date).format('LLLL')}</p>
    `;

    return this.baseTemplate(content, {
      title: 'Subscription Renewal',
      preheader: 'Your subscription is about to renew'
    });
  }

  static billingIssueEmail(user, issueDetails) {
    const content = `
      <h1>Billing Issue Detected</h1>
      
      <p>We encountered a problem with your payment method:</p>
      
      <p><strong>Issue:</strong> ${issueDetails.reason}</p>
      
      <a href="https://celestialspherex.com/billing" class="cta-button">Update Payment Method</a>
      
      <p>Please update your billing information to avoid service interruption.</p>
    `;

    return this.baseTemplate(content, {
      title: 'Billing Issue',
      preheader: 'Action required for your subscription'
    });
  }

  // 4. Support Emails
  static supportResponseEmail(user, supportTicket) {
    const content = `
      <h1>Support Ticket Response</h1>
      
      <p>Hi ${user.name}, here's a response to your recent support inquiry:</p>
      
      <div class="info-box">
        <strong>Ticket #${supportTicket.id}</strong>
        <p>${supportTicket.response}</p>
      </div>
      
      <a href="https://celestialspherex.com/support/ticket/${supportTicket.id}" class="cta-button">View Full Ticket</a>
    `;

    return this.baseTemplate(content, {
      title: 'Support Ticket Update',
      preheader: 'Response to your support request'
    });
  }

  // 5. System Notifications
  static usageReportEmail(user, usageStats) {
    const content = `
      <h1>Your Celestial Sphere X Usage Report</h1>
      
      <div class="info-box">
        <h2>Usage Statistics</h2>
        <p>Total Queries: ${usageStats.totalQueries}</p>
        <p>Active Days: ${usageStats.activeDays}</p>
        <p>Peak Usage: ${usageStats.peakUsageTime}</p>
      </div>
      
      <a href="https://celestialspherex.com/analytics" class="cta-button">View Detailed Analytics</a>
    `;

    return this.baseTemplate(content, {
      title: 'Monthly Usage Report',
      preheader: 'Your Celestial Sphere X activity summary'
    });
  }

  static systemUpdateEmail(updateDetails) {
    const content = `
      <h1>Celestial Sphere X System Update</h1>
      
      <p>We've made some exciting improvements:</p>
      
      <ul>
        ${updateDetails.features.map(feature => `<li>${feature}</li>`).join('')}
      </ul>
      
      <a href="https://celestialspherex.com/updates" class="cta-button">Learn More</a>
      
      <p>Update Deployed: ${moment(updateDetails.date).format('LLLL')}</p>
    `;

    return this.baseTemplate(content, {
      title: 'System Update',
      preheader: 'New features and improvements'
    });
  }
}

module.exports = EmailTemplates;
