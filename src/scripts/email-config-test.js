require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmailConfiguration() {
  console.log('🧪 Testing Email Configuration');
  
  // Create transporter using environment variables
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false
    }
  });

  try {
    // Verify connection configuration
    await transporter.verify();
    console.log('✅ SMTP Connection Successful');

    // Send a test email
    const testInfo = await transporter.sendMail({
      from: `"Celestial Sphere Test" <${process.env.EMAIL_USERNAME}>`,
      to: process.env.EMAIL_USERNAME, // Send to yourself
      subject: 'Email Configuration Test',
      text: 'This is a test email to verify the SMTP configuration.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Configuration Test</h2>
          <p>✅ Your Celestial Sphere email configuration is working correctly!</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
      `
    });

    console.log('📧 Test Email Sent Successfully');
    console.log('Message ID:', testInfo.messageId);
  } catch (error) {
    console.error('❌ Email Configuration Test Failed:', error);
    
    // Detailed error logging
    console.error('Error Details:');
    console.error('Host:', process.env.EMAIL_HOST);
    console.error('Port:', process.env.EMAIL_PORT);
    console.error('Secure:', process.env.EMAIL_SECURE);
    console.error('Username:', process.env.EMAIL_USERNAME);
  }
}

// Run the test
testEmailConfiguration();
