import express from 'express';
import cors from 'cors';
import debug from 'debug';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as server from './config/server.js'; // 如果不需要可以注释掉
import { homeRouter } from './routes/home.js';
import productRoutes from './routes/product.js';
import userRoutes from './routes/userRoutes.js';
import { registerForm, loginForm } from './controllers/userController.js';

const app = express();
export const codeTrace = debug('comp3028:server');

// 处理 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ejs view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// routers
app.use('/', homeRouter);
app.use('/', productRoutes);
app.use('/api/users', userRoutes);

// 页面路由
app.get('/', (req, res) => {
  res.redirect('/register');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  res.render('login');
});

// 表单提交接口
app.post('/register', registerForm);
app.post('/login', loginForm);

// 测试路由
app.get('/test', (req, res) => {
  res.send('Test');
});

// 错误处理 (如果 server.errorHandling 存在的话)
server.errorHandling(app);

// 启动服务器
export const runningServer = app.listen(server.port, () => {
  console.log(`✅ Server running at http://localhost:${server.port}`);
  codeTrace('testing');
});