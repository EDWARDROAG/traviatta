/**
 * ======================================================
 * ARCHIVO: auth.js
 * UBICACIÓN: menu-qr-system/admin-panel/src/services/auth.js
 * FASE: F2
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-17 00:45
 *
 * 🎯 PROPÓSITO:
 * Servicio de autenticación para el panel administrativo.
 * Proporciona funciones para login, logout, registro,
 * recuperación de contraseña y verificación de token.
 *
 * 📦 DEPENDENCIAS:
 * - api: Cliente HTTP configurado
 *
 * 🔗 RELACIONES:
 * - Importado por: hooks/useAuth.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-17 00:45
 *    ✅ Creación inicial del archivo
 *    ✅ Función login
 *    ✅ Función logout
 *    ✅ Función register
 *    ✅ Función verifyToken
 *    ✅ Función changePassword
 *    ✅ Función forgotPassword
 *    ✅ Función resetPassword
 *    ✅ Función refreshToken
 * ======================================================
 */

import api from './api';

// ======================================================
// AUTENTICACIÓN PRINCIPAL
// ======================================================

/**
 * Inicia sesión con email/contraseña o slug/contraseña
 * @param {Object} credentials - Credenciales { email, password } o { slug, password }
 * @returns {Promise<Object>} Datos del usuario y token
 */
const login = async (credentials) => {
  const response = await api.post('/admin/auth/login', credentials);
  if (response.data.success) {
    const { token, user } = response.data.data;
    // Guardar token en localStorage
    localStorage.setItem('auth-storage', JSON.stringify({
      state: { token, user },
      version: 0,
    }));
    return { token, user };
  }
  throw new Error(response.data.error || 'Error al iniciar sesión');
};

/**
 * Cierra la sesión actual
 * @returns {Promise<boolean>}
 */
const logout = async () => {
  try {
    await api.post('/admin/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('auth-storage');
  }
  return true;
};

/**
 * Registra un nuevo restaurante
 * @param {Object} userData - Datos del restaurante { name, email, password, phone, address, whatsapp_number }
 * @returns {Promise<Object>} Datos del usuario y token
 */
const register = async (userData) => {
  const response = await api.post('/admin/auth/register', userData);
  if (response.data.success) {
    const { token, user } = response.data.data;
    localStorage.setItem('auth-storage', JSON.stringify({
      state: { token, user },
      version: 0,
    }));
    return { token, user };
  }
  throw new Error(response.data.error || 'Error al registrar');
};

/**
 * Verifica si el token actual es válido
 * @returns {Promise<Object>} Datos del usuario
 */
const verifyToken = async () => {
  const response = await api.get('/admin/auth/verify');
  if (response.data.success) {
    return response.data.data.user;
  }
  throw new Error('Token inválido');
};

// ======================================================
// GESTIÓN DE CONTRASEÑA
// ======================================================

/**
 * Cambia la contraseña del usuario autenticado
 * @param {string} currentPassword - Contraseña actual
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<boolean>}
 */
const changePassword = async (currentPassword, newPassword) => {
  const response = await api.post('/admin/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  });
  if (response.data.success) {
    return true;
  }
  throw new Error(response.data.error || 'Error al cambiar contraseña');
};

/**
 * Solicita recuperación de contraseña
 * @param {string} email - Email del restaurante
 * @returns {Promise<boolean>}
 */
const forgotPassword = async (email) => {
  const response = await api.post('/admin/auth/forgot-password', { email });
  if (response.data.success) {
    return true;
  }
  throw new Error(response.data.error || 'Error al solicitar recuperación');
};

/**
 * Restablece la contraseña con token
 * @param {string} token - Token de recuperación
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<boolean>}
 */
const resetPassword = async (token, newPassword) => {
  const response = await api.post('/admin/auth/reset-password', {
    token,
    new_password: newPassword,
  });
  if (response.data.success) {
    return true;
  }
  throw new Error(response.data.error || 'Error al restablecer contraseña');
};

// ======================================================
// REFRESCO DE TOKEN
// ======================================================

/**
 * Refresca el token JWT
 * @returns {Promise<string>} Nuevo token
 */
const refreshToken = async () => {
  const storage = localStorage.getItem('auth-storage');
  if (!storage) {
    throw new Error('No hay sesión activa');
  }
  
  try {
    const parsed = JSON.parse(storage);
    const refreshTokenValue = parsed.state?.token;
    
    if (!refreshTokenValue) {
      throw new Error('No hay token para refrescar');
    }
    
    const response = await api.post('/admin/auth/refresh-token', {
      refresh_token: refreshTokenValue,
    });
    
    if (response.data.success) {
      const { token } = response.data.data;
      // Actualizar localStorage
      parsed.state.token = token;
      localStorage.setItem('auth-storage', JSON.stringify(parsed));
      return token;
    }
    throw new Error('Error al refrescar token');
  } catch (error) {
    localStorage.removeItem('auth-storage');
    throw error;
  }
};

// ======================================================
// UTILIDADES
// ======================================================

/**
 * Obtiene el usuario actual desde localStorage
 * @returns {Object|null}
 */
const getCurrentUser = () => {
  const storage = localStorage.getItem('auth-storage');
  if (!storage) return null;
  
  try {
    const parsed = JSON.parse(storage);
    return parsed.state?.user || null;
  } catch {
    return null;
  }
};

/**
 * Obtiene el token actual desde localStorage
 * @returns {string|null}
 */
const getCurrentToken = () => {
  const storage = localStorage.getItem('auth-storage');
  if (!storage) return null;
  
  try {
    const parsed = JSON.parse(storage);
    return parsed.state?.token || null;
  } catch {
    return null;
  }
};

/**
 * Verifica si hay un usuario autenticado
 * @returns {boolean}
 */
const isAuthenticated = () => {
  return !!getCurrentToken();
};

// ======================================================
// EXPORTACIONES
// ======================================================

export default {
  login,
  logout,
  register,
  verifyToken,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
  getCurrentUser,
  getCurrentToken,
  isAuthenticated,
};

export {
  login,
  logout,
  register,
  verifyToken,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
  getCurrentUser,
  getCurrentToken,
  isAuthenticated,
};