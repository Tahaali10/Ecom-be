const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

exports.addProduct = async (req, res) => {
    try {
        const { name, price, category, subcategory } = req.body;
        if (!req.file) {
            return res.status(400).send('Image is required.');
        }
        const result = await cloudinary.uploader.upload_stream({
            resource_type: 'image'
        }, (error, result) => {
            if (error) return res.status(500).send('Cloudinary upload failed');

            const product = new Product({
                name,
                price,
                category,
                subcategory,
                imageUrl: result.secure_url,
                imagePublicId: result.public_id
            });

            product.save();
            res.status(201).json(product);
        });
        req.file.stream.pipe(result);
    } catch (error) {
        console.error(error);
        res.status(400).send('Error processing request');
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { name, price, category, subcategory } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        if (req.file) {
            await cloudinary.uploader.destroy(product.imagePublicId);
            const result = await cloudinary.uploader.upload_stream(req.file.path);
            product.imageUrl = result.secure_url;
            product.imagePublicId = result.public_id;
        }

        product.name = name;
        product.price = price;
        product.category = category;
        product.subcategory = subcategory;

        await product.save();
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(400).send('Error updating product');
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        await cloudinary.uploader.destroy(product.imagePublicId);
        res.send('Product removed');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};
