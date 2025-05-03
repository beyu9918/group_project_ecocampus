import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const productPath = path.join(__dirname, '../data/product.json');

const readProduct = () => {
  try {
    const data = fs.readFileSync(productPath, 'utf-8');
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error reading product.json:', err);
    return [];
  }
};

const writeProduct = (product) => {
  fs.writeFileSync(productPath, JSON.stringify(product, null, 2));
};

const getNextProductID = (productList) => {
  if (productList.length === 0) return 1;
  return Math.max(...productList.map(g => g.productID)) + 1;
};

// view all product
export function showProductPage(req, res) {
  const productList = readProduct();
  res.render('product', {
    title: 'Product Management',
    product: productList,
    items: productList, 
    query: req.query || {} 
  });
}


export function showAddProductPage(req, res) {
  res.render('addProduct', { title: 'Add New Product' });
  
}

//add new product
export function addNewProduct(req, res) {
  const { productName, productPrice, Description } = req.body;
  const productList = readProduct();

  if (productName && productPrice) {
    const newProduct = {
      productID: getNextProductID(productList),
      productName,
      productPrice,
      Description: Description || ''  
    };
    productList.push(newProduct);
    writeProduct(productList);
  }

  res.redirect('/product');
}


