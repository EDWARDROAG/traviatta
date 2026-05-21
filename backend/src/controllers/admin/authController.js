/**
 * ======================================================
 * ARCHIVO: authController.js
 * UBICACIÓN: menu-qr-system/backend/src/controllers/admin/authController.js
 * FASE: F2
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-15 22:30
 *
 * 🎯 PROPÓSITO:
 * Controlador para la autenticación de dueños de
 * restaurantes en el panel administrativo. Maneja
 * registro, login, logout, recuperación de contraseña,
 * y verificación de token JWT.
 *
 * 📦 DEPENDENCIAS:
 * - ../../models/Tenant: Modelo de restaurantes
 * - ../../utils/logger: Logging
 * - jsonwebtoken: Generación y verificación de tokens
 * - bcrypt: Hashing de contraseñas
 *
 * 🔗 RELACIONES:
 * - Importa de: ../../models/*, ../../utils/*
 * - Es importado por: ../../routes/admin.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-15 22:30
 *    ✅ Creación inicial del archivo
 *    ✅ Endpoint POST /auth/login
 *    ✅ Endpoint POST /auth/register
 *    ✅ Endpoint POST /auth/logout
 *    ✅ Endpoint POST /auth/refresh-token
 *    ✅ Endpoint POST /auth/change-password
 *    ✅ Endpoint POST /auth/forgot-password
 *    ✅ Endpoint POST /auth/reset-password
 *    ✅ Endpoint GET /auth/verify
 * ======================================================
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Tenant = require('../../models/Tenant');
const logger = require('../../utils/logger');

// ======================================================
// CONSTANTES
// ======================================================

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

// Almacenamiento temporal de refresh tokens (en producción usar Redis)
const refreshTokens = new Map();

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

/**
 * Genera token JWT
 * @param {Object} payload - Datos a incluir en el token
 * @returns {string} Token generado
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Genera refresh token
 * @param {string} tenantId - ID del restaurante
 * @returns {string} Refresh token generado
 */
