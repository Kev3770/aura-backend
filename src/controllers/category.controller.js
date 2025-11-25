// src/controllers/category.controller.js
import { prisma } from '../server.js';
import { generateSlug } from '../utils/generateSlug.js';

/**
 * GET /api/categories
 * Obtener todas las categorías
 */
export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      count: categories.length,
      data: { categories }
    });
  } catch (error) {
    console.error('Error en getAllCategories:', error);
    next(error);
  }
};

/**
 * GET /api/categories/:id
 * Obtener categoría por ID
 */
export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            images: { orderBy: { order: 'asc' } },
            sizes: true,
            colors: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    console.error('Error en getCategoryById:', error);
    next(error);
  }
};

/**
 * GET /api/categories/slug/:slug
 * Obtener categoría por slug
 */
export const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          include: {
            images: { orderBy: { order: 'asc' } },
            sizes: true,
            colors: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    console.error('Error en getCategoryBySlug:', error);
    next(error);
  }
};

/**
 * POST /api/categories
 * Crear nueva categoría (ADMIN)
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la categoría es requerido'
      });
    }

    const slug = generateSlug(name);

    // Verificar si ya existe
    const existing = await prisma.category.findUnique({
      where: { slug }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una categoría con ese nombre'
      });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image
      }
    });

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: { category }
    });
  } catch (error) {
    console.error('Error en createCategory:', error);
    next(error);
  }
};

/**
 * PUT /api/categories/:id
 * Actualizar categoría (ADMIN)
 */
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, image } = req.body;

    const existing = await prisma.category.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = generateSlug(name);
    }
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;

    const category = await prisma.category.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: { category }
    });
  } catch (error) {
    console.error('Error en updateCategory:', error);
    next(error);
  }
};

/**
 * DELETE /api/categories/:id
 * Eliminar categoría (ADMIN)
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    if (category._count.products > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar. La categoría tiene ${category._count.products} productos asociados`
      });
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error en deleteCategory:', error);
    next(error);
  }
};