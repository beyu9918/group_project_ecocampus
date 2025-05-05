import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',             
  host: 'host.docker.internal',            
  database: 'eco_campus',       
  password: 'password',    
  port: 5432,
});

// GET: comment and details
export async function getProductDetails(req, res) {
  const productID = parseInt(req.params.id);

  try {
    const productResult = await pool.query('SELECT * FROM product WHERE id = $1', [productID]);
    const reviewResult = await pool.query('SELECT * FROM reviews WHERE product_id = $1', [productID]);
    const product = productResult.rows[0];

    const sellerResult = await pool.query('SELECT * FROM users WHERE id = $1', [product.seller_id]);
    const seller = sellerResult.rows[0];

    res.render('product', {
      product,
      reviews: reviewResult.rows,
      seller,
      user: req.user
    });
  } catch (err) {
    console.error('Error fetching product details:', err.message);
    res.status(500).send('Server error');
  }
}

// POST: submit
export async function submitReview(req, res) {
  const productID = parseInt(req.params.id);
  const { rating, comment } = req.body;
  const reviewerId = req.user.id;

  try {
    // check
    const existing = await pool.query(
      'SELECT * FROM reviews WHERE product_id = $1 AND reviewer = $2',
      [productID, reviewerId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).send('You already submitted a review.');
    }

    // insert
    await pool.query(
      'INSERT INTO reviews (product_id, reviewer, rating, comment) VALUES ($1, $2, $3, $4)',
      [productID, reviewerId, parseInt(rating), comment]
    );

    // update
    const avgResult = await pool.query(
      'SELECT AVG(rating)::numeric(3,2) AS avg FROM reviews WHERE product_id = $1',
      [productID]
    );
    const avg = avgResult.rows[0].avg || 0;

    await pool.query(
      'UPDATE product SET avgRating = $1 WHERE id = $2',
      [avg, productID]
    );

    res.redirect('/product/' + productID);
  } catch (err) {
    console.error('Error submitting review:', err.message);
    res.status(500).send('Server error');
  }
}