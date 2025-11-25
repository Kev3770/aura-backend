// test-connection.js
// Crear este archivo en la raíz de aura-backend

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔄 Intentando conectar a MongoDB...');
    
    // Intenta hacer una consulta simple
    await prisma.$connect();
    
    console.log('✅ ¡Conexión exitosa a MongoDB!');
    console.log('📊 Base de datos: aura_db');
    console.log('🌐 Puerto: 27017');
    
    // Contar documentos en cada colección
    const usersCount = await prisma.user.count();
    const productsCount = await prisma.product.count();
    const categoriesCount = await prisma.category.count();
    const ordersCount = await prisma.order.count();
    
    console.log('\n📈 Estado de las colecciones:');
    console.log(`   - Users: ${usersCount} documentos`);
    console.log(`   - Products: ${productsCount} documentos`);
    console.log(`   - Categories: ${categoriesCount} documentos`);
    console.log(`   - Orders: ${ordersCount} documentos`);
    
    if (productsCount === 0) {
      console.log('\n💡 Próximo paso: Ejecuta el seed para cargar los 15 productos');
      console.log('   Comando: npm run seed');
    }
    
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:');
    console.error(error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Solución: Asegúrate de que MongoDB esté corriendo:');
      console.log('   Comando: mongod');
    }
    
  } finally {
    await prisma.$disconnect();
    console.log('\n👋 Desconectado de MongoDB');
  }
}

testConnection();