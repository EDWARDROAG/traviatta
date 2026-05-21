/**
 * ======================================================
 * ARCHIVO: useBranches.js
 * UBICACIÓN: menu-qr-system/admin-panel/src/hooks/useBranches.js
 * FASE: F3
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 23:55
 *
 * 🎯 PROPÓSITO:
 * Hook personalizado para la gestión de sedes/sucursales.
 * Proporciona funciones para obtener, crear, actualizar,
 * eliminar y configurar módulos de sedes.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - react-hot-toast: Notificaciones
 * - ../services/api: Llamadas a API
 *
 * 🔗 RELACIONES:
 * - Importado por: BranchesPage.jsx, CategoriesPage.jsx
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 23:55
 *    ✅ Creación inicial del archivo
 *    ✅ Estado de carga y datos
 *    ✅ Función fetchBranches
 *    ✅ Función createBranch
 *    ✅ Función updateBranch
 *    ✅ Función deleteBranch
 *    ✅ Función fetchBranchModules
 *    ✅ Función updateBranchModule
 * ======================================================
 */

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

function useBranches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);

  /**
   * Obtiene todas las sedes del restaurante
   * @param {Object} options - Opciones de filtro
   */
  const fetchBranches = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (options.onlyActive) params.only_active = true;
      
      const response = await api.get('/admin/branches', { params });
      if (response.data.success) {
        setBranches(response.data.data.branches || []);
        return response.data.data.branches;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al cargar las sedes';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene una sede por ID
   * @param {string} id - ID de la sede
   */
  const fetchBranchById = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/branches/${id}`);
      if (response.data.success) {
        setSelectedBranch(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al cargar la sede';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crea una nueva sede
   * @param {Object} data - Datos de la sede
   */
  const createBranch = useCallback(async (data) => {
    setLoading(true);
    try {
      const response = await api.post('/admin/branches', data);
      if (response.data.success) {
        toast.success('Sede creada correctamente');
        await fetchBranches();
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al crear la sede';
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [fetchBranches]);

  /**
   * Actualiza una sede existente
   * @param {string} id - ID de la sede
   * @param {Object} data - Datos a actualizar
   */
  const updateBranch = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const response = await api.put(`/admin/branches/${id}`, data);
      if (response.data.success) {
        toast.success('Sede actualizada correctamente');
        await fetchBranches();
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al actualizar la sede';
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [fetchBranches]);

  /**
   * Elimina una sede
   * @param {string} id - ID de la sede
   * @param {boolean} hardDelete - Eliminación física
   */
  const deleteBranch = useCallback(async (id, hardDelete = false) => {
    setLoading(true);
    try {
      const url = hardDelete 
        ? `/admin/branches/${id}?hard_delete=true`
        : `/admin/branches/${id}`;
      const response = await api.delete(url);
      if (response.data.success) {
        toast.success('Sede eliminada correctamente');
        await fetchBranches();
        return true;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al eliminar la sede';
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [fetchBranches]);

  /**
   * Activa o desactiva una sede
   * @param {string} id - ID de la sede
   * @param {boolean} isActive - Estado a establecer
   */
  const toggleBranchStatus = useCallback(async (id, isActive) => {
    return updateBranch(id, { is_active: isActive });
  }, [updateBranch]);

  /**
   * Obtiene los módulos configurados para una sede
   * @param {string} branchId - ID de la sede
   */
  const fetchBranchModules = useCallback(async (branchId) => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/branches/${branchId}/modules`);
      if (response.data.success) {
        return response.data.data.modules || [];
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al cargar los módulos';
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualiza la configuración de un módulo
   * @param {string} branchId - ID de la sede
   * @param {string} moduleName - Nombre del módulo
   * @param {Object} config - Configuración del módulo
   */
  const updateBranchModule = useCallback(async (branchId, moduleName, config) => {
    setLoading(true);
    try {
      const response = await api.put(`/admin/branches/${branchId}/modules/${moduleName}`, config);
      if (response.data.success) {
        toast.success(`Módulo ${moduleName} actualizado`);
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Error al actualizar el módulo';
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene el dashboard de una sede
   * @param {string} branchId - ID de la sede
   */
  const fetchBranchDashboard = useCallback(async (branchId) => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/branches/${branchId}/dashboard`);
      if (response.data.success) {
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
   * Verifica cobertura de domicilio
   * @param {string} branchId - ID de la sede
   * @param {Object} location - Ubicación { address, lat, lng }
   */
  const checkDeliveryCoverage = useCallback(async (branchId, location) => {
    try {
      const response = await api.post(`/admin/branches/${branchId}/check-coverage`, location);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error checking coverage:', error);
      return null;
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
    setBranches([]);
    setSelectedBranch(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    // Estado
    branches,
    loading,
    error,
    selectedBranch,
    
    // Funciones principales
    fetchBranches,
    fetchBranchById,
    createBranch,
    updateBranch,
    deleteBranch,
    toggleBranchStatus,
    
    // Módulos
    fetchBranchModules,
    updateBranchModule,
    
    // Dashboard y utilidades
    fetchBranchDashboard,
    checkDeliveryCoverage,
    
    // Utilidades
    clearError,
    reset,
  };
}

export default useBranches;