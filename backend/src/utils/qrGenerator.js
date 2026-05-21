/**
 * ======================================================
 * ARCHIVO: qrGenerator.js
 * UBICACIÓN: menu-qr-system/backend/src/utils/qrGenerator.js
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 06:00
 *
 * 🎯 PROPÓSITO:
 * Utilidad para la generación de códigos QR para
 * restaurantes, sedes y mesas. Permite generar URLs
 * y/o imágenes QR que los clientes escanearán para
 * acceder al menú digital.
 *
 * 📦 DEPENDENCIAS:
 * - qrcode: Librería de generación de QR
 * - ../config/redis: Caché de QRs generados
 *
 * 🔗 RELACIONES:
 * - Importa de: qrcode, ../config/redis
 * - Es importado por: services/tableService.js,
 *   controllers/admin/branchController.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 06:00
 *    ✅ Creación inicial del archivo
 *    ✅ Generación de URLs QR
 *    ✅ Generación de imágenes QR (PNG)
 *    ✅ Generación de DataURLs
 *    ✅ Caché de QRs generados
 *    ✅ QR para menú general y por mesa
 * ======================================================
 */

const QRCode = require('qrcode');
const redis = require('../config/redis');

// ======================================================
// CONSTANTES
// ======================================================

const QR_CACHE_TTL = 86400; // 24 horas
const QR_CACHE_PREFIX = 'qr:';

const DEFAULT_QR_OPTIONS = {
  width: 300,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#ffffff',
  },
  errorCorrectionLevel: 'M',
};

// ======================================================
// FUNCIONES DE GENERACIÓN
// ======================================================

/**
 * Genera la URL para el menú de un restaurante/sede
 * @param {string} slug - Slug del restaurante
 * @param {string} branchId - ID de la sede (opcional)
 * @returns {string} URL generada
 */
const generateMenuUrl = (slug, branchId = null) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://menu.dominio.com';
  
  if (branchId) {
    return `${baseUrl}/${slug}/menu?branch_id=${branchId}`;
  }
  
  return `${baseUrl}/${slug}/menu`;
};

/**
 * Genera la URL para el menú de una mesa específica
 * @param {string} slug - Slug del restaurante
 * @param {string} tableId - ID de la mesa
 * @returns {string} URL generada
 */
const generateTableMenuUrl = (slug, tableId) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://menu.dominio.com';
  return `${baseUrl}/table/${slug}/${tableId}`;
};

/**
 * Genera imagen QR como DataURL
 * @param {string} text - Texto o URL a codificar
 * @param {Object} options - Opciones del QR
 * @returns {Promise<string>} DataURL del QR
 */
const generateQRDataURL = async (text, options = {}) => {
  const qrOptions = { ...DEFAULT_QR_OPTIONS, ...options };
  
  try {
    const dataURL = await QRCode.toDataURL(text, qrOptions);
    return dataURL;
  } catch (error) {
    console.error('Error generating QR DataURL:', error.message);
    throw error;
  }
};

/**
 * Genera imagen QR como buffer (PNG)
 * @param {string} text - Texto o URL a codificar
 * @param {Object} options - Opciones del QR
 * @returns {Promise<Buffer>} Buffer de la imagen PNG
 */
const generateQRBuffer = async (text, options = {}) => {
  const qrOptions = { ...DEFAULT_QR_OPTIONS, ...options };
  
  try {
    const buffer = await QRCode.toBuffer(text, qrOptions);
    return buffer;
  } catch (error) {
    console.error('Error generating QR buffer:', error.message);
    throw error;
  }
};

/**
 * Genera imagen QR como string (base64)
 * @param {string} text - Texto o URL a codificar
 * @param {Object} options - Opciones del QR
 * @returns {Promise<string>} String base64 de la imagen
 */
const generateQRBase64 = async (text, options = {}) => {
  const dataURL = await generateQRDataURL(text, options);
  // Extraer solo la parte base64 (remover el prefijo data:image/png;base64,)
  return dataURL.split(',')[1];
};

/**
 * Genera QR para un restaurante/sede con caché
 * @param {string} slug - Slug del restaurante
 * @param {string} branchId - ID de la sede (opcional)
 * @param {Object} options - Opciones del QR
 * @returns {Promise<Object>} QR generado (URL, imagen, etc.)
 */
