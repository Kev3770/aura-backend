// src/routes/order.routes.js
import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
} from '../controllers/order.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Rutas de usuario
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

// Rutas de admin
router.get('/', protect, authorize('ADMIN'), getAllOrders);
router.put('/:id/status', protect, authorize('ADMIN'), updateOrderStatus);

export default router;