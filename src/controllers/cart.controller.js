// src/controllers/cart.controller.js
import { prisma } from '../server.js';

/**
 * GET /api/cart
 * Obtener carrito del usuario
 */
export const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { orderBy: { order: 'asc' }, take: 1 },
            sizes: true,
            category: { select: { name: true, slug: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calcular totales
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.product.price;
      const discount = item.product.discount || 0;
      const finalPrice = price - (price * discount / 100);
      return sum + (finalPrice * item.quantity);
    }, 0);

    res.json({
      success: true,
      data: {
        cartItems,
        summary: {
          itemCount: cartItems.length,
          totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
          subtotal,
          shipping: 0,
          total: subtotal
        }
      }
    });
  } catch (error) {
    console.error('Error en getCart:', error);
    next(error);
  }
};

/**
 * POST /api/cart/add
 * Agregar producto al carrito
 */
export const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, size, quantity = 1 } = req.body;

    if (!productId || !size) {
      return res.status(400).json({
        success: false,
        message: 'ProductId y talla son requeridos'
      });
    }

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { sizes: true }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar stock de la talla
    const productSize = product.sizes.find(s => s.size === size);
    if (!productSize) {
      return res.status(400).json({
        success: false,
        message: 'Talla no disponible'
      });
    }

    if (productSize.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente. Solo quedan ${productSize.stock} unidades`
      });
    }

    // Verificar si ya existe en el carrito
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId_size: {
          userId,
          productId,
          size
        }
      }
    });

    let cartItem;

    if (existingItem) {
      // Actualizar cantidad
      const newQuantity = existingItem.quantity + quantity;
      
      if (newQuantity > productSize.stock) {
        return res.status(400).json({
          success: false,
          message: `No puedes agregar más. Stock máximo: ${productSize.stock}`
        });
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            include: {
              images: { take: 1 },
              category: { select: { name: true } }
            }
          }
        }
      });
    } else {
      // Crear nuevo item
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          size,
          quantity
        },
        include: {
          product: {
            include: {
              images: { take: 1 },
              category: { select: { name: true } }
            }
          }
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Producto agregado al carrito',
      data: { cartItem }
    });
  } catch (error) {
    console.error('Error en addToCart:', error);
    next(error);
  }
};

/**
 * PUT /api/cart/:itemId
 * Actualizar cantidad de un item
 */
export const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad debe ser mayor a 0'
      });
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        product: {
          include: { sizes: true }
        }
      }
    });

    if (!cartItem || cartItem.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Item no encontrado en tu carrito'
      });
    }

    // Verificar stock
    const productSize = cartItem.product.sizes.find(s => s.size === cartItem.size);
    if (quantity > productSize.stock) {
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente. Máximo: ${productSize.stock}`
      });
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        product: {
          include: {
            images: { take: 1 },
            category: { select: { name: true } }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Cantidad actualizada',
      data: { cartItem: updated }
    });
  } catch (error) {
    console.error('Error en updateCartItem:', error);
    next(error);
  }
};

/**
 * DELETE /api/cart/:itemId
 * Eliminar item del carrito
 */
export const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId }
    });

    if (!cartItem || cartItem.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Item no encontrado en tu carrito'
      });
    }

    await prisma.cartItem.delete({
      where: { id: itemId }
    });

    res.json({
      success: true,
      message: 'Producto eliminado del carrito'
    });
  } catch (error) {
    console.error('Error en removeFromCart:', error);
    next(error);
  }
};

/**
 * DELETE /api/cart
 * Vaciar carrito completo
 */
export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await prisma.cartItem.deleteMany({
      where: { userId }
    });

    res.json({
      success: true,
      message: 'Carrito vaciado exitosamente'
    });
  } catch (error) {
    console.error('Error en clearCart:', error);
    next(error);
  }
};