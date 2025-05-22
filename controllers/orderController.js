// controllers/orderController.js
import sql from '../db.js';
import eventBus from './eventBus.js';

// Place Order
export async function placeOrderHandler(req, res) {
  // 1) Grab the buyerID from session
  const buyerID = req.session?.user?.userid;
  if (!buyerID) {
    return res.status(401).json({ error: 'Please log in to place an order' });
  }

  // 2) Extract only productID & totalAmount from the body
  const { productID, totalAmount } = req.body;
  if (!productID || !totalAmount) {
    return res.status(400).json({ error: 'productID and totalAmount required' });
  }

  try {
    // 3) Insert into orders table
    const result = await sql`
      INSERT INTO orders (buyerid, productid, totalamount)
      VALUES (${buyerID}, ${productID}, ${totalAmount})
      RETURNING orderid, placed_at
    `;
    const order = result[0];

    // 4) Optionally clear the cart for this buyer/product
    await sql`DELETE FROM cart WHERE buyerid = ${buyerID} AND productid = ${productID}`;

    // 5) Emit realtime event
    eventBus.emit('orderProcessed', {
      orderID:    order.orderid,
      buyerID,
      productID,
      timestamp:  new Date().toISOString()
    });

    res.status(201).json({ orderID: order.orderid });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Pay / Checkout
export async function payOrderHandler(req, res) {
  const buyerID = req.session?.user?.userid;
  if (!buyerID) {
    return res.status(401).json({ error: 'Please log in to checkout' });
  }

  const { orderID } = req.params;
  try {
    // Only mark orders belonging to this buyer
    await sql`
      UPDATE orders
      SET status = 'Done'
      WHERE orderid = ${orderID}
        AND buyerid = ${buyerID}
    `;
    res.json({ success: true });
  } catch (err) {
    console.error('Error during checkout:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Show Past Orders Page
export async function getOrdersPage(req, res) {
  const buyerID = req.session?.user?.userid;
  if (!buyerID) {
    return res.redirect('/login?message=please+login');
  }

  try {
    const orders = await sql`
      SELECT
        o.orderid    AS "orderID",
        o.productid  AS "productID",
        p.productname AS "productName",
        o.totalamount AS "totalAmount",
        o.placed_at  AS "placedAt"
      FROM orders o
      JOIN product p ON p.productid = o.productid
      WHERE o.buyerid = ${buyerID}
      ORDER BY o.placed_at DESC
    `;
    res.render('pastOrders', { orders });
  } catch (err) {
    console.error('Error fetching order list:', err);
    res.status(500).send('Failed to load orders.');
  }
}

// Clear Order History
export async function clearOrderHistory(req, res) {
  const buyerID = req.session?.user?.userid;
  if (!buyerID) {
    return res.redirect('/login?message=please+login');
  }

  try {
    await sql`
      DELETE FROM orders
      WHERE buyerid = ${buyerID}
    `;
    res.redirect('/orders');
  } catch (err) {
    console.error('Error clearing order history:', err);
    res.status(500).send('Failed to clear history.');
  }
}
