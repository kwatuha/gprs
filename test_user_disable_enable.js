#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://165.22.227.234:3000';

// Test credentials - using a known test user
const TEST_USER = {
    username: 'testuser',
    password: 'password123'
};

let adminToken = '';
let testUserId = '';

async function getAdminToken() {
    try {
        console.log('🔐 Getting admin token...');
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
            username: 'testuser', // Assuming this is an admin user
            password: 'password123'
        });
        
        adminToken = response.data.token;
        console.log('✅ Admin token obtained');
        return true;
    } catch (error) {
        console.error('❌ Failed to get admin token:', error.response?.data || error.message);
        return false;
    }
}

async function findTestUser() {
    try {
        console.log('👤 Finding test user...');
        const response = await axios.get(`${BASE_URL}/api/users/users`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        const users = response.data;
        console.log(`📊 Found ${users.length} users`);
        
        // Find a user that's not the admin (assuming first user is admin)
        const testUser = users.find(user => user.username !== 'testuser' && user.isActive === 1);
        
        if (testUser) {
            testUserId = testUser.userId;
            console.log(`✅ Test user found: ${testUser.username} (ID: ${testUserId}, Active: ${testUser.isActive})`);
            return testUser;
        } else {
            console.log('❌ No suitable test user found');
            return null;
        }
    } catch (error) {
        console.error('❌ Failed to find test user:', error.response?.data || error.message);
        return null;
    }
}

async function testUserLogin(username, password, shouldSucceed = true) {
    try {
        console.log(`🔑 Testing login for ${username}...`);
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
            username: username,
            password: password
        });
        
        if (shouldSucceed) {
            console.log(`✅ Login successful for ${username}`);
            return true;
        } else {
            console.log(`❌ Login should have failed but succeeded for ${username}`);
            return false;
        }
    } catch (error) {
        if (!shouldSucceed) {
            console.log(`✅ Login correctly failed for ${username}: ${error.response?.data?.error || error.message}`);
            return true;
        } else {
            console.log(`❌ Login failed unexpectedly for ${username}: ${error.response?.data?.error || error.message}`);
            return false;
        }
    }
}

async function disableUser(userId) {
    try {
        console.log(`🚫 Disabling user ${userId}...`);
        const response = await axios.put(`${BASE_URL}/api/users/users/${userId}`, 
            { isActive: false },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        
        console.log(`✅ User ${userId} disabled successfully`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to disable user ${userId}:`, error.response?.data || error.message);
        return false;
    }
}

async function enableUser(userId) {
    try {
        console.log(`✅ Enabling user ${userId}...`);
        const response = await axios.put(`${BASE_URL}/api/users/users/${userId}`, 
            { isActive: true },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        
        console.log(`✅ User ${userId} enabled successfully`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to enable user ${userId}:`, error.response?.data || error.message);
        return false;
    }
}

async function checkUserStatus(userId) {
    try {
        console.log(`📊 Checking status of user ${userId}...`);
        const response = await axios.get(`${BASE_URL}/api/users/users/${userId}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        const user = response.data;
        console.log(`📊 User ${user.username}: isActive = ${user.isActive}, voided = ${user.voided || 0}`);
        return user;
    } catch (error) {
        console.error(`❌ Failed to check user status:`, error.response?.data || error.message);
        return null;
    }
}

async function runTest() {
    console.log('🧪 Starting User Disable/Enable Test\n');
    
    // Step 1: Get admin token
    if (!(await getAdminToken())) {
        console.log('❌ Test failed: Cannot get admin token');
        return;
    }
    
    // Step 2: Find a test user
    const testUser = await findTestUser();
    if (!testUser) {
        console.log('❌ Test failed: No test user available');
        return;
    }
    
    console.log('\n--- Phase 1: Initial State ---');
    await checkUserStatus(testUserId);
    
    // We'll use a known password for testing - in real scenario, we'd need the actual password
    // For this test, let's assume we know the test user's password or create a test scenario
    
    console.log('\n--- Phase 2: Disable User ---');
    if (await disableUser(testUserId)) {
        await checkUserStatus(testUserId);
        
        // Test login should fail
        console.log('\n--- Phase 3: Test Login (Should Fail) ---');
        // Note: We can't test actual login without knowing the password
        // But we can verify the database state
        
        console.log('\n--- Phase 4: Enable User ---');
        if (await enableUser(testUserId)) {
            await checkUserStatus(testUserId);
            
            console.log('\n--- Phase 5: Test Login (Should Succeed) ---');
            // Again, we'd need the actual password to test login
        }
    }
    
    console.log('\n🎉 Test completed!');
}

// Run the test
runTest().catch(console.error);
