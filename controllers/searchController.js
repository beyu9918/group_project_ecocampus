import sql from '../db.js';

export async function searchProducts(req, res) {
  const { keyword = '', category, minPrice, maxPrice, minRating, sort } = req.query;
  const safeKeyword = (keyword || '').trim().toLowerCase();

  let queryText = `
  SELECT 
    "productid" AS "productID",
    "productname" AS "productName",
    "productprice" AS "productPrice",
    "description",
    "avgrating" AS "avgRating",
    "category",
    "productpicture" AS "productPicture"
  FROM product
`;
  let conditions = [];
  let values = [];

  if (safeKeyword) {
    values.push(`%${safeKeyword}%`);
    conditions.push(`(LOWER("productname") LIKE $${values.length} OR LOWER("description") LIKE $${values.length})`);
  }
  if (category) {
    values.push(category);
    conditions.push(`"category" = $${values.length}`);
  }
  if (minPrice) {
    values.push(parseFloat(minPrice));
    conditions.push(`"productprice" >= $${values.length}`);
  }
  if (maxPrice) {
    values.push(parseFloat(maxPrice));
    conditions.push(`"productprice" <= $${values.length}`);
  }
  if (minRating) {
    values.push(parseFloat(minRating));
    conditions.push(`"avgrating" >= $${values.length}`);
  }

  if (conditions.length > 0) {
    queryText += ' WHERE ' + conditions.join(' AND ');
  }

  if (sort === 'price') {
    queryText += ' ORDER BY "productprice" ASC';
  } else if (sort === 'rating') {
    queryText += ' ORDER BY "avgrating" DESC';
  }

  try {
    const result = await sql.unsafe(queryText, values);
    const product = result.map(p => ({
      ...p,
      productPrice: parseFloat(p.productPrice),
      avgRating: parseFloat(p.avgRating),
      productPicture:
        p.productPicture
          ? (p.productPicture.startsWith('/uploads/')
              ? p.productPicture
              : '/uploads/' + p.productPicture)
          : '/images/default.png'
    }));

    res.render('search', {
      title: 'Search Results',
      product: product,  
      query: req.query
    });
  } catch (error) {
    console.error('Database query failed:', error.message);
    res.status(500).send('Failed to load product data from database.');
  }
}