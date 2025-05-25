import test from 'node:test';
import assert from 'node:assert/strict';
import sinon from 'sinon';
import * as productController from '../controllers/product.js';
import sql from '../db.js';


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

test('showProductPage handles error', async () => {
    const sqlStub = sinon.stub(sql, 'execute').throws(new Error('DB Error'));
  
    const req = { query: {}, session: {} };
    const res = {
      status(code) {
        assert.equal(code, 500);
        return {
          send(msg) {
            assert.equal(msg, 'Internal Server Error');
          }
        };
      }
    };
  
    await productController.showProductPage(req, res);
    sqlStub.restore();
  });
  
test('addNewProduct handles image upload failure', async () => {
    const fakeFile = {
      name: 'test.jpg',
      mv: sinon.stub().rejects(new Error('Upload failed'))
    };
  
    const req = {
      body: {
        productname: 'Item X',
        productprice: 100,
        description: 'test',
        category: 'book'
      },
      session: { user: { userid: 1 } },
      files: { productPicture: fakeFile }
    };
  
    const res = {
      status(code) {
        assert.equal(code, 500);
        return {
          send(msg) {
            assert.equal(msg, 'Image upload failed');
          }
        };
      }
    };
  
    await productController.addNewProduct(req, res);
  });

  test('addNewProduct handles SQL insert failure', async () => {
    const sqlStub = sinon.stub(sql, 'execute').rejects(new Error('Insert failed'));
  
    const req = {
      body: {
        productname: 'Item Z',
        productprice: 50,
        description: '',
        category: null
      },
      session: { user: { userid: 1 } }
    };
  
    const res = {
      status(code) {
        assert.equal(code, 500);
        return {
          send(msg) {
            assert.equal(msg, 'Internal Server Error');
          }
        };
      }
    };
  
    req.files = null;
  
    await productController.addNewProduct(req, res);
    sqlStub.restore();
  });

  
  test('showMessageList redirects to login if user not logged in', async () => {
    const req = { session: {} };
    const res = {
      redirect(path) {
        assert.equal(path, '/login');
      }
    };
  
    await productController.showMessageList(req, res);
  });
  
  test('addNewProduct returns 400 if productprice is missing', async () => {
    const req = {
      body: {
        productname: 'Only Name',
        productprice: '', 
        description: 'abc',
        category: 'books'
      },
      session: { user: { userid: 3 } }
    };
  
    const res = {
      status(code) {
        assert.equal(code, 400);
        return {
          send(msg) {
            assert.equal(msg, 'Missing required fields');
          }
        };
      }
    };
  
    await productController.addNewProduct(req, res);
  });
  

  test('addNewProduct handles image object without mv function', async () => {
    const req = {
      body: {
        productname: 'InvalidImageProduct',
        productprice: 5,
        description: '',
        category: 'other'
      },
      session: { user: { userid: 4 } },
      files: {
        productPicture: { name: 'x.jpg' } 
      }
    };
  
    const res = {
      status(code) {
        assert.equal(code, 500);
        return {
          send(msg) {
            assert.equal(msg, 'Image upload failed');
          }
        };
      }
    };
  
    await productController.addNewProduct(req, res);
  });
  
  

  test('showAddProductPage works without user session', () => {
    const req = { session: {} };
    const res = {
      render(view, data) {
        assert.equal(view, 'addProduct');
        assert.deepEqual(data.user, null);
        assert.equal(data.title, 'Add New Product');
      }
    };
  
    productController.showAddProductPage(req, res);
  });
  