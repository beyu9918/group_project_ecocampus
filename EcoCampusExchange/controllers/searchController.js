const fs = require('fs');
const path = require('path');

const itemsPath = path.join(__dirname, '../data/items.json');

function getFilteredItems(query) {
  const { keyword = '', category, minPrice, maxPrice, minRating, sort } = query;
  let items = JSON.parse(fs.readFileSync(itemsPath, 'utf-8'));

  // 关键词过滤
  items = items.filter(item =>
    item.title.toLowerCase().includes(keyword.toLowerCase()) ||
    item.description.toLowerCase().includes(keyword.toLowerCase())
  );

  if (category) {
    items = items.filter(item => item.category === category);
  }

  if (minPrice) {
    items = items.filter(item => item.price >= parseFloat(minPrice));
  }

  if (maxPrice) {
    items = items.filter(item => item.price <= parseFloat(maxPrice));
  }

  if (minRating) {
    items = items.filter(item => item.avgRating >= parseFloat(minRating));
  }

  // 排序
  if (sort === 'price') {
    items.sort((a, b) => a.price - b.price);
  } else if (sort === 'rating') {
    items.sort((a, b) => b.avgRating - a.avgRating);
  } else if (sort === 'newest') {
    items.sort((a, b) => b.id - a.id); // 假设 id 越大越新
  }

  return items;
}

exports.searchItems = (req, res) => {
  const results = getFilteredItems(req.query);
  res.render('search', { items: results, query: req.query });
};