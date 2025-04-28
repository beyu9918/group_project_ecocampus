
// Import required modules
import sqlite3Pkg from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Define __filename and __dirname first
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Now connect to the database
const sqlite3 = sqlite3Pkg.verbose();
const dbPath = path.join(__dirname, '../data/EcoCampus.db');
const db = new sqlite3.Database(dbPath);

// Fetch items based on filters (keyword, category, price, rating, sort)
function getFilteredItems(query, callback) {
  const { keyword = '', category, minPrice, maxPrice, minRating, sort } = query;
  
  const safeKeyword = keyword.trim();
  
  if (keyword !== safeKeyword) {
    console.log('The keyword contains blank characters, which have been automatically removed');
  }


  // Build SQL query dynamically
  let sql = `SELECT * FROM items WHERE (title LIKE ? OR description LIKE ?)`;
  const params = [`%${safeKeyword}%`, `%${safeKeyword}%`];

  if (category) {
    sql += ` AND category = ?`;
    params.push(category);
  }

  if (minPrice) {
    sql += ` AND price >= ?`;
    params.push(parseFloat(minPrice));
  }

  if (maxPrice) {
    sql += ` AND price <= ?`;
    params.push(parseFloat(maxPrice));
  }

  if (minRating) {
    sql += ` AND avgRating >= ?`;
    params.push(parseFloat(minRating));
  }

  
  // Add sorting if needed
  if (sort === 'price') {
    sql += ` ORDER BY price ASC`;
  } else if (sort === 'rating') {
    sql += ` ORDER BY avgRating DESC`;
  } else if (sort === 'newest') {
    sql += ` ORDER BY id DESC`;
  }

  
  // 调试输出前端提交的 keyword
  console.log('Search Keyword:', keyword);
  // Execute SQL query
  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error during query:', err);
      callback([]);
    } else {
      
      console.log('Number of items found:', rows.length);
      callback(rows);
    }
  });
}


// Handle search page request
export function searchItems(req, res) {
  getFilteredItems(req.query, (items) => {
    res.render('search', { items, query: req.query });
  });
}