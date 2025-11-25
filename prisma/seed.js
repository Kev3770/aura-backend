// prisma/seed.js

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // ============= LIMPIAR BASE DE DATOS =============
  console.log('🗑️  Limpiando base de datos...');
  
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.productColor.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productSize.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Base de datos limpia');

  // ============= CREAR USUARIOS =============
  console.log('👥 Creando usuarios...');

  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedUserPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@aura.com',
      password: hashedAdminPassword,
      name: 'Administrador',
      role: 'ADMIN'
    }
  });

  const user = await prisma.user.create({
    data: {
      email: 'user@aura.com',
      password: hashedUserPassword,
      name: 'Usuario Demo',
      role: 'USER'
    }
  });

  console.log('✅ Usuarios creados:', admin.email, user.email);

  // ============= CREAR CATEGORÍAS =============
  console.log('📦 Creando categorías...');

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Camisas',
        slug: 'camisas',
        description: 'Camisas formales y casuales para toda ocasión'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Pantalones',
        slug: 'pantalones',
        description: 'Jeans, chinos y pantalones formales'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Chaquetas',
        slug: 'chaquetas',
        description: 'Chaquetas de cuero, bomber y casuales'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Blazers',
        slug: 'blazers',
        description: 'Blazers formales y elegantes'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Suéteres',
        slug: 'sueters',
        description: 'Suéteres de lana, algodón y cardigan'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Zapatos',
        slug: 'zapatos',
        description: 'Oxford, sneakers y botas'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Accesorios',
        slug: 'accesorios',
        description: 'Cinturones, gorras y carteras'
      }
    })
  ]);

  console.log('✅ Categorías creadas:', categories.length);

  // ============= CREAR PRODUCTOS =============
  console.log('🛍️  Creando productos...');

  // Obtener IDs de categorías
  const camisasId = categories.find(c => c.slug === 'camisas').id;
  const pantalonesId = categories.find(c => c.slug === 'pantalones').id;
  const chaquetasId = categories.find(c => c.slug === 'chaquetas').id;
  const blazersId = categories.find(c => c.slug === 'blazers').id;
  const suetersId = categories.find(c => c.slug === 'sueters').id;
  const zapatosId = categories.find(c => c.slug === 'zapatos').id;
  const accesoriosId = categories.find(c => c.slug === 'accesorios').id;

  // Array de productos con tus datos actuales
  const productsData = [
    {
      name: 'Camisa Oxford Blanca',
      slug: 'camisa-oxford-blanca',
      description: 'Camisa oxford de algodón premium. Corte slim fit, ideal para ocasiones formales y casuales.',
      price: 89900,
      discount: 0,
      categoryId: camisasId,
      isNew: true,
      featured: true,
      images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800'],
      sizes: [
        { size: 'S', stock: 5 },
        { size: 'M', stock: 8 },
        { size: 'L', stock: 3 },
        { size: 'XL', stock: 6 }
      ],
      colors: ['Blanco']
    },
    {
      name: 'Jean Slim Fit Oscuro',
      slug: 'jean-slim-fit-oscuro',
      description: 'Jean de mezclilla premium con corte slim fit. Perfecto para uso diario.',
      price: 129900,
      discount: 15,
      categoryId: pantalonesId,
      isNew: false,
      featured: true,
      images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=800'],
      sizes: [
        { size: '30', stock: 4 },
        { size: '32', stock: 7 },
        { size: '34', stock: 5 },
        { size: '36', stock: 3 }
      ],
      colors: ['Azul Oscuro']
    },
    {
      name: 'Chaqueta de Cuero Negra',
      slug: 'chaqueta-de-cuero-negra',
      description: 'Chaqueta de cuero genuino con forro interior. Estilo atemporal.',
      price: 459900,
      discount: 20,
      categoryId: chaquetasId,
      isNew: true,
      featured: true,
      images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'],
      sizes: [
        { size: 'S', stock: 2 },
        { size: 'M', stock: 4 },
        { size: 'L', stock: 3 },
        { size: 'XL', stock: 2 }
      ],
      colors: ['Negro']
    },
    {
      name: 'Blazer Formal Gris',
      slug: 'blazer-formal-gris',
      description: 'Blazer de lana virgen con forro de seda. Corte europeo moderno.',
      price: 329900,
      discount: 0,
      categoryId: blazersId,
      isNew: false,
      featured: true,
      images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800'],
      sizes: [
        { size: 'S', stock: 3 },
        { size: 'M', stock: 5 },
        { size: 'L', stock: 4 },
        { size: 'XL', stock: 2 }
      ],
      colors: ['Gris']
    },
    {
      name: 'Suéter de Lana Merino',
      slug: 'sueter-de-lana-merino',
      description: 'Suéter de lana merino extrafina. Suave al tacto y perfecto para el invierno.',
      price: 159900,
      discount: 10,
      categoryId: suetersId,
      isNew: true,
      featured: false,
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800'],
      sizes: [
        { size: 'S', stock: 6 },
        { size: 'M', stock: 8 },
        { size: 'L', stock: 5 },
        { size: 'XL', stock: 4 }
      ],
      colors: ['Azul Marino']
    },
    {
      name: 'Zapatos Oxford Café',
      slug: 'zapatos-oxford-cafe',
      description: 'Zapatos Oxford de cuero italiano. Elegancia clásica para eventos formales.',
      price: 279900,
      discount: 0,
      categoryId: zapatosId,
      isNew: false,
      featured: true,
      images: ['https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800'],
      sizes: [
        { size: '39', stock: 3 },
        { size: '40', stock: 4 },
        { size: '41', stock: 5 },
        { size: '42', stock: 3 },
        { size: '43', stock: 2 }
      ],
      colors: ['Café']
    },
    {
      name: 'Cinturón de Cuero Negro',
      slug: 'cinturon-de-cuero-negro',
      description: 'Cinturón de cuero genuino con hebilla plateada. Reversible negro/café.',
      price: 69900,
      discount: 0,
      categoryId: accesoriosId,
      isNew: false,
      featured: false,
      images: ['https://images.unsplash.com/photo-1624222247344-550fb60583bb?w=800'],
      sizes: [
        { size: 'M', stock: 10 },
        { size: 'L', stock: 8 },
        { size: 'XL', stock: 5 }
      ],
      colors: ['Negro', 'Café']
    },
    {
      name: 'Camisa de Lino Azul',
      slug: 'camisa-de-lino-azul',
      description: 'Camisa de lino 100% natural. Fresca y perfecta para climas cálidos.',
      price: 99900,
      discount: 0,
      categoryId: camisasId,
      isNew: true,
      featured: false,
      images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800'],
      sizes: [
        { size: 'S', stock: 7 },
        { size: 'M', stock: 10 },
        { size: 'L', stock: 6 },
        { size: 'XL', stock: 4 }
      ],
      colors: ['Azul Cielo']
    },
    {
      name: 'Pantalón Chino Beige',
      slug: 'pantalon-chino-beige',
      description: 'Pantalón chino de algodón premium. Versátil para look casual o semi-formal.',
      price: 119900,
      discount: 0,
      categoryId: pantalonesId,
      isNew: false,
      featured: false,
      images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800'],
      sizes: [
        { size: '30', stock: 5 },
        { size: '32', stock: 8 },
        { size: '34', stock: 6 },
        { size: '36', stock: 4 }
      ],
      colors: ['Beige']
    },
    {
      name: 'Chaqueta Bomber Verde',
      slug: 'chaqueta-bomber-verde',
      description: 'Chaqueta bomber de nylon impermeable. Estilo urbano y funcional.',
      price: 189900,
      discount: 25,
      categoryId: chaquetasId,
      isNew: true,
      featured: false,
      images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800'],
      sizes: [
        { size: 'S', stock: 4 },
        { size: 'M', stock: 6 },
        { size: 'L', stock: 5 },
        { size: 'XL', stock: 3 }
      ],
      colors: ['Verde Militar']
    },
    {
      name: 'Blazer Azul Marino',
      slug: 'blazer-azul-marino',
      description: 'Blazer clásico de mezcla de lana. Botones dorados y corte tradicional.',
      price: 349900,
      discount: 0,
      categoryId: blazersId,
      isNew: false,
      featured: false,
      images: ['https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800'],
      sizes: [
        { size: 'S', stock: 2 },
        { size: 'M', stock: 4 },
        { size: 'L', stock: 3 },
        { size: 'XL', stock: 2 }
      ],
      colors: ['Azul Marino']
    },
    {
      name: 'Cardigan de Algodón',
      slug: 'cardigan-de-algodon',
      description: 'Cardigan ligero de algodón. Perfecto para entretiempo.',
      price: 139900,
      discount: 15,
      categoryId: suetersId,
      isNew: false,
      featured: false,
      images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800'],
      sizes: [
        { size: 'S', stock: 5 },
        { size: 'M', stock: 7 },
        { size: 'L', stock: 6 },
        { size: 'XL', stock: 4 }
      ],
      colors: ['Gris']
    },
    {
      name: 'Sneakers Blancos Premium',
      slug: 'sneakers-blancos-premium',
      description: 'Sneakers de cuero blanco minimalista. Cómodos y versátiles.',
      price: 229900,
      discount: 0,
      categoryId: zapatosId,
      isNew: true,
      featured: true,
      images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800'],
      sizes: [
        { size: '39', stock: 4 },
        { size: '40', stock: 6 },
        { size: '41', stock: 7 },
        { size: '42', stock: 5 },
        { size: '43', stock: 3 }
      ],
      colors: ['Blanco']
    },
    {
      name: 'Gorra de Béisbol',
      slug: 'gorra-de-beisbol',
      description: 'Gorra de algodón con logo bordado. Ajustable y cómoda.',
      price: 49900,
      discount: 0,
      categoryId: accesoriosId,
      isNew: false,
      featured: false,
      images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800'],
      sizes: [
        { size: 'Única', stock: 20 }
      ],
      colors: ['Negro', 'Blanco', 'Azul']
    },
    {
      name: 'Camisa Negra Formal',
      slug: 'camisa-negra-formal',
      description: 'Camisa de vestir negra. Elegancia y sofisticación para eventos especiales.',
      price: 109900,
      discount: 10,
      categoryId: camisasId,
      isNew: false,
      featured: false,
      images: ['https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800'],
      sizes: [
        { size: 'S', stock: 4 },
        { size: 'M', stock: 6 },
        { size: 'L', stock: 5 },
        { size: 'XL', stock: 3 }
      ],
      colors: ['Negro']
    }
  ];

  // Crear productos con relaciones
  for (const productData of productsData) {
    const { images, sizes, colors, ...productInfo } = productData;

    const product = await prisma.product.create({
      data: {
        ...productInfo,
        images: {
          create: images.map((url, index) => ({
            url,
            isPrimary: index === 0,
            order: index
          }))
        },
        sizes: {
          create: sizes
        },
        colors: {
          create: colors.map(color => ({ color }))
        }
      }
    });

    console.log(`  ✅ ${product.name}`);
  }

  console.log('✅ Productos creados:', productsData.length);

  console.log('\n🎉 Seed completado exitosamente!\n');
  console.log('📊 Resumen:');
  console.log(`   - Usuarios: 2 (admin@aura.com, user@aura.com)`);
  console.log(`   - Categorías: ${categories.length}`);
  console.log(`   - Productos: ${productsData.length}`);
  console.log('\n🔐 Credenciales:');
  console.log('   Admin: admin@aura.com / admin123');
  console.log('   User:  user@aura.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });