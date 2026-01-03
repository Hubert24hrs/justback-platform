/**
 * Simple Migration Runner
 * Uses 'pg' to run SQL files in order
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'justback_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres123',
});

async function migrate() {
    try {
        console.log('🔄 Starting migration...');
        const client = await pool.connect();

        // Read schema file
        const schemaPath = path.join(__dirname, '../schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('📄 Running schema.sql...');
        await client.query(schemaSql);

        console.log('✅ Migration complete!');
        client.release();
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
