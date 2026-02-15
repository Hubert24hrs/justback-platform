/**
 * Location Service
 * Handles Nigeria-wide location data: states, LGAs, and geo-search
 */

const pool = require('../config/database');

class LocationService {
  /**
   * Get all Nigerian states with coordinates
   */
  async getAllStates() {
    const query = `
      SELECT id, name, capital, latitude, longitude, geo_zone
      FROM states
      ORDER BY name ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get a single state by ID
   */
  async getStateById(stateId) {
    const query = `
      SELECT id, name, capital, latitude, longitude, geo_zone
      FROM states WHERE id = $1
    `;
    const result = await pool.query(query, [stateId]);
    return result.rows[0] || null;
  }

  /**
   * Get a single state by name
   */
  async getStateByName(stateName) {
    const query = `
      SELECT id, name, capital, latitude, longitude, geo_zone
      FROM states WHERE LOWER(name) = LOWER($1)
    `;
    const result = await pool.query(query, [stateName]);
    return result.rows[0] || null;
  }

  /**
   * Get all LGAs for a given state
   */
  async getLGAsByState(stateId) {
    const query = `
      SELECT l.id, l.name, l.latitude, l.longitude, s.name AS state_name
      FROM lgas l
      JOIN states s ON l.state_id = s.id
      WHERE l.state_id = $1
      ORDER BY l.name ASC
    `;
    const result = await pool.query(query, [stateId]);
    return result.rows;
  }

  /**
   * Autocomplete-style location search across states and LGAs
   */
  async searchLocations(query) {
    const searchTerm = `%${query}%`;

    const statesQuery = `
      SELECT id, name, capital, latitude, longitude, geo_zone, 'state' AS type
      FROM states
      WHERE LOWER(name) LIKE LOWER($1) OR LOWER(capital) LIKE LOWER($1)
      ORDER BY name ASC
      LIMIT 10
    `;

    const lgasQuery = `
      SELECT l.id, l.name, l.latitude, l.longitude, s.name AS state_name, 'lga' AS type
      FROM lgas l
      JOIN states s ON l.state_id = s.id
      WHERE LOWER(l.name) LIKE LOWER($1)
      ORDER BY l.name ASC
      LIMIT 10
    `;

    const [statesResult, lgasResult] = await Promise.all([
      pool.query(statesQuery, [searchTerm]),
      pool.query(lgasQuery, [searchTerm])
    ]);

    return {
      states: statesResult.rows,
      lgas: lgasResult.rows
    };
  }

  /**
   * Get states grouped by geo-zone
   */
  async getStatesByGeoZone() {
    const query = `
      SELECT id, name, capital, latitude, longitude, geo_zone
      FROM states
      ORDER BY geo_zone, name ASC
    `;
    const result = await pool.query(query);

    // Group by geo_zone
    const grouped = {};
    for (const state of result.rows) {
      if (!grouped[state.geo_zone]) {
        grouped[state.geo_zone] = [];
      }
      grouped[state.geo_zone].push(state);
    }
    return grouped;
  }

  /**
   * Find the nearest state to given coordinates using Haversine formula
   */
  async getNearestState(latitude, longitude) {
    const query = `
      SELECT id, name, capital, latitude, longitude, geo_zone,
        (6371 * acos(
          cos(radians($1)) * cos(radians(latitude))
          * cos(radians(longitude) - radians($2))
          + sin(radians($1)) * sin(radians(latitude))
        )) AS distance_km
      FROM states
      ORDER BY distance_km ASC
      LIMIT 1
    `;
    const result = await pool.query(query, [latitude, longitude]);
    return result.rows[0] || null;
  }

  /**
   * Find the nearest LGA to given coordinates
   */
  async getNearestLGA(latitude, longitude) {
    const query = `
      SELECT l.id, l.name, l.latitude, l.longitude, s.name AS state_name, s.id AS state_id,
        (6371 * acos(
          cos(radians($1)) * cos(radians(l.latitude))
          * cos(radians(l.longitude) - radians($2))
          + sin(radians($1)) * sin(radians(l.latitude))
        )) AS distance_km
      FROM lgas l
      JOIN states s ON l.state_id = s.id
      ORDER BY distance_km ASC
      LIMIT 1
    `;
    const result = await pool.query(query, [latitude, longitude]);
    return result.rows[0] || null;
  }
}

module.exports = new LocationService();
