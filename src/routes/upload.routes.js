// src/routes/upload.routes.js

import express from 'express';
import { uploadImage, deleteImage } from '../controllers/upload.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// POST /api/upload/image - Subir imagen (solo ADMIN)
router.post('/image', protect, authorize('ADMIN'), uploadImage);

// DELETE /api/upload/image - Eliminar imagen (solo ADMIN)
router.delete('/image', protect, authorize('ADMIN'), deleteImage);

export default router;