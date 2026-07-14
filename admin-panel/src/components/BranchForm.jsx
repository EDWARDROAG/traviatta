/**
 * ======================================================
 * ARCHIVO: BranchForm.jsx
 * UBICACIÓN: menu-qr-system/admin-panel/src/components/BranchForm.jsx
 * FASE: F3
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 23:00
 *
 * 🎯 PROPÓSITO:
 * Componente de formulario modal para la creación y
 * edición de sedes/sucursales. Incluye campos para
 * nombre, dirección, teléfono, WhatsApp, y configuración
 * de domicilio.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - react-hook-form: Manejo de formularios
 * - react-hot-toast: Notificaciones
 * - ../services/api: Llamadas a API
 *
 * 🔗 RELACIONES:
 * - Importado por: BranchesPage.jsx
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 23:00
 *    ✅ Creación inicial del archivo
 *    ✅ Campos del formulario
 *    ✅ Validación de datos
 *    ✅ Coordenadas (lat/lng) opcionales
 *    ✅ Configuración de domicilio
 * ======================================================
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';

function BranchForm({ branch, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      whatsapp_number: '',
      latitude: '',
      longitude: '',
      delivery_cost: 3000,
      free_delivery_min_amount: 30000,
      is_active: true,
    }
  });

  useEffect(() => {
    if (branch) {
      reset({
        name: branch.name || '',
        address: branch.address || '',
        phone: branch.phone || '',
        whatsapp_number: branch.whatsapp_number || '',
        latitude: branch.latitude || '',
        longitude: branch.longitude || '',
        delivery_cost: branch.delivery_cost || 3000,
        free_delivery_min_amount: branch.free_delivery_min_amount || 30000,
        is_active: branch.is_active !== false,
      });
    }
  }, [branch, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Convertir campos vacíos a null
      const payload = {
        ...data,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        delivery_cost: parseInt(data.delivery_cost),
        free_delivery_min_amount: parseInt(data.free_delivery_min_amount),
      };

      let response;
      if (branch) {
        response = await api.put(`/admin/branches/${branch.id}`, payload);
      } else {
        response = await api.post('/admin/branches', payload);
      }

      if (response.data.success) {
        toast.success(branch ? 'Sede actualizada' : 'Sede creada');
        onSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar la sede');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {branch ? 'Editar sede' : 'Nueva sede'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la sede *
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección *
              </label>
              <input
                type="text"
                {...register('address', { required: 'La dirección es requerida' })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                {...register('phone')}
                placeholder="1234567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp (para pedidos)
              </label>
              <input
                type="tel"
                {...register('whatsapp_number')}
                placeholder="3193856893"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Incluye código del país sin el símbolo +
              </p>
            </div>
          </div>

          {/* Coordenadas (opcional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitud (opcional)
              </label>
              <input
                type="number"
                step="any"
                {...register('latitude')}
                placeholder="4.7110"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitud (opcional)
              </label>
              <input
                type="number"
                step="any"
                {...register('longitude')}
                placeholder="-74.0721"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Configuración de domicilio */}
          <div className="border-t pt-4 mt-2">
            <h3 className="text-md font-medium text-gray-900 mb-3">Configuración de domicilio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costo de envío (COP)
                </label>
                <input
                  type="number"
                  {...register('delivery_cost')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Envío gratis en pedidos mayores a (COP)
                </label>
                <input
                  type="number"
                  {...register('free_delivery_min_amount')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Estado */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              {...register('is_active')}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <label className="text-sm text-gray-700">Sede activa</label>
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
              {loading ? 'Guardando...' : (branch ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BranchForm;