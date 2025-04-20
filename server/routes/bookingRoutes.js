const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication');
const { isAdminEmail } = require('../config/createAdmin');
const {
  createBooking,
  getUserBookings,
  getBooking,
  updateBooking,
  deleteBooking,
  getAllBookings,
  updateBookingStatus
} = require('../controllers/bookingController');

// Add debugging middleware to log all requests
router.use((req, res, next) => {
  console.log(`[BOOKING ROUTE] ${req.method} ${req.originalUrl} - User: ${req.user?.email || 'unauthenticated'}`);
  next();
});

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

// Custom middleware for admin routes to provide better error messages
const adminRouteHandler = (req, res, next) => {
  console.log('Admin middleware check:', {
    email: req.user?.email,
    isAdmin: req.user?.email ? isAdminEmail(req.user.email) : false
  });

  if (req.user?.email && isAdminEmail(req.user.email)) {
    console.log('Admin access granted for:', req.user.email);
    next();
  } else {
    console.log(`Admin access denied for user: ${req.user?.email}`);
    return res.status(403).json({
      success: false,
      message: 'Admin access required. Your account is not authorized for this action.'
    });
  }
};

// Admin-specific routes with enhanced middleware
router.get('/admin/all', adminRouteHandler, getAllBookings);
router.patch('/admin/status/:id', adminRouteHandler, updateBookingStatus);

module.exports = router; 