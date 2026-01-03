const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/justback.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.all("SELECT id, email, role FROM users", (err, rows) => {
        console.log('Users:', rows);
    });
    db.all("SELECT id, guest_id, host_id, status FROM bookings", (err, rows) => {
        console.log('Bookings:', rows);
    });
    db.all("SELECT id, booking_id, payment_id FROM payments", (err, rows) => {
        console.log('Payments:', rows);
    });
});

db.close();
