const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const { logger } = require('../utils/logger');
const path = require('path');
const fs = require('fs');

const DB_TYPE = process.env.DB_TYPE || 'postgres';

let pool;
let sqliteDb;

if (DB_TYPE === 'sqlite') {
    const dbPath = path.join(__dirname, '../../database/justback.sqlite');
    // Ensure directory exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    sqliteDb = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            logger.error('SQLite connection error:', err.message);
        } else {
            logger.info('✅ SQLite connected to ' + dbPath);
            // Enable foreign keys
            sqliteDb.run('PRAGMA foreign_keys = ON');
        }
    });
} else {
    pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });

    pool.on('connect', () => logger.info('✅ PostgreSQL connected'));
    pool.on('error', (err) => logger.error('PostgreSQL error:', err));
}

async function connectDatabase() {
    if (DB_TYPE === 'sqlite') return sqliteDb;

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

function query(text, params) {
    const start = Date.now();

    if (DB_TYPE === 'sqlite') {
        return new Promise((resolve, reject) => {
            // Convert Postgres $1, $2 syntax to SQLite ? syntax
            let paramIndex = 0;
            const sqliteText = text.replace(/\$\d+/g, () => '?');

            // Check if it's a SELECT (all) or INSERT/UPDATE/DELETE (run)
            const isSelect = text.trim().toUpperCase().startsWith('SELECT');

            if (isSelect) {
                sqliteDb.all(sqliteText, params, (err, rows) => {
                    const duration = Date.now() - start;
                    if (err) {
                        logger.error('SQLite Query Error:', { text, error: err.message });
                        reject(err);
                    } else {
                        logger.debug('Executed SQLite query', { text, duration, rows: rows.length });
                        // Mock pg result structure
                        resolve({ rows, rowCount: rows.length });
                    }
                });
            } else {
                sqliteDb.run(sqliteText, params, function (err) {
                    const duration = Date.now() - start;
                    if (err) {
                        logger.error('SQLite Query Error:', { text, error: err.message });
                        reject(err);
                    } else {
                        logger.debug('Executed SQLite query', { text, duration });
                        // Mock pg result structure
                        // For INSERT RETURNING, we might need extra fetch, but for now specific queries handle it
                        resolve({ rows: [], rowCount: this.changes, lastID: this.lastID });
                    }
                });
            }
        });
    }

    // Postgres
    return pool.query(text, params)
        .then(res => {
            const duration = Date.now() - start;
            logger.debug('Executed query', { text, duration, rows: res.rowCount });
            return res;
        })
        .catch(error => {
            logger.error('Query error:', { text, error: error.message });
            throw error;
        });
}

module.exports = {
    connectDatabase,
    query,
    pool: DB_TYPE === 'sqlite' ? sqliteDb : pool
};
