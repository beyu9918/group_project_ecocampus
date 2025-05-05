import sql from '../db.js';

// 显示所有产品
export async function showProductPage(req, res) {
  try {
    const result = await sql`SELECT * FROM product ORDER BY productid`;
    res.render('product', {
      title: 'Product Management',
      product: result,
      items: result,
      query: req.query || {}
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).send('Internal Server Error');
  }
}

// 显示添加页面
export function showAddProductPage(req, res) {
  res.render('addProduct', { title: 'Add New Product' });
}

// 添加新产品
export async function addNewProduct(req, res) {
  const { productName, productPrice, Description, category } = req.body;

  if (!productName || !productPrice) {
    return res.status(400).send('Missing required fields');
  }

  try {
    await sql`
      INSERT INTO product (productName, productPrice, Description, category)
      VALUES (${productName}, ${productPrice}, ${Description || ''}, ${category || null})
    `;
    res.redirect('/product');
  } catch (err) {
    console.error('Error inserting product:', err);
    res.status(500).send('Internal Server Error');
  }
}

