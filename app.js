import express from 'express';
import session from 'express-session';

import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url'; // Use to solve __dirname
import { dirname } from 'path';

import userRoutes from './routes/userRoutes.js'; // 
import { registerForm, loginForm } from './controllers/userController.js'; // 2 functions
import debug from 'debug';
import * as server from './config/server.js';

import productRoutes from './routes/product.js';


export const codeTrace = debug('comp3028:server');
export const app = express();
server.setup(app)


// handle __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


// set ejs views engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// routes
app.use('/api/users', userRoutes);
app.use(session({
  secret: 'your_secret_key',    // 
  resave: false,
  saveUninitialized: true
}));

app.use('/', productRoutes);
app.get('/', (req, res) => {
  res.redirect('/register');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/register', registerForm);
app.post('/login', loginForm);
app.get('/profile', (req, res) => {
  if (!req.session.user) {
    // redirect if not loged in 
    return res.redirect('/login');
  }
  
  
  // render profilepage
  res.render('profile', { user: req.session.user });
});


app.get('/test', (req, res) => {
  res.send('Test');
});

// Launch server
const PORT = 3000;
app.listen(PORT, () => console.log(` Server running at http://localhost:${PORT}`));