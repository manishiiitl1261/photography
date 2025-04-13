require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const reviewRoutes = require('./routes/reviewRoutes');
const authRoutes = require('./routes/authRoutes');

// Initialize Express app
const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(cors());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/reviews', reviewRoutes);
app.use('/api/auth', authRoutes);

// Home route
app.get('/', (req, res) => {
  res.send('Photography API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong!'
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Log connection string (with password masked)
    const maskedUri = process.env.MONGO_URI 
      ? process.env.MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//\$1:****@')
      : 'MONGO_URI is undefined';
    console.log('Attempting to connect to MongoDB with URI:', maskedUri);
    
    // Use explicit connection options
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server error:', error);
  }
};

// Start server
start();