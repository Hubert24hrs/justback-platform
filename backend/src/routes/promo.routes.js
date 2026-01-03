const express = require('express');
const router = express.Router();
const promoController = require('../controllers/promo.controller');
const { authenticate, authorize } = require('../middleware/auth');

// User: Validate promo code
router.post('/validate', authenticate, promoController.validatePromo);

// Admin: CRUD
router.get('/', authenticate, authorize('admin'), promoController.listPromos);
router.post('/', authenticate, authorize('admin'), promoController.createPromo);
router.delete('/:promoId', authenticate, authorize('admin'), promoController.deactivatePromo);

module.exports = router;
