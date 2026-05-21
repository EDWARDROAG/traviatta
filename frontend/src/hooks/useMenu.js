/**
 * ======================================================
 * ARCHIVO: useMenu.js
 * UBICACIÓN: menu-qr-system/frontend/src/hooks/useMenu.js
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 16:00
 *
 * 🎯 PROPÓSITO:
 * Hook personalizado que maneja la obtención del menú
 * desde la API del backend. Gestiona estados de carga,
 * errores y caché local de resultados.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - axios: Cliente HTTP
 * - ../services/api: Configuración base
 *
 * 🔗 RELACIONES:
 * - Importado por: MenuPage.jsx, TableMenuPage.jsx
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 16:00
 *    ✅ Creación inicial del archivo
 *    ✅ Estado loading, error, menu
 *    ✅ Función fetchMenu
 *    ✅ Soporte para menú de mesa
 *    ✅ Caché simple en memoria
 * ======================================================
 */

import { useState, useCallback, useRef } from 'react';
import api from '../services/api';

// Caché simple en memoria
const menuCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function useMenu() {
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchMenu = useCallback(async (slug, options = {}) => {
    const { tableId, skipCache = false, branchId = null } = options;
    
    // Generar clave de caché
    const cacheKey = tableId ? `table:${tableId}` : `branch:${slug}:${branchId || 'default'}`;
    
    // Verificar caché
    if (!skipCache && menuCache.has(cacheKey)) {
      const cached = menuCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        setMenu(cached.data);
        return cached.data;
      } else {
        menuCache.delete(cacheKey);
      }
    }
    
    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (tableId) {
        response = await api.get(`/table/${tableId}/menu`, {
          signal: abortController.signal,
        });
      } else {
        let url = `/${slug}/menu`;
        if (branchId) {
          url += `?branch_id=${branchId}`;
        }
        response = await api.get(url, {
          signal: abortController.signal,
        });
      }
      
      if (response.data.success) {
        const menuData = response.data.data;
        setMenu(menuData);
        
        // Guardar en caché
        menuCache.set(cacheKey, {
          data: menuData,
          timestamp: Date.now(),
        });
        
        return menuData;
      } else {
        throw new Error(response.data.error || 'Error al cargar el menú');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        return null;
      }
    } finally {
      setLoading(false);
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  }, []);
  
  const clearCache = useCallback(() => {
    menuCache.clear();
  }, []);
  
  const invalidateCache = useCallback((key) => {
    if (key) {
      menuCache.delete(key);
    } else {
      menuCache.clear();
    }
  }, []);
  
  return {
    menu,
    loading,
    error,
    fetchMenu,
    clearCache,
    invalidateCache,
  };
}

export default useMenu;