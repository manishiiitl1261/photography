const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { adminAuth } = require('../middleware/adminAuth');

// Public routes
router.get('/', serviceController.getAllServices);

// Admin routes
router.get('/admin/all', adminAuth, serviceController.getAllServicesAdmin);
router.post('/', adminAuth, serviceController.createService);
router.put('/order', adminAuth, serviceController.updateOrder);
router.put('/:id', adminAuth, serviceController.updateService);
router.delete('/:id', adminAuth, serviceController.deleteService);

// Dynamic routes come last
router.get('/:id', serviceController.getService);

module.exports = router; 
 