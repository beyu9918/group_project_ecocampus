const path = require('path');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
const eventBus = require('./src/eventBus');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Load config
envConfig = require('./config/default');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);

// Template engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Render home page
app.get('/', (req, res) => {
  res.render('index', { title: 'EcoCampus Exchange' });
});

// Socket.IO real-time
io.on('connection', (socket) => {
  console.log('Client connected');
  const cartController = require('./controllers/cartController');
  const cart = cartController.getCartInstance();
  // initial state
  socket.emit('cartUpdated', cart.getCart());
  // real-time events
  eventBus.on('cartItemAdded', item => socket.emit('cartItemAdded', item));
  eventBus.on('orderProcessed', status => socket.emit('orderProcessed', status));
  socket.on('disconnect', () => {
    eventBus.removeAllListeners('cartItemAdded');
    eventBus.removeAllListeners('orderProcessed');
  });
});

// Start server
const PORT = process.env.PORT || envConfig.port;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));