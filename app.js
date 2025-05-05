import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import './db.js'; // ✅ 连接 PostgreSQL（假设 db.js 存在）
import searchRoutes from './routes/searchRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 临时用户登录状态
app.use((req, res, next) => {
  req.user = { id: 1, name: 'TestUser' };
  next();
});

// 路由注册
app.use('/search', searchRoutes);
app.use('/product', reviewRoutes);

// 默认首页跳转
app.get('/', (req, res) => res.redirect('/search'));

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});