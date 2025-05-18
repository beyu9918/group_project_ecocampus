import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import fileUpload from 'express-fileupload'; 
import debug from 'debug';
import * as customServer from './config/server.js';
import sql from './db.js';

// Routes
import searchRoutes from './routes/searchRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/product.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/order.js';
import socialRoutes from './routes/social.js';
import messageRoutes from './routes/message.js'; // ✅ message route added

import { registerForm, loginForm } from './controllers/userController.js';
import eventBus from './controllers/eventBus.js';
import * as cartController from './controllers/cartController.js';

// Setup __dirname replacement
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/social', socialRoutes);

// Web Routes
app.use('/', productRoutes);
app.use('/search', searchRoutes);
app.use('/', messageRoutes); // ✅ mount message route

// Auth Routes
app.get('/register', (req, res) => res.render('register'));
app.get('/login', (req, res) => res.render('login'));
app.post('/register', registerForm);
app.post('/login', loginForm);

// Profile Page
app.get('/profile', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('profile', { user: req.session.user });
});

// Redirect root to product page
app.get('/', (req, res) => {
  res.redirect('/product');
});

// Test Route
app.get('/test', (req, res) => res.send('Test'));

// Socket.IO Realtime Events
io.on('connection', (socket) => {
  const cart = cartController.getCartInstance();
  socket.emit('cartUpdated', cart.getCart());

  // Join room based on user ID
  socket.on('joinRoom', (userId) => {
    socket.join(`user_${userId}`);
  });

  // Send and save message
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

  // Forward internal app events to client
  ['cartItemAdded', 'orderProcessed', 'notification', 'newFollower', 'listingShared']
    .forEach((evt) => {
      eventBus.on(evt, (data) => socket.emit(evt, data));
    });

  socket.on('disconnect', () => {
    eventBus.removeAllListeners();
  });
});

// Start Server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


