// src/controllers/admin.controller.js
import { prisma } from '../server.js';

/**
 * GET /api/admin/stats
 * Obtener estadísticas generales del dashboard
 */
export const getStats = async (req, res, next) => {
  try {
    // Contar totales
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalCategories
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.category.count()
    ]);

    // Ventas totales
    const ordersWithTotal = await prisma.order.aggregate({
      _sum: {
        total: true
      },
      where: {
        status: {
          in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
        }
      }
    });

    const totalSales = ordersWithTotal._sum.total || 0;

    // Órdenes pendientes
    const pendingOrders = await prisma.order.count({
      where: { status: 'PENDING' }
    });

    // Productos con stock bajo (< 5)
    const lowStockProducts = await prisma.product.findMany({
      where: {
        sizes: {
          some: {
            stock: {
              lt: 5
            }
          }
        }
      },
      include: {
        sizes: {
          where: {
            stock: {
              lt: 5
            }
          }
        },
        category: {
          select: { name: true }
        }
      }
    });

    // Productos más vendidos
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true
      },
      _count: {
        productId: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    // Obtener detalles de los productos más vendidos
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            images: { take: 1 },
            category: { select: { name: true } }
          }
        });
        return {
          ...product,
          totalSold: item._sum.quantity,
          orderCount: item._count.productId
        };
      })
    );

    // Ventas por categoría
    const salesByCategory = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        subtotal: true,
        quantity: true
      }
    });

    // Agrupar por categoría
    const categorySales = {};
    for (const sale of salesByCategory) {
      const product = await prisma.product.findUnique({
        where: { id: sale.productId },
        include: { category: true }
      });

      if (product && product.category) {
        const catName = product.category.name;
        if (!categorySales[catName]) {
          categorySales[catName] = {
            category: catName,
            totalSales: 0,
            totalQuantity: 0
          };
        }
        categorySales[catName].totalSales += sale._sum.subtotal || 0;
        categorySales[catName].totalQuantity += sale._sum.quantity || 0;
      }
    }

    // Órdenes recientes
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          select: {
            productName: true,
            quantity: true
          }
        }
      }
    });

    // Estadísticas por estado de orden
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalCategories,
          totalSales,
          pendingOrders,
          lowStockCount: lowStockProducts.length
        },
        topProducts: topProductsWithDetails,
        lowStockProducts,
        salesByCategory: Object.values(categorySales),
        recentOrders,
        ordersByStatus
      }
    });
  } catch (error) {
    console.error('Error en getStats:', error);
    next(error);
  }
};