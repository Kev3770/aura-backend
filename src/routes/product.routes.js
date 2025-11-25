// src/routes/product.routes.js
import express from 'express';
import {
  getAllProducts,
  getProductById,
  getProductBySlug,
  getProductsByCategory,
  getFeaturedProducts,
  getNewProducts,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validateProduct } from '../middleware/validate.js';

const router = express.Router();

// Rutas públicas
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new', getNewProducts);
router.get('/search', searchProducts);
router.get('/category/:categorySlug', getProductsByCategory);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);

// Rutas protegidas (ADMIN)
router.post('/', protect, authorize('ADMIN'), validateProduct, createProduct);
router.put('/:id', protect, authorize('ADMIN'), validateProduct, updateProduct);
router.delete('/:id', protect, authorize('ADMIN'), deleteProduct);

export default router;