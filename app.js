import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import debug from 'debug';
import fileUpload from 'express-fileupload';

import * as customServer from './config/server.js';
import sql from './db.js';
import indexRoutes from './routes/index.js';

// Routes
import searchRoutes from './routes/searchRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/product.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/order.js';
import socialRoutes from './routes/social.js';
import messageRoutes from './routes/message.js'; 

import { registerForm, loginForm } from './controllers/userController.js';
import eventBus from './controllers/eventBus.js';
import * as cartController from './controllers/cartController.js';

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

import { getCart, addCartItem } from './controllers/cartController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express, HTTP server, and Socket.IO
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);
export const codeTrace = debug('comp3028:server');

// Optional server customization
customServer.setup?.(app);

// Middleware
app.use(fileUpload({ useTempFiles: true, parseNested: true }));
app.use(cors());
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Inject `user` into all views
app.use((req, res, next) => {
  res.locals.user = req.session?.user || null;
  next();
});

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/social', socialRoutes);

// Web routes
app.use('/', userRoutes);
app.use('/', productRoutes);
app.use('/search', searchRoutes);
app.use('/', messageRoutes);
app.use('/review', reviewRoutes);
app.use('/', indexRoutes);


// Auth pages
app.get('/register', (req, res) => res.render('register'));
app.get('/login', (req, res) => res.render('login'));
app.post('/register', registerForm);
app.post('/login', loginForm);

// Profile page
app.get('/profile', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('profile', { user: req.session.user });
});


// ---- Cart page (SSR) ----
app.get('/cart', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  try {
    const items = await getCartData(req.session.user.userid);
    res.render('index', { cart: items });
  } catch (err) {
    console.error('Error loading cart page:', err);
    res.status(500).send(err.message);
  }
});

// Update quantity in cart
app.post('/cart/update', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const buyerID = req.session.user.userid;
  const { productID, quantity } = req.body;
  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty < 1) {
    return res.status(400).send('Invalid quantity');
  }
  try {
    await addCartItem(
      { body: { buyerID, productID, quantity: qty } },
      { json:() => {}, status:() => ({ json(){} }) }
    );
    res.redirect('/cart');
  } catch (err) {
    console.error('Error updating cart:', err);
    res.status(500).send(err.message);
  }
});

app.get('/', showProductPage);

// Order & payment
app.post('/order', placeOrderHandler);
app.post('/order/checkout', payOrderHandler);

// payment page
app.get('/payment', (req, res) => {
  res.render('payment');
});
app.post('/payment', (req, res) => {
  res.redirect('/orders');
});

//function used to fix bug when jump to userPage
app.get('/profile', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('profile'); //  { user:    req.session.user }

});
// Root redirect
app.get('/', (req, res) => res.redirect('/product'));


//past order,clear history
app.get('/orders', getOrdersPage);
app.post('/orders/clear', clearOrderHistory);

app.get('/product', showProductPage);
app.get('/product/add', showAddProductPage);
app.post('/product/add', addNewProduct);
app.get('/product/:productid', showProductDetail);

app.get('/product/:productID/comment', (req, res) => {
  res.render('commentProduct', { productID: req.params.productID });
});


// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Socket.IO logic
io.on('connection', (socket) => {
  socket.emit('cartUpdated', cart.getCart());

  socket.on('joinRoom', (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on('sendMessage', async (data) => {
    const { senderID, receiverID, productID, content } = data;
    try {
      await sql`
        INSERT INTO messages (senderID, receiverID, productID, content)
        VALUES (${senderID}, ${receiverID}, ${productID}, ${content})
      `;
      io.to(`user_${receiverID}`).emit('newMessage', {
        from: senderID,
        content,
        productID,
        sent_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to store or emit message:', err);
    }
  });

  ['cartItemAdded', 'orderProcessed', 'notification', 'newFollower', 'listingShared']
    .forEach((evt) => {
      eventBus.on(evt, (data) => socket.emit(evt, data));
    });

  socket.on('disconnect', () => {
    eventBus.removeAllListeners();
  });
});

// Helper for SSR cart
// async function getCartData(buyerID) {
//   const req = { query: { buyerID } };
//   let items;
//   const res = {
//     json(data) { items = data; },
//     status() { return { json() {} }; }
//   };
//   await getCart(req, res);
//   return items;
// }

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
export default app;