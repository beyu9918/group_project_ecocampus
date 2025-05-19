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
import messageRoutes from './routes/message.js'; 

import { registerForm, loginForm } from './controllers/userController.js';
import eventBus from './controllers/eventBus.js';
import * as cartController from './controllers/cartController.js';



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
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Web routes
app.use('/api/users', userRoutes);
app.use('/', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/social', socialRoutes);
app.use('/', productRoutes);
app.use('/search', searchRoutes);
app.use('/', messageRoutes);

// Mock login for testing (from vicky)
app.use((req, res, next) => {
  req.user = { userID: 1, name: 'TestUser' };
  next();
});

// Auth pages
app.get('/register', (req, res) => res.render('register'));
app.get('/login', (req, res) => res.render('login'));
app.post('/register', registerForm);
app.post('/login', loginForm);

// Profile
app.get('/profile', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('profile', { user: req.session.user });
});

// Root redirect
app.get('/', (req, res) => res.redirect('/product'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Real-time events
io.on('connection', (socket) => {
  ...
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
  


