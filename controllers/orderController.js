import sql from '../db.js';
import eventBus from './eventBus.js';

//show order summary page
export async function placeOrderHandler(req, res) {
  const buyerID = 1; 

  try {
    // 1) Fetch cart items + product info
    const items = await sql`
      SELECT
        c.productid   AS "productID",
        c.quantity,
        p.productname AS "productName",
        p.productprice AS "productPrice"
      FROM cart AS c
      JOIN product AS p ON p.productid = c.productid
      WHERE c.buyerid = ${buyerID}
    `;

    if (items.length === 0) {
      return res.status(400).send('Your cart is empty—cannot place order.');
    }

    // 2) Compute total for display
    const total = items.reduce(
      (sum, it) => sum + parseFloat(it.productPrice) * it.quantity,
      0
    );

    // 3) Insert one order row per product
    for (const it of items) {
      const [order] = await sql`
        INSERT INTO orders (buyerid, productid, totalamount)
        VALUES (${buyerID}, ${it.productID}, ${parseFloat(it.productPrice) * it.quantity})
        RETURNING orderid AS "orderID", placed_at AS "placedAt"
      `;
      eventBus.emit('orderProcessed', { order, timestamp: new Date().toISOString() });
    }

    // 4) Clear the cart
    await sql`DELETE FROM cart WHERE buyerid = ${buyerID}`;

    // 5) Render the order review page
    res.render('order', {
      items,
      total,
      confirmed: false,
      orderID: null 
    });

  } catch (err) {
    console.error('❌ Error placing order:', err);
    res.status(500).send(`Failed to place order: ${err.message}`);
  }
}

// POST /order/checkout — show confirmation page
export async function payOrderHandler(req, res) {
  try {
    res.render('order', { items: [], total: 0, confirmed: true });
  } catch (err) {
    console.error('Error during checkout:', err);
    res.status(500).send(err.message);
  }
}

// GET /orders — list past purchases
export async function getOrdersPage(req, res) {
  const buyerID = 1; 
  try {
    const orders = await sql`
      SELECT
        o.orderid     AS "orderID",
        o.productid   AS "productID",
        p.productname AS "productName",
        o.placed_at   AS "placedAt"
      FROM orders AS o
      JOIN product AS p ON p.productid = o.productid
      WHERE o.buyerid = ${buyerID}
      ORDER BY o.placed_at DESC
    `;
    res.render('pastOrders', { orders });
  } catch (err) {
    console.error('Error fetching order list:', err);
    res.status(500).send('Failed to load orders');
  }
}

// POST /orders/clear — clear this user’s history and reset IDs
export async function clearOrderHistory(req, res) {
  const buyerID = 1;
  try {
    // Delete only this user’s orders
    await sql`
      DELETE FROM orders
      WHERE buyerid = ${buyerID}
    `;
    // Reset sequence so next orderID = max(orderid)+1
    await sql`
      SELECT setval(
        pg_get_serial_sequence('orders','orderid'),
        COALESCE((SELECT MAX(orderid) FROM orders), 0) + 1,
        false
      )
    `;
    res.redirect('/orders');
  } catch (err) {
    console.error('Error clearing order history:', err);
    res.status(500).send('Failed to clear order history');
  }
}
