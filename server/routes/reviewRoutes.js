const express = require('express');
const router = express.Router();
const { cloudinaryUpload } = require('../config/cloudinary');
const { adminAuth } = require('../middleware/adminAuth');

const {
  getAllReviews,
  createReview,
  getReview,
  updateReview,
  deleteReview,
  getPendingReviews,
  getApprovedReviews,
  getRejectedReviews,
  approveReview
} = require('../controllers/reviewController');

// Public routes
router.get('/', getAllReviews);
router.get('/approved', getApprovedReviews); // Public can see only approved reviews
router.get('/:id', getReview);

// Create review route - now using Cloudinary for storage
router.post('/', cloudinaryUpload.single('eventImage'), createReview);

// Admin routes - protected by adminAuth middleware
router.get('/admin/pending', adminAuth, getPendingReviews);
router.get('/admin/rejected', adminAuth, getRejectedReviews);
router.put('/:id/approve', adminAuth, approveReview);
router.put('/:id', adminAuth, updateReview);
router.delete('/:id', adminAuth, deleteReview);

module.exports = router;