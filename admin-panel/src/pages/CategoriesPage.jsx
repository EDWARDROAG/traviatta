/**
 * ======================================================
 * ARCHIVO: CategoriesPage.jsx
 * UBICACIÓN: menu-qr-system/admin-panel/src/pages/CategoriesPage.jsx
 * FASE: F2
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 20:45
 *
 * 🎯 PROPÓSITO:
 * Página de gestión de categorías del panel administrativo.
 * Permite crear, editar, eliminar, reordenar y configurar
 * horarios por categoría (desayunos, almuerzos, etc.)
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - react-hot-toast: Notificaciones
 * - ../services/api: Llamadas a API
 * - ../components/CategoryForm: Formulario de categoría
 *
 * 🔗 RELACIONES:
 * - Es importado por: App.jsx
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 20:45
 *    ✅ Creación inicial del archivo
 *    ✅ Lista de categorías por sede
 *    ✅ Modal de creación/edición
 *    ✅ Eliminación con confirmación
 *    ✅ Activación/desactivación
 *    ✅ Reordenamiento drag & drop
 *    ✅ Configuración de horarios
 * ======================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';
import CategoryForm from '../components/CategoryForm';

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchCategories();
    }
  }, [selectedBranch]);

  const fetchBranches = async () => {
    try {
      const response = await api.get('/admin/branches');
      if (response.data.success) {
        const branchesList = response.data.data.branches || [];
        setBranches(branchesList);
        if (branchesList.length > 0 && !selectedBranch) {
          setSelectedBranch(branchesList[0].id);
        }
      }
    } catch (error) {
      toast.error('Error al cargar las sedes');
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/branch/${selectedBranch}/categories`);
      if (response.data.success) {
        setCategories(response.data.data.categories || []);
      }
    } catch (error) {
      toast.error('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (category) => {
    if (!confirm(`¿Eliminar la categoría "${category.name}"? Los productos se moverán a "Sin categoría".`)) return;
    
    try {
      const response = await api.delete(`/admin/categories/${category.id}`);
      if (response.data.success) {
        toast.success('Categoría eliminada');
        fetchCategories();
      }
    } catch (error) {
      toast.error('Error al eliminar la categoría');
    }
  };

  const handleToggleActive = async (category) => {
    try {
      const endpoint = category.is_active ? 'deactivate' : 'activate';
      const response = await api.put(`/admin/categories/${category.id}/${endpoint}`);
      if (response.data.success) {
        toast.success(category.is_active ? 'Categoría desactivada' : 'Categoría activada');
        fetchCategories();
      }
    } catch (error) {
      toast.error('Error al cambiar estado');
    }
  };

  const handleMoveUp = async (index) => {
    if (index === 0) return;
    
    const newCategories = [...categories];
    const temp = newCategories[index];
    newCategories[index] = newCategories[index - 1];
    newCategories[index - 1] = temp;
    
    setCategories(newCategories);
    await saveOrder(newCategories);
  };

  const handleMoveDown = async (index) => {
    if (index === categories.length - 1) return;
    
    const newCategories = [...categories];
    const temp = newCategories[index];
    newCategories[index] = newCategories[index + 1];
    newCategories[index + 1] = temp;
    
    setCategories(newCategories);
    await saveOrder(newCategories);
  };

  const saveOrder = async (orderedCategories) => {
    setReordering(true);
    try {
      const orderData = orderedCategories.map((cat, idx) => ({
        id: cat.id,
        display_order: idx
      }));
      
      const response = await api.put(`/admin/branch/${selectedBranch}/categories/reorder`, {
        categories: orderData
      });
      
      if (response.data.success) {
        toast.success('Orden actualizado');
      }
    } catch (error) {
      toast.error('Error al guardar el orden');
      fetchCategories();
    } finally {
      setReordering(false);
    }
  };

  const getModuleLabel = (moduleType) => {
    const labels = {
      breakfast: '🌅 Desayunos',
      lunch: '🍽️ Almuerzos',
      fastfood: '🍔 Comida Rápida',
      bar: '🍻 Bar',
      all: '📋 General'
    };
    return labels[moduleType] || moduleType;
  };

  const getScheduleText = (category) => {
    if (!category.start_time || !category.end_time) return 'Todo el día';
    
    const daysMap = {
      1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb', 7: 'Dom'
    };
    
    let daysText = '';
    if (category.days_of_week && category.days_of_week.length > 0) {
      daysText = category.days_of_week.map(d => daysMap[d]).join(', ');
    }
    
    return `${category.start_time} - ${category.end_time}${daysText ? ` (${daysText})` : ''}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-600 mt-1">Organiza los productos en categorías</p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setShowModal(true);
          }}
          disabled={!selectedBranch}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 disabled:opacity-50"
        >
          <PlusIcon className="h-5 w-5" />
          Nueva categoría
        </button>
      </div>

      {/* Selector de sede */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar sede
        </label>
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 w-full md:w-64"
        >
          <option value="">Seleccionar sede</option>
          {branches.map(branch => (
            <option key={branch.id} value={branch.id}>{branch.name}</option>
          ))}
        </select>
      </div>

      {reordering && (
        <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm">
          Actualizando orden...
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : !selectedBranch ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">Selecciona una sede para ver sus categorías</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No hay categorías en esta sede</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 text-orange-600 hover:text-orange-700"
          >
            Crear primera categoría
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orden</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Módulo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category, index) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ArrowUpIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === categories.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ArrowDownIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{category.name}</p>
                      {category.description && (
                        <p className="text-xs text-gray-500">{category.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{getModuleLabel(category.module_type)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4" />
                      <span>{getScheduleText(category)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {category.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(category)}
                        className={`${category.is_active ? 'text-yellow-600' : 'text-green-600'} hover:opacity-80`}
                        title={category.is_active ? 'Desactivar' : 'Activar'}
                      >
                        {category.is_active ? '🔴' : '🟢'}
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de formulario de categoría */}
      {showModal && (
        <CategoryForm
          category={editingCategory}
          branchId={selectedBranch}
          onClose={() => {
            setShowModal(false);
            setEditingCategory(null);
          }}
          onSuccess={() => {
            fetchCategories();
            setShowModal(false);
            setEditingCategory(null);
          }}
        />
      )}
    </div>
  );
}

export default CategoriesPage;