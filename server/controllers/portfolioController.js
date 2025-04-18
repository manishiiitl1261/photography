const Portfolio = require('../models/Portfolio');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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
    let portfolioData = { ...req.body };
    
    // Handle file upload if present
    if (req.file) {
      const filePath = await handleFileUpload(req.file);
      portfolioData.src = filePath;
    }
    
    // Get the count of existing items for ordering
    const count = await Portfolio.countDocuments();
    portfolioData.order = count;
    
    const portfolioItem = await Portfolio.create(portfolioData);
    
    res.status(201).json({
      success: true,
      message: 'Portfolio item created successfully',
      data: portfolioItem
    });
  } catch (error) {
    console.error('Error creating portfolio item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create portfolio item',
      error: error.message
    });
  }
};

// Update a portfolio item
exports.updatePortfolioItem = async (req, res) => {
  try {
    let portfolioItem = await Portfolio.findById(req.params.id);
    if (!portfolioItem) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }
    
    let updateData = { ...req.body };
    
    // Handle file upload if present
    if (req.file) {
      // Delete old file if it exists
      if (portfolioItem.src && portfolioItem.src.startsWith('/uploads/')) {
        const oldFilePath = path.join(__dirname, '../public', portfolioItem.src);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      const filePath = await handleFileUpload(req.file);
      updateData.src = filePath;
    }
    
    // Update the portfolio item
    const updatedItem = await Portfolio.findByIdAndUpdate(
      req.params.id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Portfolio item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Error updating portfolio item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update portfolio item',
      error: error.message
    });
  }
};

// Delete a portfolio item
exports.deletePortfolioItem = async (req, res) => {
  try {
    const portfolioItem = await Portfolio.findById(req.params.id);
    if (!portfolioItem) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }
    
    // Delete the file if it exists
    if (portfolioItem.src && portfolioItem.src.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../public', portfolioItem.src);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await Portfolio.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Portfolio item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete portfolio item',
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
 