import { addNewProduct } from '../controllers/product.js';
import test from 'node:test';
import assert from 'node:assert';

test('addNewProduct should add product and redirect', () => {
  // 模拟 req 和 res
  const mockReq = {
    body: {
      goodsName: 'Test Item',
      goodsPrice: 99.99
    }
  };

  let redirectPath = '';
  const mockRes = {
    redirect: (path) => {
      redirectPath = path;
    }
  };

  // 执行添加
  addNewProduct(mockReq, mockRes);

  // 验证 redirect
  assert.equal(redirectPath, '/product', 'Should redirect to /product');

  // ✅ 必须让 test() 函数结束，或者返回 Promise
});

