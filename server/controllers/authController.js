const User = require('../models/User');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { generateOTP, sendOTPEmail, sendEmailChangeOTP, sendWelcomeEmail, createTransporter } = require('../utils/emailService');
const crypto = require('crypto');
const emailService = require('../utils/emailService');
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });

    // If user exists but is not verified, generate a new OTP
    if (user && !user.isVerified) {
      // Generate new OTP
      const otp = user.generateVerificationOTP();
      await user.save();

      // Send verification email
      await sendOTPEmail(email, otp);

      return res.status(200).json({
        success: true,
        requiresVerification: true,
        email,
        message: 'A verification code has been sent to your email.'
      });
    }

    // If user exists and is verified, return error
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use. Please login instead.'
      });
    }

    // Create new user
    user = new User({
      name,
      email,
      password
    });

    // Generate and set OTP for verification
    const otp = user.generateVerificationOTP();
    
    // Save user
    await user.save();

    // Send verification email
    await sendOTPEmail(email, otp);

    // Return success
    return res.status(201).json({
      success: true,
      requiresVerification: true,
      email,
      message: 'Registration successful! Please verify your email with the code we sent you.'
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to register user'
    });
  }
};

// Verify email with OTP
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify OTP - this now handles different user roles internally
    const isValidOTP = user.verifyOTP(otp);
    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Role-specific processing can be added here if needed
    // For example, admin users might have different verification requirements
    if (user.role === 'admin') {
      logger.info(`Admin user ${user._id} (${user.email}) has been verified`);
      // Any additional admin-specific verification steps could go here
    }

    // Mark user as verified and save - this is now handled in verifyOTP for consistency
    // but we'll ensure it's set correctly here too
    user.isVerified = true;
    await user.save();

    // Generate tokens for auto-login
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store refresh token in database
    await storeRefreshToken(user._id, refreshToken);

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    // Extract user data
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isVerified: user.isVerified,
      role: user.role // Include role so the client can adjust UI accordingly
    };

    // Return success with tokens for auto-login
    res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
      token: accessToken,
      refreshToken,
      user: userData
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify email'
    });
  }
};

