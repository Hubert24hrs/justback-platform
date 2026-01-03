/**
 * SQLite Migration Runner
 */
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

async function migrate() {
    console.log('🔄 Starting SQLite migration...');
    const dbPath = path.join(__dirname, '../../database/justback.sqlite');
    const schemaPath = path.join(__dirname, '../schema_sqlite.sql');

    // Ensure db exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const db = new sqlite3.Database(dbPath);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    db.exec(schemaSql, (err) => {
        if (err) {
            console.error('❌ Migration failed:', err);
            process.exit(1);
        } else {
            console.log('✅ SQLite Schema applied successfully!');
            process.exit(0);
        }
    });
}

migrate();
