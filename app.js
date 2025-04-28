const path = require('path');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
const eventBus = require('./controllers/eventBus');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

envConfig = require('./config/default');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Root route
app.get('/', (req, res) => {
  res.render('index', { title: 'EcoCampus Exchange' });
});

// Socket.IO real-time bridge
io.on('connection', socket => {
  console.log('Client connected');
  const cartController = require('./controllers/cartController');
  const cart = cartController.getCartInstance();

  // Initial state
  socket.emit('cartUpdated', cart.getCart());

  // Forward events to client
  eventBus.on('cartItemAdded', item      => socket.emit('cartItemAdded',      item));
  eventBus.on('orderProcessed', status   => socket.emit('orderProcessed',     status));
  eventBus.on('notification',      note     => socket.emit('notification',      note));

  socket.on('disconnect', () => {
    eventBus.removeAllListeners('cartItemAdded');
    eventBus.removeAllListeners('orderProcessed');
    eventBus.removeAllListeners('notification');
  });
});

// Start server
const PORT = process.env.PORT || envConfig.port;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));