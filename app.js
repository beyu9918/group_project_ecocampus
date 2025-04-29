import express from 'express';

import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url'; //  __dirname
import { dirname } from 'path';
import session from 'express-session';


import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/order.js';
import socialRoutes from './routes/social.js';
import userRoutes from './routes/userRoutes.js';
import { registerForm, loginForm } from './controllers/userController.js';
import eventBus from './controllers/eventBus.js';
import * as cartController from './controllers/cartController.js';

// __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize express app and server
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

// Middleware
app.use(cors());
app.use(session({
  secret: 'your_secret_key',  // ]
  resave: false,
  saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// API routes
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/users', userRoutes);

// Root endpoint - main UI
app.get('/', (req, res) => {
  res.render('index', { title: 'EcoCampus Exchange' });
});

// Authentication pages
app.get('/register', (req, res) => res.render('register'));
app.get('/login', (req, res) => res.render('login'));
app.post('/register', registerForm);
app.post('/login', loginForm);

// Real-time via Socket.IO
io.on('connection', (socket) => {
  const cart = cartController.getCartInstance();
  socket.emit('cartUpdated', cart.getCart());

  ['cartItemAdded', 'orderProcessed', 'notification', 'newFollower', 'listingShared']
    .forEach((evt) => {
      eventBus.on(evt, (data) => socket.emit(evt, data));
    });

  socket.on('disconnect', () => {
    eventBus.removeAllListeners();
  });
});


app.post('/register', registerForm);
app.post('/login', loginForm);
app.get('/profile', (req, res) => {
  res.render('profile', { user: req.session.user });
});
// Launch server
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
