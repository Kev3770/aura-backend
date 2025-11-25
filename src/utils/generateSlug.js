// src/utils/generateSlug.js
export const generateSlug = (name) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .trim()
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-'); // Múltiples guiones a uno solo
};

// src/utils/generateOrderNumber.js
import { prisma } from '../server.js';

export const generateOrderNumber = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.order.count() + 1;
  return `ORD-${year}-${String(count).padStart(4, '0')}`;
};

// src/utils/validators.js
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

export const isValidPrice = (price) => {
  const numPrice = Number(price);
  return !isNaN(numPrice) && numPrice > 0;
};

export const isValidDiscount = (discount) => {
  const numDiscount = Number(discount);
  return !isNaN(numDiscount) && numDiscount >= 0 && numDiscount <= 100;
};

export const isValidStock = (stock) => {
  const numStock = Number(stock);
  return !isNaN(numStock) && numStock >= 0;
};