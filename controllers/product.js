import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const goodsPath = path.join(__dirname, '../data/goods.json');

const readGoods = () => {
  try {
    const data = fs.readFileSync(goodsPath, 'utf-8');
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error reading goods.json:', err);
    return [];
  }
};

const writeGoods = (goods) => {
  fs.writeFileSync(goodsPath, JSON.stringify(goods, null, 2));
};

const getNextGoodsID = (goodsList) => {
  if (goodsList.length === 0) return 1;
  return Math.max(...goodsList.map(g => g.goodsID)) + 1;
};

// view all product
export function showProductPage(req, res) {
  const goodsList = readGoods();
  res.render('product', {
    title: 'Product Management',
    goods: goodsList
  });
}

export function showAddProductPage(req, res) {
  res.render('addProduct', { title: 'Add New Product' });
}

//add new product
export function addNewProduct(req, res) {
  const { goodsName, goodsPrice, Description } = req.body;
  const goodsList = readGoods();

  if (goodsName && goodsPrice) {
    const newGoods = {
      goodsID: getNextGoodsID(goodsList),
      goodsName,
      goodsPrice,
      Description: Description || ''  
    };
    goodsList.push(newGoods);
    writeGoods(goodsList);
  }

  res.redirect('/product');
}


