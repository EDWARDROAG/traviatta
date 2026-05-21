/**
 * ======================================================
 * ARCHIVO: errorHandler.js
 * UBICACIÓN: menu-qr-system/backend/src/middleware/errorHandler.js
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 03:30
 *
 * 🎯 PROPÓSITO:
 * Middleware de manejo global de errores para toda la
 * aplicación. Captura errores no manejados, errores de
 * base de datos, errores de validación, y proporciona
 * respuestas consistentes con formato unificado.
 *
 * 📦 DEPENDENCIAS:
 * - ../utils/logger: Logging de errores
 *
 * 🔗 RELACIONES:
 * - Importa de: ../utils/logger
 * - Es importado por: ../app.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 03:30
 *    ✅ Creación inicial del archivo
 *    ✅ Middleware de error general
 *    ✅ Manejo de errores 404 (not found)
 *    ✅ Manejo de errores de base de datos
 *    ✅ Manejo de errores de validación Joi
 *    ✅ Manejo de errores JWT
 *    ✅ Formato de respuesta unificado
 * ======================================================
 */

const logger = require('../utils/logger');

// ======================================================
// CONSTANTES
// ======================================================

const ERROR_CODES = {
  // Errores de cliente (4xx)
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  
  // Errores de servidor (5xx)
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

// ======================================================
// FUNCIÓN AUXILIAR
// ======================================================

/**
 * Envía respuesta de error
 * @param {Object} res - Response object
 * @param {number} statusCode - Código HTTP
 * @param {string} message - Mensaje de error
 * @param {Array} details - Detalles adicionales (opcional)
 */
const sendErrorResponse = (res, statusCode, message, details = null) => {
  const response = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  };
  
  if (details && process.env.NODE_ENV !== 'production') {
    response.details = details;
  }
  
  res.status(statusCode).json(response);
};

// ======================================================
// MIDDLEWARE PRINCIPAL
// ======================================================

/**
 * Middleware para rutas no encontradas (404)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const notFoundHandler = (req, res) => {
  sendErrorResponse(
    res,
    ERROR_CODES.NOT_FOUND,
    `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  );
};

/**
 * Middleware principal de manejo de errores
 * @param {Error} err - Error capturado
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
const errorHandler = (err, req, res, next) => {
  // Log del error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: `${req.method} ${req.originalUrl}`,
    ip: req.ip,
    user: req.user?.id || 'anonymous',
  });
  
  // ======================================================
  // ERRORES DE VALIDACIÓN (Joi)
  // ======================================================
  if (err.name === 'ValidationError' || err.isJoi) {
    const details = err.details?.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
    })) || [err.message];
    
    return sendErrorResponse(
      res,
      ERROR_CODES.UNPROCESSABLE_ENTITY,
      'Error de validación',
      details
    );
  }
  
  // ======================================================
  // ERRORES DE BASE DE DATOS
  // ======================================================
  if (err.code && err.code.startsWith('23')) {
    // Errores de violación de constraint
    if (err.code === '23505') {
      return sendErrorResponse(
        res,
        ERROR_CODES.CONFLICT,
        'Ya existe un registro con esos datos'
      );
    }
    if (err.code === '23503') {
      return sendErrorResponse(
        res,
        ERROR_CODES.BAD_REQUEST,
        'Referencia inválida a otro registro'
      );
    }
  }
  
  // ======================================================
  // ERRORES DE JWT
  // ======================================================
  if (err.name === 'JsonWebTokenError') {
    return sendErrorResponse(
      res,
      ERROR_CODES.UNAUTHORIZED,
      'Token inválido'
    );
  }
  
  if (err.name === 'TokenExpiredError') {
    return sendErrorResponse(
      res,
      ERROR_CODES.UNAUTHORIZED,
      'Token expirado'
    );
  }
  
  // ======================================================
  // ERRORES DE AUTORIZACIÓN
  // ======================================================
  if (err.name === 'UnauthorizedError') {
    return sendErrorResponse(
      res,
      ERROR_CODES.UNAUTHORIZED,
      'No autorizado'
    );
  }
  
  if (err.name === 'ForbiddenError') {
    return sendErrorResponse(
      res,
      ERROR_CODES.FORBIDDEN,
      'Acceso denegado'
    );
  }
  
  // ======================================================
  // ERRORES DE RATE LIMIT
  // ======================================================
  if (err.name === 'RateLimitError') {
    return sendErrorResponse(
      res,
      ERROR_CODES.TOO_MANY_REQUESTS,
      'Demasiadas peticiones. Por favor espera un momento.'
    );
  }
  
  // ======================================================
  // ERRORES PERSONALIZADOS DE LA APLICACIÓN
  // ======================================================
  if (err.statusCode && err.message) {
    return sendErrorResponse(
      res,
      err.statusCode,
      err.message,
      err.details || null
    );
  }
  
  // ======================================================
  // ERRORES DESCONOCIDOS
  // ======================================================
  const isProduction = process.env.NODE_ENV === 'production';
  const message = isProduction 
    ? 'Error interno del servidor'
    : err.message;
  
  const details = isProduction ? null : err.stack;
  
  sendErrorResponse(
    res,
    ERROR_CODES.INTERNAL_SERVER_ERROR,
    message,
    details
  );
};

// ======================================================
// CLASE DE ERROR PERSONALIZADA
// ======================================================

/**
 * Error personalizado de la aplicación
 */
class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error de validación
 */
class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, ERROR_CODES.UNPROCESSABLE_ENTITY, details);
    this.name = 'ValidationError';
  }
}

/**
 * Error de no encontrado
 */
class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} no encontrado`, ERROR_CODES.NOT_FOUND);
    this.name = 'NotFoundError';
  }
}

/**
 * Error de conflicto
 */
class ConflictError extends AppError {
  constructor(message) {
    super(message, ERROR_CODES.CONFLICT);
    this.name = 'ConflictError';
  }
}

/**
 * Error de autorización
 */
class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, ERROR_CODES.UNAUTHORIZED);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Error de acceso denegado
 */
class ForbiddenError extends AppError {
  constructor(message = 'Acceso denegado') {
    super(message, ERROR_CODES.FORBIDDEN);
    this.name = 'ForbiddenError';
  }
}

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  // Middlewares
  notFoundHandler,
  errorHandler,
  
  // Códigos de error
  ERROR_CODES,
  
  // Clases de error personalizadas
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  
  // Función auxiliar
  sendErrorResponse,
};