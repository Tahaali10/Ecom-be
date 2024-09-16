const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/multerConfig');
const { getProducts, getProductById, addProduct, updateProduct, deleteProduct } = require('../controllers/productController');

router.route('/')
  .get(getProducts)
  .post(protect, admin, upload.single('image'), addProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, upload.single('image'), updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;
