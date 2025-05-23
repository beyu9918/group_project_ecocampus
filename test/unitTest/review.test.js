import sql from '../../db.js';

async function runTestInsert() {
  try {
    // Insert user
    await sql`
      INSERT INTO users (userID, email, password, name, role, phone, avatar, bio, address, gender, birthday)
      VALUES 
      (1, 'testuser@example.com', 'password123', 'Test User', 'user', '1234567890', '', 'Test bio', '123 Test St', 'Other', '2000-01-01')
      ON CONFLICT (userID) DO NOTHING;
    `;
    console.log('✅ User inserted or already exists');

    // Insert product
    await sql`
      INSERT INTO product (productID, sellerID, productName, productPrice, productPicture, avgRating, category, description)
      VALUES 
      (1, 1, 'Test Product', 29.99, 'test.jpg', 4.5, 'Electronics', 'A test product for database verification')
      ON CONFLICT (productID) DO NOTHING;
    `;
    console.log('✅ Product inserted or already exists');

    // Insert review
    await sql`
      INSERT INTO reviews (reviewID, productID, reviewerID, rating, comment)
      VALUES 
      (1, 1, 1, 5, 'This is a test review from SQL script')
      ON CONFLICT (reviewID) DO NOTHING;
    `;
    console.log('✅ Review inserted');

  } catch (err) {
    console.error('❌ Test insert failed:', err.message);
  } finally {
    process.exit(0); // postgres.js 无需手动关闭连接池
  }
}

runTestInsert();