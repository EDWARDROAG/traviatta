/**
 * Contrato: carga menú — estático por defecto (MVP); API si VITE_USE_STATIC_MENU=false.
 * Consumidores: MenuPage, TableMenuPage.
 */
import { useState, useCallback, useRef } from 'react';
import api from '../services/api';
import { getFallbackMenu } from '../data/staticMenus';
import { DEFAULT_MENU_SLUG, USE_STATIC_MENU } from '../data/site';

const menuCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

/** Invalida caché de menú (números WA / datos sede cambian en caliente). */
menuCache.clear();

function useMenu() {
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const applyMenu = useCallback((cacheKey, menuData) => {
    setMenu(menuData);
    setError(null);
    menuCache.set(cacheKey, {
      data: menuData,
      timestamp: Date.now(),
    });
    return menuData;
  }, []);

  const fetchMenu = useCallback(
    async (slug, options = {}) => {
      const { tableId, skipCache = false, branchId = null } = options;
      const effectiveSlug = slug || DEFAULT_MENU_SLUG;

      const cacheKey = tableId
        ? `table:${tableId}`
        : `branch:${effectiveSlug}:${branchId || 'default'}`;

      if (!skipCache && menuCache.has(cacheKey)) {
        const cached = menuCache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_TTL) {
          setMenu(cached.data);
          setError(null);
          return cached.data;
        }
        menuCache.delete(cacheKey);
      }

      const useFallback = () => {
        const fallback = getFallbackMenu(effectiveSlug);
        if (fallback) {
          return applyMenu(cacheKey, fallback);
        }
        setError('No se pudo cargar el menú. Intenta nuevamente.');
        setMenu(null);
        return null;
      };

      // MVP / GitHub Pages / sin backend: no llamar API (evita proxy ECONNREFUSED)
      if (USE_STATIC_MENU && !tableId) {
        setLoading(true);
        try {
          return useFallback();
        } finally {
          setLoading(false);
        }
      }

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
          let url = `/${effectiveSlug}/menu`;
          if (branchId) {
            url += `?branch_id=${branchId}`;
          }
          response = await api.get(url, {
            signal: abortController.signal,
          });
        }

        if (response.data?.success && response.data?.data) {
          return applyMenu(cacheKey, response.data.data);
        }

        return useFallback();
      } catch (err) {
        if (
          err.name === 'AbortError' ||
          err.name === 'CanceledError' ||
          err.code === 'ERR_CANCELED' ||
          err.message === 'canceled'
        ) {
          return null;
        }

        return useFallback();
      } finally {
        setLoading(false);
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
      }
    },
    [applyMenu]
  );

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
