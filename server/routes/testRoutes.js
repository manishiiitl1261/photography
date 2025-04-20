const express = require('express');
const router = express.Router();
const { sendBookingNotificationToAdmin, sendBookingStatusUpdateToUser } = require('../utils/emailService');

// Test route for email service
router.get('/test-email', async (req, res) => {
  try {
    const testBooking = {
      _id: 'test-booking-123',
      serviceType: 'Wedding Photography',
      packageType: 'Premium Package',
      bookingDate: new Date(),
      location: 'Test Location',
      specialRequests: 'This is a test booking',
      price: 1500,
      status: 'pending'
    };

    const testUser = {
      _id: 'test-user-456',
      name: 'Test User',
      email: 'test@example.com',
      phone: '123-456-7890'
    };

    // Test admin notification
    const adminResult = await sendBookingNotificationToAdmin(testBooking, testUser);
    
    // Test user status update notification
    const userResult = await sendBookingStatusUpdateToUser(
      { ...testBooking, status: 'approved' },
      testUser,
      'pending'
    );

    res.status(200).json({
      success: true,
      message: 'Email tests completed',
      results: {
        adminNotification: adminResult,
        userStatusUpdate: userResult
      }
    });
  } catch (error) {
    console.error('Email test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Email test failed',
      error: error.message
    });
  }
});

module.exports = router; 