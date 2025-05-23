// routes/index.js
import express from 'express';
import { getCart } from '../controllers/cartController.js';

const router = express.Router();

/**
 * Helper to reuse getCart controller logic and return items
 */
async function getCartData(buyerID) {
  // stubbed req/res so getCart writes into `items`
  const reqStub = { query: { buyerID } };
  let items;
  const resStub = {
    json(data) { items = data; },
    status() { return { json() {} }; }
  };
  await getCart(reqStub, resStub);
  return items;
}

// GET /index → render the cart template
router.get('/index', async (req, res) => {

  const buyerID = req.session?.user?.userid;

  if (!buyerID) {
    return res.redirect('/login');
  }

  try {
    const items = await getCartData(buyerID);
    res.render('index', {
      title: 'My Cart',
      cart: items,
      user: req.session.user 
    });
  } catch (err) {
    console.error('Error loading /index:', err);
    res.status(500).send(err.message);
  }
});

export default router;

