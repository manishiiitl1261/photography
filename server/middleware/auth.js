const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const auth = async (req, res, next) => {
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
      iat: payload.iat, 
      exp: payload.exp 
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

module.exports = auth; 