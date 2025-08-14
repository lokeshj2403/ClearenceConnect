/**
 * API Testing Script for Clearance Connect
 * 
 * This script tests all the major API endpoints to ensure they're working correctly.
 * Run this after starting the server to verify all APIs are functional.
 * 
 * Usage: node test-apis.js
 */

const axios = require('axios');

// Base URL for API testing
const BASE_URL = 'http://localhost:5000/api';

// Test data for various endpoints
const testData = {
  user: {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'password123',
    userType: 'customer'
  },
  seller: {
    firstName: 'Test',
    lastName: 'Seller',
    email: 'seller@example.com',
    password: 'password123',
    userType: 'seller',
    companyName: 'Test Company'
  },
  admin: {
    email: 'admin@clearanceconnect.com',
    password: 'admin123'
  },
  product: {
    name: 'Test Product',
    description: 'This is a test product',
    originalPrice: 100,
    salePrice: 80,
    category: 'Electronics',
    stock: 50,
    clearanceReason: 'overstock',
    condition: 'new'
  }
};

// Store tokens for authenticated requests
let userToken = '';
let sellerToken = '';
let adminToken = '';

/**
 * Helper function to make API requests with error handling
 */
async function makeRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {}
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status || 500
    };
  }
}

/**
 * Test Health Check Endpoint
 */
async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check...');
  const result = await makeRequest('GET', '/health');
  
  if (result.success) {
    console.log('✅ Health check passed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Message: ${result.data.message}`);
  } else {
    console.log('❌ Health check failed');
    console.log(`   Error: ${result.error}`);
  }
  
  return result.success;
}

/**
 * Test User Registration
 */
async function testUserRegistration() {
  console.log('\n👤 Testing User Registration...');
  
  // Test customer registration
  const customerResult = await makeRequest('POST', '/auth/register', testData.user);
  
  if (customerResult.success) {
    console.log('✅ Customer registration successful');
    userToken = customerResult.data.data.token;
    console.log(`   User ID: ${customerResult.data.data.user._id}`);
  } else {
    console.log('❌ Customer registration failed');
    console.log(`   Error: ${customerResult.error}`);
  }

  // Test seller registration
  const sellerResult = await makeRequest('POST', '/auth/register', testData.seller);
  
  if (sellerResult.success) {
    console.log('✅ Seller registration successful');
    sellerToken = sellerResult.data.data.token;
    console.log(`   Seller ID: ${sellerResult.data.data.user._id}`);
  } else {
    console.log('❌ Seller registration failed');
    console.log(`   Error: ${sellerResult.error}`);
  }

  return customerResult.success && sellerResult.success;
}

/**
 * Test User Login
 */
async function testUserLogin() {
  console.log('\n🔐 Testing User Login...');
  
  const loginData = {
    email: testData.user.email,
    password: testData.user.password
  };

  const result = await makeRequest('POST', '/auth/login', loginData);
  
  if (result.success) {
    console.log('✅ User login successful');
    userToken = result.data.data.token;
    console.log(`   Token received: ${userToken.substring(0, 20)}...`);
  } else {
    console.log('❌ User login failed');
    console.log(`   Error: ${result.error}`);
  }

  return result.success;
}

/**
 * Test Get Current User
 */
async function testGetCurrentUser() {
  console.log('\n👤 Testing Get Current User...');
  
  const result = await makeRequest('GET', '/auth/me', null, userToken);
  
  if (result.success) {
    console.log('✅ Get current user successful');
    console.log(`   User: ${result.data.data.user.firstName} ${result.data.data.user.lastName}`);
    console.log(`   Email: ${result.data.data.user.email}`);
  } else {
    console.log('❌ Get current user failed');
    console.log(`   Error: ${result.error}`);
  }

  return result.success;
}

/**
 * Test Categories API
 */
async function testCategories() {
  console.log('\n📂 Testing Categories API...');
  
  const result = await makeRequest('GET', '/categories');
  
  if (result.success) {
    console.log('✅ Get categories successful');
    console.log(`   Categories found: ${result.data.data.categories.length}`);
  } else {
    console.log('❌ Get categories failed');
    console.log(`   Error: ${result.error}`);
  }

  return result.success;
}

/**
 * Test Products API
 */
async function testProducts() {
  console.log('\n📦 Testing Products API...');
  
  // Test get all products
  const getResult = await makeRequest('GET', '/products');
  
  if (getResult.success) {
    console.log('✅ Get products successful');
    console.log(`   Products found: ${getResult.data.data.products.length}`);
  } else {
    console.log('❌ Get products failed');
    console.log(`   Error: ${getResult.error}`);
  }

  return getResult.success;
}

/**
 * Test Cart API
 */
async function testCart() {
  console.log('\n🛒 Testing Cart API...');
  
  // Test get cart
  const getResult = await makeRequest('GET', '/cart', null, userToken);
  
  if (getResult.success) {
    console.log('✅ Get cart successful');
    console.log(`   Cart items: ${getResult.data.data.items.length}`);
  } else {
    console.log('❌ Get cart failed');
    console.log(`   Error: ${getResult.error}`);
  }

  return getResult.success;
}

/**
 * Test Seller Registration Application
 */
async function testSellerRegistration() {
  console.log('\n🏪 Testing Seller Registration...');
  
  const sellerData = {
    companyName: 'Test Company Ltd',
    companyType: 'Private Limited Company',
    gstNumber: '27ABCDE1234F1Z5',
    panNumber: 'ABCDE1234F',
    phone: '9876543210',
    businessCategory: 'Manufacturer',
    productCategories: ['Electronics', 'Fashion'],
    bankName: 'State Bank of India',
    accountNumber: '1234567890',
    ifscCode: 'SBIN0001234'
  };

  const result = await makeRequest('POST', '/sellers/register', sellerData, userToken);
  
  if (result.success) {
    console.log('✅ Seller registration application successful');
    console.log(`   Application ID: ${result.data.data.applicationId}`);
  } else {
    console.log('❌ Seller registration application failed');
    console.log(`   Error: ${result.error}`);
  }

  return result.success;
}

/**
 * Test Admin APIs (requires admin token)
 */
async function testAdminAPIs() {
  console.log('\n👑 Testing Admin APIs...');
  
  // First try to login as admin (this will fail if admin doesn't exist)
  const adminLogin = await makeRequest('POST', '/auth/login', testData.admin);
  
  if (adminLogin.success) {
    adminToken = adminLogin.data.data.token;
    console.log('✅ Admin login successful');
    
    // Test get seller applications
    const appsResult = await makeRequest('GET', '/admin/seller-applications', null, adminToken);
    
    if (appsResult.success) {
      console.log('✅ Get seller applications successful');
      console.log(`   Applications found: ${appsResult.data.data.applications.length}`);
    } else {
      console.log('❌ Get seller applications failed');
      console.log(`   Error: ${appsResult.error}`);
    }
  } else {
    console.log('⚠️  Admin login failed (admin account may not exist)');
    console.log(`   Error: ${adminLogin.error}`);
  }

  return adminLogin.success;
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🚀 Starting API Tests for Clearance Connect');
  console.log('=' .repeat(50));

  const results = {
    healthCheck: await testHealthCheck(),
    userRegistration: await testUserRegistration(),
    userLogin: await testUserLogin(),
    getCurrentUser: await testGetCurrentUser(),
    categories: await testCategories(),
    products: await testProducts(),
    cart: await testCart(),
    sellerRegistration: await testSellerRegistration(),
    adminAPIs: await testAdminAPIs()
  };

  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('=' .repeat(50));
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`);
  });
  
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Your API is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, makeRequest, BASE_URL };