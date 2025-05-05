import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import userRoutes from './routes/userRoutes.js';

const app = express();

// __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// EJS config
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Routes
app.use('/', userRoutes);

// Render register page
app.get('/register', (req, res) => {
  res.render('register');
});

// Render login page
app.get('/login', (req, res) => {
  res.render('login');
});

// Redirect root to register page
app.get('/', (req, res) => res.redirect('/register'));

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));