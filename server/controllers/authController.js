const User = require('../models/User');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already in use' 
      });
    }
    
    // Create new user
    const user = await User.create({ name, email, password });
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_LIFETIME }
    );
    
    // Return user data (excluding password)
    const userObj = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar
    };
    
    res.status(201).json({ 
      success: true,
      user: userObj,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
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
    
    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Compare password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_LIFETIME }
    );
    
    // Return user data (excluding password)
    const userObj = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar
    };
    
    res.status(200).json({ 
      success: true,
      user: userObj,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Something went wrong. Please try again.' 
    });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
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
    console.error('Get user profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Something went wrong. Please try again.' 
    });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (avatar) updateData.avatar = avatar;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
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
    console.error('Update user profile error:', error);
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

    // Get the user
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      // Remove the uploaded file if user not found
      fs.unlinkSync(req.file.path);
      
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Delete old avatar if it exists and is not the default
    if (user.avatar && user.avatar.startsWith('/uploads/') && fs.existsSync(path.join(__dirname, '..', user.avatar))) {
      fs.unlinkSync(path.join(__dirname, '..', user.avatar));
    }
    
    // Update user with new avatar path
    const avatarPath = `/uploads/${req.file.filename}`;
    
    user.avatar = avatarPath;
    await user.save();
    
    res.status(200).json({ 
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    
    // Clean up file if there was an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Something went wrong. Please try again.' 
    });
  }
}; 