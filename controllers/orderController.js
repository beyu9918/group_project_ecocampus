import sql from '../db.js';
import eventBus from './eventBus.js';

// Place Order (with HTML response)
export async function placeOrderHandler(req, res) {
  const buyerID = req.session?.user?.userid;
  if (!buyerID) {
    return res.redirect('/login');
  }

  try {
    const cartItems = await sql`
      SELECT
        c.productid,
        c.quantity,
        p.productname,
        p.productprice,
        p.productpicture
      FROM cart c
      JOIN product p ON c.productid = p.productid
      WHERE c.buyerid = ${buyerID}
    `;

    if (cartItems.length === 0) {
      return res.status(400).send('Your cart is empty.');
    }

    const insertedOrderIDs = [];

    for (const item of cartItems) {
      const total = parseFloat(item.productprice) * item.quantity;

      const [order] = await sql`
        INSERT INTO orders (buyerid, productid, totalamount)
        VALUES (${buyerID}, ${item.productid}, ${total})
        RETURNING orderid, placed_at
      `;

      eventBus.emit('orderProcessed', {
        orderID: order.orderid,
        buyerID,
        productID: item.productid,
        timestamp: new Date().toISOString()
      });

      insertedOrderIDs.push(order.orderid);
    }

    await sql`DELETE FROM cart WHERE buyerid = ${buyerID}`;

    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + parseFloat(item.productprice) * item.quantity;
    }, 0);

    res.render('order', {
      orderID: insertedOrderIDs[0],
      items: cartItems.map(item => ({
        productName: item.productname,
        productPrice: item.productprice,
        productPicture: item.productpicture,
        quantity: item.quantity
      })),
      total: totalAmount,
      confirmed: false,
      user: req.session.user
    });

  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).send('Internal server error');
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