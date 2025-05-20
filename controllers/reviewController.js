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
    const productResult = await pool.query('SELECT * FROM product WHERE productid = $1', [productID]);
    const product = productResult.rows[0];
    if (!product || typeof product.productid === 'undefined') {
      return res.status(404).send('Product not found');
    }
    const reviewResult = await pool.query('SELECT * FROM reviews WHERE productid = $1', [product.productid]);

    const sellerResult = await pool.query('SELECT * FROM users WHERE userid = $1', [product.sellerid]);
    const seller = sellerResult.rows[0];

    res.render('review', {
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
  if (!req.user || !req.user.userid) {
    return res.redirect('/login');
  }
  const productID = parseInt(req.params.id);
  const { rating, comment } = req.body;
  const reviewerId = req.user.userid;

  try {
    const existing = await pool.query(
      'SELECT * FROM reviews WHERE productid = $1 AND reviewerid = $2',
      [productID, reviewerId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).send('You already submitted a review.');
    }

    await pool.query(
      'INSERT INTO reviews (productid, reviewerid, rating, comment) VALUES ($1, $2, $3, $4)',
      [productID, reviewerId, parseInt(rating), comment]
    );

    const avgResult = await pool.query(
      'SELECT AVG(rating)::numeric(3,2) AS avg FROM reviews WHERE productid = $1',
      [productID]
    );
    const avg = avgResult.rows[0].avg || 0;

    await pool.query(
      'UPDATE product SET avgrating = $1 WHERE productid = $2',
      [avg, productID]
    );

    res.redirect('/product/' + productID);
  } catch (err) {
    console.error('Error submitting review:', err.message);
    res.status(500).send('Server error');
  }
}