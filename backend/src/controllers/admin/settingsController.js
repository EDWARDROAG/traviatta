/**
 * ======================================================
 * ARCHIVO: settingsController.js
 * UBICACIÓN: menu-qr-system/backend/src/controllers/admin/settingsController.js
 * FASE: F2
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 01:00
 *
 * 🎯 PROPÓSITO:
 * Controlador para la configuración general del
 * restaurante en el panel administrativo. Maneja
 * actualización de datos del negocio, cambio de logo,
 * colores personalizados, configuración de WhatsApp,
 * y opciones generales del sistema.
 *
 * 📦 DEPENDENCIAS:
 * - ../../models/Tenant: Modelo de restaurantes
 * - ../../config/cloudinary: Gestión de imágenes
 * - ../../services/menuService: Invalidación de caché
 * - ../../utils/logger: Logging
 *
 * 🔗 RELACIONES:
 * - Importa de: ../../models/*, ../../config/*, ../../services/*
 * - Es importado por: ../../routes/admin.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 01:00
 *    ✅ Creación inicial del archivo
 *    ✅ Configuración general del restaurante
 *    ✅ Cambio de logo con Cloudinary
 *    ✅ Actualización de colores y tema
 *    ✅ Configuración de WhatsApp
 *    ✅ Configuración de horarios generales
 *    ✅ Configuración de domicilio global
 * ======================================================
 */

const Tenant = require('../../models/Tenant');
const cloudinary = require('../../config/cloudinary');
const menuService = require('../../services/menuService');
const logger = require('../../utils/logger');

// ======================================================
// FUNCIONES AUXILIARES
// ======================================================

/**
 * Envía respuesta de éxito
 * @param {Object} res - Response object
 * @param {Object} data - Datos a enviar
 * @param {number} statusCode - Código HTTP
 */
const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Envía respuesta de error
 * @param {Object} res - Response object
 * @param {string} message - Mensaje de error
 * @param {number} statusCode - Código HTTP
 */
const sendError = (res, message, statusCode = 500) => {
  res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  });
};

// ======================================================
// CONFIGURACIÓN GENERAL
// ======================================================

