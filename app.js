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

envConfig = require('./config/default');

app.use(express.json());
// Serve public assets if needed (e.g., CSS/JS)
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Render main page via EJS
app.get('/', (req, res) => {
  res.render('index', { title: 'EcoCampus Exchange' });
});

// Socket.IO real-time
io.on('connection', socket => {
  console.log('Client connected');
  const cartController = require('./controllers/cartController');
  const cart = cartController.getCartInstance();

  // Initial state
  socket.emit('cartUpdated', cart.getCart());

  // Real-time events
  eventBus.on('cartItemAdded', item => socket.emit('cartItemAdded', item));
  eventBus.on('orderProcessed', status => socket.emit('orderProcessed', status));

  socket.on('disconnect', () => {
    eventBus.removeAllListeners('cartItemAdded');
    eventBus.removeAllListeners('orderProcessed');
  });
});

// Start server
server.listen(process.env.PORT || envConfig.port,
  () => console.log(`Server running at http://localhost:${process.env.PORT||envConfig.port}`));