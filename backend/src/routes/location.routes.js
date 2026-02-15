const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');

// All routes are public (no auth required)
router.get('/states', locationController.getAllStates);
router.get('/states/:id', locationController.getStateById);
router.get('/states/:id/lgas', locationController.getLGAsByState);
router.get('/search', locationController.searchLocations);
router.get('/geo-zones', locationController.getStatesByGeoZone);
router.get('/nearest', locationController.getNearestLocation);

module.exports = router;
