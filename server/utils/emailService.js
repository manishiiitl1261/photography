const { google } = require('googleapis');

/**
 * Gmail API client
 * Requires:
 * GOOGLE_CLIENT_ID
 * GOOGLE_CLIENT_SECRET
 * GOOGLE_REFRESH_TOKEN
 * EMAIL_FROM
 * OPTIONAL: CLIENT_URL, ADMIN_EMAILS, NEXT_PUBLIC_ADMIN_EMAILS, OTP_EXPIRY
 */

const createGmailClient = () => {
  if (
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET ||
    !process.env.GOOGLE_REFRESH_TOKEN
  ) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
};

const gmail = createGmailClient();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const encodeSubject = (subject) => {
  return `=?UTF-8?B?${Buffer.from(subject, 'utf-8').toString('base64')}?=`;
};

const makeRawMessage = ({ from, to, subject, html }) => {
  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodeSubject(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset="UTF-8"',
    '',
    html,
  ].join('\n');

  return Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const sendViaGmail = async ({ to, subject, html }) => {
  if (!gmail) {
    console.warn('Gmail API credentials are missing. Email not sent.');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Body:', html.substring(0, 200) + '...');
    return { messageId: 'dummy-message-id' };
  }

  const raw = makeRawMessage({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });

  const response = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw,
    },
  });

  return response.data;
};

// Send OTP email
const sendOTPEmail = async (email, otp, subject = 'Email Verification Code - Photography App') => {
  try {
    console.log(`Attempting to send OTP email to ${email}`);

    const isAdminLogin = subject.includes('Admin Login');

    const html = isAdminLogin
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Admin Login Verification</h2>
          <p>Please use the following verification code to complete your admin login:</p>
          <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in ${process.env.OTP_EXPIRY || 10} minutes.</p>
          <p>If you didn't request this code, please ignore this email and contact support immediately.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
            &copy; ${new Date().getFullYear()} Photography App. All rights reserved.
          </p>
        </div>
      `
      : `
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
      `;

    const info = await sendViaGmail({
      to: email,
      subject,
      html,
    });

    console.log('Email sent:', info.id || info.messageId || 'sent');
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

    const html = `
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
    `;

    const info = await sendViaGmail({
      to: email,
      subject: 'Email Change Verification - Photography App',
      html,
    });

    console.log('Email change verification email sent:', info.id || info.messageId || 'sent');
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

    const html = `
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
    `;

    const info = await sendViaGmail({
      to: email,
      subject: 'Welcome to Photography App!',
      html,
    });

    console.log('Welcome email sent:', info.id || info.messageId || 'sent');
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

// Send booking notification to admin
const sendBookingNotificationToAdmin = async (booking, user) => {
  try {
    console.log(`Attempting to send booking notification to admin`);

    const adminEmails = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';
    if (!adminEmails) {
      console.warn('No admin emails configured. Booking notification not sent.');
      return false;
    }

    const bookingDate = new Date(booking.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formattedPrice = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(booking.price);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">New Booking Request</h2>
        <p>A new booking request has been submitted by <strong>${user.name}</strong> (${user.email}).</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #444;">Booking Details:</h3>
          <p><strong>Service Type:</strong> ${booking.serviceType}</p>
          <p><strong>Package:</strong> ${booking.packageType}</p>
          <p><strong>Date:</strong> ${bookingDate}</p>
          <p><strong>Location:</strong> ${booking.location}</p>
          <p><strong>Price:</strong> ${formattedPrice}</p>
          ${booking.additionalRequirements ? `<p><strong>Additional Requirements:</strong> ${booking.additionalRequirements}</p>` : ''}
        </div>
        
        <p>Please log in to the admin dashboard to approve or reject this booking.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/bookings" 
             style="background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Go to Admin Dashboard
          </a>
        </div>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
          &copy; ${new Date().getFullYear()} Photography App. All rights reserved.
        </p>
      </div>
    `;

    const info = await sendViaGmail({
      to: adminEmails.split(',').map(email => email.trim()).join(','),
      subject: 'New Booking Request - Photography App',
      html,
    });

    console.log('Admin booking notification sent:', info.id || info.messageId || 'sent');
    return true;
  } catch (error) {
    console.error('Error sending admin booking notification:', error);
    return false;
  }
};

// Send booking status update to user
const sendBookingStatusUpdateToUser = async (booking, user, previousStatus) => {
  try {
    console.log(`Attempting to send booking status update to user ${user.email}`);

    const bookingDate = new Date(booking.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formattedPrice = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(booking.price);

    let statusMessage = '';
    let statusColor = '';
    let actionButton = '';

    switch (booking.status) {
      case 'approved':
        statusMessage = 'Your booking has been approved! We look forward to seeing you on the scheduled date.';
        statusColor = '#4caf50';
        actionButton = `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/profile/bookings" 
               style="background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Booking Details
            </a>
          </div>
        `;
        break;

      case 'rejected':
        statusMessage =
          'We regret to inform you that your booking has been rejected. ' +
          (booking.adminNotes
            ? `The administrator provided the following note: "${booking.adminNotes}"`
            : 'Please contact us if you have any questions.');
        statusColor = '#f44336';
        actionButton = `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/Services" 
               style="background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Explore Other Options
            </a>
          </div>
        `;
        break;

      case 'completed':
        statusMessage = 'Your booking has been marked as completed. Thank you for choosing our services!';
        statusColor = '#2196f3';
        actionButton = `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/reviews/add" 
               style="background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Leave a Review
            </a>
          </div>
        `;
        break;

      default:
        statusMessage = `Your booking status has been updated from "${previousStatus}" to "${booking.status}".`;
        statusColor = '#ff9800';
        actionButton = `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/profile/bookings" 
               style="background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Booking Details
            </a>
          </div>
        `;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Booking Status Update</h2>
        
        <div style="text-align: center; margin: 20px 0;">
          <span style="display: inline-block; padding: 8px 16px; background-color: ${statusColor}; color: white; border-radius: 20px; font-weight: bold;">
            ${booking.status.toUpperCase()}
          </span>
        </div>
        
        <p>${statusMessage}</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #444;">Booking Details:</h3>
          <p><strong>Service Type:</strong> ${booking.serviceType}</p>
          <p><strong>Package:</strong> ${booking.packageType}</p>
          <p><strong>Date:</strong> ${bookingDate}</p>
          <p><strong>Location:</strong> ${booking.location}</p>
          <p><strong>Price:</strong> ${formattedPrice}</p>
          ${booking.adminNotes && booking.status !== 'rejected' ? `<p><strong>Admin Notes:</strong> ${booking.adminNotes}</p>` : ''}
        </div>
        
        ${actionButton}
        
        <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
          &copy; ${new Date().getFullYear()} Photography App. All rights reserved.
        </p>
      </div>
    `;

    const info = await sendViaGmail({
      to: user.email,
      subject: `Booking Status Update: ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)} - Photography App`,
      html,
    });

    console.log('User booking status update sent:', info.id || info.messageId || 'sent');
    return true;
  } catch (error) {
    console.error('Error sending booking status update:', error);
    return false;
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendEmailChangeOTP,
  sendWelcomeEmail,
  sendBookingNotificationToAdmin,
  sendBookingStatusUpdateToUser,
};
