// seed.js
import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'host.docker.internal',
  database: 'eco_campus',
  password: 'password',
  port: 5432
});

async function seed() {
  try {
    await pool.query(`
      INSERT INTO users (userID, email, name, password)
      VALUES 
      (1, 'user1@example.com', 'User One', 'password1'),
      (2, 'user2@example.com', 'User Two', 'password2')
      ON CONFLICT (userID) DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO product ("productName", "description", "productPrice", "category", "productPicture", "sellerID")
      VALUES
      ('Eco Bottle', 'Reusable bottle', 12.99, 'Kitchen', 'bottle.jpg', 1),
      ('Bamboo Brush', 'Eco brush', 4.99, 'Personal', 'brush.jpg', 2);
    `);

    await pool.query(`
      INSERT INTO reviews ("productID", "reviewerID", rating, comment)
      VALUES
      (1, 2, 5, 'Love this bottle!'),
      (2, 1, 4, 'Nice brush!');
    `);

    console.log('✅ Seeding completed!');
  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    await pool.end();
  }
}

seed();