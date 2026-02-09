"use strict";
const API_URL = 'http://localhost:3000/api/auth';
const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';
const TEST_NAME = 'Test User';
async function runTest() {
    try {
        console.log('1. Registering user...');
        const registerRes = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_EMAIL,
                password: TEST_PASSWORD,
                name: TEST_NAME
            })
        });
        console.log('Registration success:', registerRes.status === 201);
        console.log('2. Logging in...');
        const loginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login success, token received:', !!token);
        console.log('3. Fetching User Profile (/me)...');
        const meRes = await fetch(`${API_URL}/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const meData = await meRes.json();
        console.log('Profile fetched:', meRes.status === 200);
        console.log('User data:', meData.user);
        if (meData.user.email === TEST_EMAIL) {
            console.log('SUCCESS: Email matches!');
        }
        else {
            console.error('FAILURE: Email mismatch!');
        }
        if (!meData.user.password) {
            console.log('SUCCESS: Password not returned!');
        }
        else {
            console.error('FAILURE: Password returned!');
        }
    }
    catch (error) {
        console.error('Test failed:', error);
    }
}
runTest();
