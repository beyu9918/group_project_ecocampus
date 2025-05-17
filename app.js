import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import searchRoutes from './routes/searchRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import userRoutes from './routes/userRoutes.js';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import productRoutes from './routes/product.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/order.js';
import socialRoutes from './routes/social.js';
import { registerForm, loginForm } from './controllers/userController.js';
import eventBus from './controllers/eventBus.js';
import * as cartController from './controllers/cartController.js';
import fileUpload from 'express-fileupload'; 
import debug from 'debug';
import * as customServer from './config/server.js';

// __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Init Express and HTTP + Socket.IO
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);
export const codeTrace = debug('comp3028:server');

// Optional custom setup
customServer.setup?.(app);


app.use(fileUpload({
  useTempFiles: true,
  parseNested: true
}));

// Middleware
app.use(cors());
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// EJS config
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Routes
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/social', socialRoutes);
app.use('/', productRoutes);
app.use('/search', searchRoutes);

// Authentication
app.get('/register', (req, res) => res.render('register'));
app.get('/login', (req, res) => res.render('login'));
app.post('/register', registerForm);
app.post('/login', loginForm);

// Profile Page
app.get('/profile', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('profile', { user: req.session.user });
});


// Homepage UI
app.get('/', (req, res) => {
  res.redirect('/product');
});


// Optional test route
app.get('/test', (req, res) => res.send('Test'));

// Real-time events
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

// Start server
const PORT = 3000;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
