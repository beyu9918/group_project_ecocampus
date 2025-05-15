import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { connectDatabase } from './config/database.js';
import * as cartCtrl from './controllers/cartController.js';
import * as orderCtrl from './controllers/orderController.js';
import * as reviewCtrl from './controllers/reviewController.js';
import eventBus from './controllers/eventBus.js';

import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/order.js';
import reviewRoutes from './routes/reviews.js';

// __dirname shim for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// API routes
app.use('/api/cart',  cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/reviews', reviewRoutes);

// Root: show shopping cart
app.get('/', async (req, res) => {
  const buyerID = req.session.userID || 1; // default for demo
  try {
    const items = await cartCtrl.Cart.findAll({ where: { buyerID } });
    const plainItems = items.map(i => i.get({ plain: true }));
    res.render('index', { title: 'Your Cart', items: plainItems, buyerID });
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Order summary page
app.get('/order/:orderID', async (req, res) => {
  const { orderID } = req.params;
  try {
    const order = await orderCtrl.Order.findByPk(orderID, { raw: true });
    res.render('order', { order });
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Review submission page
app.get('/reviews', async (req, res) => {
  const orderID = parseInt(req.query.orderID, 10);
  try {
    const orderItems = await orderCtrl.Order.findByPk(orderID, {
      include: [{ model: cartCtrl.Cart, as: 'items' }],
      raw: true
    });
    res.render('reviews', { orderID, items: orderItems.items });
  } catch (err) {
    console.error('Error fetching review items:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Real-time notifications via Socket.IO
io.on('connection', socket => {
  ['cartItemAdded','orderProcessed','notification','newFollower','listingShared']
    .forEach(evt => eventBus.on(evt, data => socket.emit(evt, data)));
  socket.on('disconnect', () => eventBus.removeAllListeners());
});

// Handle server port errors
server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    process.exit(1);
  }
  throw err;
});

// Start server after DB connection
(async () => {
  try {
    await connectDatabase();
    server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  }
})();
