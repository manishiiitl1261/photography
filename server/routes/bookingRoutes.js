const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication');
const {
  createBooking,
  getUserBookings,
  getBooking,
  updateBooking,
  deleteBooking,
  getAllBookings,
  updateBookingStatus
} = require('../controllers/bookingController');

// Auth middleware for all booking routes
router.use(authenticateUser);

// User booking routes
router.route('/')
  .post(createBooking)
  .get(getUserBookings);

router.route('/:id')
  .get(getBooking)
  .patch(updateBooking)
  .delete(deleteBooking);

// Admin-specific routes
router.get('/admin/all', getAllBookings);
router.patch('/admin/status/:id', updateBookingStatus);

module.exports = router; 