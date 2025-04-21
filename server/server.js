require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { handleCSRFError } = require("./middleware/csrfMiddleware");
const logger = require("./utils/logger");
const reviewRoutes = require("./routes/reviewRoutes");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const pricingRoutes = require("./routes/pricingRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");
const teamMemberRoutes = require("./routes/teamMemberRoutes");
const testCloudinaryRoutes = require("./testCloudinary");

// Initialize Express app
const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(morgan("combined", { stream: logger.stream }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

// CSRF error handler - must be before any routes
app.use(handleCSRFError);

// Configure API rate limiter for all routes to prevent abuse
// This is a general limiter with high limits to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs (reasonable for normal use)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
});

// Configure more strict rate limiter for sensitive auth endpoints
const sensitiveAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 requests per windowMs for sensitive routes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many authentication attempts, please try again after 15 minutes",
  },
});

// Apply general API rate limiter to all routes
app.use("/api", apiLimiter);

// Apply stricter rate limiter only to sensitive auth endpoints
app.use("/api/auth/login", sensitiveAuthLimiter);
app.use("/api/auth/register", sensitiveAuthLimiter);
app.use("/api/auth/verify-email", sensitiveAuthLimiter);
app.use("/api/auth/resend-verification", sensitiveAuthLimiter);
app.use("/api/auth/forgot-password", sensitiveAuthLimiter);
app.use("/api/auth/reset-password", sensitiveAuthLimiter);
app.use("/api/admin/login", sensitiveAuthLimiter);
app.use("/api/admin/verify-otp", sensitiveAuthLimiter);

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/reviews", reviewRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/admin-user", adminUserRoutes);
app.use("/api/team-members", teamMemberRoutes);
app.use("/api/test-cloudinary", testCloudinaryRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("Photography API is running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
      req.method
    } - ${req.ip}`
  );

  // Don't leak error details in production
  const errorResponse = {
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong!"
        : err.message || "Something went wrong!",
  };

  // Include stack trace in development
  if (process.env.NODE_ENV !== "production") {
    errorResponse.stack = err.stack;
  }

  res.status(err.status || 500).json(errorResponse);
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Log connection string (with password masked)
    const maskedUri = process.env.MONGO_URI
      ? process.env.MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@")
      : "MONGO_URI is undefined";
    logger.info("Attempting to connect to MongoDB with URI:", maskedUri);

    // Use explicit connection options
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Server error:", error);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  logger.error("Unhandled Promise Rejection:", error);
  process.exit(1);
});

// Start server
start();
