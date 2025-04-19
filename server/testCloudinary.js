const express = require('express');
const router = express.Router();
const { cloudinary, cloudinaryUpload } = require('./config/cloudinary');

// Test route for checking Cloudinary credentials
router.get('/check-credentials', (req, res) => {
  try {
    // Check if Cloudinary credentials are set
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      return res.status(400).json({
        success: false,
        message: 'Cloudinary credentials not fully configured'
      });
    }
    
    // Basic check (doesn't verify API key)
    return res.json({
      success: true,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      message: 'Cloudinary credentials found. Test upload to verify they work.'
    });
  } catch (error) {
    console.error('Cloudinary check error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Test route for uploading an image to Cloudinary
router.post('/test-upload', cloudinaryUpload.single('testImage'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }
    
    // Return the Cloudinary URL
    res.json({ 
      success: true, 
      message: 'Upload successful', 
      url: req.file.path,
      file: req.file
    });
  } catch (error) {
    console.error('Cloudinary test upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router; 