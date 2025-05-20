import sql from '../db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = path.join(__dirname, '../public/uploads');

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Show all products
export async function showProductPage(req, res) {
  try {
    const result = await sql`SELECT * FROM product ORDER BY productid`;
    res.render('product', {
      title: 'Product Management',
      product: result,
      items: result,
      query: req.query || {},
      user: req.session.user || null  
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).send('Internal Server Error');
  }
}

// Show add product form
export function showAddProductPage(req, res) {
  res.render('addProduct', {
    title: 'Add New Product',
    user: req.session.user || null  
  });
}

// Add new product
export async function addNewProduct(req, res) {
  const { productname, productprice, description, category } = req.body;

  const sellerid = req.session?.user?.userid || 1;
  let imagePath = null;

  function isEmpty(val) {
    return val === undefined || val === null || val === '';
  }

  if (isEmpty(productname) || isEmpty(productprice)) {
    return res.status(400).send('Missing required fields');
  }

  // Handle image upload
  if (req.files && req.files.productPicture) {
    const image = req.files.productPicture;
    const filename = Date.now() + '-' + image.name;
    const filepath = path.join(uploadDir, filename);

    try {
      await image.mv(filepath);
      imagePath = '/uploads/' + filename;
    } catch (err) {
      console.error('Image upload error:', err);
      return res.status(500).send('Image upload failed');
    }
  }

  // Insert into database
  try {
    await sql`
      INSERT INTO product (
        sellerid,
        productname,
        productprice,
        description,
        category,
        productpicture
      )
      VALUES (
        ${sellerid},
        ${productname},
        ${productprice},
        ${description || ''},
        ${category || null},
        ${imagePath || null}
      )
    `;
    res.redirect('/product');
  } catch (err) {
    console.error('Error inserting product:', err);
    res.status(500).send('Internal Server Error');
  }
}

// Show product detail page
export async function showProductDetail(req, res) {
  const { productid } = req.params;

  try {
    const result = await sql`SELECT * FROM product WHERE productid = ${productid}`;
    if (result.length === 0) {
      return res.status(404).send('Product not found');
    }
    const product = result[0];
    res.render('productDetail', {
      title: product.productname,
      product,
      user: req.session.user || null  
    });
  } catch (err) {
    console.error('Error fetching product detail:', err);
    res.status(500).send('Internal Server Error');
  }
}


export async function showMessageList(req, res) {
  const sellerId = req.session?.user?.userid;
  if (!sellerId) return res.redirect('/login');

  try {
    const result = await sql`
      SELECT DISTINCT ON (m.productid, m.senderid)
        m.productid,
        m.senderid AS buyerid,
        u.name AS buyername,
        p.productname
      FROM messages m
      JOIN users u ON m.senderid = u.userid
      JOIN product p ON m.productid = p.productid
      WHERE m.receiverid = ${sellerId}
      ORDER BY m.productid, m.senderid, m.sent_at DESC
    `;

    res.render('messageList', {
      title: 'My Messages',
      conversations: result,
    });
  } catch (err) {
    console.error('Error loading message list:', err);
    res.status(500).send('Internal Server Error');
  }
}