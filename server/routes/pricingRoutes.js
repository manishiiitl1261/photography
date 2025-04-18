const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');
const { adminAuth } = require('../middleware/adminAuth');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', pricingController.getAllPackages);
router.get('/packages/all', pricingController.getAllPricePackages);
router.get('/packages/wedding', pricingController.getWeddingPackages);
router.get('/packages/featured', pricingController.getFeaturedPackages);
router.get('/packages/category/:category', pricingController.getPackagesByCategory);
router.get('/packages/:id', pricingController.getPricePackage);

// Admin routes - with both new adminAuth and backward compatibility
router.get('/admin/packages', adminAuth, pricingController.getAllPricePackagesAdmin);
router.post('/packages', adminAuth, pricingController.createPricePackage);
router.put('/packages/order', adminAuth, pricingController.updateOrder);
router.put('/packages/featured', adminAuth, pricingController.setFeaturedPackages);
router.put('/packages/:id', adminAuth, pricingController.updatePricePackage);
router.delete('/packages/:id', adminAuth, pricingController.deletePricePackage);

// Backward compatibility routes with older middleware
router.post('/packages/create', authenticateToken, isAdmin, pricingController.createPricePackage);
router.put('/packages/:id/update', authenticateToken, isAdmin, pricingController.updatePricePackage);
router.delete('/packages/:id/delete', authenticateToken, isAdmin, pricingController.deletePricePackage);

module.exports = router; 