const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { upload } = require('../config/upload'); // Update import to use the config file

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', authMiddleware, authController.getUserProfile);
router.patch('/profile', authMiddleware, authController.updateUserProfile);
router.post('/avatar', authMiddleware, upload.single('avatar'), authController.uploadAvatar);

module.exports = router; 