/**
 * ======================================================
 * ARCHIVO: auth.js
 * UBICACIÓN: menu-qr-system/backend/src/middleware/auth.js
 * FASE: F2
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 01:30
 *
 * 🎯 PROPÓSITO:
 * Middleware de autenticación para verificar tokens JWT
 * en rutas protegidas del panel administrativo.
 * Extrae el token del header Authorization, lo valida,
 * y adjunta la información del usuario al objeto req.
 *
 * 📦 DEPENDENCIAS:
 * - jsonwebtoken: Verificación de tokens
 * - ../config/redis: Verificación de sesiones
 * - ../utils/logger: Logging
 *
 * 🔗 RELACIONES:
 * - Importa de: jsonwebtoken, ../config/redis, ../utils/logger
 * - Es importado por: ../routes/admin.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 01:30
 *    ✅ Creación inicial del archivo
 *    ✅ Extracción y validación de token JWT
 *    ✅ Verificación de sesión en Redis
 *    ✅ Manejo de errores de autenticación
 *    ✅ Opcional: autenticación para rutas públicas
 * ======================================================
 */

const jwt = require('jsonwebtoken');
const redis = require('../config/redis');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_change_in_production';

// ======================================================
// MIDDLEWARE PRINCIPAL
// ======================================================

/**
 * Middleware de autenticación
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado. Token no proporcionado.',
        timestamp: new Date().toISOString(),
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expirado. Por favor inicia sesión nuevamente.',
          timestamp: new Date().toISOString(),
        });
      }
      return res.status(401).json({
        success: false,
        error: 'Token inválido.',
        timestamp: new Date().toISOString(),
      });
    }
    
    // Verificar sesión en Redis
    const session = await redis.getSession(token);
    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'Sesión inválida o expirada.',
        timestamp: new Date().toISOString(),
      });
    }
    
    // Adjuntar usuario al request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      slug: decoded.slug,
      tenant_id: decoded.id,
      role: decoded.role || 'owner',
    };
    
    logger.debug(`User authenticated: ${req.user.email} (${req.user.id})`);
    
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error interno de autenticación.',
      timestamp: new Date().toISOString(),
    });
  }
};

// ======================================================
// MIDDLEWARE OPCIONAL (para rutas públicas con auth opcional)
// ======================================================

/**
 * Middleware de autenticación opcional
 * No falla si no hay token, solo adjunta usuario si existe
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const session = await redis.getSession(token);
        
        if (session) {
          req.user = {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            slug: decoded.slug,
            tenant_id: decoded.id,
            role: decoded.role || 'owner',
          };
        }
      } catch (error) {
        // Token inválido, pero no fallamos la petición
        logger.debug('Optional auth: invalid token provided');
      }
    }
    
    next();
  } catch (error) {
    logger.error('Optional auth middleware error:', error.message);
    next();
  }
};

// ======================================================
// MIDDLEWARE DE ROLES
// ======================================================

/**
 * Verifica que el usuario tenga rol de administrador
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado.',
      timestamp: new Date().toISOString(),
    });
  }
  
  if (req.user.role !== 'admin' && req.user.role !== 'owner') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requieren permisos de administrador.',
      timestamp: new Date().toISOString(),
    });
  }
  
  next();
};

/**
 * Verifica que el usuario tenga rol de dueño
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
const requireOwner = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado.',
      timestamp: new Date().toISOString(),
    });
  }
  
  if (req.user.role !== 'owner') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requieren permisos de propietario.',
      timestamp: new Date().toISOString(),
    });
  }
  
  next();
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  requireAdmin,
  requireOwner,
};