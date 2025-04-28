// Simple Node.js script to test /search page functionality using fetch
// Run this file with: node tests/test.js
// Make sure the server is running (npm start)
// If using Node.js 18+, fetch is built-in. Otherwise, install node-fetch and uncomment the import below.

// Uncomment the following line if using Node.js < 18:
// import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testSearchNoKeyword() {
  try {
    const response = await fetch(`${BASE_URL}/search`);
    const text = await response.text();

    if (response.status === 200 && text.includes('EcoCampus')) {
      console.log('✅ GET /search without keyword works correctly');
    } else {
      console.error('❌ GET /search without keyword failed');
    }
  } catch (error) {
    console.error('Error testing /search without keyword:', error);
  }
}

async function testSearchWithKeyword() {
  try {
    const response = await fetch(`${BASE_URL}/search?keyword=Physics`);
    const text = await response.text();

    if (response.status === 200 && text.includes('Physics')) {
      console.log('✅ GET /search with keyword "Physics" works correctly');
    } else {
      console.error('❌ GET /search with keyword "Physics" failed');
    }
  } catch (error) {
    console.error('Error testing /search with keyword:', error);
  }
}

async function runTests() {
  await testSearchNoKeyword();
  await testSearchWithKeyword();
}

runTests();