/**
 * ======================================================
 * ARCHIVO: BranchModules.jsx
 * UBICACIÓN: menu-qr-system/admin-panel/src/components/BranchModules.jsx
 * FASE: F3
 * VERSIÓN: 1.1
 * ÚLTIMA ACTUALIZACIÓN: 2024-05-22 20:00
 *
 * 🎯 PROPÓSITO:
 * Modal para configurar los módulos activables de una sede:
 * desayunos, almuerzos, comida rápida, bar, domicilios.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - @heroicons/react: Iconos (solo los que existen)
 * - react-hot-toast: Notificaciones
 * - ../services/api: Llamadas a API
 *
 * 🔗 RELACIONES:
 * - Importado por: pages/BranchesPage.jsx
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.1 - 2024-05-22 20:00
 *    ✅ Corregido: Eliminadas importaciones de iconos inexistentes
 *    ✅ Corregido: Uso de emojis en getModuleIcon
 * ------------------------------------------------------
 * 1.0 - 2024-05-22 19:45
 *    ✅ Creación inicial del archivo
 * ======================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  TruckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';

// Módulos disponibles
const AVAILABLE_MODULES = [
  { 
    id: 'breakfast', 
    name: 'Desayunos', 
    icon: '🌅', 
    description: 'Desayunos, panadería, café, jugos, calentados',
    defaultHours: { start: '06:00', end: '10:30' }
  },
  { 
    id: 'lunch', 
    name: 'Almuerzos', 
    icon: '🍽️', 
    description: 'Menú del día, corrientazos, almuerzos ejecutivos',
    defaultHours: { start: '11:00', end: '15:00' }
  },
  { 
    id: 'fastfood', 
    name: 'Comida Rápida', 
    icon: '🍔', 
    description: 'Hamburguesas, pizzas, perros, alitas, papas',
    defaultHours: { start: '12:00', end: '22:00' }
  },
  { 
    id: 'bar', 
    name: 'Bar / Nocturno', 
    icon: '🍻', 
    description: 'Tragos, cervezas, licores, picadas',
    defaultHours: { start: '18:00', end: '02:00' }
  },
  { 
    id: 'delivery', 
    name: 'Domicilios', 
    icon: '🚚', 
    description: 'Servicio de envío a domicilio',
    defaultHours: { start: '08:00', end: '22:00' }
  },
];

function BranchModules({ branch, onClose, onSuccess }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchModules();
  }, [branch.id]);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/branches/${branch.id}/modules`);
      if (response.data.success) {
        setModules(response.data.data.modules || []);
      } else {
        // Inicializar con módulos por defecto
        const defaultModules = AVAILABLE_MODULES.map(mod => ({
          module_name: mod.id,
          is_enabled: mod.id === 'delivery', // Solo delivery activo por defecto
          schedule: {
            start: mod.defaultHours.start,
            end: mod.defaultHours.end,
            days: [1, 2, 3, 4, 5, 6, 7] // Lunes a Domingo
          }
        }));
        setModules(defaultModules);
      }
    } catch (error) {
      toast.error('Error al cargar la configuración de módulos');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleModule = (moduleId, isEnabled) => {
    setModules(prev => prev.map(module => 
      module.module_name === moduleId 
        ? { ...module, is_enabled: isEnabled }
        : module
    ));
  };

  const handleScheduleChange = (moduleId, field, value) => {
    setModules(prev => prev.map(module => 
      module.module_name === moduleId 
        ? { 
            ...module, 
            schedule: { 
              ...module.schedule, 
              [field]: value 
            } 
          }
        : module
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.put(`/admin/branches/${branch.id}/modules`, {
        modules: modules
      });
      if (response.data.success) {
        toast.success('Configuración de módulos guardada');
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  // Usar emojis directamente desde AVAILABLE_MODULES
  const getModuleIcon = (moduleId) => {
    const module = AVAILABLE_MODULES.find(m => m.id === moduleId);
    return module?.icon || '📋';
  };

  const getModuleName = (moduleId) => {
    const module = AVAILABLE_MODULES.find(m => m.id === moduleId);
    return module?.name || moduleId;
  };

  const getModuleDescription = (moduleId) => {
    const module = AVAILABLE_MODULES.find(m => m.id === moduleId);
    return module?.description || '';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Fondo oscuro */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Configurar Módulos
              </h2>
              <p className="text-sm text-gray-500">
                {branch.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Contenido */}
          <div className="p-6 space-y-6">
            <p className="text-sm text-gray-600">
              Activa o desactiva los módulos que ofrece esta sede.
              Cada módulo tiene su propio horario de funcionamiento.
            </p>

            {/* Lista de módulos */}
            <div className="space-y-4">
              {AVAILABLE_MODULES.map((availableModule) => {
                const moduleConfig = modules.find(m => m.module_name === availableModule.id) || {
                  module_name: availableModule.id,
                  is_enabled: false,
                  schedule: { start: availableModule.defaultHours.start, end: availableModule.defaultHours.end, days: [1,2,3,4,5,6,7] }
                };
                
                return (
                  <div key={availableModule.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{getModuleIcon(availableModule.id)}</div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {getModuleName(availableModule.id)}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {getModuleDescription(availableModule.id)}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={moduleConfig.is_enabled}
                          onChange={(e) => handleToggleModule(availableModule.id, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>

                    {/* Horarios (solo si está activo) */}
                    {moduleConfig.is_enabled && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 mb-3">
                          <ClockIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Horario de atención</span>
                        </div>
                        <div className="flex gap-4">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Desde</label>
                            <input
                              type="time"
                              value={moduleConfig.schedule?.start || '08:00'}
                              onChange={(e) => handleScheduleChange(availableModule.id, 'start', e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Hasta</label>
                            <input
                              type="time"
                              value={moduleConfig.schedule?.end || '22:00'}
                              onChange={(e) => handleScheduleChange(availableModule.id, 'end', e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          El menú de este módulo solo estará visible en este horario
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BranchModules;