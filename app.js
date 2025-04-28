import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/order.js';
import socialRoutes from './routes/social.js';
import eventBus from './controllers/eventBus.js';
import * as cartController from './controllers/cartController.js';

import envConfig from './config/default.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/social', socialRoutes);

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Root endpoint
app.get('/', (req, res) => {
  res.render('index', { title: 'EcoCampus Exchange' });
});

// Real-time via Socket.IO
io.on('connection', (socket) => {
  const cart = cartController.getCartInstance();
  socket.emit('cartUpdated', cart.getCart());

  // Forward events to client
  ['cartItemAdded', 'orderProcessed', 'notification', 'newFollower', 'listingShared']
    .forEach((evt) => {
      eventBus.on(evt, (data) => socket.emit(evt, data));
    });

  socket.on('disconnect', () => {
    eventBus.removeAllListeners();
  });
});

// Start server
const PORT = process.env.PORT || envConfig.port;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
