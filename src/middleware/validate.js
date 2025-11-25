// src/middleware/validate.js
import { isValidEmail, isValidPassword } from '../utils/validators.js';

/**
 * Validar datos de registro
 */
export const validateRegister = (req, res, next) => {
  const { email, password, name } = req.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push('Email inválido');
  }

  if (!password || !isValidPassword(password)) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }

  if (!name || name.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors
    });
  }

  next();
};

/**
 * Validar datos de login
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push('Email inválido');
  }

  if (!password) {
    errors.push('Contraseña requerida');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors
    });
  }

  next();
};

/**
 * Validar datos de producto
 */
export const validateProduct = (req, res, next) => {
  const { name, description, price, categoryId } = req.body;
  const errors = [];

  if (!name || name.trim().length < 3) {
    errors.push('El nombre debe tener al menos 3 caracteres');
  }

  if (!description || description.trim().length < 10) {
    errors.push('La descripción debe tener al menos 10 caracteres');
  }

  if (!price || isNaN(Number(price)) || Number(price) <= 0) {
    errors.push('El precio debe ser un número mayor a 0');
  }

  if (!categoryId) {
    errors.push('La categoría es requerida');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors
    });
  }

  next();
};