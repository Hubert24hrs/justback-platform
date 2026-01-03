/**
 * Simple Migration Runner
 * Uses the central database config to run SQL files
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { connectDatabase, query } = require('../../src/config/database');

async function migrate() {
    try {
        console.log('🔄 Starting migration...');

        // Connect to DB (Postgres or SQLite based on env)
        await connectDatabase();

        // Determine schema file
        const isSqlite = process.env.DB_TYPE === 'sqlite';
        const schemaFile = isSqlite ? 'schema_sqlite.sql' : 'schema.sql';
        const schemaPath = path.join(__dirname, `../${schemaFile}`);

        console.log(`📄 Reading schema from ${schemaFile}...`);
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('🚀 Running schema...');

        // Split by semicolon to run statements individually for SQLite
        // (Removing empty statements caused by trailing newlines)
        const statements = schemaSql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            await query(statement);
        }

        console.log('✅ Migration complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
