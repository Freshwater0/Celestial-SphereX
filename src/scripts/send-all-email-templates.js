require('dotenv').config();
const EmailTemplates = require('../services/emailTemplates');
const fs = require('fs');
const path = require('path');

class EmailTemplateMocker {
  constructor() {
    // Create a directory to store mock email outputs
    this.mockEmailDir = path.join(__dirname, 'mock-email-outputs');
    if (!fs.existsSync(this.mockEmailDir)) {
      fs.mkdirSync(this.mockEmailDir);
    }
  }

  // Mock method to save email template to a file
  saveMockEmail(templateName, subject, html) {
    const timestamp = new Date().toISOString().replace(/[:\.]/g, '-');
    const filename = `${timestamp}-${templateName}.html`;
    const filepath = path.join(this.mockEmailDir, filename);

    // Write the full HTML to a file
    fs.writeFileSync(filepath, html);

    console.log(`📧 Mock Email Generated: ${templateName}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Saved to: ${filepath}\n`);
  }

  // Test all email templates
  testAllEmailTemplates() {
    const testUser = {
      name: 'Dr. Alexandra Rodriguez',
      email: 'alexandra.rodriguez@research.org'
    };

    const emailTemplates = [
      {
        name: 'Welcome Email',
        subject: 'Welcome to Celestial Sphere X Data Intelligence Platform',
        template: () => EmailTemplates.welcomeEmail(testUser)
      },
      {
        name: 'Email Verification',
        subject: 'Email Verification for Celestial Sphere X Research Platform',
        template: () => EmailTemplates.emailVerificationEmail(testUser, 'https://celestialspherex.com/verify?token=123456')
      },
      {
        name: 'Password Reset',
        subject: 'Password Reset Request for Celestial Sphere X Platform',
        template: () => EmailTemplates.passwordResetEmail(testUser, 'https://celestialspherex.com/reset-password?token=789012')
      },
      {
        name: 'New Device Login Alert',
        subject: 'Security Alert: New Device Login Detected',
        template: () => EmailTemplates.newDeviceLoginAlert(testUser, {
          device: 'Research Workstation - Chrome',
          location: 'Advanced Computing Center, Stanford University',
          time: new Date()
        })
      },
      {
        name: 'Newsletter',
        subject: 'Celestial Sphere X: Latest Developments in Data Intelligence',
        template: () => EmailTemplates.newsletterEmail(testUser, `
          <h2>Breakthrough Computational Research Insights</h2>
          <p>Comprehensive analysis of recent advancements in machine learning and high-performance computing methodologies.</p>
        `)
      },
      {
        name: 'Promotional Email',
        subject: 'Exclusive Research Platform Enhancement Offer',
        template: () => EmailTemplates.promotionalEmail(testUser, {
          description: 'Advanced Computational Resources: 50% Expanded Analytics Tier for Research Professionals',
          link: 'https://celestialspherex.com/research-promo',
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })
      },
      {
        name: 'Payment Confirmation',
        subject: 'Celestial Sphere X - Research Platform Subscription Confirmation',
        template: () => EmailTemplates.paymentConfirmationEmail(testUser, {
          amount: 299.99,
          date: new Date(),
          plan: 'Enterprise Research Analytics Tier'
        })
      },
      {
        name: 'Subscription Renewal Reminder',
        subject: 'Upcoming Renewal: Celestial Sphere X Research Platform Subscription',
        template: () => EmailTemplates.subscriptionRenewalReminder(testUser, {
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          plan: 'Enterprise Research Analytics Tier'
        })
      }
    ];

    // Generate mock emails for each template
    emailTemplates.forEach(emailTemplate => {
      try {
        const html = emailTemplate.template();
        this.saveMockEmail(
          emailTemplate.name, 
          emailTemplate.subject, 
          html
        );
      } catch (error) {
        console.error(`Error generating ${emailTemplate.name}:`, error);
      }
    });

    console.log('🎉 Email Template Mocking Complete!');
    console.log(`   Mock emails saved to: ${this.mockEmailDir}`);
  }
}

// Run the email template mock generation
const emailMocker = new EmailTemplateMocker();
emailMocker.testAllEmailTemplates();
