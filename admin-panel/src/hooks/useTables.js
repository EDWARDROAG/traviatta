/**
 * ======================================================
 * ARCHIVO: useTables.js
 * UBICACIÓN: menu-qr-system/admin-panel/src/hooks/useTables.js
 * FASE: F4
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-17 00:15
 *
 * 🎯 PROPÓSITO:
 * Hook personalizado para la gestión de mesas del local.
 * Proporciona funciones para obtener, crear, actualizar,
 * eliminar, cambiar estado, generar QR y gestionar
 * el layout visual de mesas.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - react-hot-toast: Notificaciones
 * - ../services/api: Llamadas a API
 *
 * 🔗 RELACIONES:
 * - Importado por: TablesPage.jsx
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-17 00:15
 *    ✅ Creación inicial del archivo
 *    ✅ Estado de carga y datos
 *    ✅ Función fetchTables
 *    ✅ Función createTable
 *    ✅ Función updateTable
 *    ✅ Función deleteTable
 *    ✅ Función changeTableStatus
 *    ✅ Función generateTableQR
 *    ✅ Función updateTableLayout
 *    ✅ Función getOccupancyDashboard
 * ======================================================
 */

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

function useTables() {
  const [tables, setTables] = useState([]);
  const [layout, setLayout] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);

  /**
   * Obtiene todas las mesas de una sede
   * @param {string} branchId - ID de la sede
   */
  const fetchTables = useCallback(async (branchId) => {
    if (!branchId) return [];
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/admin/branch/${branchId}/tables`);
      if (response.data.success) {
        setTables(response.data.data.tables || []);
        return response.data.data.tables;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al cargar las mesas';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene el layout visual de mesas
   * @param {string} branchId - ID de la sede
   * @param {boolean} skipCache - Forzar refresco
   */
  const fetchTableLayout = useCallback(async (branchId, skipCache = false) => {
    if (!branchId) return null;
    
    setLoading(true);
    try {
      const params = skipCache ? { skip_cache: true } : {};
      const response = await api.get(`/admin/branch/${branchId}/tables/layout`, { params });
      if (response.data.success) {
        setLayout(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al cargar el layout';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualiza las posiciones de múltiples mesas
   * @param {string} branchId - ID de la sede
   * @param {Array} tablePositions - Array de { id, position_x, position_y }
   */
  const updateTableLayout = useCallback(async (branchId, tablePositions) => {
    setLoading(true);
    try {
      const response = await api.put(`/admin/branch/${branchId}/tables/layout`, {
        tables: tablePositions,
      });
      if (response.data.success) {
        toast.success('Posiciones actualizadas');
        return true;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al actualizar posiciones';
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene una mesa por ID
   * @param {string} tableId - ID de la mesa
   */
  const fetchTableById = useCallback(async (tableId) => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/table/${tableId}`);
      if (response.data.success) {
        setSelectedTable(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al cargar la mesa';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crea una nueva mesa
   * @param {string} branchId - ID de la sede
   * @param {Object} data - Datos de la mesa
   */
  const createTable = useCallback(async (branchId, data) => {
    setLoading(true);
    try {
      const response = await api.post(`/admin/branch/${branchId}/tables`, data);
      if (response.data.success) {
        toast.success('Mesa creada correctamente');
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al crear la mesa';
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualiza una mesa existente
   * @param {string} tableId - ID de la mesa
   * @param {Object} data - Datos a actualizar
   */
  const updateTable = useCallback(async (tableId, data) => {
    setLoading(true);
    try {
      const response = await api.put(`/admin/table/${tableId}`, data);
      if (response.data.success) {
        toast.success('Mesa actualizada correctamente');
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al actualizar la mesa';
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Elimina una mesa
   * @param {string} tableId - ID de la mesa
   * @param {boolean} hardDelete - Eliminación física
   */
  const deleteTable = useCallback(async (tableId, hardDelete = false) => {
    setLoading(true);
    try {
      const url = hardDelete 
        ? `/admin/table/${tableId}?hard_delete=true`
        : `/admin/table/${tableId}`;
      const response = await api.delete(url);
      if (response.data.success) {
        toast.success('Mesa eliminada correctamente');
        return true;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al eliminar la mesa';
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cambia el estado de una mesa
   * @param {string} tableId - ID de la mesa
   * @param {string} status - Nuevo estado (available, occupied, reserved, cleaning)
   * @param {string} orderId - ID del pedido (para occupied)
   */
  const changeTableStatus = useCallback(async (tableId, status, orderId = null) => {
    setLoading(true);
    try {
      const response = await api.put(`/admin/table/${tableId}/status`, { status, order_id: orderId });
      if (response.data.success) {
        toast.success(`Estado cambiado a ${status}`);
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al cambiar el estado';
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Genera código QR para una mesa
   * @param {string} tableId - ID de la mesa
   */
  const generateTableQR = useCallback(async (tableId) => {
    setLoading(true);
    try {
      const response = await api.post(`/admin/table/${tableId}/generate-qr`);
      if (response.data.success) {
        toast.success('QR generado correctamente');
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al generar el QR';
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Regenera QR para todas las mesas de una sede
   * @param {string} branchId - ID de la sede
   */
  const regenerateAllTableQRs = useCallback(async (branchId) => {
    setLoading(true);
    try {
      const response = await api.post(`/admin/branch/${branchId}/tables/regenerate-qrs`);
      if (response.data.success) {
        toast.success(response.data.data.message || 'QR regenerados');
        return response.data.data.tables || [];
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al regenerar los QR';
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene dashboard de ocupación de mesas
   * @param {string} branchId - ID de la sede
   */
  const getOccupancyDashboard = useCallback(async (branchId) => {
    if (!branchId) return null;
    
    setLoading(true);
    try {
      const response = await api.get(`/admin/branch/${branchId}/tables/dashboard`);
      if (response.data.success) {
        setDashboard(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al cargar el dashboard';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Libera todas las mesas de una sede
   * @param {string} branchId - ID de la sede
   */
  const releaseAllTables = useCallback(async (branchId) => {
    setLoading(true);
    try {
      const response = await api.post(`/admin/branch/${branchId}/tables/release-all`);
      if (response.data.success) {
        toast.success(response.data.data.message || 'Mesas liberadas');
        return response.data.data.released_count || 0;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al liberar las mesas';
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
    setTables([]);
    setLayout(null);
    setDashboard(null);
    setSelectedTable(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    // Estado
    tables,
    layout,
    dashboard,
    loading,
    error,
    selectedTable,
    
    // Funciones principales
    fetchTables,
    fetchTableById,
    createTable,
    updateTable,
    deleteTable,
    
    // Layout visual
    fetchTableLayout,
    updateTableLayout,
    
    // Estado de mesas
    changeTableStatus,
    
    // QR
    generateTableQR,
    regenerateAllTableQRs,
    
    // Dashboard
    getOccupancyDashboard,
    releaseAllTables,
    
    // Utilidades
    clearError,
    reset,
  };
}

export default useTables;