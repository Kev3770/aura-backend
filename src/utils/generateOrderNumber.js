// src/utils/generateOrderNumber.js
import { prisma } from '../server.js';

/**
 * Generar número de orden único
 * Formato: ORD-2025-0001
 */
export const generateOrderNumber = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.order.count() + 1;
  return `ORD-${year}-${String(count).padStart(4, '0')}`;
};