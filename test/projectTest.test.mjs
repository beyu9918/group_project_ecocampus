import { addNewProduct } from '../controllers/product.js';
import { showAddProductPage } from '../controllers/product.js';
import { showProductDetail } from '../controllers/product.js';
import { showMessageList } from '../controllers/product.js';
import test from 'node:test';
import assert from 'node:assert';
import * as db from '../db.js';

test('addNewProduct should add product and redirect to product page', () => {
  const mockReq = {
    body: {
      productName: 'test product',
      productPrice: 20
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



test('showAddProductPage should render addProduct view with title', () => {
  const mockReq = {
    session: {
      user: { userid: 1, name: 'Test User' }
    }
  };

  let renderedView = '';
  let renderedData = {};

  const mockRes = {
    render: (view, data) => {
      renderedView = view;
      renderedData = data;
    }
  };

  showAddProductPage(mockReq, mockRes);

  assert.strictEqual(renderedView, 'addProduct', 'Should render addProduct page');
  assert.strictEqual(renderedData.title, 'Add New Product', 'Should pass correct title');
  assert.deepStrictEqual(renderedData.user, mockReq.session.user, 'Should pass user from session');
});





db.default = async () => [{ productid: 1, productname: 'Test Product' }];

test('showProductDetail should render productDetail page when product exists', async () => {
  const mockReq = {
    params: { productid: 1 },
    session: { user: { userid: 2, name: 'Alice' } }
  };

  let viewRendered = '';
  let renderedData = null;

  const mockRes = {
    render: (view, data) => {
      viewRendered = view;
      renderedData = data;
    },
    status: () => mockRes,
    send: () => {}
  };

  await showProductDetail(mockReq, mockRes);

  assert.strictEqual(viewRendered, 'productDetail');
  assert.deepStrictEqual(renderedData.title, 'Test Product');
  assert.deepStrictEqual(renderedData.product.productid, 1);
});



const fakeConversations = [
  {
    productid: 1,
    buyerid: 10,
    buyername: 'Alice',
    productname: 'Eco Bottle'
  }
];

// Patch SQL query
db.default = async () => fakeConversations;

test('showMessageList should render messageList with conversations', async () => {
  const mockReq = {
    session: {
      user: { userid: 2 }
    }
  };

  let viewRendered = '';
  let renderedData = null;

  const mockRes = {
    render: (view, data) => {
      viewRendered = view;
      renderedData = data;
    },
    redirect: () => {},
    status: () => mockRes,
    send: () => {}
  };

  await showMessageList(mockReq, mockRes);

  assert.strictEqual(viewRendered, 'messageList');
  assert.deepStrictEqual(renderedData.title, 'My Messages');
  assert.deepStrictEqual(renderedData.conversations, fakeConversations);
});