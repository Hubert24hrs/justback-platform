const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:5000/api/v1';

async function run() {
    try {
        console.log('Registering...');
        const userEmail = `isolate_${Date.now()}@test.com`;
        const regRes = await axios.post(`${API_URL}/auth/register`, {
            email: userEmail,
            password: 'password123',
            firstName: 'Iso',
            lastName: 'Late',
            phone: `+234${Math.floor(Math.random() * 10000000000)}`
        });
        const token = regRes.data.data.accessToken;
        console.log('Token acquired.');

        console.log('Fetching Props...');
        const propRes = await axios.get(`${API_URL}/properties`);
        const prop = propRes.data.data.properties[0];
        console.log('Prop:', prop.id);

        console.log('Booking...');
        const checkIn = new Date();
        checkIn.setDate(checkIn.getDate() + 40);
        const checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + 3);

        const payload = {
            propertyId: prop.id,
            checkInDate: checkIn.toISOString().split('T')[0],
            checkOutDate: checkOut.toISOString().split('T')[0],
            numGuests: 1
        };

        const bookRes = await axios.post(`${API_URL}/bookings`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        fs.writeFileSync('result_booking.json', JSON.stringify({ success: true, data: bookRes.data }, null, 2));
        console.log('Success.');

    } catch (error) {
        console.error('Failed.');
        const errInfo = {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            stack: error.stack
        };
        fs.writeFileSync('result_booking.json', JSON.stringify({ success: false, error: errInfo }, null, 2));
    }
}

run();
