// 1. Import Express and set up the application
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/e-commerce';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev_session_secret_change_me';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || undefined;
const IS_PROD = process.env.NODE_ENV === 'production';

// 2. Middleware
app.use(
  cors({
    origin: FRONTEND_ORIGIN || true,
    credentials: true
  })
);
app.use(express.json());
app.set('trust proxy', 1);
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: IS_PROD,
      sameSite: IS_PROD ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7
    },
    store: MongoStore.create({ mongoUrl: MONGO_URI })
  })
);

// 3. Database & Models
const productSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  brand: String,
  name: String,
  price: Number,
  originalPrice: Number,
  category: String,
  rating: Number,
  ratingCount: Number,
  image: String
});
const orderSchema = new mongoose.Schema({
  orderId: { type: String, index: true },
  customerInfo: Object,
  items: [
    {
      productId: Number,
      name: String,
      price: Number,
      quantity: Number
    }
  ],
  totalAmount: Number,
  orderDate: Date
});
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

// Default products to seed if DB empty
const seedProducts = [
  { id: 1, brand: 'Brand A', name: 'Men Regular Fit Solid T-Shirt', price: 799, originalPrice: 1499, category: 'T-Shirts', rating: 4.3, ratingCount: 1200, image: 'https://placehold.co/300x400/EFEFEF/AAAAAA&text=Product1' },
  { id: 2, brand: 'Brand B', name: 'Men Slim Fit Casual Shirt', price: 1199, originalPrice: 1999, category: 'Shirts', rating: 4.1, ratingCount: 850, image: 'https://placehold.co/300x400/CD5C5C/FFFFFF&text=Product2' },
  { id: 3, brand: 'Brand A', name: 'Relaxed Fit Denim Jeans', price: 1499, originalPrice: 2999, category: 'Jeans', rating: 4.5, ratingCount: 2500, image: 'https://placehold.co/300x400/4682B4/FFFFFF&text=Product3' },
  { id: 4, brand: 'Brand C', name: 'Striped Polo T-Shirt', price: 899, originalPrice: 1799, category: 'T-Shirts', rating: 4.2, ratingCount: 980, image: 'https://placehold.co/300x400/2E8B57/FFFFFF&text=Product4' },
  { id: 5, brand: 'Brand B', name: 'Classic Blue Washed Jeans', price: 1699, originalPrice: 3199, category: 'Jeans', rating: 4.6, ratingCount: 3100, image: 'https://placehold.co/300x400/6A5ACD/FFFFFF&text=Product5' },
  { id: 6, brand: 'Brand C', name: 'Formal Checkered Shirt', price: 450, originalPrice: 999, category: 'Shirts', rating: 3.9, ratingCount: 500, image: 'https://placehold.co/300x400/D2B48C/FFFFFF&text=Product6' },
  { id: 7, brand: 'Brand A', name: 'Graphic Print T-Shirt', price: 480, originalPrice: 899, category: 'T-Shirts', rating: 4.0, ratingCount: 750, image: 'https://placehold.co/300x400/708090/FFFFFF&text=Product7' },
  { id: 8, brand: 'Brand D', name: 'Cargo Style Trousers', price: 1999, originalPrice: 3499, category: 'Jeans', rating: 4.7, ratingCount: 4200, image: 'https://placehold.co/300x400/5F9EA0/FFFFFF&text=Product8' }
];

// Initialize session cart helper
function getSessionCart(req) {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  return req.session.cart;
}


// 5. API ROUTES / ENDPOINTS

// ====== PRODUCT ENDPOINTS ======

// GET /api/products - Retrieve all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ id: 1 }).lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// GET /api/products/:id - Retrieve a single product by its ID
app.get('/api/products/:id', async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  try {
    const product = await Product.findOne({ id: productId }).lean();
    if (product) return res.json(product);
    return res.status(404).json({ message: 'Product not found' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});


// ====== CART MANAGEMENT ENDPOINTS ======

// GET /api/cart - Retrieve all items in the cart
app.get('/api/cart', (req, res) => {
  const cart = getSessionCart(req);
  res.json(cart);
});

// POST /api/cart - Add an item to the cart
app.post('/api/cart', async (req, res) => {
  const { productId, quantity } = req.body;
  const qty = parseInt(quantity || 1, 10);
  if (!productId || qty <= 0) {
    return res.status(400).json({ message: 'Invalid product or quantity' });
  }
  try {
    const product = await Product.findOne({ id: productId }).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const cart = getSessionCart(req);
    const existingItem = cart.find((item) => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      cart.push({ productId, name: product.name, price: product.price, quantity: qty });
    }
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add to cart' });
  }
});

// PUT /api/cart/:productId - Update the quantity of a cart item
app.put('/api/cart/:productId', (req, res) => {
  const productId = parseInt(req.params.productId, 10);
  const { quantity } = req.body;
  const qty = parseInt(quantity, 10);
  const cart = getSessionCart(req);
  const cartItem = cart.find((item) => item.productId === productId);

  if (!cartItem) return res.status(404).json({ message: 'Item not found in cart' });

  if (qty <= 0) {
    const index = cart.findIndex((i) => i.productId === productId);
    if (index > -1) cart.splice(index, 1);
  } else {
    cartItem.quantity = qty;
  }
  res.json(cart);
});

// DELETE /api/cart/:productId - Remove an item from the cart
app.delete('/api/cart/:productId', (req, res) => {
  const productId = parseInt(req.params.productId, 10);
  const cart = getSessionCart(req);
  const itemIndex = cart.findIndex((item) => item.productId === productId);
  if (itemIndex > -1) {
    cart.splice(itemIndex, 1);
    return res.json(cart);
  }
  return res.status(404).json({ message: 'Item not found in cart' });
});


// ====== CHECKOUT ENDPOINT ======

// POST /api/checkout - Process checkout and create an order
app.post('/api/checkout', async (req, res) => {
  const { customerInfo } = req.body;
  const cart = getSessionCart(req);
  if (!customerInfo || !customerInfo.name || !customerInfo.address) {
    return res.status(400).json({ message: 'Customer information is required.' });
  }
  if (!cart || cart.length === 0) {
    return res.status(400).json({ message: 'Cannot checkout with an empty cart.' });
  }
  try {
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderPayload = {
      orderId: `YS${Date.now()}`,
      customerInfo,
      items: [...cart],
      totalAmount,
      orderDate: new Date()
    };
    const saved = await Order.create(orderPayload);
    req.session.cart = [];
    res.status(201).json({ message: 'Checkout successful! Order has been placed.', order: saved });
  } catch (err) {
    res.status(500).json({ message: 'Failed to place order' });
  }
});


// ====== ROOT ROUTE ======
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the E-commerce API' });
});


// 6. Start the Server (DB connect -> seed -> listen)
async function start() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: undefined });
    // Seed products if empty
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(seedProducts);
      console.log('Seeded default products');
    }
    app.listen(PORT, () => {
      console.log(`Server is running successfully on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}
start();