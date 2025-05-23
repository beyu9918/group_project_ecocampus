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
    title: 'Chat',
    user,
    seller,
    product
  });
});

router.get('/messages', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const sellerId = req.session.user.userid;

  try {
    const result = await sql`
      SELECT DISTINCT ON (m.productid, m.senderid)
        m.productid,
        m.senderid AS buyerid,
        u.name AS buyername,
        p.productname
      FROM messages m
      JOIN users u ON m.senderid = u.userid
      JOIN product p ON m.productid = p.productid
      WHERE m.receiverid = ${sellerId}
      ORDER BY m.productid, m.senderid, m.sent_at DESC
    `;

    res.render('messageList', {
      title: 'My Messages',
      conversations: result,
      user: req.session.user
    });
  } catch (err) {
    console.error('Error loading message list:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/messages/chat/:productid/:buyerid', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const { productid, buyerid } = req.params;
  const seller = req.session.user;

  try {
    const [product] = await sql`SELECT * FROM product WHERE productid = ${productid}`;
    const [buyer] = await sql`SELECT * FROM users WHERE userid = ${buyerid}`;

    const messages = await sql`
      SELECT * FROM messages
      WHERE productid = ${productid}
        AND ((senderid = ${seller.userid} AND receiverid = ${buyerid})
          OR (senderid = ${buyerid} AND receiverid = ${seller.userid}))
      ORDER BY sent_at ASC
    `;

    if (!product || !buyer) return res.status(404).send('Invalid chat request');

    res.render('message', {
      title: 'Chat',
      user: seller,
      seller: buyer,
      product,
      messages
    });
  } catch (err) {
    console.error('Error loading chat:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Defensive route to handle /messages/send without :id
router.get('/messages/send', (req, res) => {
  res.status(400).send('Missing product ID');
});

router.get('/messages/send/:id', (req, res) => {
  const { id } = req.params;
  return res.redirect(`/messages/${id}`);
});

export default router;
