/**
 * Location Controller
 * Handles API requests for Nigeria-wide location data
 */

const locationService = require('../services/location.service');

class LocationController {
    /**
     * GET /api/v1/locations/states
     * Returns all Nigerian states
     */
    async getAllStates(req, res, next) {
        try {
            const states = await locationService.getAllStates();
            res.json({
                success: true,
                data: { states, total: states.length }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/locations/states/:id
     * Returns a single state by ID
     */
    async getStateById(req, res, next) {
        try {
            const state = await locationService.getStateById(req.params.id);
            if (!state) {
                return res.status(404).json({
                    success: false,
                    error: { code: 'STATE_NOT_FOUND', message: 'State not found' }
                });
            }
            res.json({ success: true, data: state });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/locations/states/:id/lgas
     * Returns all LGAs for a given state
     */
    async getLGAsByState(req, res, next) {
        try {
            const lgas = await locationService.getLGAsByState(req.params.id);
            res.json({
                success: true,
                data: { lgas, total: lgas.length }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/locations/search?q=...
     * Autocomplete search across states and LGAs
     */
    async searchLocations(req, res, next) {
        try {
            const { q } = req.query;
            if (!q || q.length < 2) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'INVALID_QUERY', message: 'Query must be at least 2 characters' }
                });
            }
            const results = await locationService.searchLocations(q);
            res.json({ success: true, data: results });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/locations/geo-zones
     * Returns states grouped by geo-zone
     */
    async getStatesByGeoZone(req, res, next) {
        try {
            const zones = await locationService.getStatesByGeoZone();
            res.json({ success: true, data: zones });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/locations/nearest?latitude=...&longitude=...
     * Reverse geocode: find nearest state and LGA from coordinates
     */
    async getNearestLocation(req, res, next) {
        try {
            const { latitude, longitude } = req.query;
            if (!latitude || !longitude) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_COORDS', message: 'Latitude and longitude are required' }
                });
            }

            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);

            if (isNaN(lat) || isNaN(lng)) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'INVALID_COORDS', message: 'Invalid coordinates' }
                });
            }

            const [nearestState, nearestLGA] = await Promise.all([
                locationService.getNearestState(lat, lng),
                locationService.getNearestLGA(lat, lng)
            ]);

            res.json({
                success: true,
                data: { state: nearestState, lga: nearestLGA }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new LocationController();
