const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');

async function readJSON(file) {
  try {
    const data = await fs.readFile(file, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeJSON(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

// USERS
app.get('/api/users', async (req, res) => res.json(await readJSON(USERS_FILE)));

app.post('/api/users', async (req, res) => {
  const users = await readJSON(USERS_FILE);
  const newUser = { id: Date.now(), ...req.body };
  users.push(newUser);
  await writeJSON(USERS_FILE, users);
  res.json({ success: true, user: newUser });
});

app.put('/api/users/:id', async (req, res) => {
  const users = await readJSON(USERS_FILE);
  const idx = users.findIndex(u => u.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  users[idx] = { ...users[idx], ...req.body };
  await writeJSON(USERS_FILE, users);
  res.json({ success: true, user: users[idx] });
});

app.delete('/api/users/:id', async (req, res) => {
  let users = await readJSON(USERS_FILE);
  users = users.filter(u => u.id != req.params.id);
  await writeJSON(USERS_FILE, users);
  res.json({ success: true });
});


app.get('/api/products', async (req, res) => res.json(await readJSON(PRODUCTS_FILE)));

app.get('/api/products/:id', async (req, res) => {
  const products = await readJSON(PRODUCTS_FILE);
  const product = products.find(p => p.id == req.params.id);
  product ? res.json(product) : res.status(404).json({ error: 'Not found' });
});

app.post('/api/products', async (req, res) => {
  const products = await readJSON(PRODUCTS_FILE);
  const newProduct = { id: Date.now(), ...req.body };
  products.push(newProduct);
  await writeJSON(PRODUCTS_FILE, products);
  res.json({ success: true, product: newProduct });
});

app.put('/api/products/:id', async (req, res) => {
  const products = await readJSON(PRODUCTS_FILE);
  const idx = products.findIndex(p => p.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  products[idx] = { ...products[idx], ...req.body };
  await writeJSON(PRODUCTS_FILE, products);
  res.json({ success: true, product: products[idx] });
});

app.delete('/api/products/:id', async (req, res) => {
  let products = await readJSON(PRODUCTS_FILE);
  products = products.filter(p => p.id != req.params.id);
  await writeJSON(PRODUCTS_FILE, products);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`🚀 Funkwave server running at http://localhost:${PORT}`));