// Import required modules
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, '../data/items.json');  


export async function searchItems(req, res) {
  const { keyword = '', category, minPrice, maxPrice, minRating, sort } = req.query;

  
  const safeKeyword = (keyword || '').trim().toLowerCase();

  
  let data;
  try {
    
    const rawData = await readFile(dataPath, 'utf-8');
    data = JSON.parse(rawData);
  } catch (error) {
    
    console.error('Error reading or parsing items.json:', error.message);
    return res.status(500).send('Failed to load product data.');
  }

  let filteredItems = data.items || [];

  
  if (safeKeyword) {
    filteredItems = filteredItems.filter(item =>
      (item.title && item.title.toLowerCase().includes(safeKeyword)) ||
      (item.description && item.description.toLowerCase().includes(safeKeyword))
    );
  }

  
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

  
  if (sort === 'price') {
    filteredItems.sort((a, b) => a.price - b.price);
  } else if (sort === 'rating') {
    filteredItems.sort((a, b) => b.avgRating - a.avgRating);
  }

  
  res.render('search', { title: 'Search Results', items: filteredItems, query: req.query });
}