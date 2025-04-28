import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url'; // ⬅️ 用于解决 __dirname
import { dirname } from 'path';

import userRoutes from './routes/userRoutes.js'; // ⬅️ 注意加.js后缀
import { registerForm, loginForm } from './controllers/userController.js'; // ⬅️ 解构引入两个函数

const app = express();

// 处理 __dirname 的替代方案
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 设置 EJS 视图引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 路由
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

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));