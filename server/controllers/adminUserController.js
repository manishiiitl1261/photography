const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Get all users (admin only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Support pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Support search by name or email
    const searchQuery = {};
    if (req.query.search) {
      const search = req.query.search;
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Support filtering by role
    if (req.query.role) {
      searchQuery.role = req.query.role;
    }
    
    // Get total count for pagination
    const totalUsers = await User.countDocuments(searchQuery);
    
    // Get users with pagination, exclude sensitive fields
    const users = await User.find(searchQuery)
      .select('-password -refreshToken -refreshTokenExpiresAt -verificationOTP -verificationOTPExpires -verificationToken -verificationTokenExpires -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: users.length,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      users
    });
  } catch (error) {
    logger.error('Error fetching all users:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch users, please try again later.',
      error: error.message
    });
  }
};

/**
 * Delete a user (admin only)
 */
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Prevent admins from deleting other admins
    const userToDelete = await User.findById(userId);
    
    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // If trying to delete an admin
    if (userToDelete.role === 'admin') {
      // Only allow if it's the user deleting themselves
      const requestingAdmin = req.user.id || req.user.userId;
      if (userId !== requestingAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete other admin users'
        });
      }
    }
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to delete user, please try again later.',
      error: error.message
    });
  }
};

/**
 * Get user details (admin only)
 */
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select('-password -refreshToken -refreshTokenExpiresAt -verificationOTP -verificationOTPExpires -verificationToken -verificationTokenExpires -resetPasswordToken -resetPasswordExpires');
    
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
    logger.error('Error fetching user details:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch user details, please try again later.',
      error: error.message
    });
  }
}; 