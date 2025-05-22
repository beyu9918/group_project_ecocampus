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

//function used to fix bug when jump to userPage
app.get('/profile', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('profile'); //  { user: req.session.user }
});
// Root redirect
app.get('/', (req, res) => res.redirect('/product'));


// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Socket.IO logic
io.on('connection', (socket) => {
  const cart = cartController.getCartInstance();
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
async function getCartData(buyerID) {
  const req = { query: { buyerID } };
  let items;
  const res = {
    json(data) { items = data; },
    status() { return { json() {} }; }
  };
  await getCart(req, res);
  return items;
}

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
export default app;