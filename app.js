import express from 'express';
import http    from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors    from 'cors';
import path    from 'path';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname }  from 'path';

import cartRoutes  from './routes/cart.js';
import orderRoutes from './routes/order.js';
import socialRoutes from './routes/social.js';
import userRoutes  from './routes/userRoutes.js';
import { registerForm, loginForm } from './controllers/userController.js';
import eventBus            from './controllers/eventBus.js';
import * as cartController from './controllers/cartController.js';
import * as cartCtrl       from './controllers/cartController.js';
import * as orderCtrl      from './controllers/orderController.js';
import { connectDatabase } from './config/database.js';

// __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const app    = express();
const server = http.createServer(app);
const io     = new SocketIOServer(server);
const PORT   = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
app.use('/api/cart',  cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => res.render('index', { title: 'Shopping Page' }));
app.get('/register', (req, res) => res.render('register'));
app.get('/login',    (req, res) => res.render('login'));
app.post('/register', registerForm);
app.post('/login',    loginForm);

// Socket.IO
io.on('connection', socket => {
  const cart = cartController.getCartInstance();
  socket.emit('cartUpdated', cart.getCart());

  ['cartItemAdded','orderProcessed','notification','newFollower','listingShared']
    .forEach(evt => eventBus.on(evt, data => socket.emit(evt, data)));

  socket.on('disconnect', () => eventBus.removeAllListeners());
});

// Errors
server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} in use`);
    process.exit(1);
  }
  throw err;
});

// Bootstrap DB & launch
(async () => {
  await connectDatabase();
  server.listen(PORT, () => console.log(`✅ Server at http://localhost:${PORT}`));
})();