// routes/index.js
import express from 'express';
import { getCart } from '../controllers/cartController.js';

const router = express.Router();
const BUYER_ID = 1;  // or pull from session

/**
 * Helper to reuse getCart controller logic and return items
 */
async function getCartData(buyerID) {
  // stubbed req/res so getCart writes into `items`
  const reqStub = { query: { buyerID } };
  let items;
  const resStub = {
    json(data) { items = data; },
    status() { return { json(){} }; }
  };
  await getCart(reqStub, resStub);
  return items;
}

// GET /index → render the cart template
router.get('/index', async (req, res) => {
  try {
    const items = await getCartData(BUYER_ID);
    res.render('index', { cart: items });
  } catch (err) {
    console.error('Error loading /index:', err);
    res.status(500).send(err.message);
  }
});

export default router;
