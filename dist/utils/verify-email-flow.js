"use strict";
const API_URL = 'http://localhost:3000/api/auth';
const TEST_EMAIL = `verify_test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';
const TEST_NAME = 'Verify User';
async function testEmailVerification() {
    console.log('--- Starting Email Verification Tests ---');
    // 1. Register
    console.log('\n1. Registering user...');
    try {
        const registerRes = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_EMAIL,
                password: TEST_PASSWORD,
                name: TEST_NAME
            })
        });
        const regData = await registerRes.json();
        console.log('Registration Status:', registerRes.status);
        console.log('Message:', regData.message);
        if (registerRes.status === 201 && regData.message.includes('verify your account')) {
            console.log('SUCCESS: Registration successful.');
        }
        else {
            console.error('FAILURE: Registration failed.');
            return;
        }
        // 2. Attempt Login (Unverified) - Should fail and Trigger Resend
        console.log('\n2. Attempting login (Unverified)...');
        const loginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            })
        });
        console.log('Login Status (Unverified):', loginRes.status);
        const loginData = await loginRes.json();
        console.log('Login Message:', loginData.message);
        if (loginRes.status === 403 && loginData.message.includes('new verification email')) {
            console.log('SUCCESS: Login blocked AND verification email resent.');
        }
        else {
            console.log('FAILURE: Login not handled correctly for unverified user.');
        }
    }
    catch (error) {
        console.error('Test failed:', error);
    }
}
testEmailVerification();
