const axios = require('axios');
const db = require('../src/config/database');
const { v4: uuidv4 } = require('uuid');

const API_URL = 'http://localhost:5000/api/v1';
const ADMIN_EMAIL = 'admin@justback.com';
const ADMIN_PASSWORD = 'password123';

const runTest = async () => {
    console.log('🚀 Starting End-to-End Test Simulation...\n');

    try {
        // 1. Register a new User
        console.log('1. 👤 Registering new user...');
        const userEmail = `testuser_${Date.now()}@example.com`;
        const userPass = 'password123';
        const userPhone = `+234${Math.floor(Math.random() * 10000000000)}`;

        const regRes = await axios.post(`${API_URL}/auth/register`, {
            email: userEmail,
            password: userPass,
            firstName: 'Test',
            lastName: 'User',
            phone: userPhone
        });
        const userToken = regRes.data.data.accessToken;
        console.log(`   ✅ User registered: ${userEmail}`);

        // 2. Fetch Properties to find one to book
        console.log('2. 🏠 Fetching properties...');
        const propsRes = await axios.get(`${API_URL}/properties`);

        // Debug info
        const propertyList = propsRes.data.data.properties;
        console.log(`   ℹ️ Properties found: ${propertyList ? propertyList.length : 'undefined'}`);

        const property = propertyList ? propertyList[0] : null;

        if (!property) {
            console.error('   ❌ List is empty or structure mismatch:', JSON.stringify(propsRes.data, null, 2));
            throw new Error('No properties found to book. Please seed database.');
        }
        console.log(`   ✅ Found property: ${property.title} (ID: ${property.id})`);

        // 3. Create a Booking
        console.log('3. 📅 Creating a booking...');

        const checkIn = new Date();
        checkIn.setDate(checkIn.getDate() + 30); // 30 days from now
        const checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + 5); // 5 nights

        const bookingData = {
            propertyId: property.id,
            checkInDate: checkIn.toISOString().split('T')[0],
            checkOutDate: checkOut.toISOString().split('T')[0],
            numGuests: 1
        };

        const bookRes = await axios.post(`${API_URL}/bookings`, bookingData, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        const bookingId = bookRes.data.data.booking.id;
        console.log(`   ✅ Booking created! ID: ${bookingId}`);

        // 4. Verify Initial Status (Should be PENDING)
        const myBookingsRes = await axios.get(`${API_URL}/bookings`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        const myBooking = myBookingsRes.data.data.find(b => b.id === bookingId);

        if (myBooking.status !== 'PENDING') {
            console.warn(`   ⚠️ Warning: Initial status is ${myBooking.status}, expected PENDING.`);
        } else {
            console.log(`   ✅ Initial Status verified: PENDING`);
        }

        // 5. Admin Login
        console.log('5. 🔑 Logging in as Admin...');
        const adminLoginRes = await axios.post(`${API_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        const adminToken = adminLoginRes.data.data.accessToken;
        console.log('   ✅ Admin logged in.');

        // 6. Admin Approves Booking
        console.log('6. 👮 Admin approving booking...');
        await axios.patch(`${API_URL}/admin/bookings/${bookingId}/status`, {
            status: 'confirmed'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('   ✅ Approval request sent.');

        // 7. Verify Final Status
        console.log('7. 🔍 Verifying final status...');
        const finalCheckRes = await axios.get(`${API_URL}/bookings`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        const confirmedBooking = finalCheckRes.data.data.find(b => b.id === bookingId);

        if (confirmedBooking.status.toUpperCase() === 'CONFIRMED') {
            console.log(`   ✅ SUCCESS: Booking status is confirmed!`);
        } else {
            throw new Error(`Failed: Status is ${confirmedBooking.status}`);
        }

        console.log('\n🎉 E2E TEST PASSED SUCCESSFULLY!');

    } catch (error) {
        console.error('\n❌ E2E TEST FAILED');
        if (error.response) {
            console.error('API Error Status:', error.response.status);
            console.error('API Error Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('No response received:', error.message);
        } else {
            console.error('Error Setup:', error.message);
            if (error.config) {
                console.error('Request URL:', error.config.url);
                console.error('Request Method:', error.config.method);
            }
            console.error(error.stack);
        }
        process.exit(1);
    }
};

runTest();
