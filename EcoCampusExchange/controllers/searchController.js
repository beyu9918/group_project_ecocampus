// Import required modules
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 使用 import.meta.url 获取当前模块的 URL，并转换为文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, '../data/items.json');  // 指向你的 JSON 数据文件

// 其他代码...
export function searchItems(req, res) {
  const { keyword = '', category, minPrice, maxPrice, minRating, sort } = req.query;
  
  const safeKeyword = keyword.trim();

  // 读取本地 JSON 文件的数据
  const rawData = fs.readFileSync(dataPath);
  const data = JSON.parse(rawData);

  let filteredItems = data.items;

  // 根据关键词过滤商品
  if (safeKeyword) {
    filteredItems = filteredItems.filter(item =>
      item.title.toLowerCase().includes(safeKeyword.toLowerCase()) ||
      item.description.toLowerCase().includes(safeKeyword.toLowerCase())
    );
  }

  // 其他过滤条件（分类、价格、评分等）
  if (category) {
    filteredItems = filteredItems.filter(item => item.category === category);
  }

  if (minPrice) {
    filteredItems = filteredItems.filter(item => item.price >= parseFloat(minPrice));
  }

  if (maxPrice) {
    filteredItems = filteredItems.filter(item => item.price <= parseFloat(maxPrice));
  }

  if (minRating) {
    filteredItems = filteredItems.filter(item => item.avgRating >= parseFloat(minRating));
  }

  // 排序
  if (sort === 'price') {
    filteredItems.sort((a, b) => a.price - b.price);
  } else if (sort === 'rating') {
    filteredItems.sort((a, b) => b.avgRating - a.avgRating);
  }
  console.log('Filtered Items:', filteredItems);
  // 渲染搜索页面并传递过滤后的商品数据
  res.render('search', { title: 'Search Results', items: filteredItems, query: req.query });
}