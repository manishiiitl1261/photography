
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const portfolioController = require(path.join(__dirname, '../controllers/portfolioController'));
const { authenticateToken, isAdmin } = require('../middleware/auth');

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
router.get('/', (req, res) => portfolioController.getAllPortfolioItems(req, res));

// Admin routes
router.put('/:id', authenticateToken, isAdmin, upload.single('image'), (req, res) => portfolioController.updatePortfolioItem(req, res));
router.post('/', authenticateToken, isAdmin, upload.single('image'), (req, res) => portfolioController.createPortfolioItem(req, res));
router.delete('/:id', authenticateToken, isAdmin, (req, res) => portfolioController.deletePortfolioItem(req, res));
router.post('/reorder', authenticateToken, isAdmin, (req, res) => portfolioController.updateOrder(req, res));

// Dynamic route must be last
router.get('/:id', (req, res) => portfolioController.getPortfolioItem(req, res));

module.exports = router;
  