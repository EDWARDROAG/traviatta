/**
 * ======================================================
 * ARCHIVO: useProducts.js
 * UBICACIÓN: menu-qr-system/admin-panel/src/hooks/useProducts.js
 * FASE: F2
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-17 00:00
 *
 * 🎯 PROPÓSITO:
 * Hook personalizado para la gestión de productos del menú.
 * Proporciona funciones para obtener, crear, actualizar,
 * eliminar, duplicar y cambiar disponibilidad de productos.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - react-hot-toast: Notificaciones
 * - ../services/api: Llamadas a API
 *
 * 🔗 RELACIONES:
 * - Importado por: ProductsPage.jsx
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-17 00:00
 *    ✅ Creación inicial del archivo
 *    ✅ Estado de carga y datos
 *    ✅ Función fetchProducts
 *    ✅ Función createProduct
 *    ✅ Función updateProduct
 *    ✅ Función deleteProduct
 *    ✅ Función duplicateProduct
 *    ✅ Función toggleAvailability
 *    ✅ Función reorderProducts
 * ======================================================
 */

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

function useProducts() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  /**
   * Obtiene todos los productos con paginación y filtros
   * @param {Object} filters - Filtros (category_id, branch_id, search, is_available)
   * @param {number} page - Número de página
   */
  const fetchProducts = useCallback(async (filters = {}, page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: pagination.limit,
        ...filters,
      };
      
      const response = await api.get('/admin/products', { params });
      if (response.data.success) {
        setProducts(response.data.data.data || []);
        setTotal(response.data.data.total || 0);
        setPagination({
          page: response.data.data.page || page,
          limit: response.data.data.limit || pagination.limit,
          totalPages: response.data.data.totalPages || 0,
        });
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al cargar los productos';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  /**
   * Obtiene un producto por ID
   * @param {string} id - ID del producto
   */
  const fetchProductById = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/products/${id}`);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al cargar el producto';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene productos por categoría
   * @param {string} categoryId - ID de la categoría
   * @param {boolean} onlyAvailable - Solo productos disponibles
   */
  const fetchProductsByCategory = useCallback(async (categoryId, onlyAvailable = false) => {
    setLoading(true);
    try {
      const params = {};
      if (onlyAvailable) params.only_available = true;
      
      const response = await api.get(`/admin/category/${categoryId}/products`, { params });
      if (response.data.success) {
        return response.data.data.products || [];
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al cargar los productos';
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crea un nuevo producto
   * @param {FormData} formData - Datos del producto (con imagen)
   */
  const createProduct = useCallback(async (formData) => {
    setLoading(true);
    try {
      const response = await api.post('/admin/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        toast.success('Producto creado correctamente');
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al crear el producto';
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualiza un producto existente
   * @param {string} id - ID del producto
   * @param {FormData} formData - Datos a actualizar (con imagen opcional)
   */
  const updateProduct = useCallback(async (id, formData) => {
    setLoading(true);
    try {
      const response = await api.put(`/admin/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        toast.success('Producto actualizado correctamente');
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al actualizar el producto';
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Elimina un producto
   * @param {string} id - ID del producto
   * @param {boolean} hardDelete - Eliminación física
   */
  const deleteProduct = useCallback(async (id, hardDelete = false) => {
    setLoading(true);
    try {
      const url = hardDelete 
        ? `/admin/products/${id}?hard_delete=true`
        : `/admin/products/${id}`;
      const response = await api.delete(url);
      if (response.data.success) {
        toast.success('Producto eliminado correctamente');
        return true;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al eliminar el producto';
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cambia la disponibilidad de un producto
   * @param {string} id - ID del producto
   * @param {boolean} isAvailable - Estado de disponibilidad
   */
  const toggleAvailability = useCallback(async (id, isAvailable) => {
    setLoading(true);
    try {
      const response = await api.put(`/admin/products/${id}/availability`, { is_available: isAvailable });
      if (response.data.success) {
        toast.success(isAvailable ? 'Producto activado' : 'Producto desactivado');
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al cambiar disponibilidad';
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cambia disponibilidad de múltiples productos
   * @param {Array} productIds - IDs de los productos
   * @param {boolean} isAvailable - Estado de disponibilidad
   */
  const bulkAvailability = useCallback(async (productIds, isAvailable) => {
    setLoading(true);
    try {
      const response = await api.put('/admin/products/availability/batch', {
        product_ids: productIds,
        is_available: isAvailable,
      });
      if (response.data.success) {
        toast.success(`${productIds.length} productos actualizados`);
        return true;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al actualizar productos';
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Duplica un producto
   * @param {string} id - ID del producto a duplicar
   * @param {Object} overrides - Datos a sobrescribir (nombre, precio, etc.)
   */
  const duplicateProduct = useCallback(async (id, overrides = {}) => {
    setLoading(true);
    try {
      const response = await api.post(`/admin/products/${id}/duplicate`, overrides);
      if (response.data.success) {
        toast.success('Producto duplicado correctamente');
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al duplicar el producto';
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reordena productos en una categoría
   * @param {string} categoryId - ID de la categoría
   * @param {Array} productsOrder - Array de { id, display_order }
   */
  const reorderProducts = useCallback(async (categoryId, productsOrder) => {
    setLoading(true);
    try {
      const response = await api.put(`/admin/category/${categoryId}/products/reorder`, {
        products: productsOrder,
      });
      if (response.data.success) {
        toast.success('Orden actualizado correctamente');
        return true;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al reordenar productos';
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Limpia los errores
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reinicia el estado
   */
  const reset = useCallback(() => {
    setProducts([]);
    setTotal(0);
    setLoading(false);
    setError(null);
    setPagination({ page: 1, limit: 20, totalPages: 0 });
  }, []);

  return {
    // Estado
    products,
    total,
    loading,
    error,
    pagination,
    
    // Funciones principales
    fetchProducts,
    fetchProductById,
    fetchProductsByCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    
    // Disponibilidad
    toggleAvailability,
    bulkAvailability,
    
    // Utilidades
    duplicateProduct,
    reorderProducts,
    
    // Utilidades generales
    clearError,
    reset,
  };
}

export default useProducts;