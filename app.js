import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/order.js';
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

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Root route
app.get('/', (req, res) => {
  res.render('index', { title: 'EcoCampus Exchange' });
});

// Socket.IO real-time bridge
io.on('connection', socket => {
  console.log('Client connected');
  const cart = cartController.getCartInstance();

  // Initial state
  socket.emit('cartUpdated', cart.getCart());

  // Forward server events
  eventBus.on('cartItemAdded', item    => socket.emit('cartItemAdded',    item));
  eventBus.on('orderProcessed', status => socket.emit('orderProcessed',     status));
  eventBus.on('notification',    note   => socket.emit('notification',      note));

  socket.on('disconnect', () => {
    eventBus.removeAllListeners('cartItemAdded');
    eventBus.removeAllListeners('orderProcessed');
    eventBus.removeAllListeners('notification');
  });
});

// Start server
const PORT = process.env.PORT || envConfig.port;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));