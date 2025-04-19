const Portfolio = require('../models/Portfolio');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { deleteImage, getPublicIdFromUrl } = require('../config/cloudinary');

// Helper function to handle file uploads
const handleFileUpload = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return resolve(null);
    }

    const uploadDir = path.join(__dirname, '../public/uploads/portfolio');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${uuidv4()}-${file.originalname}`;
    const filepath = path.join(uploadDir, filename);
    
    const writeStream = fs.createWriteStream(filepath);
    writeStream.write(file.buffer);
    writeStream.end();
    
    writeStream.on('finish', () => {
      resolve(`/uploads/portfolio/${filename}`);
    });
    
    writeStream.on('error', (error) => {
      reject(error);
    });
  });
};

// Get all portfolio items
exports.getAllPortfolioItems = async (req, res) => {
  try {
    const portfolioItems = await Portfolio.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({
      success: true,
      data: portfolioItems
    });
  } catch (error) {
    console.error('Error fetching portfolio items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio items',
      error: error.message
    });
  }
};

// Get a single portfolio item
exports.getPortfolioItem = async (req, res) => {
  try {
    const portfolioItem = await Portfolio.findById(req.params.id);
    if (!portfolioItem) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }
    res.status(200).json({
      success: true,
      data: portfolioItem
    });
  } catch (error) {
    console.error('Error fetching portfolio item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio item',
      error: error.message
    });
  }
};

// Create a new portfolio item
exports.createPortfolioItem = async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;
    
    // Validate required fields
    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and category'
      });
    }
    
    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }
    
    // With Cloudinary, the image URL comes from req.file.path
    const imageUrl = req.file.path;
    
    // Convert tags string to array if it exists
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
    
    // Process quality and resize options
    const { quality, resize } = req.body;
    
    // Create portfolio item
    const portfolioItem = await Portfolio.create({
      title,
      description: description || '',
      category,
      tags: tagArray,
      src: imageUrl,
      alt: title, // Use title as alt text
      quality: quality || 'high',
      resize: resize || 'none'
    });
    
    res.status(201).json({
      success: true,
      data: portfolioItem
    });
  } catch (error) {
    console.error('Create portfolio item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating portfolio item',
      error: error.message
    });
  }
};

// Update a portfolio item
exports.updatePortfolioItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, tags, quality, resize } = req.body;
    
    // Find the item to update
    const portfolioItem = await Portfolio.findById(id);
    
    if (!portfolioItem) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }
    
    // Update fields
    if (title) {
      portfolioItem.title = title;
      portfolioItem.alt = title; // Update alt text with title
    }
    if (description !== undefined) portfolioItem.description = description;
    if (category) portfolioItem.category = category;
    if (tags) {
      portfolioItem.tags = tags.split(',').map(tag => tag.trim());
    }
    if (quality) portfolioItem.quality = quality;
    if (resize) portfolioItem.resize = resize;
    
    // If there's a new image, update it and delete the old one
    if (req.file) {
      // If the old image is from Cloudinary, delete it
      if (portfolioItem.src && portfolioItem.src.includes('cloudinary.com')) {
        const publicId = getPublicIdFromUrl(portfolioItem.src);
        if (publicId) {
          await deleteImage(publicId);
        }
      }
      
      // Update with new Cloudinary image URL
      portfolioItem.src = req.file.path;
    }
    
    // Save the updated item
    await portfolioItem.save();
    
    res.status(200).json({
      success: true,
      data: portfolioItem
    });
  } catch (error) {
    console.error('Update portfolio item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating portfolio item',
      error: error.message
    });
  }
};

// Delete a portfolio item
exports.deletePortfolioItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the item to delete
    const portfolioItem = await Portfolio.findById(id);
    
    if (!portfolioItem) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }
    
    // Delete the associated image if it exists
    if (portfolioItem.src) {
      // If the image is from Cloudinary, delete it
      if (portfolioItem.src.includes('cloudinary.com')) {
        const publicId = getPublicIdFromUrl(portfolioItem.src);
        if (publicId) {
          await deleteImage(publicId);
        }
      }
    }
    
    // Delete the portfolio item
    await Portfolio.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Portfolio item deleted successfully'
    });
  } catch (error) {
    console.error('Delete portfolio item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting portfolio item',
      error: error.message
    });
  }
};

// Update portfolio items order
exports.updateOrder = async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items must be an array'
      });
    }
    
    const updates = items.map(item => {
      return Portfolio.findByIdAndUpdate(
        item.id,
        { order: item.order, updatedAt: Date.now() },
        { new: true }
      );
    });
    
    await Promise.all(updates);
    
    res.status(200).json({
      success: true,
      message: 'Portfolio items order updated successfully'
    });
  } catch (error) {
    console.error('Error updating portfolio items order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update portfolio items order',
      error: error.message
    });
  }
}; 
 