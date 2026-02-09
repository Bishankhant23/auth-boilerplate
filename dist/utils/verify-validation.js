"use strict";
const API_URL = 'http://localhost:3000/api/auth';
async function testValidation() {
    console.log('--- Starting Validation Tests ---');
    // Test 1: Forgot Password - Invalid Email
    console.log('\nTest 1: Forgot Password - Invalid Email');
    try {
        const res = await fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'invalid-email' })
        });
        const data = await res.json();
        if (res.status === 400 && data.message.includes('valid email')) {
            console.log('SUCCESS: Caught invalid email');
        }
        else {
            console.error('FAILURE: Expected 400 for invalid email, got', res.status, data);
        }
    }
    catch (err) {
        console.error('Error:', err);
    }
    // Test 2: Forgot Password - Missing Email
    console.log('\nTest 2: Forgot Password - Missing Email');
    try {
        const res = await fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        const data = await res.json();
        if (res.status === 400 && data.message.includes('required')) {
            console.log('SUCCESS: Caught missing email');
        }
        else {
            console.error('FAILURE: Expected 400 for missing email, got', res.status, data);
        }
    }
    catch (err) {
        console.error('Error:', err);
    }
    // Test 3: Reset Password - Missing Token
    console.log('\nTest 3: Reset Password - Missing Token');
    try {
        const res = await fetch(`${API_URL}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword: 'password123' })
        });
        const data = await res.json();
        if (res.status === 400 && data.message.includes('Token is required')) {
            console.log('SUCCESS: Caught missing token');
        }
        else {
            console.error('FAILURE: Expected 400 for missing token, got', res.status, data);
        }
    }
    catch (err) {
        console.error('Error:', err);
    }
    // Test 4: Reset Password - Short Password
    console.log('\nTest 4: Reset Password - Short Password');
    try {
        const res = await fetch(`${API_URL}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: 'some-token', newPassword: '123' })
        });
        const data = await res.json();
        if (res.status === 400 && data.message.includes('minimum length')) {
            console.log('SUCCESS: Caught short password');
        }
        else {
            console.error('FAILURE: Expected 400 for short password, got', res.status, data);
        }
    }
    catch (err) {
        console.error('Error:', err);
    }
    // Test 5: Reset Password - Valid Schema (logic might fail if token invalid, but validation passes)
    console.log('\nTest 5: Reset Password - Valid Schema');
    try {
        const res = await fetch(`${API_URL}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: 'some-token', newPassword: 'password123' })
        });
        const data = await res.json();
        // We expect 400 because token is invalid, BUT validation schema check should have passed.
        // Effectively if we get "Invalid or expired token" it means validation passed and we hit the DB check.
        if (res.status === 400 && data.message === 'Invalid or expired token') {
            console.log('SUCCESS: Validation passed (proceeded to DB check)');
        }
        else {
            console.log('Note: Unexpected response:', res.status, data); // Could happen if token actually exists in test DB? Unlikely.
        }
    }
    catch (err) {
        console.error('Error:', err);
    }
    console.log('\n--- End Validation Tests ---');
}
testValidation();
