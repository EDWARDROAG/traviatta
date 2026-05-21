/**
 * ======================================================
 * ARCHIVO: api.js
 * UBICACIÓN: menu-qr-system/admin-panel/src/services/api.js
 * FASE: F2
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-17 00:30
 *
 * 🎯 PROPÓSITO:
 * Configuración del cliente Axios para el panel
 * administrativo. Incluye interceptores para manejo
 * de tokens, errores y refresco automático de sesión.
 *
 * 📦 DEPENDENCIAS:
 * - axios: Cliente HTTP
 *
 * 🔗 RELACIONES:
 * - Importado por: hooks, componentes
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-17 00:30
 *    ✅ Creación inicial del archivo
 *    ✅ Configuración base de Axios
 *    ✅ Interceptor de request (token)
 *    ✅ Interceptor de respuesta (errores)
 *    ✅ Refresco automático de token
 *    ✅ Logout en caso de token inválido
 * ======================================================
 */

import axios from 'axios';

// ======================================================
// CONFIGURACIÓN BASE
// ======================================================

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ======================================================
// VARIABLES GLOBALES
// ======================================================

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ======================================================
// INTERCEPTOR DE REQUEST
// ======================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-storage');
    if (token) {
      try {
        const parsed = JSON.parse(token);
        if (parsed.state?.token) {
          config.headers.Authorization = `Bearer ${parsed.state.token}`;
        }
      } catch (e) {
        // Token no es JSON válido
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ======================================================
// INTERCEPTOR DE RESPONSE
// ======================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si es error 401 y no es un intento de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Esperar a que se complete el refresh
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const refreshToken = localStorage.getItem('auth-storage');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        
        const response = await axios.post('/api/admin/auth/refresh-token', {
          refresh_token: refreshToken,
        });
        
        if (response.data.success) {
          const { token } = response.data.data;
          // Actualizar localStorage
          const storage = localStorage.getItem('auth-storage');
          if (storage) {
            const parsed = JSON.parse(storage);
            parsed.state.token = token;
            localStorage.setItem('auth-storage', JSON.stringify(parsed));
          }
          
          processQueue(null, token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } else {
          throw new Error('Refresh failed');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Redirigir a login
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

// ======================================================
// FUNCIONES DE UTILIDAD
// ======================================================

/**
 * Establece el token manualmente
 * @param {string} token - Token JWT
 */
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

/**
 * Elimina el token de autenticación
 */
const removeAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
};

/**
 * Verifica si hay un token activo
 * @returns {boolean}
 */
const hasAuthToken = () => {
  return !!api.defaults.headers.common['Authorization'];
};

// ======================================================
// EXPORTACIONES
// ======================================================

export default api;
export { setAuthToken, removeAuthToken, hasAuthToken };