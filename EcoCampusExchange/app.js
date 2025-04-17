const express = require('express');
const path = require('path');
const searchRoutes = require('./routes/searchRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 模拟用户登录
app.use((req, res, next) => {
  req.user = { id: 1, name: 'TestUser' }; // 假设登录的用户 ID 为 1
  next();
});

// 路由
app.use('/search', searchRoutes);
app.use('/item', reviewRoutes);

// 首页跳转到搜索
app.get('/', (req, res) => res.redirect('/search'));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
