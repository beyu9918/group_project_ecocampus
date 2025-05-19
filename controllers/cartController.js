// controllers/cartController.js
import sql from '../db.js';
import eventBus from './eventBus.js';

// GET /api/cart?buyerID=…
export async function getCart(req, res) {
  const buyerID = parseInt(req.query.buyerID, 10);
  if (!buyerID) {
    return res.status(400).json({ error: 'buyerID query required' });
  }
  try {
    const items = await sql`
      SELECT
        c.cartid    AS "cartID",
        c.buyerid   AS "buyerID",
        c.productid AS "productID",
        c.quantity,
        p.productname    AS "productName",
        p.productprice   AS "productPrice",
        p.productpicture AS "productPicture"
      FROM cart AS c
      JOIN product AS p
        ON c.productid = p.productid
      WHERE c.buyerid = ${buyerID}
    `;
    res.json(items);
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
}

// controllers/cartController.js
export async function addCartItem(req, res) {
  const { buyerID, productID, quantity = 1 } = req.body;
  try {
    const [item] = await sql`
      INSERT INTO cart (buyerid, productid, quantity, added_at)
      VALUES (${buyerID}, ${productID}, ${quantity}, DEFAULT)
      ON CONFLICT (buyerid, productid) DO UPDATE
        SET quantity = cart.quantity + EXCLUDED.quantity
      RETURNING
        cartid    AS "cartID",
        buyerid   AS "buyerID",
        productid AS "productID",
        quantity
    `;
    eventBus.emit('cartItemAdded', { item, timestamp: new Date().toISOString() });
    return res.status(201).json(item);
  } catch (err) {
    console.error('Error adding to cart:', err);
    return res.status(500).json({ error: err.message });
  }
}
