const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { loginRateLimit, passwordStrengthValidator } = require('../middleware/accountProtection');
const { upload } = require('../config/upload'); // Update import to use the config file

// Apply account protection middleware
router.use(loginRateLimit());
router.use(passwordStrengthValidator);

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Email verification routes
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerificationOTP);

// Email change routes
router.post('/change-email', authenticateToken, authController.requestEmailChange);
router.post('/verify-email-change', authenticateToken, authController.verifyEmailChange);
router.post('/check-email', authController.checkEmailExists);

// Password reset routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/validate-reset-token', authController.validateResetToken);

// Token refresh route - doesn't require auth since the token might be expired
router.post('/refresh', authController.refreshToken);

// Logout route
router.post('/logout', authenticateToken, authController.logout);

// Protected routes
router.get('/profile', authenticateToken, authController.getUserProfile);
router.patch('/profile', authenticateToken, authController.updateUserProfile);
router.post('/avatar', authenticateToken, upload.single('avatar'), authController.uploadAvatar);
router.delete('/avatar', authenticateToken, authController.removeAvatar);

module.exports = router; 