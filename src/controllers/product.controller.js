// src/controllers/product.controller.js
import { prisma } from '../server.js';
import { generateSlug } from '../utils/generateSlug.js';

/**
 * GET /api/products
 * Obtener todos los productos con filtros opcionales
 */
export const getAllProducts = async (req, res, next) => {
  try {
    const { category, isNew, featured, search, sortBy, order } = req.query;

    const where = {};
    
    if (category) {
      const cat = await prisma.category.findUnique({
        where: { slug: category }
      });
      if (cat) where.categoryId = cat.id;
    }
    
    if (isNew === 'true') where.isNew = true;
    if (featured === 'true') where.featured = true;
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const orderBy = {};
    if (sortBy === 'price') {
      orderBy.price = order === 'desc' ? 'desc' : 'asc';
    } else if (sortBy === 'name') {
      orderBy.name = order === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        images: { orderBy: { order: 'asc' } },
        sizes: true,
        colors: true
      }
    });

    res.json({
      success: true,
      count: products.length,
      data: { products }
    });
  } catch (error) {
    console.error('Error en getAllProducts:', error);
    next(error);
  }
};

/**
 * GET /api/products/featured
 * Obtener productos destacados
 */
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { featured: true },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        images: { orderBy: { order: 'asc' } },
        sizes: true,
        colors: true
      },
      take: 8
    });

    res.json({
      success: true,
      count: products.length,
      data: { products }
    });
  } catch (error) {
    console.error('Error en getFeaturedProducts:', error);
    next(error);
  }
};

/**
 * GET /api/products/new
 * Obtener productos nuevos
 */
export const getNewProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { isNew: true },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        images: { orderBy: { order: 'asc' } },
        sizes: true,
        colors: true
      },
      take: 8
    });

    res.json({
      success: true,
      count: products.length,
      data: { products }
    });
  } catch (error) {
    console.error('Error en getNewProducts:', error);
    next(error);
  }
};

/**
 * GET /api/products/search
 * Buscar productos
 */
export const searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un término de búsqueda'
      });
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } }
        ]
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        images: { orderBy: { order: 'asc' } },
        sizes: true,
        colors: true
      }
    });

    res.json({
      success: true,
      count: products.length,
      data: { products }
    });
  } catch (error) {
    console.error('Error en searchProducts:', error);
    next(error);
  }
};

/**
 * GET /api/products/category/:categorySlug
 * Obtener productos por categoría
 */
export const getProductsByCategory = async (req, res, next) => {
  try {
    const { categorySlug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug: categorySlug }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    const products = await prisma.product.findMany({
      where: { categoryId: category.id },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        images: { orderBy: { order: 'asc' } },
        sizes: true,
        colors: true
      }
    });

    res.json({
      success: true,
      count: products.length,
      data: { products, category }
    });
  } catch (error) {
    console.error('Error en getProductsByCategory:', error);
    next(error);
  }
};

/**
 * GET /api/products/:id
 * Obtener producto por ID
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        images: { orderBy: { order: 'asc' } },
        sizes: true,
        colors: true
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Error en getProductById:', error);
    next(error);
  }
};

/**
 * GET /api/products/slug/:slug
 * Obtener producto por slug
 */
export const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        images: { orderBy: { order: 'asc' } },
        sizes: true,
        colors: true
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Error en getProductBySlug:', error);
    next(error);
  }
};

/**
 * POST /api/products
 * Crear nuevo producto (ADMIN)
 */
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      discount = 0,
      categoryId,
      isNew = false,
      featured = false,
      images = [],
      sizes = [],
      colors = []
    } = req.body;

    const slug = generateSlug(name);

    // Verificar si el slug ya existe
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un producto con ese nombre'
      });
    }

    // Crear producto con relaciones
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseInt(price),
        discount: parseInt(discount),
        categoryId,
        isNew,
        featured,
        images: {
          create: images.map((url, index) => ({
            url,
            isPrimary: index === 0,
            order: index
          }))
        },
        sizes: {
          create: sizes.map(s => ({
            size: s.size,
            stock: parseInt(s.stock || 0)
          }))
        },
        colors: {
          create: colors.map(color => ({ color }))
        }
      },
      include: {
        category: true,
        images: true,
        sizes: true,
        colors: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: { product }
    });
  } catch (error) {
    console.error('Error en createProduct:', error);
    next(error);
  }
};

/**
 * PUT /api/products/:id
 * Actualizar producto (ADMIN)
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      discount,
      categoryId,
      isNew,
      featured,
      images,
      sizes,
      colors
    } = req.body;

    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Generar nuevo slug si cambió el nombre
    let slug = existingProduct.slug;
    if (name && name !== existingProduct.name) {
      slug = generateSlug(name);
    }

    // Actualizar producto
    const updateData = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (description) updateData.description = description;
    if (price !== undefined) updateData.price = parseInt(price);
    if (discount !== undefined) updateData.discount = parseInt(discount);
    if (categoryId) updateData.categoryId = categoryId;
    if (isNew !== undefined) updateData.isNew = isNew;
    if (featured !== undefined) updateData.featured = featured;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        images: true,
        sizes: true,
        colors: true
      }
    });

    // Actualizar imágenes si se proporcionaron
    if (images && Array.isArray(images)) {
      await prisma.productImage.deleteMany({
        where: { productId: id }
      });
      await prisma.productImage.createMany({
        data: images.map((url, index) => ({
          productId: id,
          url,
          isPrimary: index === 0,
          order: index
        }))
      });
    }

    // Actualizar tallas si se proporcionaron
    if (sizes && Array.isArray(sizes)) {
      await prisma.productSize.deleteMany({
        where: { productId: id }
      });
      await prisma.productSize.createMany({
        data: sizes.map(s => ({
          productId: id,
          size: s.size,
          stock: parseInt(s.stock || 0)
        }))
      });
    }

    // Actualizar colores si se proporcionaron
    if (colors && Array.isArray(colors)) {
      await prisma.productColor.deleteMany({
        where: { productId: id }
      });
      await prisma.productColor.createMany({
        data: colors.map(color => ({
          productId: id,
          color
        }))
      });
    }

    // Obtener producto actualizado completo
    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        sizes: true,
        colors: true
      }
    });

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: { product: updatedProduct }
    });
  } catch (error) {
    console.error('Error en updateProduct:', error);
    next(error);
  }
};

/**
 * DELETE /api/products/:id
 * Eliminar producto (ADMIN)
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    await prisma.product.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en deleteProduct:', error);
    next(error);
  }
};