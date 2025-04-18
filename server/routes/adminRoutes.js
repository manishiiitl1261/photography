const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');
const { authenticateAdmin } = require('../middleware/adminAuth');
const { loginRateLimit } = require('../middleware/accountProtection');

// Admin authentication routes (no registration needed)
router.post('/login', loginRateLimit(), adminAuthController.adminLogin);
router.post('/verify-otp', adminAuthController.verifyAdminOTP);

// Protected admin routes (require admin authentication)
router.get('/validate', authenticateAdmin, adminAuthController.validateAdmin);

// Other admin routes can go here, protected by the authenticateAdmin middleware
// Example:
// router.get('/dashboard-stats', authenticateAdmin, adminController.getDashboardStats);

module.exports = router; 