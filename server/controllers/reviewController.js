const Review = require('../models/Review');
const User = require('../models/User');

// Get all reviews
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new review
const createReview = async (req, res) => {
  try {
    const { name, email, event, text, rating, userId, userAvatar } = req.body;
    
    if (!name || !event || !text || !rating) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Create review data
    const reviewData = {
      name,
      email,
      event,
      text,
      rating: parseInt(rating),
      approved: null // Set as pending by default
    };

    // Add user reference if provided
    if (userId) {
      // Verify that the user exists
      const userExists = await User.findById(userId);
      if (userExists) {
        reviewData.userId = userId;
        
        // If user exists and has an avatar, use it directly (unless it's overridden)
        if (userExists.avatar && !userAvatar) {
          reviewData.userAvatar = userExists.avatar;
        }
        
        // If user exists and has an email, use it
        if (userExists.email && !email) {
          reviewData.email = userExists.email;
        }
      }
    }

    // Add user avatar if provided in the request - use it directly
    if (userAvatar) {
      reviewData.userAvatar = userAvatar;
      console.log('Using avatar path from request:', userAvatar);
    }

    // If there's an uploaded file, add its path
    if (req.file) {
      reviewData.eventImage = `/uploads/${req.file.filename}`;
    }

    // Create the review
    const review = await Review.create(reviewData);
    
    // Log the created review for debugging
    console.log('Created review with avatar:', review.userAvatar);
    
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single review
const getReview = async (req, res) => {
  try {
    const { id: reviewId } = req.params;
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ success: false, message: `No review with id: ${reviewId}` });
    }
    
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const { id: reviewId } = req.params;
    const review = await Review.findByIdAndUpdate(reviewId, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!review) {
      return res.status(404).json({ success: false, message: `No review with id: ${reviewId}` });
    }
    
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const { id: reviewId } = req.params;
    const review = await Review.findByIdAndDelete(reviewId);
    
    if (!review) {
      return res.status(404).json({ success: false, message: `No review with id: ${reviewId}` });
    }
    
    res.status(200).json({ success: true, data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get pending reviews (not yet approved or rejected)
const getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ approved: null }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get approved reviews only
const getApprovedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ approved: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get rejected reviews
const getRejectedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ approved: false }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve or reject a review
const approveReview = async (req, res) => {
  try {
    const { id: reviewId } = req.params;
    const { approved } = req.body;
    
    if (typeof approved !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        message: 'The approved field must be a boolean value (true or false)' 
      });
    }
    
    const review = await Review.findByIdAndUpdate(
      reviewId, 
      { approved }, 
      { new: true, runValidators: true }
    );
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: `No review with id: ${reviewId}` 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: `Review ${approved ? 'approved' : 'rejected'} successfully`,
      data: review 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllReviews,
  createReview,
  getReview,
  updateReview,
  deleteReview,
  getPendingReviews,
  getApprovedReviews,
  getRejectedReviews,
  approveReview
};