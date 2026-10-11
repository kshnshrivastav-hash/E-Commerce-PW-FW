// Local shop API used for API, negative and regression tests.
// Mirrors the demo store's catalogue and users. Data lives in memory.
const express = require('express');

const app = express();
app.use(express.json());

const PORT = 4100;
const TAX_RATE = 0.08;
const MAX_QTY = 10;

const products = [
  { id: 1, name: 'Sauce Labs Backpack', price: 29.99 },
  { id: 2, name: 'Sauce Labs Bike Light', price: 9.99 },
  { id: 3, name: 'Sauce Labs Bolt T-Shirt', price: 15.99 },
  { id: 4, name: 'Sauce Labs Fleece Jacket', price: 49.99 },
  { id: 5, name: 'Sauce Labs Onesie', price: 7.99 },
  { id: 6, name: 'Test.allTheThings() T-Shirt (Red)', price: 15.99 },
];

const users = {
  standard_user: { password: 'secret_sauce', locked: false },
  problem_user: { password: 'secret_sauce', locked: false },
  locked_out_user: { password: 'secret_sauce', locked: true },
};

let sessions = new Map(); // token -> { username, cart: Map(productId -> quantity) }
let orders = new Map();   // orderId -> order
let orderSeq = 5000;
const money = (n) => Math.round(n * 100) / 100;

app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/__reset', (req, res) => {
  sessions = new Map();
  orders = new Map();
  orderSeq = 5000;
  res.json({ reset: true });
});

// ---------- Authentication ----------
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return res.status(400).json({ error: 'username_and_password_required' });
  }
  const user = users[username];
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }
  if (user.locked) {
    return res.status(403).json({ error: 'user_locked_out' });
  }
  const token = 'tok_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  sessions.set(token, { username, cart: new Map() });
  res.json({ token, username });
});

function auth(req, res, next) {
  const header = req.get('Authorization');
  if (!header) return res.status(401).json({ error: 'missing_token' });
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const session = sessions.get(token);
  if (!session) return res.status(401).json({ error: 'invalid_token' });
  req.session = session;
  next();
}

// ---------- Products (public) ----------
app.get('/products', (req, res) => {
  const { q, sort, order = 'asc' } = req.query;
  let items = [...products];

  if (q) {
    const term = String(q).toLowerCase();
    items = items.filter((p) => p.name.toLowerCase().includes(term));
  }
  if (sort !== undefined) {
    if (!['price', 'name'].includes(String(sort)) || !['asc', 'desc'].includes(String(order))) {
      return res.status(400).json({ error: 'invalid_sort' });
    }
    const dir = order === 'desc' ? -1 : 1;
    items.sort((a, b) => (a[sort] > b[sort] ? 1 : a[sort] < b[sort] ? -1 : 0) * dir);
  }

  const total = items.length;
  const offset = req.query.offset === undefined ? 0 : Number(req.query.offset);
  const limit = req.query.limit === undefined ? Number.MAX_SAFE_INTEGER : Number(req.query.limit);
  if (!Number.isInteger(offset) || offset < 0 || !Number.isInteger(limit) || limit < 1) {
    return res.status(400).json({ error: 'invalid_pagination' });
  }
  res.json({ total, items: items.slice(offset, offset + limit) });
});

app.get('/products/:id', (req, res) => {
  const product = products.find((p) => String(p.id) === req.params.id);
  if (!product) return res.status(404).json({ error: 'product_not_found' });
  res.json(product);
});

// ---------- Cart (needs a token) ----------
function cartView(session) {
  const items = [...session.cart.entries()].map(([productId, quantity]) => {
    const p = products.find((x) => x.id === productId);
    return { productId, name: p.name, price: p.price, quantity, lineTotal: money(p.price * quantity) };
  });
  const subtotal = money(items.reduce((sum, i) => sum + i.lineTotal, 0));
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  return { items, itemCount, subtotal };
}

app.get('/cart', auth, (req, res) => res.json(cartView(req.session)));

app.post('/cart/items', auth, (req, res) => {
  const { productId, quantity = 1 } = req.body || {};
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
    return res.status(422).json({ error: 'invalid_quantity' });
  }
  const product = products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ error: 'product_not_found' });
  const current = req.session.cart.get(productId) || 0;
  if (current + quantity > MAX_QTY) {
    return res.status(422).json({ error: 'quantity_limit_exceeded' });
  }
  req.session.cart.set(productId, current + quantity);
  res.status(201).json(cartView(req.session));
});

app.delete('/cart/items/:productId', auth, (req, res) => {
  const productId = Number(req.params.productId);
  if (!req.session.cart.has(productId)) {
    return res.status(404).json({ error: 'item_not_in_cart' });
  }
  req.session.cart.delete(productId);
  res.json(cartView(req.session));
});

// ---------- Orders (checkout) ----------
app.post('/orders', auth, (req, res) => {
  const body = req.body || {};
  if (req.session.cart.size === 0) {
    return res.status(409).json({ error: 'cart_empty' });
  }
  for (const field of ['firstName', 'lastName', 'postalCode']) {
    if (typeof body[field] !== 'string' || body[field].trim() === '') {
      return res.status(422).json({ error: 'missing_field', field });
    }
  }
  const cart = cartView(req.session);
  const tax = money(cart.subtotal * TAX_RATE);
  const id = 'ORD-' + (++orderSeq);
  const order = {
    id,
    username: req.session.username,
    items: cart.items,
    subtotal: cart.subtotal,
    tax,
    total: money(cart.subtotal + tax),
    shipping: { firstName: body.firstName, lastName: body.lastName, postalCode: body.postalCode },
    status: 'CONFIRMED',
  };
  orders.set(id, order);
  req.session.cart.clear();
  res.status(201).json(order);
});

app.get('/orders/:id', auth, (req, res) => {
  const order = orders.get(req.params.id);
  if (!order) return res.status(404).json({ error: 'order_not_found' });
  if (order.username !== req.session.username) return res.status(403).json({ error: 'forbidden' });
  res.json(order);
});

// Malformed JSON bodies get a JSON error instead of an HTML page
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'invalid_json' });
  }
  next(err);
});

app.listen(PORT, () => console.log('Shop API running on http://localhost:' + PORT));