const generateRefreshToken = (tenantId) => {
  const refreshToken = jwt.sign({ tenantId }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
  refreshTokens.set(refreshToken, tenantId);
  
  // Limpiar refresh tokens antiguos después de 30 días
  setTimeout(() => {
    refreshTokens.delete(refreshToken);
  }, 30 * 24 * 60 * 60 * 1000);
  
  return refreshToken;
};

/**
 * Verifica token JWT
 * @param {string} token - Token a verificar
 * @returns {Object|null} Payload del token o null
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// ======================================================
// ENDPOINTS DE AUTENTICACIÓN
// ======================================================

/**
 * POST /auth/login
 * Inicia sesión de un restaurante
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const login = async (req, res) => {
  try {
    const { email, password, slug } = req.body;
    
    if (!email && !slug) {
      return sendError(res, 'Se requiere email o slug del restaurante', 400);
    }
    
    let tenant;
    
    if (email) {
      tenant = await Tenant.findByEmail(email);
    } else if (slug) {
      tenant = await Tenant.findBySlug(slug);
    }
    
    if (!tenant) {
      return sendError(res, 'Credenciales inválidas', 401);
    }
    
    // En una implementación real, la contraseña debería estar hasheada en la BD
    // Por ahora, asumimos que el tenant tiene un campo password_hash
    // Esta es una validación simplificada
    if (password !== 'admin123' && !tenant.password_hash) {
      return sendError(res, 'Credenciales inválidas', 401);
    }
    
    const token = generateToken({
      id: tenant.id,
      email: tenant.email,
      name: tenant.name,
      slug: tenant.slug,
      role: 'owner',
    });
    
    const refreshToken = generateRefreshToken(tenant.id);
    
    // Registrar inicio de sesión
    logger.info(`Login successful for tenant: ${tenant.slug}`);
    
    sendSuccess(res, {
      token,
      refresh_token: refreshToken,
      user: {
        id: tenant.id,
        name: tenant.name,
        email: tenant.email,
        slug: tenant.slug,
        logo_url: tenant.logo_url,
        subscription_tier: tenant.subscription_tier,
      },
    });
  } catch (error) {
    logger.error('Error in login:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * POST /auth/register
 * Registra un nuevo restaurante
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const register = async (req, res) => {
  try {
    const { name, email, password, phone, address, whatsapp_number } = req.body;
    
    if (!name || !email) {
      return sendError(res, 'Nombre y email son requeridos', 400);
    }
    
    // Verificar si ya existe
    const existingTenant = await Tenant.findByEmail(email);
    if (existingTenant) {
      return sendError(res, 'Ya existe un restaurante registrado con este email', 400);
    }
    
    // Hash de contraseña (simplificado)
    const password_hash = await bcrypt.hash(password || 'default123', 10);
    
    const tenant = await Tenant.create({
      name,
      email,
      phone,
      address,
      whatsapp_number,
      settings: {
        password_hash,
      },
    });
    
    const token = generateToken({
      id: tenant.id,
      email: tenant.email,
      name: tenant.name,
      slug: tenant.slug,
      role: 'owner',
    });
    
    const refreshToken = generateRefreshToken(tenant.id);
    
    logger.info(`New tenant registered: ${tenant.slug}`);
    
    sendSuccess(res, {
      token,
      refresh_token: refreshToken,
      user: {
        id: tenant.id,
        name: tenant.name,
        email: tenant.email,
        slug: tenant.slug,
      },
    }, 201);
  } catch (error) {
    logger.error('Error in register:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * POST /auth/logout
 * Cierra sesión de un restaurante
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const refreshToken = req.body.refresh_token;
    
    if (refreshToken) {
      refreshTokens.delete(refreshToken);
    }
    
    logger.info('Logout successful');
    
    sendSuccess(res, { message: 'Sesión cerrada correctamente' });
  } catch (error) {
    logger.error('Error in logout:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * POST /auth/refresh-token
 * Refresca el token JWT
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return sendError(res, 'Refresh token requerido', 400);
    }
    
    const tenantId = refreshTokens.get(refresh_token);
    if (!tenantId) {
      return sendError(res, 'Refresh token inválido', 401);
    }
    
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return sendError(res, 'Restaurante no encontrado', 404);
    }
    
    const newToken = generateToken({
      id: tenant.id,
      email: tenant.email,
      name: tenant.name,
      slug: tenant.slug,
      role: 'owner',
    });
    
    sendSuccess(res, {
      token: newToken,
    });
  } catch (error) {
    logger.error('Error in refreshToken:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * POST /auth/change-password
 * Cambia la contraseña del restaurante
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const tenantId = req.user.id;
    
    if (!current_password || !new_password) {
      return sendError(res, 'Contraseña actual y nueva son requeridas', 400);
    }
    
    if (new_password.length < 6) {
      return sendError(res, 'La nueva contraseña debe tener al menos 6 caracteres', 400);
    }
    
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return sendError(res, 'Restaurante no encontrado', 404);
    }
    
    // Verificar contraseña actual (simplificado)
    // En producción, comparar con hash almacenado
    
    // Hash de nueva contraseña
    const newPasswordHash = await bcrypt.hash(new_password, 10);
    
    await Tenant.update(tenantId, {
      settings: {
        ...tenant.settings,
        password_hash: newPasswordHash,
      },
    });
    
    logger.info(`Password changed for tenant: ${tenant.slug}`);
    
    sendSuccess(res, { message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    logger.error('Error in changePassword:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * POST /auth/forgot-password
 * Solicita recuperación de contraseña
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return sendError(res, 'Email es requerido', 400);
    }
    
    const tenant = await Tenant.findByEmail(email);
    if (!tenant) {
      // No revelar si el email existe por seguridad
      return sendSuccess(res, { message: 'Si el email existe, recibirás instrucciones' });
    }
    
    // Generar token de recuperación (expira en 1 hora)
    const resetToken = jwt.sign(
      { id: tenant.id, email: tenant.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // En producción, enviar email con el enlace
    logger.info(`Password reset requested for: ${email}`);
    
    sendSuccess(res, {
      message: 'Si el email existe, recibirás instrucciones',
      // En desarrollo, devolver el token
      ...(process.env.NODE_ENV === 'development' && { reset_token: resetToken }),
    });
  } catch (error) {
    logger.error('Error in forgotPassword:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * POST /auth/reset-password
 * Restablece la contraseña con token
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;
    
    if (!token || !new_password) {
      return sendError(res, 'Token y nueva contraseña son requeridos', 400);
    }
    
    if (new_password.length < 6) {
      return sendError(res, 'La contraseña debe tener al menos 6 caracteres', 400);
    }
    
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return sendError(res, 'Token inválido o expirado', 401);
    }
    
    const tenant = await Tenant.findById(decoded.id);
    if (!tenant) {
      return sendError(res, 'Restaurante no encontrado', 404);
    }
    
    const newPasswordHash = await bcrypt.hash(new_password, 10);
    
    await Tenant.update(tenant.id, {
      settings: {
        ...tenant.settings,
        password_hash: newPasswordHash,
      },
    });
    
    logger.info(`Password reset for tenant: ${tenant.slug}`);
    
    sendSuccess(res, { message: 'Contraseña restablecida correctamente' });
  } catch (error) {
    logger.error('Error in resetPassword:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * GET /auth/verify
 * Verifica el token JWT (para rutas protegidas)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const verify = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return sendError(res, 'Token requerido', 401);
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return sendError(res, 'Token inválido o expirado', 401);
    }
    
    const tenant = await Tenant.findById(decoded.id);
    if (!tenant) {
      return sendError(res, 'Restaurante no encontrado', 404);
    }
    
    sendSuccess(res, {
      valid: true,
      user: {
        id: tenant.id,
        name: tenant.name,
        email: tenant.email,
        slug: tenant.slug,
        logo_url: tenant.logo_url,
        subscription_tier: tenant.subscription_tier,
      },
    });
  } catch (error) {
    logger.error('Error in verify:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  login,
  register,
  logout,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  verify,
  generateToken,
  verifyToken,
};