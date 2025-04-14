const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

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

      // Attach user to request object
      req.user = {
        userId: decoded.userId || decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role || 'user' // Default to 'user' if role is not in token
      };
      
      console.log('User object attached to request:', req.user);

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

// Middleware to check if user is admin
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
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