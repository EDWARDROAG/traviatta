/**
 * ======================================================
 * ARCHIVO: TableForm.jsx
 * UBICACIÓN: menu-qr-system/admin-panel/src/components/TableForm.jsx
 * FASE: F4
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 23:30
 *
 * 🎯 PROPÓSITO:
 * Componente de formulario modal para la creación y
 * edición de mesas. Incluye campos para número, nombre,
 * capacidad, forma, tamaño y posición inicial.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - react-hook-form: Manejo de formularios
 * - react-hot-toast: Notificaciones
 * - ../services/api: Llamadas a API
 *
 * 🔗 RELACIONES:
 * - Importado por: TablesPage.jsx
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 23:30
 *    ✅ Creación inicial del archivo
 *    ✅ Campos del formulario
 *    ✅ Validación de datos
 *    ✅ Formas: círculo, cuadrado, rectángulo
 *    ✅ Tamaño personalizable
 * ======================================================
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';

const TABLE_SHAPES = [
  { value: 'circle', label: '🔴 Círculo', defaultWidth: 60, defaultHeight: 60 },
  { value: 'square', label: '⬛ Cuadrado', defaultWidth: 60, defaultHeight: 60 },
  { value: 'rectangle', label: '📐 Rectángulo', defaultWidth: 80, defaultHeight: 60 },
];

const TABLE_STATUS = [
  { value: 'available', label: '🟢 Libre' },
  { value: 'occupied', label: '🔴 Ocupada' },
  { value: 'reserved', label: '🟡 Reservada' },
  { value: 'cleaning', label: '🔵 Limpieza' },
];

function TableForm({ table, branchId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [selectedShape, setSelectedShape] = useState('circle');
  
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      table_number: '',
      table_name: '',
      capacity: 4,
      shape: 'circle',
      width: 60,
      height: 60,
      position_x: 0,
      position_y: 0,
      status: 'available',
      is_active: true,
    }
  });

  const watchShape = watch('shape', 'circle');

  useEffect(() => {
    const shapeConfig = TABLE_SHAPES.find(s => s.value === watchShape);
    if (shapeConfig) {
      setValue('width', shapeConfig.defaultWidth);
      setValue('height', shapeConfig.defaultHeight);
    }
  }, [watchShape, setValue]);

  useEffect(() => {
    if (table) {
      reset({
        table_number: table.table_number || '',
        table_name: table.table_name || '',
        capacity: table.capacity || 4,
        shape: table.shape || 'circle',
        width: table.width || 60,
        height: table.height || 60,
        position_x: table.position_x || 0,
        position_y: table.position_y || 0,
        status: table.status || 'available',
        is_active: table.is_active !== false,
      });
      setSelectedShape(table.shape || 'circle');
    }
  }, [table, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let response;
      if (table) {
        response = await api.put(`/admin/table/${table.id}`, data);
      } else {
        response = await api.post(`/admin/branch/${branchId}/tables`, data);
      }

      if (response.data.success) {
        toast.success(table ? 'Mesa actualizada' : 'Mesa creada');
        onSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar la mesa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {table ? 'Editar mesa' : 'Nueva mesa'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          {/* Número de mesa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de mesa *
            </label>
            <input
              type="text"
              {...register('table_number', { required: 'El número de mesa es requerido' })}
              placeholder="Ej: 1, 2, 3, Terraza 1, VIP"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
                errors.table_number ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.table_number && (
              <p className="text-red-500 text-xs mt-1">{errors.table_number.message}</p>
            )}
          </div>

          {/* Nombre de mesa (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre (opcional)
            </label>
            <input
              type="text"
              {...register('table_name')}
              placeholder="Ej: Ventanal, Terraza, VIP"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Capacidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacidad (personas)
            </label>
            <input
              type="number"
              {...register('capacity', { min: 1, max: 20 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Forma de la mesa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forma de la mesa
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TABLE_SHAPES.map(shape => (
                <button
                  key={shape.value}
                  type="button"
                  onClick={() => setValue('shape', shape.value)}
                  className={`px-3 py-2 text-sm rounded-lg border transition ${
                    watchShape === shape.value
                      ? 'border-orange-500 bg-orange-50 text-orange-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {shape.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tamaño (solo para rectángulo) */}
          {watchShape === 'rectangle' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ancho (px)
                </label>
                <input
                  type="number"
                  {...register('width')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alto (px)
                </label>
                <input
                  type="number"
                  {...register('height')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          )}

          {/* Posición inicial */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Posición X (px)
              </label>
              <input
                type="number"
                {...register('position_x')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Posición Y (px)
              </label>
              <input
                type="number"
                {...register('position_y')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado inicial
            </label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            >
              {TABLE_STATUS.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Activa */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('is_active')}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <label className="text-sm text-gray-700">Mesa activa</label>
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
              {loading ? 'Guardando...' : (table ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TableForm;