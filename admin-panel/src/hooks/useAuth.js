/**
 * ======================================================
 * ARCHIVO: useAuth.js
 * UBICACIÓN: menu-qr-system/admin-panel/src/hooks/useAuth.js
 * FASE: F2
 * VERSIÓN: 1.1
 * ÚLTIMA ACTUALIZACIÓN: 2024-05-22 20:30
 *
 * 🎯 PROPÓSITO:
 * Hook personalizado para manejar la autenticación.
 * VERSIÓN CORREGIDA - Inicializa checkAuth automáticamente.
 *
 * 🐛 CORRECCIÓN: Se agregó useEffect para llamar checkAuth
 *    al iniciar y cambiar el estado loading.
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.1 - 2024-05-22 20:30
 *    ✅ Corregido: useEffect para inicializar checkAuth
 *    ✅ Corregido: loading inicial true hasta verificar
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 23:45
 *    ✅ Creación inicial del archivo
 * ======================================================
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: true,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/admin/auth/login', { email, password });
          if (response.data.success) {
            const { token, user } = response.data.data;
            // Configurar token en axios para futuras peticiones
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            set({
              user,
              token,
              isAuthenticated: true,
              loading: false,
              error: null,
            });
            return true;
          }
        } catch (error) {
          const message = error.response?.data?.error || 'Error al iniciar sesión';
          set({ error: message, loading: false });
          throw new Error(message);
        }
      },

      logout: async () => {
        try {
          await api.post('/admin/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Limpiar token de axios
          delete api.defaults.headers.common['Authorization'];
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          });
        }
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) {
          set({ loading: false, isAuthenticated: false });
          return false;
        }

        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/admin/auth/verify');
          if (response.data.success) {
            set({
              user: response.data.data.user,
              isAuthenticated: true,
              loading: false,
            });
            return true;
          } else {
            throw new Error('Token inválido');
          }
        } catch (error) {
          delete api.defaults.headers.common['Authorization'];
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
          });
          return false;
        }
      },
      
      // Función para inicializar (llamada desde el hook)
      init: async () => {
        await get().checkAuth();
      },
    }),
    {
      name: 'auth-storage',
      storage: localStorage,  // 🔧 Cambiado de getStorage a storage
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

function useAuth() {
  const { 
    user, 
    token, 
    isAuthenticated, 
    loading, 
    error,
    login, 
    logout, 
    checkAuth,
    init
  } = useAuthStore();

  // 🔧 CORRECCIÓN: Inicializar la autenticación al montar el hook
  useEffect(() => {
    init();
  }, []);

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    checkAuth,
  };
}

export { useAuth, useAuthStore };