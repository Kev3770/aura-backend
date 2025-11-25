// src/controllers/upload.controller.js

import cloudinary from '../config/cloudinary.js';

/**
 * POST /api/upload/image
 * Subir imagen a Cloudinary y retornar URL
 */
export const uploadImage = async (req, res, next) => {
  try {
    const { image } = req.body; // base64 desde el frontend

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen'
      });
    }

    // Validar que sea una imagen
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: 'El archivo debe ser una imagen válida'
      });
    }

    console.log('📤 Subiendo imagen a Cloudinary...');

    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: 'aura-products',           // Carpeta en Cloudinary
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' }, // Máximo 1200x1200px
        { quality: 'auto:good' },                      // Calidad automática
        { fetch_format: 'auto' }                       // WebP si es compatible
      ]
    });

    console.log('✅ Imagen subida:', result.secure_url);

    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        imageUrl: result.secure_url,  // URL pública de la imagen
        publicId: result.public_id    // ID para eliminarla después
      }
    });
  } catch (error) {
    console.error('❌ Error subiendo a Cloudinary:', error);
    next(error);
  }
};

/**
 * DELETE /api/upload/image
 * Eliminar imagen de Cloudinary
 */
export const deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó el ID de la imagen'
      });
    }

    console.log('🗑️  Eliminando imagen de Cloudinary:', publicId);

    await cloudinary.uploader.destroy(publicId);

    console.log('✅ Imagen eliminada');

    res.json({
      success: true,
      message: 'Imagen eliminada correctamente'
    });
  } catch (error) {
    console.error('❌ Error eliminando imagen:', error);
    next(error);
  }
};