import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { connectDatabase } from './config/database.js';
import { Cart } from './controllers/cartController.js';
import { Order } from './controllers/orderController.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/order.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database
connectDatabase();

// Routes
app.use('/cart', cartRoutes);
app.use('/order', orderRoutes);

// Cart page: show items with product details
app.get('/', async (req, res) => {
  const buyerID = 1;
  const cartItems = await Cart.findAll({
    where: { buyerID },
    include: [{ model: Product, attributes: ['productName', 'productPrice'] }]
  });
  res.render('index', { cart: cartItems });
});

// Place order: compute total, create order, clear cart, redirect
app.post('/order', async (req, res) => {
  const buyerID = 1;
  const cartItems = await Cart.findAll({
    where: { buyerID },
    include: [{ model: Product, attributes: ['productPrice'] }]
  });
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.Product.productPrice * item.quantity,
    0
  );
  const order = await Order.create({ buyerID, totalAmount });
  // clear cart
  await Cart.destroy({ where: { buyerID } });
  res.redirect(`/order/${order.orderID}`);
});

// Show order details or confirmation
app.get('/order/:id', async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  const confirmed = order.status === 'Done';
  res.render('order', { order: { id: order.orderID, totalAmount: order.totalAmount }, cart: [], confirmed });
});

// Handle payment and redirect to confirmation
app.post('/order/:id/pay', async (req, res) => {
  await Order.update(
    { status: 'Done' },
    { where: { orderID: req.params.id } }
  );
  res.redirect(`/order/${req.params.id}`);
});

// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));