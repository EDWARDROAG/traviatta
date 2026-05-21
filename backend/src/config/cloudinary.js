/**
 * ======================================================
 * ARCHIVO: cloudinary.js
 * UBICACIÓN: menu-qr-system/backend/src/config/cloudinary.js
 * FASE: F2
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-15 12:30
 *
 * 🎯 PROPÓSITO:
 * Configurar el cliente de Cloudinary para gestión de
 * imágenes de productos, logos de restaurantes y
 * galerías. Permite subida automática, optimización
 * de formato WebP, transformaciones bajo demanda y
 * eliminación de imágenes no utilizadas.
 *
 * 📦 DEPENDENCIAS:
 * - cloudinary: SDK oficial de Cloudinary
 * - dotenv: Variables de entorno
 * - streamifier: Conversión de buffers a streams
 *
 * 🔗 RELACIONES:
 * - Importa de: dotenv, streamifier
 * - Es importado por: controllers/admin/productController.js,
 *   controllers/admin/settingsController.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-15 12:30
 *    ✅ Creación inicial del archivo
 *    ✅ Configuración de Cloudinary con credenciales
 *    ✅ Funciones de subida de imágenes
 *    ✅ Funciones de eliminación
 *    ✅ Generación de URLs optimizadas
 *    ✅ Transformación de imágenes (tamaños, formatos)
 *    ✅ Validación de archivos
 * ======================================================
 */

const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
require('dotenv').config();

// ======================================================
// CONFIGURACIÓN DE CLOUDINARY
// ======================================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Usar URLs HTTPS
});

// ======================================================
// CONFIGURACIONES POR DEFECTO
// ======================================================

const DEFAULT_OPTIONS = {
  // Productos
  product: {
    folder: 'products',
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'auto' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' }, // WebP si el navegador lo soporta
    ],
  },
  
  // Logos de restaurantes
  logo: {
    folder: 'logos',
    transformation: [
      { width: 200, height: 200, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  },
  
  // Galerías de restaurantes
  gallery: {
    folder: 'galleries',
    transformation: [
      { width: 800, height: 600, crop: 'fill', gravity: 'auto' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  },
  
  // Thumbnails (miniaturas)
  thumbnail: {
    folder: 'thumbnails',
    transformation: [
      { width: 100, height: 100, crop: 'thumb', gravity: 'face' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  },
};

// ======================================================
// FUNCIONES DE SUBIDA
// ======================================================

/**
 * Sube una imagen desde buffer (archivo subido por multer)
 * @param {Buffer} buffer - Buffer de la imagen
 * @param {string} type - Tipo de imagen ('product', 'logo', 'gallery', 'thumbnail')
 * @param {string} customName - Nombre personalizado para la imagen (opcional)
 * @returns {Promise<Object>} Resultado con url, public_id, etc.
 */
const uploadFromBuffer = async (buffer, type = 'product', customName = null) => {
  try {
    const config = DEFAULT_OPTIONS[type] || DEFAULT_OPTIONS.product;
    
    // Generar nombre único
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const publicId = customName 
      ? `${config.folder}/${customName}`
      : `${config.folder}/${timestamp}_${random}`;
    
    // Subir con stream
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          folder: config.folder,
          transformation: config.transformation,
          unique_filename: true,
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
              created_at: result.created_at,
            });
          }
        }
      );
      
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  } catch (error) {
    console.error('❌ Error subiendo imagen a Cloudinary:', error.message);
    throw error;
  }
};

/**
 * Sube una imagen desde URL
 * @param {string} imageUrl - URL de la imagen
 * @param {string} type - Tipo de imagen ('product', 'logo', 'gallery')
 * @returns {Promise<Object>} Resultado con url, public_id, etc.
 */
const uploadFromUrl = async (imageUrl, type = 'product') => {
  try {
    const config = DEFAULT_OPTIONS[type] || DEFAULT_OPTIONS.product;
    
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: config.folder,
      transformation: config.transformation,
    });
    
    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('❌ Error subiendo imagen desde URL:', error.message);
    throw error;
  }
};

/**
 * Sube múltiples imágenes
 * @param {Array<Buffer>} buffers - Array de buffers de imágenes
 * @param {string} type - Tipo de imagen
 * @returns {Promise<Array>} Array de resultados
 */
const uploadMultiple = async (buffers, type = 'product') => {
  const uploads = buffers.map(buffer => uploadFromBuffer(buffer, type));
  return Promise.all(uploads);
};

// ======================================================
// FUNCIONES DE ELIMINACIÓN
// ======================================================

/**
 * Elimina una imagen de Cloudinary
 * @param {string} publicId - ID público de la imagen
 * @returns {Promise<boolean>} True si se eliminó correctamente
 */
const deleteImage = async (publicId) => {
  try {
    if (!publicId) return false;
    
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('❌ Error eliminando imagen:', error.message);
    return false;
  }
};

