// src/utils/validators.js

/**
 * Validar formato de email
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validar contraseña (mínimo 6 caracteres)
 */
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Validar precio (debe ser número positivo)
 */
export const isValidPrice = (price) => {
  const numPrice = Number(price);
  return !isNaN(numPrice) && numPrice > 0;
};

/**
 * Validar descuento (0-100)
 */
export const isValidDiscount = (discount) => {
  const numDiscount = Number(discount);
  return !isNaN(numDiscount) && numDiscount >= 0 && numDiscount <= 100;
};

/**
 * Validar stock (número >= 0)
 */
export const isValidStock = (stock) => {
  const numStock = Number(stock);
  return !isNaN(numStock) && numStock >= 0;
};

/**
 * Validar nombre (mínimo 2 caracteres)
 */
export const isValidName = (name) => {
  return name && name.trim().length >= 2;
};

/**
 * Validar slug (solo letras, números y guiones)
 */
export const isValidSlug = (slug) => {
  const regex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return regex.test(slug);
};

/**
 * Validar teléfono (formato flexible)
 */
export const isValidPhone = (phone) => {
  if (!phone) return true; // Opcional
  const regex = /^[0-9\s\-\+\(\)]{7,20}$/;
  return regex.test(phone);
};

/**
 * Validar cantidad (número entero positivo)
 */
export const isValidQuantity = (quantity) => {
  const num = Number(quantity);
  return Number.isInteger(num) && num > 0;
};

/**
 * Validar talla (no vacío)
 */
export const isValidSize = (size) => {
  return size && size.trim().length > 0;
};