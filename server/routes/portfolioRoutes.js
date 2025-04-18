const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const portfolioController = require('../controllers/portfolioController');
const { adminAuth } = require('../middleware/adminAuth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/portfolio');
  },
  filename: (req, file, cb) => {
    cb(null, `portfolio-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Filter files to only accept images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Public routes
router.get('/', portfolioController.getAllPortfolioItems);

// Admin routes
router.post('/', adminAuth, upload.single('image'), portfolioController.createPortfolioItem);
router.put('/order', adminAuth, portfolioController.updateOrder);
router.put('/:id', adminAuth, upload.single('image'), portfolioController.updatePortfolioItem);
router.delete('/:id', adminAuth, portfolioController.deletePortfolioItem);

// Dynamic routes come last
router.get('/:id', portfolioController.getPortfolioItem);

module.exports = router; 
 