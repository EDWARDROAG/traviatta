/**
 * ======================================================
 * ARCHIVO: validation.js
 * UBICACIÓN: menu-qr-system/backend/src/middleware/validation.js
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 03:00
 *
 * 🎯 PROPÓSITO:
 * Middleware de validación de datos de entrada usando
 * Joi. Proporciona esquemas de validación reutilizables
 * para productos, categorías, pedidos, usuarios, etc.
 * Centraliza las reglas de validación y maneja errores
 * de forma consistente.
 *
 * 📦 DEPENDENCIAS:
 * - joi: Librería de validación
 *
 * 🔗 RELACIONES:
 * - Importa de: joi
 * - Es importado por: ../routes/*.js, controladores
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 03:00
 *    ✅ Creación inicial del archivo
 *    ✅ Esquemas de validación para productos
 *    ✅ Esquemas para categorías
 *    ✅ Esquemas para pedidos
 *    ✅ Esquemas para sedes
 *    ✅ Esquemas para autenticación
 *    ✅ Middleware de validación genérico
 * ======================================================
 */

const Joi = require('joi');

// ======================================================
// ESQUEMAS DE VALIDACIÓN
// ======================================================

// ======================================================
// AUTENTICACIÓN
// ======================================================

/**
 * Esquema para login
 */
const loginSchema = Joi.object({
  email: Joi.string().email().optional(),
  slug: Joi.string().min(3).max(50).optional(),
  password: Joi.string().min(6).required(),
}).xor('email', 'slug');

/**
 * Esquema para registro
 */
const registerSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().pattern(/^[0-9]{7,15}$/).optional(),
  address: Joi.string().max(200).optional(),
  whatsapp_number: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
});

/**
 * Esquema para cambio de contraseña
 */
const changePasswordSchema = Joi.object({
  current_password: Joi.string().min(6).required(),
  new_password: Joi.string().min(6).required(),
});

/**
 * Esquema para recuperación de contraseña
 */
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

/**
 * Esquema para restablecer contraseña
 */
const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  new_password: Joi.string().min(6).required(),
});

// ======================================================
// PRODUCTOS
// ======================================================

/**
 * Esquema para creación/actualización de producto
 */
const productSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
  price: Joi.number().positive().required(),
  category_id: Joi.string().uuid().required(),
  is_available: Joi.boolean().default(true),
  is_featured: Joi.boolean().default(false),
  preparation_time: Joi.number().integer().min(1).max(180).optional(),
  allergens: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  modifiers: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    price: Joi.number().min(0).required(),
  })).optional(),
});

/**
 * Esquema para actualización parcial de producto
 */
const productUpdateSchema = productSchema.fork(
  ['name', 'price', 'category_id'],
  (field) => field.optional()
);

// ======================================================
// CATEGORÍAS
// ======================================================

/**
 * Esquema para creación/actualización de categoría
 */
const categorySchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(200).optional(),
  icon: Joi.string().max(50).optional(),
  display_order: Joi.number().integer().min(0).optional(),
  module_type: Joi.string().valid('breakfast', 'lunch', 'fastfood', 'bar', 'all').default('all'),
  start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  days_of_week: Joi.array().items(Joi.number().integer().min(1).max(7)).optional(),
  is_active: Joi.boolean().default(true),
});

/**
 * Esquema para reordenamiento de categorías
 */
const categoryReorderSchema = Joi.object({
  categories: Joi.array().items(Joi.object({
    id: Joi.string().uuid().required(),
    display_order: Joi.number().integer().min(0).required(),
  })).min(1).required(),
});

// ======================================================
// PEDIDOS
// ======================================================

/**
 * Esquema para item de pedido
 */
const orderItemSchema = Joi.object({
  product_id: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(1).max(99).required(),
  modifiers: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    price: Joi.number().min(0).required(),
  })).optional(),
});

/**
 * Esquema para creación de pedido
 */
