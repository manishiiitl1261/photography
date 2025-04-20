const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const { isAdminEmail } = require('../config/createAdmin');

const authenticateUser = async (req, res, next) => {
  try {
    // Check header for token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      console.log('JWT decoded token:', decoded);

      // Check if this is an admin email
      const adminStatus = decoded.email ? isAdminEmail(decoded.email) : false;

      // Standardize user ID to ensure _id is always available
      const userId = decoded.id || decoded.userId;
      
      // Attach user to request object with consistent ID format
      req.user = {
        _id: userId,         // Primary ID field (MongoDB standard)
        userId: userId,      // Include for backward compatibility
        id: userId,          // Include for backward compatibility
        email: decoded.email,
        name: decoded.name,
        // Set role based on the email allowlist, not from token
        role: adminStatus ? 'admin' : 'user'
      };
      
      console.log('User object attached to request:', {
        ...req.user,
        isAdmin: adminStatus
      });

      next();
    } catch (error) {
      logger.error('JWT verification error:', error);
      
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token'
      });
    }
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Middleware to check if user is admin using email allowlist
const authorizeAdmin = (req, res, next) => {
  // Check if email is in admin list
  if (!req.user.email || !isAdminEmail(req.user.email)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

module.exports = {
  authenticateUser,
  authorizeAdmin
}; 