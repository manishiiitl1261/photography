const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { isAdminEmail } = require('../config/createAdmin');
const User = require('../models/User');

/**
 * Authentication middleware - verifies the JWT token
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication invalid: No token provided' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication invalid: Token is missing' 
      });
    }
    
    // Verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token payload is valid - now it could be either id or userId depending on which token system
    const userId = payload.id || payload.userId;
    if (!userId) {
      logger.warn('Invalid token format detected', { payload });
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication invalid: Invalid token format' 
      });
    }
    
    // Attach user info to request
    req.user = { 
      userId: userId, 
      id: userId, // Include both formats for backward compatibility
      email: payload.email,
      iat: payload.iat, 
      exp: payload.exp,
      isAdmin: payload.isAdmin || false
    };
    
    // Check token expiration (additional check besides jwt.verify)
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication invalid: Token has expired' 
      });
    }
    
    next();
  } catch (error) {
    // Log the error for debugging
    logger.error('Authentication error:', error);
    
    // Specific error for token expiration
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication invalid: Token has expired' 
      });
    }
    
    // Specific error for invalid token
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication invalid: Invalid token' 
      });
    }
    
    // Generic error
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication invalid: ' + (error.message || 'Unknown error') 
    });
  }
};

/**
 * Admin middleware - verifies that the user is an admin
 * Must be used after authenticateToken middleware
 */
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Either check the isAdmin flag from the token or lookup the email
    if (req.user.isAdmin === true) {
      return next();
    }

    // If we have the email in the request, check if it's an admin email
    if (req.user.email && isAdminEmail(req.user.email)) {
      return next();
    }

    // Otherwise we need to lookup the user's email in the database
    const userId = req.user.id || req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!isAdminEmail(user.email)) {
      logger.warn(`Unauthorized admin access attempt: ${user.email}`);
      return res.status(403).json({
        success: false,
        message: 'Admin access denied'
      });
    }

    next();
  } catch (error) {
    logger.error('Admin verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying admin status'
    });
  }
};

module.exports = {
  authenticateToken,
  isAdmin
}; 