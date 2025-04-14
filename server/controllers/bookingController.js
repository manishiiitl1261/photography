const Booking = require('../models/Booking');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');

// Create a new booking
const createBooking = async (req, res) => {
  try {
    // Get user ID from authenticated request
    // Check all possible fields in the req.user object
    const userId = req.user.userId || req.user.id || req.user._id;
    
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
    const userId = req.user.userId;
    
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
    const userId = req.user.userId;
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking found with id ${bookingId}`
      });
    }
    
    // Regular users can only access their own bookings
    // Admins can access any booking
    if (booking.user.toString() !== userId && req.user.role !== 'admin') {
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
    const userId = req.user.userId;
    
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
    if (booking.user.toString() !== userId && req.user.role !== 'admin') {
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
    const userId = req.user.userId;
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking found with id ${bookingId}`
      });
    }
    
    // Regular users can only delete their own pending bookings
    // Admins can delete any booking
    if (booking.user.toString() !== userId && req.user.role !== 'admin') {
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

// Admin functions
// Get all bookings (admin only)
const getAllBookings = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access all bookings'
      });
    }
    
    // Support filtering by status
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Error fetching all bookings:', error);
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
    
    const updateData = { status };
    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }
    
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking found with id ${bookingId}`
      });
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