import { addNewProduct } from '../../controllers/product.js';
import test from 'node:test';
import assert from 'node:assert';

test('addNewProduct should add product and redirect to product page', () => {
  const mockReq = {
    body: {
      goodsName: 'test goods',
      goodsPrice: 20
    }
  };

  let redirectPath = '';
  const mockRes = {
    redirect: (path) => {
      redirectPath = path;
    }
  };

  addNewProduct(mockReq, mockRes);

  assert.equal(redirectPath, '/product', 'Should redirect to /product');

});

