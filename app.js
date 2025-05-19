import express from 'express';
import path    from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import debug from 'debug';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);
export const codeTrace = debug('comp3028:server');

// Controllers
import { getCart, addCartItem } from './controllers/cartController.js';
import {
  placeOrderHandler,
  payOrderHandler,
  getOrdersPage,
  clearOrderHistory
} from './controllers/orderController.js';
import {
  showProductPage,
  showAddProductPage,
  addNewProduct,
  showProductDetail
} from './controllers/product.js';

(async () => {
  // ESM __dirname boilerplate
  const __filename = fileURLToPath(import.meta.url);
  const __dirname  = path.dirname(__filename);

  const BUYER_ID = 1;  //swap for session/auth


  //Inject `user` into all views via res.locals
  app.use((req, res, next) => {
    res.locals.user = req.session?.user || null;
    next();
  });

  // Middleware
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  // View engine
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  // JSON API routes
  app.get('/api/cart',  getCart);
  app.post('/api/cart', addCartItem);

  // Server-rendered Cart page
  app.get('/', async (req, res) => {
    try {
      const items = await getCartData(BUYER_ID);
      res.render('index', { cart: items });
    } catch (err) {
      console.error('Error loading cart page:', err);
      res.status(500).send(err.message);
    }
  });

  // Update quantity in cart
  app.post('/cart/update', async (req, res) => {
    const { productID, quantity } = req.body;
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).send('Invalid quantity');
    }
    try {
      await addCartItem({ body: { buyerID: BUYER_ID, productID, quantity: qty } }, {
        json: () => {}, status: () => ({ json: () => {} })
      });
      res.redirect('/');
    } catch (err) {
      console.error('Error updating cart:', err);
      res.status(500).send(err.message);
    }
  });

  // Place order (SSR)
  app.post('/order', placeOrderHandler);

  // Checkout (SSR)
  app.post('/order/checkout', payOrderHandler);

  // Product management pages
  app.get('/product',            showProductPage);
  app.get('/product/add',        showAddProductPage);
  app.post('/product/add',       addNewProduct);
  app.get('/product/:productid', showProductDetail);

  // Payment pages
  app.get('/payment', (req, res) => {
    res.render('payment');
  });
  app.post('/payment', (req, res) => {
    // handle payment logic
    res.redirect('/orders');
  });

  // Past orders page & clear history
  app.get('/orders',      getOrdersPage);
  app.post('/orders/clear', clearOrderHistory);

  // Comment on product from history
  app.get('/product/:productID/comment', (req, res) => {
    res.render('commentProduct', { productID: req.params.productID });
  });

  // Helper: fetch cart items for SSR
  async function getCartData(buyerID) {
    // reuse the logic from getCart controller but return the items
    const req = { query: { buyerID } };
    let items;
    const res = {
      json(data) { items = data; },
      status() { return { json() {} }; }
    };
    await getCart(req, res);
    return items;
  }
})();

  // Start server
const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

