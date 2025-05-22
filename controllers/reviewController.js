import sql from '../db.js';

// GET: comment and details
export async function getProductDetails(req, res) {
  const productID = parseInt(req.params.id);

  try {
    const productResult = await sql`SELECT * FROM product WHERE productid = ${productID}`;
    const product = productResult[0];

    if (!product || typeof product.productid === 'undefined') {
      return res.status(404).send('Product not found');
    }

    const reviewResult = await sql`SELECT * FROM reviews WHERE productid = ${product.productid}`;
    const sellerResult = await sql`SELECT * FROM users WHERE userid = ${product.sellerid}`;
    const seller = sellerResult[0];

    res.render('review', {
      product,
      reviews: reviewResult,
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
    const existing = await sql`
      SELECT * FROM reviews WHERE productid = ${productID} AND reviewerid = ${reviewerId}
    `;

    if (existing.length > 0) {
      return res.status(400).send('You already submitted a review.');
    }

    await sql`
      INSERT INTO reviews (productid, reviewerid, rating, comment)
      VALUES (${productID}, ${reviewerId}, ${parseInt(rating)}, ${comment})
    `;

    const avgResult = await sql`
      SELECT AVG(rating)::numeric(3,2) AS avg FROM reviews WHERE productid = ${productID}
    `;
    const avg = avgResult[0].avg || 0;

    await sql`
      UPDATE product SET avgrating = ${avg} WHERE productid = ${productID}
    `;

    res.redirect('/product/' + productID);
  } catch (err) {
    console.error('Error submitting review:', err.message);
    res.status(500).send('Server error');
  }
}