// Resend verification OTP
exports.resendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please register again.'
      });
    }
    
    // User already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified. Please login.'
      });
    }
    
    // Generate and save new OTP
    const otp = user.generateVerificationOTP();
    await user.save();
    
    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);
    
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.'
      });
    }
    
    console.log('Verification OTP resent for:', email);
    
    res.status(200).json({ 
      success: true,
      message: 'A new verification code has been sent to your email.',
      email
    });
    
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Something went wrong. Please try again.' 
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (user.accountLocked) {
      if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
        // Account is locked, calculate time remaining
        const timeRemaining = Math.ceil((user.accountLockedUntil - new Date()) / (1000 * 60));
        return res.status(403).json({
          success: false,
          message: `Account locked. Please try again in ${timeRemaining} minute(s).`
        });
      } else {
        // Lock period has expired, unlock the account
        user.accountLocked = false;
        user.failedLoginAttempts = 0;
        await user.save();
      }
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    
    // Handle login attempt result
    await user.handleLoginAttempt(isMatch);
    
    if (!isMatch) {
      // Determine attempts remaining before lockout
      const attemptsRemaining = Math.max(0, 5 - user.failedLoginAttempts);
      
      if (user.accountLocked) {
        const timeRemaining = Math.ceil((user.accountLockedUntil - new Date()) / (1000 * 60));
        return res.status(403).json({
          success: false,
          message: `Too many failed attempts. Account locked for ${timeRemaining} minute(s).`
        });
      }
      
      return res.status(401).json({
        success: false,
        message: attemptsRemaining > 0 
          ? `Invalid email or password. ${attemptsRemaining} attempt(s) remaining.`
          : 'Invalid email or password'
      });
    }

    // Check if user is verified - handle differently based on role
    if (!user.isVerified) {
      // Generate new OTP for verification
      const otp = user.generateVerificationOTP();
      await user.save();

      // Determine message based on user role
      let message = 'Please verify your email before logging in. A new verification code has been sent.';
      
      if (user.role === 'admin') {
        logger.info(`Unverified admin login attempt: ${user.email}`);
        message = 'Admin account requires email verification. A verification code has been sent.';
      }

      // Send verification email
      await sendOTPEmail(email, otp);

      return res.status(403).json({
        success: false,
        requiresVerification: true,
        email,
        role: user.role, // Include role so the client can adjust UI accordingly
        message: message
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store refresh token in database
    await storeRefreshToken(user._id, refreshToken);

    // Extract user data (exclude sensitive fields)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isVerified: user.isVerified,
      role: user.role // Include role so the client can adjust UI accordingly
    };

    // Success - return token and user data
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: accessToken,
      refreshToken,
      user: userData
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.'
    });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    // Get user ID from req.user (could be in either id or userId)
    const userId = req.user.id || req.user.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID not found in authentication token' 
      });
    }
    
    const user = await User.findById(userId).select('-password -refreshToken -refreshTokenExpiresAt');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.status(200).json({ 
      success: true,
      user
    });
  } catch (error) {
    logger.error('Get user profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Something went wrong. Please try again.' 
    });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    // Get user ID from req.user (could be in either id or userId)
    const userId = req.user.id || req.user.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID not found in authentication token' 
      });
    }
    
    const { name, email, avatar } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    
    // Check if email is being changed
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    if (email && email !== user.email) {
      // Check if email is already in use by someone else
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({
          success: false,
          message: 'This email is already associated with another account'
        });
      }
    
      // Store the new email in tempEmail field instead of changing it directly
      updateData.tempEmail = email;
      
      // Generate and set OTP for verification
      const otp = user.generateVerificationOTP();
      
      // Save the user with tempEmail and OTP
      user.tempEmail = email;
      await user.save();
      
      // Send verification email to the new email address
      await sendEmailChangeOTP(email, otp);
      
      return res.status(200).json({
        success: true,
        message: 'Email change requested. Please verify your new email address with the code we sent.',
        requiresVerification: true,
        email
      });
    }
    
    if (avatar) updateData.avatar = avatar;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshToken -refreshTokenExpiresAt');
    
    res.status(200).json({ 
      success: true,
      user: updatedUser
    });
  } catch (error) {
    logger.error('Update user profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Something went wrong. Please try again.' 
    });
  }
};

// Upload avatar image
exports.uploadAvatar = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    // Get user ID from req.user (could be in either id or userId)
    const userId = req.user.id || req.user.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID not found in authentication token' 
      });
    }

    // Get the user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Store old avatar URL to check for reviews later
    const oldAvatarUrl = user.avatar;

    // If user has an existing Cloudinary avatar, delete it ONLY if no reviews are using it
    if (oldAvatarUrl && oldAvatarUrl.includes('cloudinary.com')) {
      // First check if any reviews are using this avatar
      const Review = require('../models/Review');
      const reviewsUsingAvatar = await Review.countDocuments({ userAvatar: oldAvatarUrl });
      
      if (reviewsUsingAvatar === 0) {
        // Safe to delete as no reviews are using this avatar
        const { getPublicIdFromUrl, deleteImage } = require('../config/cloudinary');
        const publicId = getPublicIdFromUrl(oldAvatarUrl);
        if (publicId) {
          console.log(`Deleting unused avatar image: ${publicId}`);
          await deleteImage(publicId);
        }
      } else {
        console.log(`Keeping old avatar as ${reviewsUsingAvatar} reviews are using it`);
      }
    }
    // Delete old avatar local file if it's a local file
    else if (oldAvatarUrl && oldAvatarUrl.startsWith('/uploads/') && fs.existsSync(path.join(__dirname, '..', oldAvatarUrl))) {
      fs.unlinkSync(path.join(__dirname, '..', oldAvatarUrl));
    }
    
    // The Cloudinary URL is now available in req.file.path
    const avatarUrl = req.file.path;
    
    // Update user with new avatar path
    user.avatar = avatarUrl;
    await user.save();
    
    // Create a sanitized user object to return
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isVerified: user.isVerified
    };
    
    res.status(200).json({ 
      success: true,
      user: userResponse
    });
  } catch (error) {
    logger.error('Upload avatar error:', error);
    
    res.status(500).json({ 
      success: false, 
      message: 'Something went wrong. Please try again.' 
    });
  }
};

