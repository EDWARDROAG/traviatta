/**
 * ======================================================
 * ARCHIVO: logger.js
 * UBICACIÓN: menu-qr-system/backend/src/utils/logger.js
 * FASE: F0
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 05:30
 *
 * 🎯 PROPÓSITO:
 * Configuración centralizada de logging para toda la
 * aplicación usando Winston. Proporciona diferentes
 * niveles de log (error, warn, info, debug) y formatos
 * según el entorno (desarrollo vs producción).
 *
 * 📦 DEPENDENCIAS:
 * - winston: Librería de logging
 * - winston-daily-rotate-file: Rotación diaria de archivos
 *
 * 🔗 RELACIONES:
 * - Importa de: winston, winston-daily-rotate-file
 * - Es importado por: toda la aplicación
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 05:30
 *    ✅ Creación inicial del archivo
 *    ✅ Configuración de Winston
 *    ✅ Múltiples transportes (consola, archivo)
 *    ✅ Rotación diaria de logs
 *    ✅ Formato según entorno (dev/prod)
 *    ✅ Funciones de utilidad por nivel
 * ======================================================
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// ======================================================
// CONFIGURACIÓN DE FORMATOS
// ======================================================

/**
 * Formato para desarrollo (colorido y legible)
 */
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    if (Object.keys(meta).length > 0 && meta.stack) {
      log += `\n${meta.stack}`;
    } else if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

/**
 * Formato para producción (JSON estructurado)
 */
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Formato para archivos de log (simple)
 */
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(meta).length > 0 && meta.stack) {
      log += `\n${meta.stack}`;
    } else if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    return log;
  })
);

// ======================================================
// DETERMINAR ENTORNO
// ======================================================

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

// ======================================================
// CONFIGURACIÓN DE TRANSPORTES
// ======================================================

/**
 * Transporte para consola
 */
const consoleTransport = new winston.transports.Console({
  level: logLevel,
  format: isProduction ? winston.format.simple() : devFormat,
  handleExceptions: true,
});

/**
 * Transporte para archivo de errores (solo errores)
 */
const errorFileTransport = new DailyRotateFile({
  level: 'error',
  filename: path.join('logs', 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  format: fileFormat,
  handleExceptions: true,
});

/**
 * Transporte para archivo combinado (todos los niveles)
 */
const combinedFileTransport = new DailyRotateFile({
  level: 'info',
  filename: path.join('logs', 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  format: fileFormat,
});

/**
 * Transporte para archivo de debug (solo desarrollo)
 */
const debugFileTransport = isDevelopment ? new DailyRotateFile({
  level: 'debug',
  filename: path.join('logs', 'debug-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '7d',
  format: fileFormat,
}) : null;

/**
 * Transporte para archivo de peticiones HTTP
 */
const httpFileTransport = new DailyRotateFile({
  level: 'http',
  filename: path.join('logs', 'http-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  format: fileFormat,
});

// ======================================================
// CREAR TRANSPORTES ACTIVOS
// ======================================================

const transports = [
  consoleTransport,
  errorFileTransport,
  combinedFileTransport,
  httpFileTransport,
];

if (debugFileTransport) {
  transports.push(debugFileTransport);
}

// ======================================================
// CREAR LOGGER
// ======================================================

const logger = winston.createLogger({
  level: logLevel,
  format: isProduction ? prodFormat : devFormat,
  transports,
  exitOnError: false,
});

// ======================================================
// FUNCIONES DE UTILIDAD
// ======================================================

/**
 * Crea un child logger con metadata adicional
 * @param {Object} metadata - Metadata a agregar
 * @returns {Object} Child logger
 */
const createChildLogger = (metadata) => {
  return logger.child(metadata);
};

/**
 * Crea un logger para un módulo específico
 * @param {string} moduleName - Nombre del módulo
 * @returns {Object} Logger del módulo
 */
const getModuleLogger = (moduleName) => {
  return createChildLogger({ module: moduleName });
};

/**
 * Log de petición HTTP
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {number} duration - Duración en ms
 */
const logHttpRequest = (req, res, duration) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    status: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  };
  
  if (req.user?.id) {
    logData.userId = req.user.id;
  }
  
  if (res.statusCode >= 500) {
    logger.error('HTTP Request', logData);
  } else if (res.statusCode >= 400) {
    logger.warn('HTTP Request', logData);
  } else {
    logger.http('HTTP Request', logData);
  }
};

/**
 * Log de operación de base de datos
 * @param {string} operation - Tipo de operación (SELECT, INSERT, etc.)
 * @param {string} table - Tabla afectada
 * @param {number} duration - Duración en ms
 * @param {Object} metadata - Metadata adicional
 */
const logDatabaseOperation = (operation, table, duration, metadata = {}) => {
  logger.debug('Database Operation', {
    operation,
    table,
    duration: `${duration}ms`,
    ...metadata,
  });
};

/**
 * Log de pedido
 * @param {string} orderId - ID del pedido
 * @param {string} action - Acción realizada
 * @param {Object} metadata - Metadata adicional
 */
const logOrderAction = (orderId, action, metadata = {}) => {
  logger.info('Order Action', {
    orderId,
    action,
    ...metadata,
  });
};

/**
 * Log de autenticación
 * @param {string} userId - ID del usuario
 * @param {string} action - Acción (login, logout, etc.)
 * @param {Object} metadata - Metadata adicional
 */
const logAuthAction = (userId, action, metadata = {}) => {
  logger.info('Auth Action', {
    userId,
    action,
    ...metadata,
  });
};

/**
 * Log de error con stack trace
 * @param {Error} error - Error capturado
 * @param {string} context - Contexto donde ocurrió
 * @param {Object} metadata - Metadata adicional
 */
const logError = (error, context, metadata = {}) => {
  logger.error(`Error in ${context}: ${error.message}`, {
    context,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    ...metadata,
  });
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  // Logger principal
  logger,
  
  // Funciones de utilidad
  createChildLogger,
  getModuleLogger,
  logHttpRequest,
  logDatabaseOperation,
  logOrderAction,
  logAuthAction,
  logError,
  
  // Niveles directamente (conveniencia)
  error: logger.error.bind(logger),
  warn: logger.warn.bind(logger),
  info: logger.info.bind(logger),
  http: logger.http.bind(logger),
  debug: logger.debug.bind(logger),
};