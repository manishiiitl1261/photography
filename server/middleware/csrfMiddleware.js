const csrf = require('csurf');
const logger = require('../utils/logger');

// Configure CSRF protection
const csrfProtection = csrf({ 
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict'
  } 
});

// Error handler for CSRF token errors
const handleCSRFError = (err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') {
    return next(err);
  }

  // Log CSRF failure
  logger.warn(`CSRF attack detected: ${req.method} ${req.originalUrl} from ${req.ip}`);
  
  // Send error response
  res.status(403).json({
    success: false,
    message: 'Form has been tampered with'
  });
};

module.exports = {
  csrfProtection,
  handleCSRFError
}; 