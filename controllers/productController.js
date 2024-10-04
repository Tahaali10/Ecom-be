const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload_stream((error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ message: 'Cloudinary upload failed', error: error.message });
      }

      const product = new Product({
        name,
        price,
        category,
        subcategory,
        imageUrl: result.secure_url,
      });

      product.save().then(() => {
        res.status(201).json(product);
      }).catch((saveError) => {
        console.error(saveError);
        res.status(500).json({ message: 'Error saving product', error: saveError.message });
      });
    });

    result.end(req.file.buffer);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding product', error: error.message });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, category, subcategory } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (req.file) {
      // Upload new image to Cloudinary if provided
      const result = await cloudinary.uploader.upload_stream((error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ message: 'Cloudinary upload failed', error: error.message });
        }

        // Update product image URL
        product.imageUrl = result.secure_url;

        product.name = name || product.name;
        product.price = price || product.price;
        product.category = category || product.category;
        product.subcategory = subcategory || product.subcategory;

        product.save().then(() => {
          res.json(product);
        }).catch((saveError) => {
          console.error(saveError);
          res.status(500).json({ message: 'Error saving product', error: saveError.message });
        });
      });

      result.end(req.file.buffer);
    } else {
      product.name = name || product.name;
      product.price = price || product.price;
      product.category = category || product.category;
      product.subcategory = subcategory || product.subcategory;

      await product.save();
      res.json(product);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
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
