const User = require("../models/User");
const Booking = require("../models/Booking");
const TeamMember = require("../models/TeamMember");
const logger = require("../utils/logger");

/**
 * Get dashboard statistics for admin
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts from different collections
    const userCount = await User.countDocuments({ role: "user" });
    const bookingCount = await Booking.countDocuments();
    const teamMemberCount = await TeamMember.countDocuments({ isActive: true });

    // Calculate revenue from bookings
    const bookings = await Booking.find({ status: "completed" });
    const revenue = bookings.reduce((total, booking) => {
      return total + (booking.price || 0);
    }, 0);

    res.status(200).json({
      success: true,
      stats: {
        users: userCount,
        bookings: bookingCount,
        revenue: revenue,
        members: teamMemberCount,
      },
    });
  } catch (error) {
    logger.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch dashboard stats, please try again later",
      error: error.message,
    });
  }
};
