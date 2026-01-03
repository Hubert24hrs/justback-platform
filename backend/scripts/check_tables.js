const { connectDatabase, query } = require('../src/config/database');
require('dotenv').config();

async function checkTables() {
    await connectDatabase();
    const result = await query("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('Tables:', result.rows.map(r => r.name));
    process.exit(0);
}

checkTables();
