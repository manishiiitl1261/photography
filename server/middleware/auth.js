const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication invalid' 
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request
    req.user = { userId: payload.userId };
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication invalid' 
    });
  }
};

module.exports = auth; 