const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Category = require('./models/Category');
const Product = require('./models/Product');

const app = express();
const PORT = process.env.PORT || 3007;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to DB with fallback
async function connectDB() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/shopping_cart_db', { serverSelectionTimeoutMS: 2000 });
    console.log('Connected to Local MongoDB (shopping_cart_db)');
  } catch (err) {
    console.log('Local MongoDB not running. Launching MongoMemoryServer...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    console.log('Connected to MongoMemoryServer');
  }

  // Seed initial 2-level Category structure & Products if empty
  const catCount = await Category.countDocuments();
  if (catCount === 0) {
    console.log('Seeding initial 2-level Categories & Sample Products...');
    // Level 1: Main Categories
    const electronics = await Category.create({ name: 'Electronics', parentCategory: null });
    const fashion = await Category.create({ name: 'Fashion', parentCategory: null });

    // Level 2: Subcategories
    const laptops = await Category.create({ name: 'Laptops & Computers', parentCategory: electronics._id });
    const smartphones = await Category.create({ name: 'Smartphones & Mobile', parentCategory: electronics._id });
    const mensClothing = await Category.create({ name: "Men's Clothing", parentCategory: fashion._id });

    // Sample Products
    await Product.create([
      {
        title: 'MacBook Pro 16"',
        description: 'M3 Max chip, 36GB RAM, 1TB SSD',
        price: 2499,
        category: electronics._id,
        subcategory: laptops._id,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
        stock: 15
      },
      {
        title: 'iPhone 15 Pro',
        description: 'Titanium design, A17 Pro chip, 256GB',
        price: 999,
        category: electronics._id,
        subcategory: smartphones._id,
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
        stock: 25
      },
      {
        title: 'Classic Denim Jacket',
        description: '100% Cotton vintage wash jacket',
        price: 89,
        category: fashion._id,
        subcategory: mensClothing._id,
        image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400',
        stock: 40
      }
    ]);
    console.log('Seeding complete!');
  }
}
connectDB();

// --- CATEGORY API ROUTES ---
// GET all categories (returns parents and subcategories)
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find().populate('parentCategory');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// POST add category (Main or Subcategory)
app.post('/api/categories', async (req, res) => {
  try {
    const { name, parentCategory } = req.body;
    const category = new Category({
      name,
      parentCategory: parentCategory || null
    });
    await category.save();
    const populated = await Category.findById(category._id).populate('parentCategory');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Error creating category' });
  }
});

// DELETE category
app.delete('/api/categories/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting category' });
  }
});

// --- PRODUCT API ROUTES ---
// GET products (with filtering support for main category or subcategory)
app.get('/api/products', async (req, res) => {
  try {
    const { category, subcategory } = req.query;
    let query = {};
    if (subcategory) {
      query.subcategory = subcategory;
    } else if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .populate('category')
      .populate('subcategory');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// POST add product
app.post('/api/products', async (req, res) => {
  try {
    const { title, description, price, category, subcategory, image, stock } = req.body;
    const newProduct = new Product({
      title,
      description,
      price: parseFloat(price),
      category,
      subcategory,
      image: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      stock: parseInt(stock) || 10
    });

    await newProduct.save();
    const populated = await Product.findById(newProduct._id).populate('category').populate('subcategory');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Error creating product' });
  }
});

// DELETE product
app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// Fallback to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Q7 MERN Shopping Cart Server running on http://localhost:${PORT}`);
});
