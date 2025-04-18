const jwt = require('jsonwebtoken');
const { isAdminEmail } = require('../config/createAdmin');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Middleware to protect admin routes
 * Checks JWT token and verifies that the user's email is in the admin list
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token has admin claim
      if (!decoded.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Admin privileges required'
        });
      }
      
      // Verify email is in admin list
      const user = await User.findById(decoded.id);
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
      
      // Set user info in request object
      req.user = {
        id: decoded.id,
        email: user.email,
        isAdmin: true
      };
      
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }
      
      throw error;
    }
  } catch (error) {
    logger.error('Admin authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

module.exports = {
  authenticateAdmin
}; 