import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  host: 'host.docker.internal',
  database: 'eco_campus',
  password: 'password',
  port: 5432,
});

export async function searchProducts(req, res) {
  const { keyword = '', category, minPrice, maxPrice, minRating, sort } = req.query;
  const safeKeyword = (keyword || '').trim().toLowerCase();

  let queryText = 'SELECT * FROM product';
  let conditions = [];
  let values = [];

  if (safeKeyword) {
    values.push(`%${safeKeyword}%`);
    conditions.push(`(LOWER(title) LIKE $${values.length} OR LOWER(description) LIKE $${values.length})`);
  }
  if (category) {
    values.push(category);
    conditions.push(`category = $${values.length}`);
  }
  if (minPrice) {
    values.push(parseFloat(minPrice));
    conditions.push(`price >= $${values.length}`);
  }
  if (maxPrice) {
    values.push(parseFloat(maxPrice));
    conditions.push(`price <= $${values.length}`);
  }
  if (minRating) {
    values.push(parseFloat(minRating));
    conditions.push(`avgRating >= $${values.length}`);
  }

  if (conditions.length > 0) {
    queryText += ' WHERE ' + conditions.join(' AND ');
  }

  if (sort === 'price') {
    queryText += ' ORDER BY price ASC';
  } else if (sort === 'rating') {
    queryText += ' ORDER BY avgRating DESC';
  }

  try {
    const result = await pool.query(queryText, values);
    const products = result.rows.map(p => ({
      ...p,
      price: parseFloat(p.price),
      avgRating: parseFloat(p.avgRating)
    }));

    res.render('search', {
      title: 'Search Results',
      product: products,
      query: req.query
    });
  } catch (error) {
    console.error('Database query failed:', error.message);
    res.status(500).send('Failed to load product data from database.');
  }
}