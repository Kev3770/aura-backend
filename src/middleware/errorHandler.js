// src/middleware/errorHandler.js

/**
 * Middleware global de manejo de errores
 */
export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Error de Prisma - Registro duplicado
  if (err.code === 'P2002') {
    return res.status(400).json({
      success: false,
      message: `El ${err.meta?.target?.[0] || 'campo'} ya existe`,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Error de Prisma - Registro no encontrado
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registro no encontrado',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors
    });
  }

  // Error genérico
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Error del servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};