const Review = require('../models/Review');
const User = require('../models/User');
const { deleteImage, getPublicIdFromUrl, cloudinary } = require('../config/cloudinary');

// Helper function to copy an image to a dedicated reviews folder
const copyImageForReview = async (sourceUrl) => {
  if (!sourceUrl || !sourceUrl.includes('cloudinary.com')) {
    return sourceUrl; // Return original URL if not a Cloudinary URL
  }
  
  try {
    // Extract the public ID from the source URL
    const publicId = getPublicIdFromUrl(sourceUrl);
    if (!publicId) return sourceUrl;
    
    // Create a new public ID in the reviews folder 
    const targetPublicId = `reviews_avatars/${publicId.split('/').pop()}`;
    
    // Use the Cloudinary API to create a copy with a new public ID
    const result = await cloudinary.uploader.copy(
      publicId,
      targetPublicId,
      { resource_type: 'image' }
    );
    
    // Return the new URL
    return result.secure_url;
  } catch (error) {
    console.error('Error copying image for review:', error);
    return sourceUrl; // Return original URL on error
  }
};

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

    // Handle user avatar to ensure persistence
    let avatarToUse = null;
    
    // Add user reference if provided
    if (userId) {
      // Verify that the user exists
      const userExists = await User.findById(userId);
      if (userExists) {
        reviewData.userId = userId;
        
        // If user exists and has an avatar, make a persistent copy of it
        if (userExists.avatar && !userAvatar) {
          // Copy the avatar to a dedicated reviews folder in Cloudinary
          avatarToUse = await copyImageForReview(userExists.avatar);
        }
        
        // If user exists and has an email, use it
        if (userExists.email && !email) {
          reviewData.email = userExists.email;
        }
      }
    }

    // Add user avatar if provided in the request - make a persistent copy
    if (userAvatar) {
      avatarToUse = await copyImageForReview(userAvatar);
      console.log('Using avatar path from request:', avatarToUse);
    }
    
    // Set the final avatar URL
    if (avatarToUse) {
      reviewData.userAvatar = avatarToUse;
    }

    // If there's an uploaded file, use the Cloudinary URL
    if (req.file) {
      reviewData.eventImage = req.file.path; // Cloudinary URL is in the path property
    }

    // Create the review
    const review = await Review.create(reviewData);
    
    // Log the created review for debugging
    console.log('Created review with Cloudinary image:', review.eventImage);
    
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
    
    // Find the review first to get the eventImage URL
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ success: false, message: `No review with id: ${reviewId}` });
    }
    
    // Delete the associated Cloudinary image if it exists
    if (review.eventImage && review.eventImage.includes('cloudinary.com')) {
      try {
        const publicId = getPublicIdFromUrl(review.eventImage);
        if (publicId) {
          console.log(`Deleting Cloudinary image: ${publicId}`);
          await deleteImage(publicId);
        }
      } catch (cloudinaryError) {
        console.error('Error deleting Cloudinary image:', cloudinaryError);
        // Continue with deletion even if image deletion fails
      }
    }
    
    // Now delete the review from the database
    await Review.findByIdAndDelete(reviewId);
    
    res.status(200).json({ 
      success: true, 
      message: 'Review and associated images deleted successfully',
      data: null 
    });
  } catch (error) {
    console.error('Error deleting review:', error);
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
    
    // First find the review to handle the image if we're rejecting it
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: `No review with id: ${reviewId}` 
      });
    }
    
    // If rejecting the review, delete the associated Cloudinary image to save storage
    if (approved === false && review.eventImage && review.eventImage.includes('cloudinary.com')) {
      try {
        const publicId = getPublicIdFromUrl(review.eventImage);
        if (publicId) {
          console.log(`Deleting Cloudinary image for rejected review: ${publicId}`);
          await deleteImage(publicId);
          
          // Update the review to remove the image reference
          review.eventImage = null;
        }
      } catch (cloudinaryError) {
        console.error('Error deleting Cloudinary image for rejected review:', cloudinaryError);
        // Continue with rejection even if image deletion fails
      }
    }
    
    // Update the approval status
    review.approved = approved;
    await review.save();
    
    res.status(200).json({ 
      success: true, 
      message: `Review ${approved ? 'approved' : 'rejected'} successfully${!approved ? ' and associated images deleted' : ''}`,
      data: review 
    });
  } catch (error) {
    console.error('Error updating review status:', error);
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