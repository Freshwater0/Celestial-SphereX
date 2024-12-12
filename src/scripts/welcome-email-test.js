require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendWelcomeEmail() {
  console.log('🚀 Sending Welcome Email');
  
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
    // Send welcome email
    const emailInfo = await transporter.sendMail({
      from: `"Celestial Sphere" <${process.env.EMAIL_USERNAME}>`,
      to: 'tshojifaggy@gmail.com',
      subject: 'Welcome to Celestial Sphere!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h1 style="color: #2c3e50; text-align: center;">Welcome to Celestial Sphere!</h1>
            
            <p style="color: #34495e; line-height: 1.6;">
              Hi there! 👋
            </p>
            
            <p style="color: #34495e; line-height: 1.6;">
              We're excited to have you join Celestial Sphere, your gateway to exploring the cosmos like never before.
            </p>
            
            <div style="background-color: #3498db; color: white; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <strong>Your Cosmic Journey Begins Now!</strong>
            </div>
            
            <p style="color: #34495e; line-height: 1.6;">
              Stay tuned for more updates, and get ready to explore the universe from the comfort of your screen.
            </p>
            
            <p style="color: #34495e; line-height: 1.6;">
              Best regards,<br>
              The Celestial Sphere Team
            </p>
            
            <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 20px 0;">
            
            <small style="color: #7f8c8d; font-size: 12px;">
              © ${new Date().getFullYear()} Celestial Sphere. All rights reserved.<br>
              If you did not sign up for this service, please ignore this email.
            </small>
          </div>
        </div>
      `,
      text: `Welcome to Celestial Sphere!

Hi there!

We're excited to have you join Celestial Sphere, your gateway to exploring the cosmos like never before.

Your Cosmic Journey Begins Now!

Stay tuned for more updates, and get ready to explore the universe from the comfort of your screen.

Best regards,
The Celestial Sphere Team

© ${new Date().getFullYear()} Celestial Sphere. All rights reserved.
If you did not sign up for this service, please ignore this email.`
    });

    console.log('📧 Welcome Email Sent Successfully');
    console.log('Message ID:', emailInfo.messageId);
  } catch (error) {
    console.error('❌ Welcome Email Failed:', error);
    
    // Detailed error logging
    console.error('Error Details:');
    console.error('Host:', process.env.EMAIL_HOST);
    console.error('Port:', process.env.EMAIL_PORT);
    console.error('Secure:', process.env.EMAIL_SECURE);
    console.error('Username:', process.env.EMAIL_USERNAME);
  }
}

// Run the email send
sendWelcomeEmail();
