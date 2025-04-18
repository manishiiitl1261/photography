const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isAdminEmail } = require('../config/createAdmin');
const { sendOTPEmail, createTransporter } = require('../utils/emailService');
const logger = require('../utils/logger');
const crypto = require('crypto');

/**
 * Send OTP to admin email for login
 */
exports.adminLogin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if email is in the admin list
    if (!isAdminEmail(email)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Check if user exists in the database
    let user = await User.findOne({ email });

    // If admin doesn't exist yet in the database, create an entry
    if (!user) {
      const defaultName = email.split('@')[0];
      user = new User({
        email,
        name: defaultName,
        password: crypto.randomBytes(16).toString('hex'), // Generate random password
        isVerified: true // Admin accounts are auto-verified
      });
      await user.save();
      logger.info(`Created new admin user for ${email}`);
    }

    // Generate OTP for admin login
    const otp = user.generateVerificationOTP();
    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, 'Admin Login Verification');
    
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification code. Please try again.'
      });
    }

    logger.info(`Admin login OTP sent to ${email}`);
    
    res.status(200).json({
      success: true,
      message: 'Verification code has been sent to your email',
      email,
      requiresVerification: true
    });
    
  } catch (error) {
    logger.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};

/**
 * Verify OTP for admin login
 */
exports.verifyAdminOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
    }

    // Check if email is in the admin list
    if (!isAdminEmail(email)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Find the admin user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify OTP
    const isValidOTP = user.verifyOTP(otp);
    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Generate admin JWT token
    const adminToken = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        isAdmin: true // Explicitly mark as admin
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // 1 day for admin sessions
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        isAdmin: true
      },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' } // 7 days
    );

    // Store refresh token (hashed)
    const hashedToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    user.refreshToken = hashedToken;
    user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.save();

    logger.info(`Admin ${email} successfully authenticated`);

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token: adminToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: true
      }
    });
    
  } catch (error) {
    logger.error('Admin verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};

/**
 * Validate if a user is an admin
 */
exports.validateAdmin = async (req, res) => {
  try {
    // The authentication middleware should set req.user
    const userId = req.user.id || req.user.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user's email is in the admin list
    const isAdmin = isAdminEmail(user.email);
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin validated',
      isAdmin: true
    });
  } catch (error) {
    logger.error('Admin validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
}; 