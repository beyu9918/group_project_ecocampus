// app.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDatabase } from './config/database.js';
import { Cart }            from './controllers/cartController.js';
// Note: productController.js only defines Product; the association is in cartController

;(async () => {
  // 1. Connect to Postgres
  await connectDatabase();

  // 2. Boilerplate for __dirname in ESM
  const __filename = fileURLToPath(import.meta.url);
  const __dirname  = path.dirname(__filename);

  // 3. Create Express app
  const app = express();

  // 4. Middleware
  app.use(express.urlencoded({ extended: true })); // for <form> POSTs
  app.use(express.json());                         // in case you need JSON APIs
  app.use(express.static(path.join(__dirname, 'public')));

  // 5. View engine
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  const BUYER_ID = 1; // hard-coded for your sample data; swap for session/auth later

  // 6. Cart page: list items in cart
  app.get('/', async (req, res) => {
    try {
      const cartItems = await Cart.findAll({
        where: { buyerID: BUYER_ID },
        include: [{
          association: 'product',
          attributes: ['productName', 'productPrice', 'productPicture']
        }]
      });
      res.render('index', { cart: cartItems });
    } catch (err) {
      console.error('Error loading cart page:', err);
      res.status(500).send(err.message);
    }
  });

  // 7. Place Order: show order summary
  app.post('/order', async (req, res) => {
    try {
      const items = await Cart.findAll({
        where: { buyerID: BUYER_ID },
        include: [{
          association: 'product',
          attributes: ['productName', 'productPrice', 'productPicture']
        }]
      });
      const total = items.reduce(
        (sum, it) => sum + parseFloat(it.product.productPrice) * it.quantity,
        0
      );
      res.render('order', { items, total, confirmed: false });
    } catch (err) {
      console.error('Error rendering order page:', err);
      res.status(500).send(err.message);
    }
  });
  
// Update quantity in cart
app.post('/cart/update', async (req, res) => {
  const { productID, quantity } = req.body;
  const parsedQty = parseInt(quantity, 10);
  if (isNaN(parsedQty) || parsedQty < 1) {
    return res.status(400).send('Invalid quantity');
  }

  try {
    await Cart.update(
      { quantity: parsedQty },
      { where: { buyerID: BUYER_ID, productID: productID } }
    );
    // After updating, send them back to the cart page
    res.redirect('/');
  } catch (err) {
    console.error('Error updating cart item:', err);
    res.status(500).send('Failed to update quantity');
  }
});

  // 8. Checkout: clear the cart, show confirmation
  app.post('/order/checkout', async (req, res) => {
    try {
      await Cart.destroy({ where: { buyerID: BUYER_ID } });
      res.render('order', { items: [], total: 0, confirmed: true });
    } catch (err) {
      console.error('Error during checkout:', err);
      res.status(500).send(err.message);
    }
  });

  // 9. Start server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
})();