// Remove avatar image
exports.removeAvatar = async (req, res) => {
  try {
    // Get user ID from req.user (could be in either id or userId)
    const userId = req.user.id || req.user.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID not found in authentication token' 
      });
    }

    // Get the user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Store the current avatar URL
    const oldAvatarUrl = user.avatar;

    // If user has a Cloudinary avatar, check if we can delete it
    if (oldAvatarUrl && oldAvatarUrl.includes('cloudinary.com')) {
      // First check if any reviews are using this avatar
      const Review = require('../models/Review');
      const reviewsUsingAvatar = await Review.countDocuments({ userAvatar: oldAvatarUrl });
      
      if (reviewsUsingAvatar === 0) {
        // Safe to delete as no reviews are using this avatar
        const { getPublicIdFromUrl, deleteImage } = require('../config/cloudinary');
        const publicId = getPublicIdFromUrl(oldAvatarUrl);
        if (publicId) {
          console.log(`Deleting unused avatar image: ${publicId}`);
          await deleteImage(publicId);
        }
      } else {
        console.log(`Keeping old avatar as ${reviewsUsingAvatar} reviews are using it`);
      }
    }
    // Delete local avatar file if it exists and is not the default
    else if (oldAvatarUrl && oldAvatarUrl.startsWith('/uploads/') && fs.existsSync(path.join(__dirname, '..', oldAvatarUrl))) {
      fs.unlinkSync(path.join(__dirname, '..', oldAvatarUrl));
    }
    
    // Remove avatar from user
    user.avatar = null;
    await user.save();
    
    // Create a sanitized user object to return
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isVerified: user.isVerified
    };
    
    res.status(200).json({ 
      success: true,
      user: userResponse
    });
  } catch (error) {
    logger.error('Remove avatar error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Something went wrong. Please try again.' 
    });
  }
};

// Generate tokens
const generateTokens = (userId) => {
  try {
    // Create access token (short-lived)
    const accessToken = jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' } // 15 minutes
    );

    // Create refresh token (long-lived)
    const refreshToken = jwt.sign(
      { id: userId },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' } // 7 days
    );

    return { accessToken, refreshToken };
  } catch (error) {
    logger.error('Error generating tokens:', error);
    throw new Error('Failed to generate authentication tokens');
  }
};

