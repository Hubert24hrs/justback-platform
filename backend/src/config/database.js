const { Pool } = require('pg');
const { logger } = require('../utils/logger');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
    logger.info('✅ PostgreSQL connected');
});

pool.on('error', (err) => {
    logger.error('PostgreSQL error:', err);
});

async function connectDatabase() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        logger.info(`PostgreSQL connection established at ${result.rows[0].now}`);
        client.release();
        return pool;
    } catch (error) {
        logger.error('Failed to connect to PostgreSQL:', error);
        throw error;
    }
}

async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        logger.debug('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        logger.error('Query error:', { text, error: error.message });
        throw error;
    }
}

module.exports = {
    connectDatabase,
    query,
    pool
};
