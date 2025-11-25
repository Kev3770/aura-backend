// src/controllers/order.controller.js
import { prisma } from '../server.js';
import { generateOrderNumber } from '../utils/generateOrderNumber.js';

/**
 * POST /api/orders
 * Crear nueva orden
 */
export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip
    } = req.body;

    // Validaciones
    if (!customerName || !customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y email son requeridos'
      });
    }

    // Obtener items del carrito
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { orderBy: { order: 'asc' }, take: 1 },
            sizes: true
          }
        }
      }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El carrito está vacío'
      });
    }

    // Validar stock disponible
    for (const item of cartItems) {
      const productSize = item.product.sizes.find(s => s.size === item.size);
      if (!productSize || productSize.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para ${item.product.name} talla ${item.size}`
        });
      }
    }

    // Calcular totales
    let subtotal = 0;
    const orderItems = cartItems.map(item => {
      const price = item.product.price;
      const discount = item.product.discount || 0;
      const finalPrice = price - (price * discount / 100);
      const itemSubtotal = finalPrice * item.quantity;
      subtotal += itemSubtotal;

      return {
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.images[0]?.url || '',
        size: item.size,
        quantity: item.quantity,
        price: item.product.price,
        discount: item.product.discount,
        subtotal: itemSubtotal
      };
    });

    const shipping = 0; // Envío gratis por ahora
    const total = subtotal + shipping;

    // Generar número de orden
    const orderNumber = await generateOrderNumber();

    // Crear orden con items
    const order = await prisma.order.create({
      data: {
        userId,
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingZip,
        subtotal,
        shipping,
        total,
        status: 'PENDING',
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1 }
              }
            }
          }
        }
      }
    });

    // Reducir stock de los productos
    for (const item of cartItems) {
      const productSize = item.product.sizes.find(s => s.size === item.size);
      await prisma.productSize.update({
        where: { id: productSize.id },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    // Vaciar carrito del usuario
    await prisma.cartItem.deleteMany({
      where: { userId }
    });

    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      data: { order }
    });
  } catch (error) {
    console.error('Error en createOrder:', error);
    next(error);
  }
};

/**
 * GET /api/orders/my-orders
 * Obtener órdenes del usuario actual
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: orders.length,
      data: { orders }
    });
  } catch (error) {
    console.error('Error en getMyOrders:', error);
    next(error);
  }
};

/**
 * GET /api/orders/:id
 * Obtener orden por ID
 */
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Verificar que la orden pertenezca al usuario (excepto admin)
    if (order.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta orden'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Error en getOrderById:', error);
    next(error);
  }
};

/**
 * GET /api/orders
 * Obtener todas las órdenes (ADMIN)
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.order.count({ where });

    res.json({
      success: true,
      count: orders.length,
      total,
      data: { orders }
    });
  } catch (error) {
    console.error('Error en getAllOrders:', error);
    next(error);
  }
};

/**
 * PUT /api/orders/:id/status
 * Actualizar estado de orden (ADMIN)
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Válidos: ${validStatuses.join(', ')}`
      });
    }

    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: true
      }
    });

    res.json({
      success: true,
      message: 'Estado de orden actualizado',
      data: { order: updatedOrder }
    });
  } catch (error) {
    console.error('Error en updateOrderStatus:', error);
    next(error);
  }
};