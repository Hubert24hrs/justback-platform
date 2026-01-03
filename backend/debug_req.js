const axios = require('axios');

async function debug() {
    try {
        // 1. Login
        console.log('🔑 Logging in...');
        const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
            email: 'admin@justback.com',
            password: 'password123'
        });

        const token = loginRes.data.data.accessToken;
        console.log('✅ Token obtained');

        // 2. Hit Dashboard
        console.log('📊 Fetching dashboard...');
        const dashRes = await axios.get('http://localhost:5000/api/v1/admin/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
        });

    } catch (err) {
        const fs = require('fs');
        if (err.response) {
            console.error('❌ API Error (saved to last_error.json)');
            fs.writeFileSync('last_error.json', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('❌ Network/Other Error:', err.message);
        }
    }
}

debug();
