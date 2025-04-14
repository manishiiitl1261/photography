const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  // For development/testing, use a test account if no credentials are provided
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'YOUR_GMAIL_PASSWORD_HERE') {
    console.log('No email credentials provided or using placeholder. Using test account instead.');
    return createTestTransporter();
  }
  
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // Add these options for Gmail
    secure: true,
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Create a test email account for development
const createTestTransporter = async () => {
  console.log('Creating test email account...');
  try {
    // Generate test SMTP service account
    const testAccount = await nodemailer.createTestAccount();
    console.log('Test email account created:', testAccount.user);
    
    // Create a test transporter
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } catch (error) {
    console.error('Failed to create test email account:', error);
    
    // Return a dummy transporter that logs emails instead of sending them
    return {
      sendMail: (options) => {
        console.log('EMAIL NOT SENT (dummy transporter). Would have sent:');
        console.log(`From: ${options.from}`);
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Body: ${options.html.substring(0, 150)}...`);
        return Promise.resolve({ messageId: 'dummy-message-id' });
      }
    };
  }
};

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    console.log(`Attempting to send OTP email to ${email}`);
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Photography App <noreply@photography.com>',
      to: email,
      subject: 'Email Verification Code - Photography App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Email Verification</h2>
          <p>Thank you for registering with Photography App. Please use the following verification code to complete your registration:</p>
          <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in ${process.env.OTP_EXPIRY || 10} minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
            &copy; ${new Date().getFullYear()} Photography App. All rights reserved.
          </p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    
    // If using Ethereal, provide preview URL
    if (info.messageId && info.messageId.includes('ethereal')) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Send email change verification code
const sendEmailChangeOTP = async (email, otp) => {
  try {
    console.log(`Attempting to send email change verification code to ${email}`);
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Photography App <noreply@photography.com>',
      to: email,
      subject: 'Email Change Verification - Photography App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Email Change Verification</h2>
          <p>You've requested to change your email address for your Photography App account. Please use the following verification code to confirm this change:</p>
          <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in ${process.env.OTP_EXPIRY || 10} minutes.</p>
          <p>If you didn't request this change, please ignore this email or contact support if you believe your account may be compromised.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
            &copy; ${new Date().getFullYear()} Photography App. All rights reserved.
          </p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email change verification email sent:', info.messageId);
    
    // If using Ethereal, provide preview URL
    if (info.messageId && info.messageId.includes('ethereal')) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Error sending email change verification email:', error);
    return false;
  }
};

// Send welcome email after successful verification
const sendWelcomeEmail = async (email, name) => {
  try {
    console.log(`Attempting to send welcome email to ${email}`);
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Photography App <noreply@photography.com>',
      to: email,
      subject: 'Welcome to Photography App!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Welcome, ${name}!</h2>
          <p>Thank you for joining Photography App. Your account has been successfully verified and activated.</p>
          <p>You can now log in and explore all the features of our application.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" style="background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Login to Your Account
            </a>
          </div>
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
            &copy; ${new Date().getFullYear()} Photography App. All rights reserved.
          </p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    
    // If using Ethereal, provide preview URL
    if (info.messageId && info.messageId.includes('ethereal')) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendEmailChangeOTP,
  sendWelcomeEmail,
  createTransporter
}; 