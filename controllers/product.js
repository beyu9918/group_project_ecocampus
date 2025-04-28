//simulated database
const goodsList = [];
let nextGoodsID = 1;

export function showProductPage(req, res) {
  res.render('product', {
    title: 'Product Management',
    goods: goodsList
  });
}

export function showAddProductPage(req, res) {
  res.render('addProduct', { title: 'Add New Product' });
}

export function addNewProduct(req, res) {
  const { goodsName, goodsPrice } = req.body;

  if (goodsName && goodsPrice) {
    const newGoods = {
      goodsID: nextGoodsID++,
      goodsName,
      goodsPrice
    };
    goodsList.push(newGoods);
  }

  res.redirect('/product');
}
