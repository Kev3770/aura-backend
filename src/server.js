// src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './config/database.js';

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import adminRoutes from './routes/admin.routes.js';
import uploadRoutes from './routes/upload.routes.js';

// Importar middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

// Cargar variables de entorno
dotenv.config();

// Crear app de Express
const app = express();

// ============= MIDDLEWARES GLOBALES =============
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============= HEALTH CHECK (para Render) =============
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Aura Backend API'
  });
});

// ============= RUTA PRINCIPAL =============
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Aura funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      cart: '/api/cart',
      orders: '/api/orders',
      admin: '/api/admin',
      upload: '/api/upload'
    },
  });
});

// ============= RUTAS DE LA API =============
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// ============= MANEJO DE ERRORES =============
app.use(notFound);
app.use(errorHandler);

// ============= INICIAR SERVIDOR =============
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n🚀 ======================================');
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log('🚀 ======================================\n');
});
  
export { prisma };

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Error no manejado:', err);
  process.exit(1);
});
