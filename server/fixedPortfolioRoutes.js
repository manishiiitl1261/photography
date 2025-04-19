const express = require('express');
const router = express.Router();
const path = require('path');
const portfolioController = require(path.join(__dirname, '/controllers/portfolioController'));
const { authenticateToken, isAdmin } = require('./middleware/auth');
const { cloudinaryUpload } = require('./config/cloudinary');

// Public routes
router.get('/', portfolioController.getAllPortfolioItems);
router.get('/categories', portfolioController.getCategories);
router.get('/categories/:category', portfolioController.getPortfolioItemsByCategory);
router.get('/:id', portfolioController.getPortfolioItemById);

// Admin routes
router.post('/', authenticateToken, isAdmin, cloudinaryUpload.single('image'), portfolioController.createPortfolioItem);
router.put('/:id', authenticateToken, isAdmin, cloudinaryUpload.single('image'), portfolioController.updatePortfolioItem);
router.delete('/:id', authenticateToken, isAdmin, portfolioController.deletePortfolioItem);

module.exports = router;
  