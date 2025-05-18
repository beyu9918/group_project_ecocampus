import express from 'express';
import sql from '../db.js';

const router = express.Router();

// GET /messages/:productId
router.get('/messages/:productId', async (req, res) => {
  // Ensure user is logged in
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const productId = req.params.productId;
  const sender = req.session.user; // Current logged-in user

  try {
    // Fetch product info
    const productResult = await sql`
      SELECT * FROM product WHERE productid = ${productId}
    `;
    if (productResult.length === 0) {
      return res.status(404).send('Product not found');
    }
    const product = productResult[0];

    // Fetch seller info
    const sellerResult = await sql`
      SELECT * FROM users WHERE userid = ${product.sellerid}
    `;
    if (sellerResult.length === 0) {
      return res.status(404).send('Seller not found');
    }
    const seller = sellerResult[0];

    // Render message page and pass required data
    res.render('message', {
      title: 'Chat with Seller',
      user: sender,
      seller: seller,
      product: product
    });
  } catch (error) {
    console.error('Error loading message page:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
