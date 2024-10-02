const Product = require('../models/Product');

// Get all products
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

// Get product by ID
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

// Create a product
exports.addProduct = async (req, res) => {
  try {
    const { name, price, category, subcategory } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required.' });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

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

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, category, subcategory } = req.body;
    let imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : undefined;

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

// Delete a product
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