/**
 * Elimina múltiples imágenes
 * @param {Array<string>} publicIds - Array de IDs públicos
 * @returns {Promise<Object>} Resultado de la operación
 */
const deleteMultipleImages = async (publicIds) => {
  try {
    const results = await Promise.all(
      publicIds.map(id => deleteImage(id))
    );
    return {
      success: results.filter(r => r).length,
      failed: results.filter(r => !r).length,
    };
  } catch (error) {
    console.error('❌ Error eliminando múltiples imágenes:', error.message);
    return { success: 0, failed: publicIds.length };
  }
};

// ======================================================
// FUNCIONES DE TRANSFORMACIÓN
// ======================================================

/**
 * Genera URL optimizada con transformaciones
 * @param {string} publicId - ID público de la imagen
 * @param {Object} transformations - Transformaciones a aplicar
 * @returns {string} URL transformada
 */
const getOptimizedUrl = (publicId, transformations = {}) => {
  if (!publicId) return null;
  
  const defaultTransforms = {
    quality: 'auto',
    fetch_format: 'auto',
  };
  
  const finalTransforms = { ...defaultTransforms, ...transformations };
  
  return cloudinary.url(publicId, finalTransforms);
};

/**
 * Genera URL para thumbnail
 * @param {string} publicId - ID público de la imagen
 * @param {number} width - Ancho (default 150)
 * @param {number} height - Alto (default 150)
 * @returns {string} URL del thumbnail
 */
const getThumbnailUrl = (publicId, width = 150, height = 150) => {
  if (!publicId) return null;
  
  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'thumb',
    gravity: 'face',
    quality: 'auto',
    fetch_format: 'auto',
  });
};

/**
 * Genera URL responsive (diferentes tamaños según dispositivo)
 * @param {string} publicId - ID público de la imagen
 * @returns {Object} URLs para diferentes tamaños
 */
const getResponsiveUrls = (publicId) => {
  if (!publicId) return null;
  
  return {
    small: cloudinary.url(publicId, { width: 300, crop: 'scale', quality: 'auto' }),
    medium: cloudinary.url(publicId, { width: 600, crop: 'scale', quality: 'auto' }),
    large: cloudinary.url(publicId, { width: 1200, crop: 'scale', quality: 'auto' }),
    original: cloudinary.url(publicId, { quality: 'auto' }),
  };
};

// ======================================================
// VALIDACIÓN DE ARCHIVOS
// ======================================================

/**
 * Tipos de imagen permitidos
 */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
];

/**
 * Tamaño máximo por defecto (5MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Valida un archivo de imagen
 * @param {Object} file - Archivo de multer
 * @param {number} maxSize - Tamaño máximo en bytes
 * @returns {Object} { valid: boolean, error: string }
 */
const validateImage = (file, maxSize = MAX_FILE_SIZE) => {
  if (!file) {
    return { valid: false, error: 'No se proporcionó ningún archivo' };
  }
  
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return { 
      valid: false, 
      error: `Tipo de archivo no permitido. Permitidos: ${ALLOWED_MIME_TYPES.join(', ')}` 
    };
  }
  
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `Archivo demasiado grande. Máximo: ${maxSize / (1024 * 1024)}MB` 
    };
  }
  
  return { valid: true, error: null };
};

/**
 * Valida múltiples archivos
 * @param {Array} files - Array de archivos de multer
 * @returns {Object} Resultados de validación
 */
const validateMultipleImages = (files) => {
  const results = files.map(file => validateImage(file));
  const invalid = results.filter(r => !r.valid);
  
  if (invalid.length > 0) {
    return { valid: false, errors: invalid.map(r => r.error) };
  }
  
  return { valid: true, errors: [] };
};

// ======================================================
// UTILIDADES
// ======================================================

/**
 * Obtiene información de una imagen
 * @param {string} publicId - ID público de la imagen
 * @returns {Promise<Object>} Información de la imagen
 */
const getImageInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return {
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      created_at: result.created_at,
    };
  } catch (error) {
    console.error('❌ Error obteniendo información de imagen:', error.message);
    return null;
  }
};

/**
 * Health check de Cloudinary
 * @returns {Promise<Object>}
 */
const healthCheck = async () => {
  try {
    // Intentar obtener recursos como prueba de conexión
    await cloudinary.api.ping();
    return {
      healthy: true,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      status: 'connected',
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      status: 'disconnected',
    };
  }
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  // Cliente directo
  client: cloudinary,
  
  // Constantes
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  DEFAULT_OPTIONS,
  
  // Subida
  uploadFromBuffer,
  uploadFromUrl,
  uploadMultiple,
  
  // Eliminación
  deleteImage,
  deleteMultipleImages,
  
  // Transformación
  getOptimizedUrl,
  getThumbnailUrl,
  getResponsiveUrls,
  
  // Validación
  validateImage,
  validateMultipleImages,
  
  // Utilidades
  getImageInfo,
  healthCheck,
};