const generateMenuQR = async (slug, branchId = null, options = {}) => {
  const url = generateMenuUrl(slug, branchId);
  const cacheKey = `${QR_CACHE_PREFIX}menu:${slug}${branchId ? `:${branchId}` : ''}`;
  
  // Intentar obtener del caché
  const cached = await redis.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  const dataURL = await generateQRDataURL(url, options);
  const buffer = await generateQRBuffer(url, options);
  
  const result = {
    url,
    dataURL,
    base64: dataURL.split(',')[1],
    buffer: buffer.toString('base64'),
    options: { ...DEFAULT_QR_OPTIONS, ...options },
  };
  
  // Guardar en caché
  await redis.set(cacheKey, result, QR_CACHE_TTL);
  
  return result;
};

/**
 * Genera QR para una mesa específica con caché
 * @param {string} slug - Slug del restaurante
 * @param {string} tableId - ID de la mesa
 * @param {string} tableNumber - Número de mesa (para metadata)
 * @param {Object} options - Opciones del QR
 * @returns {Promise<Object>} QR generado (URL, imagen, etc.)
 */
const generateTableQR = async (slug, tableId, tableNumber, options = {}) => {
  const url = generateTableMenuUrl(slug, tableId);
  const cacheKey = `${QR_CACHE_PREFIX}table:${slug}:${tableId}`;
  
  // Intentar obtener del caché
  const cached = await redis.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  const dataURL = await generateQRDataURL(url, options);
  const buffer = await generateQRBuffer(url, options);
  
  const result = {
    url,
    dataURL,
    base64: dataURL.split(',')[1],
    buffer: buffer.toString('base64'),
    table_id: tableId,
    table_number: tableNumber,
    options: { ...DEFAULT_QR_OPTIONS, ...options },
  };
  
  // Guardar en caché
  await redis.set(cacheKey, result, QR_CACHE_TTL);
  
  return result;
};

// ======================================================
// FUNCIONES DE UTILIDAD
// ======================================================

/**
 * Invalida el caché de un QR
 * @param {string} type - Tipo de QR ('menu' o 'table')
 * @param {string} identifier - Identificador (slug o tableId)
 * @returns {Promise<boolean>}
 */
const invalidateQRCache = async (type, identifier) => {
  let pattern;
  
  if (type === 'menu') {
    pattern = `${QR_CACHE_PREFIX}menu:${identifier}*`;
  } else if (type === 'table') {
    pattern = `${QR_CACHE_PREFIX}table:*:${identifier}`;
  } else {
    return false;
  }
  
  const deleted = await redis.invalidateByPattern(pattern);
  console.log(`Invalidated ${deleted} QR cache entries for ${type}: ${identifier}`);
  
  return deleted > 0;
};

/**
 * Invalida todo el caché de QRs de un restaurante
 * @param {string} slug - Slug del restaurante
 * @returns {Promise<number>}
 */
const invalidateAllQRCache = async (slug) => {
  const menuPattern = `${QR_CACHE_PREFIX}menu:${slug}*`;
  const tablePattern = `${QR_CACHE_PREFIX}table:${slug}:*`;
  
  const menuDeleted = await redis.invalidateByPattern(menuPattern);
  const tableDeleted = await redis.invalidateByPattern(tablePattern);
  
  const total = menuDeleted + tableDeleted;
  console.log(`Invalidated ${total} QR cache entries for restaurant: ${slug}`);
  
  return total;
};

/**
 * Obtiene opciones personalizadas para QR
 * @param {Object} customOptions - Opciones personalizadas
 * @param {string} primaryColor - Color primario del restaurante
 * @returns {Object} Opciones combinadas
 */
const getQROptions = (customOptions = {}, primaryColor = '#000000') => {
  return {
    ...DEFAULT_QR_OPTIONS,
    color: {
      dark: customOptions.color?.dark || primaryColor,
      light: customOptions.color?.light || '#ffffff',
    },
    ...customOptions,
  };
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  // Constantes
  DEFAULT_QR_OPTIONS,
  QR_CACHE_TTL,
  
  // Generación de URLs
  generateMenuUrl,
  generateTableMenuUrl,
  
  // Generación de imágenes QR
  generateQRDataURL,
  generateQRBuffer,
  generateQRBase64,
  
  // QRs completos con caché
  generateMenuQR,
  generateTableQR,
  
  // Invalidación de caché
  invalidateQRCache,
  invalidateAllQRCache,
  
  // Utilidades
  getQROptions,
};