const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/property.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', propertyController.searchProperties);
router.get('/:id', propertyController.getPropertyById);
router.get('/:id/availability', propertyController.checkAvailability);

// Protected routes (host only)
router.post('/', authenticate, authorize('host', 'admin'), propertyController.createProperty);
router.put('/:id', authenticate, authorize('host', 'admin'), propertyController.updateProperty);
router.get('/my/properties', authenticate, authorize('host'), propertyController.getMyProperties);

module.exports = router;