// Store refresh token in database
const storeRefreshToken = async (userId, refreshToken) => {
  try {
    // Hash the refresh token before storing it
    const hashedToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    // Update user with the new refresh token
    await User.findByIdAndUpdate(userId, {
      refreshToken: hashedToken,
      refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
  } catch (error) {
    logger.error('Error storing refresh token:', error);
    throw new Error('Failed to store refresh token');
  }
};

// Refresh token endpoint
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  // Validate request
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    // Get the user associated with the token
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Verify that the stored hashed token matches
    const hashedToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    if (user.refreshToken !== hashedToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Check if token is expired
    if (user.refreshTokenExpiresAt && user.refreshTokenExpiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired'
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    // Store the new refresh token
    await storeRefreshToken(user._id, newRefreshToken);

    // Remove sensitive data before sending the response
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.refreshToken;
    delete userObject.refreshTokenExpiresAt;

    // Send the new tokens
    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      token: accessToken,
      refreshToken: newRefreshToken,
      user: userObject
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    logger.error('Refresh token error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to refresh token'
    });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    // If using auth middleware, req.user should be available
    if (req.user && req.user.id) {
      // Clear the refresh token in database
      await User.findByIdAndUpdate(req.user.id, {
        refreshToken: null,
        refreshTokenExpiresAt: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout'
    });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    // If user doesn't exist, still return success for security
    if (!user) {
      console.log('Forgot password requested for non-existent email:', email);
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, password reset instructions have been sent.'
      });
    }
    
    // Generate a password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Set password reset token and expiry (1 hour)
    user.resetPasswordToken = resetToken;
    const resetExpiry = new Date();
    resetExpiry.setHours(resetExpiry.getHours() + 1);
    user.resetPasswordExpires = resetExpiry;
    
    await user.save();
    
    // Generate a reset URL
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${email}`;
    
    try {
      // Send reset email using the email service
      const transporter = await createTransporter();
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Photography App <noreply@photography.com>',
        to: email,
        subject: 'Password Reset - Photography App',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333; text-align: center;">Password Reset</h2>
            <p>You requested a password reset for your Photography App account. Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Reset Your Password
              </a>
            </div>
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            <p>This link will expire in 1 hour.</p>
            <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
              &copy; ${new Date().getFullYear()} Photography App. All rights reserved.
            </p>
          </div>
        `
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', info.messageId);
      
      // If using Ethereal, provide preview URL
      if (info.messageId && info.messageId.includes('ethereal')) {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      // Don't return an error to the client for security reasons
    }
    
    // Always return success for security (don't reveal if email exists)
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, password reset instructions have been sent.'
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Something went wrong. Please try again.' 
    });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body;
    
    if (!email || !token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, token and new password'
      });
    }
    
    // Find user by email and valid token
    const user = await User.findOne({ 
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }
    
    // Validate password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number, and be at least 6 characters long'
      });
    }
    
    // Update password and clear reset token fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.lastPasswordChange = Date.now();
    
    await user.save();
    
    try {
      // Send password changed notification email
      const transporter = await createTransporter();
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Photography App <noreply@photography.com>',
        to: email,
        subject: 'Password Changed - Photography App',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333; text-align: center;">Password Changed</h2>
            <p>Your password for Photography App has been successfully changed.</p>
            <p>If you did not make this change, please contact support immediately.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" style="background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Login to Your Account
              </a>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
              &copy; ${new Date().getFullYear()} Photography App. All rights reserved.
            </p>
          </div>
        `
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log('Password changed email sent:', info.messageId);
      
      // If using Ethereal, provide preview URL
      if (info.messageId && info.messageId.includes('ethereal')) {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }
    } catch (emailError) {
      console.error('Error sending password changed email:', emailError);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Your password has been reset successfully. You can now log in with your new password.'
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Something went wrong. Please try again.' 
    });
  }
};

// Validate reset token
exports.validateResetToken = async (req, res) => {
  try {
    const { email, token } = req.body;
    
    if (!email || !token) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and token'
      });
    }
    
    // Find user by email and valid token
    const user = await User.findOne({ 
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Token is valid'
    });
    
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Something went wrong. Please try again.' 
    });
  }
};

// Create token
const createToken = (user) => {
  const token = jwt.sign(
    { 
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME }
  );
  
  console.log('Created JWT token with payload:', { 
    userId: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  });
  
  return token;
};

// Check if email exists
exports.checkEmailExists = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find if a user already exists with this email
    const existingUser = await User.findOne({ email });
    
    // Return whether the email exists
    return res.status(200).json({
      success: true,
      exists: !!existingUser
    });
  } catch (error) {
    logger.error('Check email exists error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while checking email'
    });
  }
};

// Request email change
exports.requestEmailChange = async (req, res) => {
  try {
    // Get user ID from req.user (could be in either id or userId)
    const userId = req.user.id || req.user.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID not found in authentication token' 
      });
    }
    
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new email address'
      });
    }
    
    // Check if email is valid
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    // Get the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if email is already in use by someone else
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({
        success: false,
        message: 'This email is already associated with another account'
      });
    }
    
    // If it's the same as current email, return success
    if (email === user.email) {
      return res.status(200).json({
        success: true,
        message: 'This is already your email address'
      });
    }
    
    // Update the user's tempEmail field
    user.tempEmail = email;
    
    // Generate and set OTP for verification
    const otp = user.generateVerificationOTP();
    await user.save();
    
    // Send verification email to the new email address
    await sendEmailChangeOTP(email, otp);
    
    res.status(200).json({
      success: true,
      message: 'Verification code sent to your new email address',
      email
    });
  } catch (error) {
    logger.error('Request email change error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Something went wrong. Please try again.' 
    });
  }
};

// Verify email change
exports.verifyEmailChange = async (req, res) => {
  try {
    // Get user ID from req.user (could be in either id or userId)
    const userId = req.user.id || req.user.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID not found in authentication token' 
      });
    }
    
    const { otp } = req.body;
    
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the verification code'
      });
    }
    
    // Get the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if user has a tempEmail
    if (!user.tempEmail) {
      return res.status(400).json({
        success: false,
        message: 'No email change was requested'
      });
    }
    
    // Verify OTP - this now handles different user roles internally
    const isValidOTP = user.verifyOTP(otp);
    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }
    
    // Different logic for admin vs regular users
    if (user.role === 'admin') {
      // Admin users might require additional verification or approvals
      // For now, we'll implement a simple extra verification step
      logger.info(`Admin email change requested for user ${user._id}, from ${user.email} to ${user.tempEmail}`);
      
      // Check if the tempEmail is already in use by another account
      const existingUser = await User.findOne({ email: user.tempEmail });
      if (existingUser && existingUser._id.toString() !== userId) {
        // Clear tempEmail as it's not usable
        user.tempEmail = undefined;
        await user.save();
        
        return res.status(400).json({
          success: false,
          message: 'This email is already associated with another account'
        });
      }
      
      // Additional security check could be added here for admin users
      // For example, requiring a second factor or approval
      
      // Continue with the email change process
    } else {
      // Regular user email change process
      // Check if the tempEmail is already in use by another account
      const existingUser = await User.findOne({ email: user.tempEmail });
      if (existingUser && existingUser._id.toString() !== userId) {
        // Clear tempEmail as it's not usable
        user.tempEmail = undefined;
        await user.save();
        
        return res.status(400).json({
          success: false,
          message: 'This email is already associated with another account'
        });
      }
    }
    
    try {
      // Update the user's email with the verified tempEmail
      const oldEmail = user.email;
      user.email = user.tempEmail;
      user.tempEmail = undefined;
      
      // Save the user
      await user.save();
      
      // Send confirmation email to both old and new email addresses
      try {
        const transporter = await createTransporter();
        
        // Send to new email
        const mailOptions = {
          from: process.env.EMAIL_FROM || 'Photography App <noreply@photography.com>',
          to: user.email,
          subject: 'Email Address Changed - Photography App',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h2 style="color: #333; text-align: center;">Email Address Changed</h2>
              <p>Your email address for Photography App has been successfully changed.</p>
              <p>If you did not make this change, please contact support immediately.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" style="background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                  Login to Your Account
                </a>
              </div>
              <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
                &copy; ${new Date().getFullYear()} Photography App. All rights reserved.
              </p>
            </div>
          `
        };
        
        // Send to old email
        const notificationOptions = {
          from: process.env.EMAIL_FROM || 'Photography App <noreply@photography.com>',
          to: oldEmail,
          subject: 'Email Address Changed - Photography App',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h2 style="color: #333; text-align: center;">Email Address Changed</h2>
              <p>The email address for your Photography App account has been changed to ${user.email}.</p>
              <p>If you did not make this change, please contact support immediately.</p>
              <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
                &copy; ${new Date().getFullYear()} Photography App. All rights reserved.
              </p>
            </div>
          `
        };
        
        await transporter.sendMail(mailOptions);
        await transporter.sendMail(notificationOptions);
      } catch (emailError) {
        console.error('Error sending email change confirmation:', emailError);
      }
      
      // Return the updated user
      const updatedUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified
      };
      
      res.status(200).json({
        success: true,
        message: 'Email address changed successfully',
        user: updatedUser
      });
    } catch (saveError) {
      logger.error('Error saving user email change:', saveError);
      
      // Check if this is a duplicate key error (email already exists)
      if (saveError.code === 11000) {
        // Reset the user's tempEmail since we can't use it
        user.email = oldEmail; // Set back to original
        user.tempEmail = undefined;
        await user.save();
        
        return res.status(400).json({
          success: false,
          message: 'This email is already associated with another account'
        });
      }
      
      // For other errors, return a generic message
      return res.status(500).json({
        success: false,
        message: 'Failed to update email. Please try again.'
      });
    }
  } catch (error) {
    logger.error('Verify email change error:', error);
    
    // Check if this is a duplicate key error (email already exists)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This email is already associated with another account'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Something went wrong. Please try again.' 
    });
  }
}; 