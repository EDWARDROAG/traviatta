/**
 * ======================================================
 * ARCHIVO: slugify.js
 * UBICACIÓN: menu-qr-system/backend/src/utils/slugify.js
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 06:30
 *
 * 🎯 PROPÓSITO:
 * Utilidad para la generación de slugs URL-amigables
 * a partir de nombres de restaurantes, productos o
 * categorías. Convierte texto con tildes, espacios
 * y caracteres especiales a formato seguro para URLs.
 *
 * 📦 DEPENDENCIAS:
 * - slugify: Librería de generación de slugs
 *
 * 🔗 RELACIONES:
 * - Importa de: slugify
 * - Es importado por: models/Tenant.js, models/Product.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 06:30
 *    ✅ Creación inicial del archivo
 *    ✅ Generación de slugs para restaurantes
 *    ✅ Generación de slugs para productos
 *    ✅ Validación de slugs únicos
 *    ✅ Normalización de caracteres especiales
 *    ✅ Soporte para español (tildes, ñ)
 * ======================================================
 */

const slugifyLib = require('slugify');

// ======================================================
// CONFIGURACIÓN
// ======================================================

/**
 * Configuración por defecto para slugify
 * Soporte para caracteres en español
 */
const DEFAULT_OPTIONS = {
  replacement: '-',
  remove: /[*+~.()'"!:@]/g,
  lower: true,
  strict: true,
  locale: 'es',
  trim: true,
};

// Mapa de caracteres especiales para normalización adicional
const CHAR_MAP = {
  'á': 'a',
  'é': 'e',
  'í': 'i',
  'ó': 'o',
  'ú': 'u',
  'ü': 'u',
  'ñ': 'n',
  'Á': 'a',
  'É': 'e',
  'Í': 'i',
  'Ó': 'o',
  'Ú': 'u',
  'Ü': 'u',
  'Ñ': 'n',
  'ç': 'c',
  'Ç': 'c',
  'ß': 'ss',
  'ø': 'o',
};

// ======================================================
// FUNCIONES PRINCIPALES
// ======================================================

/**
 * Genera un slug a partir de un texto
 * @param {string} text - Texto a convertir
 * @param {Object} options - Opciones adicionales
 * @returns {string} Slug generado
 */
const slugify = (text, options = {}) => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  // Normalizar caracteres especiales adicionales
  let normalized = text;
  for (const [char, replacement] of Object.entries(CHAR_MAP)) {
    normalized = normalized.replace(new RegExp(char, 'g'), replacement);
  }
  
  // Generar slug con librería
  let slug = slugifyLib(normalized, mergedOptions);
  
  // Limitar longitud (máximo 50 caracteres para slugs)
  if (slug.length > 50) {
    slug = slug.substring(0, 50);
  }
  
  // Eliminar guiones múltiples
  slug = slug.replace(/-+/g, '-');
  
  // Eliminar guiones al inicio o final
  slug = slug.replace(/^-|-$/g, '');
  
  return slug;
};

/**
 * Genera slug para restaurante
 * @param {string} name - Nombre del restaurante
 * @returns {string} Slug generado
 */
const slugifyTenant = (name) => {
  return slugify(name, { replacement: '-', lower: true, strict: true });
};

/**
 * Genera slug para producto
 * @param {string} name - Nombre del producto
 * @returns {string} Slug generado
 */
const slugifyProduct = (name) => {
  return slugify(name, { replacement: '-', lower: true, strict: true });
};

/**
 * Genera slug para categoría
 * @param {string} name - Nombre de la categoría
 * @returns {string} Slug generado
 */
const slugifyCategory = (name) => {
  return slugify(name, { replacement: '-', lower: true, strict: true });
};

/**
 * Genera slug único añadiendo número si es necesario
 * @param {string} baseSlug - Slug base
 * @param {Function} existsFunction - Función para verificar existencia
 * @returns {Promise<string>} Slug único
 */
const generateUniqueSlug = async (baseSlug, existsFunction) => {
  let slug = baseSlug;
  let counter = 1;
  
  while (await existsFunction(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

// ======================================================
// FUNCIONES DE VALIDACIÓN
// ======================================================

/**
 * Verifica si un slug es válido
 * @param {string} slug - Slug a validar
 * @returns {boolean} Válido o no
 */
const isValidSlug = (slug) => {
  if (!slug || typeof slug !== 'string') {
    return false;
  }
  
  // Debe contener solo letras minúsculas, números y guiones
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

/**
 * Normaliza un slug (limpia y formatea)
 * @param {string} slug - Slug a normalizar
 * @returns {string} Slug normalizado
 */
const normalizeSlug = (slug) => {
  if (!slug) return '';
  
  let normalized = slug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Limitar longitud
  if (normalized.length > 50) {
    normalized = normalized.substring(0, 50);
  }
  
  return normalized;
};

// ======================================================
// FUNCIONES DE UTILIDAD
// ======================================================

/**
 * Extrae slug de una URL
 * @param {string} url - URL completa
 * @returns {string|null} Slug extraído o null
 */
const extractSlugFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(p => p);
    // Asume que el slug es el último segmento o uno específico
    return pathParts[pathParts.length - 1] || null;
  } catch (error) {
    return null;
  }
};

/**
 * Convierte slug a nombre legible
 * @param {string} slug - Slug a convertir
 * @returns {string} Nombre legible
 */
const slugToName = (slug) => {
  if (!slug) return '';
  
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  // Configuración
  DEFAULT_OPTIONS,
  CHAR_MAP,
  
  // Funciones principales
  slugify,
  slugifyTenant,
  slugifyProduct,
  slugifyCategory,
  generateUniqueSlug,
  
  // Validación
  isValidSlug,
  normalizeSlug,
  
  // Utilidades
  extractSlugFromUrl,
  slugToName,
};