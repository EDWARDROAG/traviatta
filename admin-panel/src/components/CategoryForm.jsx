/**
 * ======================================================
 * ARCHIVO: CategoryForm.jsx
 * UBICACIÓN: menu-qr-system/admin-panel/src/components/CategoryForm.jsx
 * FASE: F2
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 23:15
 *
 * 🎯 PROPÓSITO:
 * Componente de formulario modal para la creación y
 * edición de categorías. Incluye campos para nombre,
 * descripción, icono, módulo (desayunos, almuerzos, etc.),
 * horarios y días de disponibilidad.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - react-hook-form: Manejo de formularios
 * - react-hot-toast: Notificaciones
 * - ../services/api: Llamadas a API
 *
 * 🔗 RELACIONES:
 * - Importado por: CategoriesPage.jsx
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 23:15
 *    ✅ Creación inicial del archivo
 *    ✅ Campos del formulario
 *    ✅ Módulos: breakfast, lunch, fastfood, bar, all
 *    ✅ Horarios por categoría
 *    ✅ Días de la semana configurables
 * ======================================================
 */

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';

const MODULE_TYPES = [
  { value: 'all', label: '📋 General (siempre visible)' },
  { value: 'breakfast', label: '🌅 Desayunos' },
  { value: 'lunch', label: '🍽️ Almuerzos' },
  { value: 'fastfood', label: '🍔 Comida Rápida' },
  { value: 'bar', label: '🍻 Bar / Nocturno' },
];

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' },
];

function CategoryForm({ category, branchId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [hasSchedule, setHasSchedule] = useState(false);
  
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      icon: '',
      module_type: 'all',
      start_time: '',
      end_time: '',
      days_of_week: [],
      is_active: true,
    }
  });

  const selectedDays = watch('days_of_week', []);

  useEffect(() => {
    if (category) {
      reset({
        name: category.name || '',
        description: category.description || '',
        icon: category.icon || '',
        module_type: category.module_type || 'all',
        start_time: category.start_time || '',
        end_time: category.end_time || '',
        days_of_week: category.days_of_week || [],
        is_active: category.is_active !== false,
      });
      setHasSchedule(!!category.start_time || !!category.end_time);
    }
  }, [category, reset]);

  const toggleDay = (dayValue) => {
    const current = selectedDays || [];
    if (current.includes(dayValue)) {
      setValue('days_of_week', current.filter(d => d !== dayValue));
    } else {
      setValue('days_of_week', [...current, dayValue]);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        start_time: hasSchedule ? data.start_time : null,
        end_time: hasSchedule ? data.end_time : null,
        days_of_week: hasSchedule ? data.days_of_week : null,
      };

      let response;
      if (category) {
        response = await api.put(`/admin/categories/${category.id}`, payload);
      } else {
        response = await api.post(`/admin/branch/${branchId}/categories`, payload);
      }

      if (response.data.success) {
        toast.success(category ? 'Categoría actualizada' : 'Categoría creada');
        onSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar la categoría');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {category ? 'Editar categoría' : 'Nueva categoría'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la categoría *
            </label>
            <input
              type="text"
              {...register('name', { required: 'El nombre es requerido' })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              rows="2"
              {...register('description')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              placeholder="Breve descripción de la categoría"
            />
          </div>

          {/* Icono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icono (emoji)
            </label>
            <input
              type="text"
              {...register('icon')}
              placeholder="🍔"
              maxLength="2"
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-center text-xl"
            />
            <p className="text-xs text-gray-500 mt-1">Ej: 🍔, 🥗, 🍕, 🥤</p>
          </div>

          {/* Módulo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Módulo / Horario de aparición
            </label>
            <select
              {...register('module_type')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            >
              {MODULE_TYPES.map(module => (
                <option key={module.value} value={module.value}>
                  {module.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Define en qué momento del día se mostrará esta categoría
            </p>
          </div>

          {/* Horario específico */}
          <div>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={hasSchedule}
                onChange={(e) => setHasSchedule(e.target.checked)}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">Configurar horario específico</span>
            </label>

            {hasSchedule && (
              <div className="space-y-3 pl-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora de inicio
                    </label>
                    <input
                      type="time"
                      {...register('start_time')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora de fin
                    </label>
                    <input
                      type="time"
                      {...register('end_time')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Días de la semana
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map(day => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`px-3 py-1 text-sm rounded-full transition ${
                          selectedDays?.includes(day.value)
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Selecciona los días en que esta categoría está disponible
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Estado */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              {...register('is_active')}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <label className="text-sm text-gray-700">Categoría activa</label>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : (category ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryForm;