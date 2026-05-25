/**
 * ======================================================
 * ARCHIVO: rateLimit.js
 * UBICACIÓN: menu-qr-system/backend/src/middleware/rateLimit.js
 * FASE: F5
 * VERSIÓN: 1.1
 * ÚLTIMA ACTUALIZACIÓN: 2024-05-21 14:45
 *
 * 🎯 PROPÓSITO:
 * Middleware de rate limiting para proteger la API
 * contra abusos y ataques de denegación de servicio.
 * Limita el número de peticiones por IP, tenant o
 * endpoint específico usando Redis como almacenamiento
 * distribuido.
 *
 * 📦 DEPENDENCIAS:
 * - express-rate-limit: Base del rate limiting
 * - rate-limit-redis: Store de Redis
 * - ../config/redis: Cliente Redis
 *
 * 🔗 RELACIONES:
 * - Importa de: express-rate-limit, rate-limit-redis, ../config/redis
 * - Es importado por: ../app.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.1 - 2024-05-21 14:45
 *    ✅ Corregida importación de RedisStore para versiones modernas
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 02:00
 *    ✅ Creación inicial del archivo
 * ======================================================
 */

const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redis = require('../config/redis');

// ======================================================
// FUNCIÓN AUXILIAR
// ======================================================

/**
 * Obtiene el identificador del tenant para rate limiting
 * @param {Object} req - Request object
 * @returns {string} Identificador del tenant o IP
 */
const getTenantIdentifier = (req) => {
  // Si hay un usuario autenticado, usar su tenant_id
  if (req.user && req.user.tenant_id) {
    return `tenant:${req.user.tenant_id}`;
  }
  
  // Si es una ruta pública con slug, usar el slug
  if (req.params && req.params.slug) {
    return `slug:${req.params.slug}`;
  }
  
  // Fallback a IP
  return req.ip || req.connection.remoteAddress;
};

// ======================================================
// CONFIGURACIÓN BASE DE REDIS
// ======================================================

const redisClient = redis.client;

// ======================================================
// LIMITER GENERAL (por IP)
// ======================================================

/**
 * Rate limiter general para todas las rutas
 * 100 peticiones por minuto por IP
 */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: 'Demasiadas peticiones. Por favor espera un momento.',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// ======================================================
// LIMITER POR TENANT (restaurante)
// ======================================================

/**
 * Rate limiter por tenant (restaurante)
 * 500 peticiones por minuto por tenant
 */
const tenantLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 500,
  keyGenerator: (req) => getTenantIdentifier(req),
  message: {
    success: false,
    error: 'Límite de peticiones del restaurante excedido. Por favor espera.',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ======================================================
// LIMITER ESTRICTO (para endpoints críticos)
// ======================================================

/**
 * Rate limiter estricto para endpoints críticos (pedidos, login)
 * 20 peticiones por minuto por IP
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: 'Demasiadas peticiones en este endpoint. Por favor espera.',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// ======================================================
// LIMITER PARA LOGIN
// ======================================================

/**
 * Rate limiter específico para login
 * 5 intentos por 15 minutos por IP (protección contra fuerza bruta)
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: 'Demasiados intentos de inicio de sesión. Por favor intenta más tarde.',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ======================================================
// LIMITER PARA CREACIÓN DE PEDIDOS
// ======================================================

/**
 * Rate limiter específico para creación de pedidos
 * 10 pedidos por minuto por IP
 */
const orderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: 'Has excedido el límite de pedidos. Por favor espera un momento.',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ======================================================
// LIMITER PARA REGISTRO
// ======================================================

/**
 * Rate limiter específico para registro de usuarios
 * 3 registros por hora por IP
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    error: 'Demasiados intentos de registro. Por favor intenta más tarde.',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ======================================================
// LIMITER PARA API PÚBLICA (menú)
// ======================================================

/**
 * Rate limiter para endpoints públicos de menú
 * 200 peticiones por minuto por IP
 */
const publicApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: {
    success: false,
    error: 'Demasiadas peticiones. Por favor espera.',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// ======================================================
// LIMITER PARA ADMIN PANEL
// ======================================================

/**
 * Rate limiter para endpoints del panel admin
 * 300 peticiones por minuto por tenant
 */
const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  keyGenerator: (req) => getTenantIdentifier(req),
  message: {
    success: false,
    error: 'Límite de peticiones del panel excedido. Por favor espera.',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ======================================================
// LIMITER PARA WEBHOOKS
// ======================================================

/**
 * Rate limiter para webhooks (más permisivo)
 * 1000 peticiones por minuto por IP
 */
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  message: {
    success: false,
    error: 'Demasiadas peticiones de webhook.',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// ======================================================
// FUNCIÓN PARA CREAR LIMITERS PERSONALIZADOS
// ======================================================

/**
 * Crea un rate limiter personalizado
 * @param {Object} options - Opciones personalizadas
 * @returns {Object} Rate limiter configurado
 */
const createCustomLimiter = (options) => {
  const {
    windowMs = 60 * 1000,
    max = 100,
    keyGenerator = (req) => req.ip || req.connection.remoteAddress,
    message = 'Demasiadas peticiones. Por favor espera.',
    skipSuccessfulRequests = false,
  } = options;
  
  return rateLimit({
    windowMs,
    max,
    keyGenerator,
    message: {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
  });
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  generalLimiter,
  tenantLimiter,
  strictLimiter,
  loginLimiter,
  orderLimiter,
  registerLimiter,
  publicApiLimiter,
  adminLimiter,
  webhookLimiter,
  createCustomLimiter,
  getTenantIdentifier,
};