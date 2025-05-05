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
      ('u001', 'user1@example.com', 'User One', 'password1'),
      ('u002', 'user2@example.com', 'User Two', 'password2')
      ON CONFLICT (userID) DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO product (title, description, price, category, image, seller_id)
      VALUES
      ('Eco Bottle', 'Reusable bottle', 12.99, 'Kitchen', 'bottle.jpg', 1),
      ('Bamboo Brush', 'Eco brush', 4.99, 'Personal', 'brush.jpg', 2);
    `);

    await pool.query(`
      INSERT INTO reviews (product_id, reviewer, rating, comment)
      VALUES
      (1, 'u002', 5, 'Love this bottle!'),
      (2, 'u001', 4, 'Nice brush!');
    `);

    console.log('✅ Seeding completed!');
  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    await pool.end();
  }
}

seed();