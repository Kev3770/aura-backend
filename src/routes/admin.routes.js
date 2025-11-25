// src/routes/admin.routes.js
import express from 'express';
import { getStats } from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Todas las rutas requieren ser ADMIN
router.get('/stats', protect, authorize('ADMIN'), getStats);

export default router;