const Booking = require('../models/Booking');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { sendBookingNotificationToAdmin, sendBookingStatusUpdateToUser } = require('../utils/emailService');

// Create a new booking
const createBooking = async (req, res) => {
  try {
    // Get user ID from authenticated request - standardize to _id
    const userId = req.user._id || req.user.userId || req.user.id;
    
    console.log('Creating booking with user ID:', userId);
    console.log('Request user object:', req.user);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID not found in authentication token.',
        debug: { user: req.user }
      });
    }
    
    // Create the booking with user ID and request data
    const bookingData = {
      ...req.body,
      user: userId,
      status: 'pending' // Default status is pending
    };
    
    console.log('Booking data being saved:', bookingData);
    
    const booking = await Booking.create(bookingData);
    
    // Send email notification to admins
    try {
      // Fetch full user data to include in email
      const user = await User.findById(userId);
      if (user) {
        sendBookingNotificationToAdmin(booking, user)
          .then(success => {
            console.log(`Admin notification ${success ? 'sent' : 'failed'} for booking: ${booking._id}`);
          })
          .catch(error => {
            console.error('Error in admin notification:', error);
          });
      }
    } catch (emailError) {
      console.error('Error preparing admin notification email:', emailError);
      // Don't return an error to client if email fails
    }
    
    res.status(201).json({ 
      success: true,
      booking 
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to create booking, please try again later.',
      error: error.message
    });
  }
};

// Get all bookings for the current user
const getUserBookings = async (req, res) => {
  try {
    // Standardize to _id
    const userId = req.user._id || req.user.userId || req.user.id;
    
    const bookings = await Booking.find({ user: userId })
      .sort({ createdAt: -1 }); // Most recent first
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch bookings, please try again later.',
      error: error.message
    });
  }
};

// Get a single booking by ID
const getBooking = async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    // Standardize to _id
    const userId = req.user._id || req.user.userId || req.user.id;
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking found with id ${bookingId}`
      });
    }
    
    // Regular users can only access their own bookings
    // Admins can access any booking
    // Convert both to strings for comparison
    if (booking.user.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }
    
    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch booking details, please try again later.',
      error: error.message
    });
  }
};

// Update a booking (users can only update certain fields)
const updateBooking = async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    // Standardize to _id
    const userId = req.user._id || req.user.userId || req.user.id;
    
    // Find the booking
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking found with id ${bookingId}`
      });
    }
    
    // Regular users can only update their own bookings
    // and only certain fields (not status)
    // Convert both to strings for comparison
    if (booking.user.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }
    
    // For regular users, restrict fields they can update
    // and prevent updating approved bookings
    if (req.user.role !== 'admin') {
      if (booking.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `Cannot update booking with status '${booking.status}'`
        });
      }
      
      // Allow only certain fields to be updated by regular users
      const allowedFields = ['date', 'location', 'additionalRequirements'];
      const updateData = {};
      
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });
      
      const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        updateData,
        { new: true, runValidators: true }
      );
      
      return res.status(200).json({
        success: true,
        booking: updatedBooking
      });
    }
    
    // Admin can update any field
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to update booking, please try again later.',
      error: error.message
    });
  }
};

// Delete a booking
const deleteBooking = async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    // Standardize to _id
    const userId = req.user._id || req.user.userId || req.user.id;
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking found with id ${bookingId}`
      });
    }
    
    // Regular users can only delete their own pending bookings
    // Admins can delete any booking
    // Convert both to strings for comparison
    if (booking.user.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this booking'
      });
    }
    
    // Only allow users to delete pending bookings
    if (req.user.role !== 'admin' && booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete booking with status '${booking.status}'`
      });
    }
    
    await Booking.findByIdAndDelete(bookingId);
    
    res.status(200).json({
      success: true,
      message: 'Booking successfully deleted'
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to delete booking, please try again later.',
      error: error.message
    });
  }
};

// Get all bookings (admin only)
const getAllBookings = async (req, res) => {
  try {
    // Admin check is now done in the route middleware
    // We just log the user info here for debugging
    console.log('getAllBookings called by user:', {
      email: req.user?.email,
      userId: req.user?._id || req.user?.userId || req.user?.id
    });
    
    // Support filtering by status
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    console.log('Admin fetching bookings with filter:', filter);
    
    // First, check if there are any bookings at all
    const totalCount = await Booking.countDocuments({});
    console.log(`Total bookings in database (unfiltered): ${totalCount}`);
    
    if (totalCount === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        bookings: []
      });
    }
    
    // Fetch bookings
    try {
      // First try with explicit population
      const bookings = await Booking.find(filter)
        .populate({
          path: 'user',
          select: 'name email',
          model: User
        })
        .sort({ createdAt: -1 });
      
      console.log(`Found ${bookings.length} bookings matching filter`);
      
      // Debug the first booking if any
      if (bookings.length > 0) {
        const sampleBooking = { ...bookings[0].toObject() };
        // Remove potentially large fields for logging
        if (sampleBooking.user) {
          sampleBooking.user = { 
            _id: sampleBooking.user._id,
            name: sampleBooking.user.name, 
            email: sampleBooking.user.email 
          };
        }
        console.log('Sample booking:', JSON.stringify(sampleBooking, null, 2));
      }
      
      return res.status(200).json({
        success: true,
        count: bookings.length,
        bookings
      });
    } catch (populateError) {
      console.error('Error with user population, trying without:', populateError);
      
      // If population fails, try without it
      const bookings = await Booking.find(filter)
        .sort({ createdAt: -1 });
      
      console.log(`Found ${bookings.length} bookings (without population)`);
      
      return res.status(200).json({
        success: true,
        count: bookings.length,
        bookings,
        warning: 'User data could not be populated'
      });
    }
  } catch (error) {
    console.error('Error in getAllBookings:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch bookings, please try again later.',
      error: error.message
    });
  }
};

// Update booking status (admin only)
const updateBookingStatus = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update booking status'
      });
    }
    
    const { id: bookingId } = req.params;
    const { status, adminNotes } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    // Find current booking to know the previous status
    const currentBooking = await Booking.findById(bookingId);
    if (!currentBooking) {
      return res.status(404).json({
        success: false,
        message: `No booking found with id ${bookingId}`
      });
    }
    
    const previousStatus = currentBooking.status;
    
    // Only update if status is actually changing
    if (previousStatus === status && (!adminNotes || adminNotes === currentBooking.adminNotes)) {
      return res.status(200).json({
        success: true,
        message: 'No changes to apply',
        booking: currentBooking
      });
    }
    
    const updateData = { status };
    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }
    
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      updateData,
      { new: true, runValidators: true }
    );
    
    // Send email notification to user if status changed
    if (previousStatus !== status) {
      try {
        // Fetch the user to get their email
        const user = await User.findById(currentBooking.user);
        if (user) {
          sendBookingStatusUpdateToUser(booking, user, previousStatus)
            .then(success => {
              console.log(`Status update notification ${success ? 'sent' : 'failed'} to user: ${user.email}`);
            })
            .catch(error => {
              console.error('Error in status update notification:', error);
            });
        }
      } catch (emailError) {
        console.error('Error preparing status update notification:', emailError);
        // Don't return an error to client if email fails
      }
    }
    
    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to update booking status, please try again later.',
      error: error.message
    });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBooking,
  updateBooking,
  deleteBooking,
  getAllBookings,
  updateBookingStatus
}; 