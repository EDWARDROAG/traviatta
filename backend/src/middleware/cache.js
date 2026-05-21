/**
 * ======================================================
 * ARCHIVO: cache.js
 * UBICACIÓN: menu-qr-system/backend/src/middleware/cache.js
 * FASE: F5
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 02:30
 *
 * 🎯 PROPÓSITO:
 * Middleware de caché para almacenar respuestas de
 * endpoints GET frecuentes en Redis. Reduce la carga
 * en la base de datos y mejora los tiempos de respuesta.
 * Soporta TTL configurable, invalidación por patrones,
 * y cacheo selectivo por endpoint.
 *
 * 📦 DEPENDENCIAS:
 * - ../config/redis: Cliente Redis
 * - ../utils/logger: Logging
 *
 * 🔗 RELACIONES:
 * - Importa de: ../config/redis, ../utils/logger
 * - Es importado por: ../app.js, ../routes/*.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 02:30
 *    ✅ Creación inicial del archivo
 *    ✅ Middleware de caché para respuestas GET
 *    ✅ TTL configurable por endpoint
 *    ✅ Cache key generado automáticamente
 *    ✅ Soporte para caché por query params
 *    ✅ Bypass de caché con header
 *    ✅ Invalidador de caché por patrón
 * ======================================================
 */

const redis = require('../config/redis');
const logger = require('../utils/logger');

// ======================================================
// CONSTANTES
// ======================================================

const DEFAULT_CACHE_TTL = 300; // 5 minutos

// Endpoints que NO deben ser cacheados
const NO_CACHE_PATHS = [
  '/api/order',
  '/api/login',
  '/api/register',
  '/api/refresh-token',
  '/api/change-password',
  '/api/reset-password',
];

// Query params que afectan el contenido (incluir en cache key)
const CACHE_KEY_PARAMS = ['branch_id', 'category_id', 'limit', 'page'];

// Headers que indican bypass de caché
const BYPASS_HEADERS = ['x-skip-cache', 'Cache-Control'];

// ======================================================
// FUNCIONES AUXILIARES
// ======================================================

/**
 * Genera la clave de caché para una request
 * @param {Object} req - Request object
 * @returns {string} Clave de caché
 */
const generateCacheKey = (req) => {
  const method = req.method;
  const originalUrl = req.originalUrl || req.url;
  const queryParams = req.query;
  
  // Construir clave base
  let cacheKey = `${method}:${originalUrl.split('?')[0]}`;
  
  // Agregar query params relevantes
  const relevantParams = {};
  for (const param of CACHE_KEY_PARAMS) {
    if (queryParams[param]) {
      relevantParams[param] = queryParams[param];
    }
  }
  
  if (Object.keys(relevantParams).length > 0) {
    cacheKey += `:${JSON.stringify(relevantParams)}`;
  }
  
  // Agregar slug si existe (para multi-tenant)
  if (req.params && req.params.slug) {
    cacheKey += `:slug:${req.params.slug}`;
  }
  
  // Agregar branch_id si existe
  if (req.params && req.params.branchId) {
    cacheKey += `:branch:${req.params.branchId}`;
  }
  
  // Normalizar clave (reemplazar caracteres especiales)
  cacheKey = cacheKey.replace(/[^a-zA-Z0-9:]/g, '_');
  
  return cacheKey;
};

/**
 * Verifica si la request debe ser cacheada
 * @param {Object} req - Request object
 * @returns {boolean}
 */
const shouldCache = (req) => {
  // Solo cachear GET
  if (req.method !== 'GET') {
    return false;
  }
  
  // Verificar si hay headers de bypass
  for (const header of BYPASS_HEADERS) {
    if (req.headers[header.toLowerCase()] === 'no-cache' || 
        req.headers[header.toLowerCase()] === 'skip') {
      logger.debug(`Cache bypassed by header: ${header}`);
      return false;
    }
  }
  
  // Verificar si el path no debe ser cacheado
  for (const path of NO_CACHE_PATHS) {
    if (req.path.includes(path)) {
      return false;
    }
  }
  
  return true;
};

// ======================================================
// MIDDLEWARE PRINCIPAL
// ======================================================

/**
 * Middleware de caché para respuestas GET
 * @param {Object} options - Opciones de configuración
 * @returns {Function} Middleware
 */