/**
 * GET /admin/settings
 * Obtiene la configuración del restaurante autenticado
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getSettings = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return sendError(res, 'Restaurante no encontrado', 404);
    }
    
    sendSuccess(res, {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      logo_url: tenant.logo_url,
      primary_color: tenant.primary_color,
      whatsapp_number: tenant.whatsapp_number,
      email: tenant.email,
      phone: tenant.phone,
      address: tenant.address,
      subscription_tier: tenant.subscription_tier,
      settings: tenant.settings,
    });
  } catch (error) {
    logger.error('Error in getSettings:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * PUT /admin/settings
 * Actualiza la configuración general del restaurante
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const updateSettings = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const updateData = req.body;
    
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return sendError(res, 'Restaurante no encontrado', 404);
    }
    
    const allowedFields = [
      'name', 'whatsapp_number', 'email', 'phone', 'address', 'primary_color'
    ];
    
    const filteredData = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }
    
    if (updateData.settings) {
      filteredData.settings = updateData.settings;
    }
    
    const updatedTenant = await Tenant.update(tenantId, filteredData);
    
    // Invalidar caché de menús
    await menuService.invalidateAllMenusByTenant(tenantId);
    
    logger.info(`Settings updated for tenant: ${tenant.slug}`);
    
    sendSuccess(res, updatedTenant);
  } catch (error) {
    logger.error('Error in updateSettings:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// GESTIÓN DE LOGO
// ======================================================

/**
 * POST /admin/settings/logo
 * Actualiza el logo del restaurante
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const updateLogo = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return sendError(res, 'Restaurante no encontrado', 404);
    }
    
    if (!req.file) {
      return sendError(res, 'No se proporcionó ninguna imagen', 400);
    }
    
    const validation = cloudinary.validateImage(req.file);
    if (!validation.valid) {
      return sendError(res, validation.error, 400);
    }
    
    // Eliminar logo anterior si existe
    if (tenant.logo_url) {
      const publicId = tenant.logo_url.split('/').pop().split('.')[0];
      await cloudinary.deleteImage(`logos/${publicId}`);
    }
    
    const uploadResult = await cloudinary.uploadFromBuffer(req.file.buffer, 'logo');
    
    const updatedTenant = await Tenant.update(tenantId, {
      logo_url: uploadResult.url,
    });
    
    await menuService.invalidateAllMenusByTenant(tenantId);
    
    logger.info(`Logo updated for tenant: ${tenant.slug}`);
    
    sendSuccess(res, {
      logo_url: uploadResult.url,
      message: 'Logo actualizado correctamente',
    });
  } catch (error) {
    logger.error('Error in updateLogo:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * DELETE /admin/settings/logo
 * Elimina el logo del restaurante
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const deleteLogo = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return sendError(res, 'Restaurante no encontrado', 404);
    }
    
    if (tenant.logo_url) {
      const publicId = tenant.logo_url.split('/').pop().split('.')[0];
      await cloudinary.deleteImage(`logos/${publicId}`);
    }
    
    const updatedTenant = await Tenant.update(tenantId, {
      logo_url: null,
    });
    
    await menuService.invalidateAllMenusByTenant(tenantId);
    
    logger.info(`Logo deleted for tenant: ${tenant.slug}`);
    
    sendSuccess(res, { message: 'Logo eliminado correctamente' });
  } catch (error) {
    logger.error('Error in deleteLogo:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// CONFIGURACIÓN DE COLORES
// ======================================================

/**
 * PUT /admin/settings/colors
 * Actualiza los colores del restaurante
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const updateColors = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { primary_color, secondary_color, font_family } = req.body;
    
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return sendError(res, 'Restaurante no encontrado', 404);
    }
    
    const settings = tenant.settings || {};
    
    if (primary_color) settings.primary_color = primary_color;
    if (secondary_color) settings.secondary_color = secondary_color;
    if (font_family) settings.font_family = font_family;
    
    const updatedTenant = await Tenant.update(tenantId, {
      primary_color: primary_color || tenant.primary_color,
      settings,
    });
    
    await menuService.invalidateAllMenusByTenant(tenantId);
    
    logger.info(`Colors updated for tenant: ${tenant.slug}`);
    
    sendSuccess(res, {
      primary_color: updatedTenant.primary_color,
      settings: updatedTenant.settings,
    });
  } catch (error) {
    logger.error('Error in updateColors:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// CONFIGURACIÓN DE WHATSAPP
// ======================================================

/**
 * PUT /admin/settings/whatsapp
 * Actualiza el número de WhatsApp del restaurante
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const updateWhatsApp = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { whatsapp_number } = req.body;
    
    if (!whatsapp_number) {
      return sendError(res, 'El número de WhatsApp es requerido', 400);
    }
    
    const cleanedNumber = whatsapp_number.replace(/[^0-9]/g, '');
    if (cleanedNumber.length < 10 || cleanedNumber.length > 15) {
      return sendError(res, 'Número de WhatsApp inválido (debe tener entre 10 y 15 dígitos)', 400);
    }
    
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return sendError(res, 'Restaurante no encontrado', 404);
    }
    
    const updatedTenant = await Tenant.update(tenantId, {
      whatsapp_number: cleanedNumber,
    });
    
    await menuService.invalidateAllMenusByTenant(tenantId);
    
    logger.info(`WhatsApp updated for tenant: ${tenant.slug}`);
    
    sendSuccess(res, {
      whatsapp_number: updatedTenant.whatsapp_number,
      message: 'Número de WhatsApp actualizado correctamente',
    });
  } catch (error) {
    logger.error('Error in updateWhatsApp:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// CONFIGURACIÓN DE HORARIOS GENERALES
// ======================================================

/**
 * PUT /admin/settings/schedule
 * Actualiza horarios generales del restaurante
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const updateGeneralSchedule = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { schedule } = req.body;
    
    if (!schedule) {
      return sendError(res, 'Se requiere el objeto schedule', 400);
    }
    
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return sendError(res, 'Restaurante no encontrado', 404);
    }
    
    const settings = tenant.settings || {};
    settings.schedule = schedule;
    
    const updatedTenant = await Tenant.update(tenantId, { settings });
    
    await menuService.invalidateAllMenusByTenant(tenantId);
    
    logger.info(`General schedule updated for tenant: ${tenant.slug}`);
    
    sendSuccess(res, {
      schedule,
      message: 'Horarios actualizados correctamente',
    });
  } catch (error) {
    logger.error('Error in updateGeneralSchedule:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// CONFIGURACIÓN DE DOMICILIO GLOBAL
// ======================================================

/**
 * PUT /admin/settings/delivery
 * Actualiza configuración de domicilio global
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const updateGlobalDelivery = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { delivery_settings } = req.body;
    
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return sendError(res, 'Restaurante no encontrado', 404);
    }
    
    const settings = tenant.settings || {};
    settings.delivery = delivery_settings;
    
    const updatedTenant = await Tenant.update(tenantId, { settings });
    
    logger.info(`Global delivery settings updated for tenant: ${tenant.slug}`);
    
    sendSuccess(res, {
      delivery_settings: delivery_settings,
      message: 'Configuración de domicilio actualizada correctamente',
    });
  } catch (error) {
    logger.error('Error in updateGlobalDelivery:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// SUSCRIPCIÓN
// ======================================================

/**
 * GET /admin/settings/subscription
 * Obtiene información de la suscripción
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getSubscriptionInfo = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return sendError(res, 'Restaurante no encontrado', 404);
    }
    
    sendSuccess(res, {
      subscription_tier: tenant.subscription_tier,
      features: getFeaturesByTier(tenant.subscription_tier),
      settings: tenant.settings?.subscription || {},
    });
  } catch (error) {
    logger.error('Error in getSubscriptionInfo:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * Obtiene características por nivel de suscripción
 * @param {string} tier - Nivel de suscripción
 * @returns {Object} Características
 */
const getFeaturesByTier = (tier) => {
  const features = {
    basic: {
      max_branches: 1,
      max_products: 50,
      max_orders_per_day: 100,
      custom_qr: false,
      analytics: false,
      support: 'email',
    },
    pro: {
      max_branches: 5,
      max_products: 500,
      max_orders_per_day: 1000,
      custom_qr: true,
      analytics: true,
      support: 'priority',
    },
    premium: {
      max_branches: 999,
      max_products: 9999,
      max_orders_per_day: 10000,
      custom_qr: true,
      analytics: true,
      support: '24/7',
    },
  };
  
  return features[tier] || features.basic;
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  getSettings,
  updateSettings,
  updateLogo,
  deleteLogo,
  updateColors,
  updateWhatsApp,
  updateGeneralSchedule,
  updateGlobalDelivery,
  getSubscriptionInfo,
};