const express = require('express');
const router = express.Router();
const { upload } = require('../config/upload'); // Import from config file

const {
  getAllReviews,
  createReview,
  getReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');

// Routes
router.route('/').get(getAllReviews);

// Handle file upload for review creation
router.route('/').post(upload.single('eventImage'), createReview);

router.route('/:id').get(getReview).patch(updateReview).delete(deleteReview);

module.exports = router;