const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/adminAuth');
const adminUserController = require('../controllers/adminUserController');

// Protect all routes with admin authentication
router.use(authenticateAdmin);

// Get all users
router.get('/users', adminUserController.getAllUsers);

// Get user details
router.get('/users/:userId', adminUserController.getUserDetails);

// Delete a user
router.delete('/users/:userId', adminUserController.deleteUser);

module.exports = router; 