import sql from '../../db.js';

async function testSQL() {
  try {
    // Insert user
    console.log('\n== INSERT USER ==');
    await sql`
      INSERT INTO users (userID, email, password, name, role, phone, avatar, bio, address, gender, birthday)
      VALUES (1, 'testuser@example.com', 'password123', 'Test User', 'user', '1234567890', '', 'Test bio', '123 Test St', 'Other', '2000-01-01')
      ON CONFLICT (userID) DO NOTHING;
    `;
    console.log('✅ User inserted or already exists');

    // Insert product
    console.log('\n== INSERT PRODUCT ==');
    await sql`
      INSERT INTO product (productID, sellerID, productName, productPrice, productPicture, avgRating, category, description)
      VALUES (1, 1, 'Test Product', 29.99, 'test.jpg', 4.5, 'Electronics', 'A test product for database verification')
      ON CONFLICT (productID) DO NOTHING;
    `;
    console.log('✅ Product inserted or already exists');

    // Insert review
    console.log('\n== INSERT REVIEW ==');
    const insertResult = await sql`
      INSERT INTO reviews (reviewID, productID, reviewerID, rating, comment)
      VALUES (1, 1, 1, 5, 'This is a test review from SQL script')
      ON CONFLICT (reviewID) DO NOTHING
      RETURNING *;
    `;
    const review = insertResult[0];
    console.log('✅ Review inserted or already exists:', review);

    // Select review
    console.log('\n== SELECTING REVIEW ==');
    const selectResult = await sql`
      SELECT * FROM reviews WHERE reviewerID = 1;
    `;
    console.log('📄 Select result:', selectResult);

    // Update review
    console.log('\n== UPDATING REVIEW ==');
    const updateResult = await sql`
      UPDATE reviews
      SET comment = 'Updated review comment'
      WHERE reviewID = 1
      RETURNING *;
    `;
    console.log('✏️ Update result:', updateResult[0]);

    // Delete review
    console.log('\n== DELETING REVIEW ==');
    const deleteResult = await sql`
      DELETE FROM reviews
      WHERE reviewID = 1
      RETURNING *;
    `;
    console.log('🗑️ Delete result:', deleteResult[0]);

  } catch (err) {
    console.error('❌ SQL operation failed:', err.message);
  } finally {
    // No pool.end() needed with postgres.js
    process.exit(0);
  }
}

testSQL();