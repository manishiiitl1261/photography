const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { cloudinaryUpload } = require('../config/cloudinary');
const { adminAuth } = require('../middleware/adminAuth');

// Public routes
router.get('/', portfolioController.getAllPortfolioItems);
router.get('/:id', portfolioController.getPortfolioItem);

// Order route must come before :id route to avoid conflict
router.put('/order', adminAuth, portfolioController.updateOrder);

// Admin routes
router.post('/', adminAuth, cloudinaryUpload.single('image'), portfolioController.createPortfolioItem);
router.put('/:id', adminAuth, cloudinaryUpload.single('image'), portfolioController.updatePortfolioItem);
router.delete('/:id', adminAuth, portfolioController.deletePortfolioItem);

module.exports = router; 
 