// test/controllers/product.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import sinon from 'sinon';
import * as productController from '../../controllers/product.js';
import sql from '../../db.js';


test('showProductPage should render product page with data', async () => {
  const mockData = [{ productid: 1, productname: 'Test Item' }];
  
  const sqlStub = sinon.stub(sql, 'execute').resolves(mockData); 

  const req = {
    session: { user: { userid: 123, name: 'Tester' } },
    query: {}
  };

  const res = {
    renderCalledWith: {},
    render(view, data) {
      this.renderCalledWith = { view, data };
    },
    status() { return this; },
    send() {}
  };

  await productController.showProductPage(req, res);

  assert.strictEqual(res.renderCalledWith.view, 'product');
  assert.deepEqual(res.renderCalledWith.data.product, mockData);

  sqlStub.restore();
});


test('addNewProduct returns 400 if required fields missing', async () => {
  const req = { body: { productname: '', productprice: '' }, session: {} };
  const res = {
    status(code) {
      assert.equal(code, 400);
      return {
        send(message) {
          assert.equal(message, 'Missing required fields');
        },
      };
    },
  };
  await productController.addNewProduct(req, res);
});

test('showAddProductPage renders addProduct view', () => {
  const req = { session: { user: { name: 'Alice' } } };
  const res = {
    render(view, data) {
      assert.equal(view, 'addProduct');
      assert.deepEqual(data.user, req.session.user);
    },
  };
  productController.showAddProductPage(req, res);
});

test('showProductDetail returns 404 if product not found', async () => {
  const sqlStub = sinon.stub(sql, 'execute').resolves([]);
  const req = { params: { productid: 99 }, session: {} };
  const res = {
    status(code) {
      assert.equal(code, 404);
      return { send: (msg) => assert.equal(msg, 'Product not found') };
    },
  };

  await productController.showProductDetail(req, res);
  sqlStub.restore();
});

test('showMessageList renders messages if user is logged in', async () => {
  const req = { session: { user: { userid: 1 } } };
  const res = {
    render(view, data) {
      assert.equal(view, 'messageList');
      assert.ok(Array.isArray(data.conversations));
    },
  };

  const fakeData = [{
    productid: 1,
    buyerid: 2,
    buyername: 'TestBuyer',
    productname: 'TestProduct'
  }];

  const sqlStub = sinon.stub(sql, 'execute').resolves(fakeData);
  await productController.showMessageList(req, res);
  sqlStub.restore();
});

test('showProductDetail should render productDetail view when product exists', async () => {
    const fakeProduct = {
      productid: 10,
      productname: 'Test Product',
      productprice: 99.99,
      description: 'Example',
      category: 'textbook',
      productpicture: null
    };
  
    const sqlStub = sinon.stub(sql).resolves([fakeProduct]);
  
    const req = {
      params: { productid: 10 },
      session: { user: { userid: 3 } }
    };
  
    const res = {
      render(view, data) {
        assert.strictEqual(view, 'productDetail');
        assert.strictEqual(data.title, fakeProduct.productname);
        assert.deepEqual(data.product, fakeProduct);
        assert.deepEqual(data.user.userid, 3);
      },
      status: () => ({ send: () => {} })
    };
  
    await productController.showProductDetail(req, res);
    sqlStub.restore();
  });
