import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url'; // ⬅️ 用于解决 __dirname
import { dirname } from 'path';

import userRoutes from './routes/userRoutes.js'; // ⬅️ 注意加.js后缀
import { registerForm, loginForm } from './controllers/userController.js'; // ⬅️ 解构引入两个函数

const app = express();

// handle __dirname 的替代方案
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

// Launch server
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));