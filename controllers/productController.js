const Product = require('../models/Product');
const multer = require('multer');

// @route    GET api/products
// @desc     Get all products
// @access   Public
// @route    GET api/products
// @desc     Get all products optionally filtered by subcategory
// @access   Public
exports.getProducts = async (req, res) => {
  const categoryFilter = req.query.category ? { category: req.query.category } : {};
  
  try {
    const products = await Product.find(categoryFilter);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};


// @route    GET api/products/:id
// @desc     Get product by ID
// @access   Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) { 
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// @route    POST api/products
// @desc     Create a product
// @access   Private
exports.addProduct = async (req, res) => {
  try {
    const { name, price, category, subcategory } = req.body;
    
    // Check if file is provided
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required.' });
    }

    // Use the file path from Multer
    const imageUrl = req.file.path;

    const product = new Product({
      name,
      price,
      category,
      subcategory,
      imageUrl
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error adding product', error: error.message });
  }
};

// @route    PUT api/products/:id
// @desc     Update a product
// @access   Private
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, category, subcategory } = req.body;
    let imageUrl = req.file ? req.file.path : undefined;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.name = name || product.name;
    product.price = price || product.price;
    product.category = category || product.category;
    product.subcategory = subcategory || product.subcategory;
    if (imageUrl) {
      product.imageUrl = imageUrl; // Update only if new image is uploaded
    }

    await product.save();
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error updating product', error: error.message });
  }
};

// @route    DELETE api/products/:id
// @desc     Delete a product
// @access   Private
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};
