import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url'; //  __dirname
import { dirname } from 'path';
import session from 'express-session';


import userRoutes from './routes/userRoutes.js'; // 
import { registerForm, loginForm } from './controllers/userController.js'; // 2 functions

const app = express();

// handle __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// middleware
app.use(cors());
app.use(session({
  secret: 'your_secret_key',  // ]
  resave: false,
  saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// set ejs views engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// routes
app.use('/api/users', userRoutes);

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
  res.render('profile', { user: req.session.user });
});
// Launch server
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));