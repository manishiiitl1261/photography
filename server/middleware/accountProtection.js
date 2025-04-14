const logger = require('../utils/logger');

/**
 * Middleware to protect against brute force login attempts
 * Limits login requests to a maximum number within a time window
 */
const loginRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();
  
  // Cleanup function to remove old entries
  const cleanup = () => {
    const now = Date.now();
    for (const [key, data] of attempts.entries()) {
      if (now - data.startTime > windowMs) {
        attempts.delete(key);
      }
    }
  };
  
  // Run cleanup every minute
  setInterval(cleanup, 60 * 1000);
  
  return (req, res, next) => {
    // Only apply to sensitive auth routes, not profile or other endpoints
    const sensitiveRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/resend-verification'];
    
    // Skip rate limiting for non-sensitive routes
    if (!sensitiveRoutes.includes(req.path)) {
      return next();
    }
    
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const email = req.body.email || 'unknown';
    
    // Create a key from both IP and email to prevent abuse from multiple IPs
    const ipKey = `ip:${ip}`;
    const emailKey = `email:${email}`;
    
    const now = Date.now();
    
    // Initialize or update attempts for IP
    if (!attempts.has(ipKey)) {
      attempts.set(ipKey, { count: 0, startTime: now });
    }
    
    // Initialize or update attempts for email
    if (!attempts.has(emailKey)) {
      attempts.set(emailKey, { count: 0, startTime: now });
    }
    
    const ipData = attempts.get(ipKey);
    const emailData = attempts.get(emailKey);
    
    // Reset if window has passed
    if (now - ipData.startTime > windowMs) {
      ipData.count = 0;
      ipData.startTime = now;
    }
    
    if (now - emailData.startTime > windowMs) {
      emailData.count = 0;
      emailData.startTime = now;
    }
    
    // Increment counters
    ipData.count++;
    emailData.count++;
    
    // Check if limits exceeded
    if (ipData.count > maxAttempts || emailData.count > maxAttempts) {
      logger.warn(`Rate limit exceeded: ${email} from IP ${ip} on path ${req.path}`);
      
      // Calculate remaining time until reset
      const ipResetTime = Math.ceil((ipData.startTime + windowMs - now) / 1000 / 60);
      const emailResetTime = Math.ceil((emailData.startTime + windowMs - now) / 1000 / 60);
      const resetTime = Math.min(ipResetTime, emailResetTime);
      
      return res.status(429).json({
        success: false,
        message: `Too many requests. Please try again in ${resetTime} minutes.`
      });
    }
    
    next();
  };
};

/**
 * Middleware to enforce secure passwords
 * Validates password strength during registration and password changes
 */
const passwordStrengthValidator = (req, res, next) => {
  // Only apply to registration and password change routes
  if (req.path !== '/register' && req.path !== '/reset-password' && req.path !== '/profile') {
    return next();
  }
  
  // Skip if no password in request
  if (!req.body.password) {
    return next();
  }
  
  const password = req.body.password;
  
  // Validate password strength
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  
  const errors = [];
  
  if (!hasMinLength) errors.push('Password must be at least 8 characters long');
  if (!hasUppercase) errors.push('Password must contain at least one uppercase letter');
  if (!hasLowercase) errors.push('Password must contain at least one lowercase letter');
  if (!hasNumber) errors.push('Password must contain at least one number');
  if (!hasSpecialChar) errors.push('Password must contain at least one special character');
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Password is not strong enough',
      errors
    });
  }
  
  next();
};

module.exports = {
  loginRateLimit,
  passwordStrengthValidator
}; 