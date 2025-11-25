// src/config/database.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Probar conexión
prisma.$connect()
  .then(() => {
    console.log('✅ Base de datos conectada correctamente');
  })
  .catch((error) => {
    console.error('❌ Error conectando a la base de datos:', error);
    process.exit(1);
  });

export default prisma;