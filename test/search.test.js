// Simple Node.js script to test /search page functionality using fetch
// Run this file with: node tests/test.js
// Make sure the server is running (npm start)
// If using Node.js 18+, fetch is built-in. Otherwise, install node-fetch and uncomment the import below.

// Uncomment the following line if using Node.js < 18:
// import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';


async function test(description, url, expectedText = 'EcoCampus') {
  try {
    const res = await fetch(`${BASE_URL}${url}`);
    const text = await res.text();
    if (!res.ok) throw new Error(`Status ${res.status}`);
    if (text.includes(expectedText)) {
      console.log(` ${description}`);
    } else {
      console.error(` ${description} - unexpected content`);
    }
  } catch (err) {
    console.error(` ${description} - error: ${err.message}`);
  }
}

async function runTests() {
  console.log('🔍 Running /search branch coverage tests...');

  
  await test('No filters - no query', '/search');

  
  await test('Keyword only', '/search?keyword=pen');
  await test('Category only', '/search?category=Stationery');
  await test('MinPrice only', '/search?minPrice=10');
  await test('MaxPrice only', '/search?maxPrice=999');
  await test('MinRating only', '/search?minRating=4');

  
  await test('Sort by price', '/search?sort=price');
  await test('Sort by rating', '/search?sort=rating');
  await test('Sort unknown (default no ORDER BY)', '/search?sort=unknown');
  await test('No sort at all (else fallback)', '/search?keyword=abc');
  await test('Keyword is empty string', '/search?keyword=');
  await test('Keyword is spaces only', '/search?keyword=   ');

  
  await test('All filters combined', '/search?keyword=test&category=Misc&minPrice=1&maxPrice=999&minRating=3.5&sort=price');

  
  await test('Picture starts with /uploads/', '/search?keyword=Upload');

  
  await test('Picture without /uploads/', '/search?keyword=Book');

  
  await test('Picture fallback to default.png', '/search?keyword=NoImage');

  
  await test('Invalid minPrice', '/search?minPrice=abc');
  await test('Invalid minRating', '/search?minRating=xyz');

}

runTests();