const orderSchema = Joi.object({
  branch_id: Joi.string().uuid().required(),
  customer_name: Joi.string().min(2).max(100).required(),
  customer_phone: Joi.string().pattern(/^[0-9]{7,15}$/).required(),
  customer_email: Joi.string().email().optional(),
  order_type: Joi.string().valid('delivery', 'takeaway', 'table').default('delivery'),
  delivery_address: Joi.string().max(200).when('order_type', {
    is: 'delivery',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  items: Joi.array().items(orderItemSchema).min(1).required(),
  payment_method: Joi.string().valid('cash', 'card', 'transfer', 'nequi', 'daviplata').default('cash'),
  notes: Joi.string().max(500).optional(),
});

/**
 * Esquema para cancelación de pedido
 */
const orderCancelSchema = Joi.object({
  reason: Joi.string().max(200).optional(),
  phone: Joi.string().pattern(/^[0-9]{7,15}$/).required(),
});

// ======================================================
// SEDES (BRANCHES)
// ======================================================

/**
 * Esquema para creación/actualización de sede
 */
const branchSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  address: Joi.string().min(5).max(200).required(),
  phone: Joi.string().pattern(/^[0-9]{7,15}$/).optional(),
  whatsapp_number: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  delivery_cost: Joi.number().min(0).default(3000),
  free_delivery_min_amount: Joi.number().min(0).default(30000),
  is_active: Joi.boolean().default(true),
});

/**
 * Esquema para actualización de horarios
 */
const scheduleSchema = Joi.object({
  monday: Joi.object({ open: Joi.string(), close: Joi.string(), closed: Joi.boolean() }),
  tuesday: Joi.object({ open: Joi.string(), close: Joi.string(), closed: Joi.boolean() }),
  wednesday: Joi.object({ open: Joi.string(), close: Joi.string(), closed: Joi.boolean() }),
  thursday: Joi.object({ open: Joi.string(), close: Joi.string(), closed: Joi.boolean() }),
  friday: Joi.object({ open: Joi.string(), close: Joi.string(), closed: Joi.boolean() }),
  saturday: Joi.object({ open: Joi.string(), close: Joi.string(), closed: Joi.boolean() }),
  sunday: Joi.object({ open: Joi.string(), close: Joi.string(), closed: Joi.boolean() }),
});

// ======================================================
// MESAS
// ======================================================

/**
 * Esquema para creación/actualización de mesa
 */
const tableSchema = Joi.object({
  table_number: Joi.string().min(1).max(20).required(),
  table_name: Joi.string().max(50).optional(),
  capacity: Joi.number().integer().min(1).max(20).default(4),
  position_x: Joi.number().integer().min(0).max(2000).default(0),
  position_y: Joi.number().integer().min(0).max(2000).default(0),
  shape: Joi.string().valid('circle', 'square', 'rectangle').default('circle'),
  status: Joi.string().valid('available', 'occupied', 'reserved', 'cleaning').default('available'),
});

/**
 * Esquema para actualización de posiciones de mesas
 */
const tablePositionsSchema = Joi.object({
  tables: Joi.array().items(Joi.object({
    id: Joi.string().uuid().required(),
    position_x: Joi.number().integer().min(0).max(2000).required(),
    position_y: Joi.number().integer().min(0).max(2000).required(),
  })).min(1).required(),
});

// ======================================================
// CONFIGURACIÓN
// ======================================================

/**
 * Esquema para actualización de configuración general
 */
const settingsSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  whatsapp_number: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^[0-9]{7,15}$/).optional(),
  address: Joi.string().max(200).optional(),
  primary_color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
});

/**
 * Esquema para actualización de colores
 */
const colorsSchema = Joi.object({
  primary_color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
  secondary_color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
  font_family: Joi.string().max(100),
});

// ======================================================
// MIDDLEWARE DE VALIDACIÓN
// ======================================================

/**
 * Crea un middleware de validación
 * @param {Object} schema - Esquema Joi a validar
 * @param {string} property - Propiedad del req a validar ('body', 'query', 'params')
 * @returns {Function} Middleware
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const data = req[property];
    
    if (!data) {
      return res.status(400).json({
        success: false,
        error: `No hay datos para validar en ${property}`,
        timestamp: new Date().toISOString(),
      });
    }
    
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        error: 'Error de validación',
        details: errors,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Reemplazar datos con valores validados
    req[property] = value;
    next();
  };
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  // Autenticación
  loginSchema,
  registerSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  
  // Productos
  productSchema,
  productUpdateSchema,
  
  // Categorías
  categorySchema,
  categoryReorderSchema,
  
  // Pedidos
  orderSchema,
  orderCancelSchema,
  orderItemSchema,
  
  // Sedes
  branchSchema,
  scheduleSchema,
  
  // Mesas
  tableSchema,
  tablePositionsSchema,
  
  // Configuración
  settingsSchema,
  colorsSchema,
  
  // Middleware
  validate,
};