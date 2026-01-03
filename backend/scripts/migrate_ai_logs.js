const db = require('../src/config/database');
const fs = require('fs');
const path = require('path');

const migrate = async () => {
    try {
        console.log('Migrating call_logs table...');

        const sql = `
        CREATE TABLE IF NOT EXISTS call_logs (
            id TEXT PRIMARY KEY,
            user_id TEXT REFERENCES users(id),
            phone_number TEXT NOT NULL,
            direction TEXT DEFAULT 'outbound',
            status TEXT DEFAULT 'completed',
            duration INTEGER DEFAULT 0,
            average_confidence REAL DEFAULT 0,
            transcript TEXT DEFAULT '[]',
            call_sid TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        `;

        await db.query(sql);
        console.log('Migration successful: call_logs table created.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
};

migrate();