const cacheMiddleware = (options = {}) => {
  const ttl = options.ttl || DEFAULT_CACHE_TTL;
  const keyGenerator = options.keyGenerator || generateCacheKey;
  
  return async (req, res, next) => {
    // Verificar si debemos cachear esta request
    if (!shouldCache(req)) {
      return next();
    }
    
    const cacheKey = keyGenerator(req);
    
    try {
      // Intentar obtener del caché
      const cachedResponse = await redis.get(cacheKey);
      
      if (cachedResponse) {
        logger.debug(`Cache HIT: ${cacheKey}`);
        
        // Restaurar respuesta desde caché
        return res.status(200).json(cachedResponse);
      }
      
      logger.debug(`Cache MISS: ${cacheKey}`);
      
      // Interceptar res.json para guardar en caché
      const originalJson = res.json;
      res.json = function(data) {
        // Guardar en caché solo si la respuesta fue exitosa
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redis.set(cacheKey, data, ttl).catch(err => {
            logger.error(`Error saving cache for ${cacheKey}:`, err.message);
          });
        }
        
        // Restaurar método original y enviar respuesta
        res.json = originalJson;
        return res.json(data);
      };
      
      next();
    } catch (error) {
      logger.error(`Cache middleware error for ${cacheKey}:`, error.message);
      // En caso de error, continuar sin caché
      next();
    }
  };
};

// ======================================================
// MIDDLEWARE PARA LIMPIAR CACHÉ
// ======================================================

/**
 * Middleware que limpia el caché después de operaciones de escritura
 * @param {string|Array} patterns - Patrón(es) de claves a limpiar
 * @returns {Function} Middleware
 */
const invalidateCacheMiddleware = (patterns) => {
  return async (req, res, next) => {
    // Interceptar res.json para limpiar caché después de respuesta exitosa
    const originalJson = res.json;
    
    res.json = async function(data) {
      // Restaurar método original
      res.json = originalJson;
      
      // Si la operación fue exitosa, limpiar caché
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const patternArray = Array.isArray(patterns) ? patterns : [patterns];
        
        for (const pattern of patternArray) {
          // Reemplazar placeholders dinámicos
          let finalPattern = pattern;
          if (pattern.includes(':branchId') && req.params.branchId) {
            finalPattern = finalPattern.replace(':branchId', req.params.branchId);
          }
          if (pattern.includes(':slug') && req.params.slug) {
            finalPattern = finalPattern.replace(':slug', req.params.slug);
          }
          
          try {
            const deleted = await redis.invalidateByPattern(`*${finalPattern}*`);
            logger.debug(`Cache invalidated: ${deleted} keys matching pattern ${finalPattern}`);
          } catch (error) {
            logger.error(`Error invalidating cache pattern ${finalPattern}:`, error.message);
          }
        }
      }
      
      return res.json(data);
    };
    
    next();
  };
};

// ======================================================
// MIDDLEWARE ESPECÍFICOS POR ENDPOINT
// ======================================================

/**
 * Middleware de caché para menú (TTL más largo)
 */
const menuCacheMiddleware = cacheMiddleware({ ttl: 300 }); // 5 minutos

/**
 * Middleware de caché para productos destacados (TTL largo)
 */
const featuredCacheMiddleware = cacheMiddleware({ ttl: 3600 }); // 1 hora

/**
 * Middleware de caché para listas (TTL mediano)
 */
const listCacheMiddleware = cacheMiddleware({ ttl: 600 }); // 10 minutos

/**
 * Middleware de caché para categorías (TTL mediano)
 */
const categoryCacheMiddleware = cacheMiddleware({ ttl: 600 }); // 10 minutos

/**
 * Middleware de caché para configuración (TTL largo)
 */
const settingsCacheMiddleware = cacheMiddleware({ ttl: 1800 }); // 30 minutos

/**
 * Invalida caché de menú después de cambios en productos/categorías
 */
const invalidateMenuCache = invalidateCacheMiddleware([
  'GET:*/menu*',
  'GET:*/featured*',
  'GET:*/category*',
]);

/**
 * Invalida caché de configuración después de cambios
 */
const invalidateSettingsCache = invalidateCacheMiddleware([
  'GET:*/settings*',
]);

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  // Middleware principal
  cacheMiddleware,
  invalidateCacheMiddleware,
  
  // Middlewares específicos
  menuCacheMiddleware,
  featuredCacheMiddleware,
  listCacheMiddleware,
  categoryCacheMiddleware,
  settingsCacheMiddleware,
  
  // Invalidadores
  invalidateMenuCache,
  invalidateSettingsCache,
  
  // Utilidades
  generateCacheKey,
  shouldCache,
  DEFAULT_CACHE_TTL,
  NO_CACHE_PATHS,
};