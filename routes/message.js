import express from 'express';
import sql from '../db.js';

const router = express.Router();

router.get('/messages/:productId', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const productId = req.params.productId;
  const user = req.session.user;

  const [product] = await sql`SELECT * FROM product WHERE productid = ${productId}`;
  const [seller] = await sql`SELECT * FROM users WHERE userid = ${product.sellerid}`;

  res.render('message', {
    user,
    seller,
    product
  });
});

export default router;
