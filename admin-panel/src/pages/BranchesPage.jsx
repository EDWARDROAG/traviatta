/**
 * ======================================================
 * ARCHIVO: BranchesPage.jsx
 * UBICACIÓN: menu-qr-system/admin-panel/src/pages/BranchesPage.jsx
 * FASE: F3
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 20:30
 *
 * 🎯 PROPÓSITO:
 * Página de gestión de sedes del panel administrativo.
 * Permite crear, editar, eliminar y configurar sedes,
 * incluyendo zonas de domicilio, horarios y módulos
 * activables (desayunos, almuerzos, comida rápida, bar).
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - react-hot-toast: Notificaciones
 * - ../services/api: Llamadas a API
 * - ../components/BranchForm: Formulario de sede
 * - ../components/BranchModules: Configuración de módulos
 *
 * 🔗 RELACIONES:
 * - Es importado por: App.jsx
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 20:30
 *    ✅ Creación inicial del archivo
 *    ✅ Lista de sedes con tarjetas
 *    ✅ Modal de creación/edición
 *    ✅ Eliminación con confirmación
 *    ✅ Activación/desactivación de sedes
 *    ✅ Configuración de módulos
 * ======================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MapPinIcon, 
  PhoneIcon,
  ClockIcon,
  TruckIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';
import BranchForm from '../components/BranchForm';
import BranchModules from '../components/BranchModules';

function BranchesPage() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showModulesModal, setShowModulesModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/branches');
      if (response.data.success) {
        setBranches(response.data.data.branches || []);
      }
    } catch (error) {
      toast.error('Error al cargar las sedes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (branch) => {
    if (!confirm(`¿Eliminar la sede "${branch.name}"? Esto eliminará también sus mesas y productos asociados.`)) return;
    
    try {
      const response = await api.delete(`/admin/branches/${branch.id}`);
      if (response.data.success) {
        toast.success('Sede eliminada');
        fetchBranches();
      }
    } catch (error) {
      toast.error('Error al eliminar la sede');
    }
  };

  const handleToggleActive = async (branch) => {
    try {
      const response = await api.put(`/admin/branches/${branch.id}`, {
        is_active: !branch.is_active
      });
      if (response.data.success) {
        toast.success(branch.is_active ? 'Sede desactivada' : 'Sede activada');
        fetchBranches();
      }
    } catch (error) {
      toast.error('Error al cambiar estado');
    }
  };

  const handleConfigureModules = (branch) => {
    setSelectedBranch(branch);
    setShowModulesModal(true);
  };

  const getStatusBadge = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sedes</h1>
          <p className="text-gray-600 mt-1">Gestiona las sucursales de tu restaurante</p>
        </div>
        <button
          onClick={() => {
            setEditingBranch(null);
            setShowModal(true);
          }}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700"
        >
          <PlusIcon className="h-5 w-5" />
          Nueva sede
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : branches.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay sedes registradas</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 text-orange-600 hover:text-orange-700"
          >
            Crear primera sede
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <div key={branch.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Header con estado */}
              <div className={`p-4 ${branch.is_active ? 'bg-green-50' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{branch.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{branch.address}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(branch.is_active)}`}>
                    {branch.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>

              {/* Información de contacto */}
              <div className="p-4 space-y-2 border-b">
                {branch.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <PhoneIcon className="h-4 w-4" />
                    <span>{branch.phone}</span>
                  </div>
                )}
                {branch.whatsapp_number && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <span className="text-lg">💬</span>
                    <span>WhatsApp: {branch.whatsapp_number}</span>
                  </div>
                )}
              </div>

              {/* Configuración de domicilio */}
              <div className="p-4 border-b">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <TruckIcon className="h-4 w-4" />
                  <span className="font-medium">Domicilio</span>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Costo envío: ${branch.delivery_cost?.toLocaleString() || 0}</p>
                  <p>Envío gratis en pedidos &gt; ${branch.free_delivery_min_amount?.toLocaleString() || 0}</p>
                </div>
              </div>

              {/* Acciones */}
              <div className="p-4 flex justify-between items-center bg-gray-50">
                <button
                  onClick={() => handleConfigureModules(branch)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <GlobeAltIcon className="h-4 w-4" />
                  Configurar módulos
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingBranch(branch);
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                    title="Editar"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(branch)}
                    className={`${branch.is_active ? 'text-yellow-600' : 'text-green-600'} hover:opacity-80`}
                    title={branch.is_active ? 'Desactivar' : 'Activar'}
                  >
                    {branch.is_active ? '🔴' : '🟢'}
                  </button>
                  <button
                    onClick={() => handleDelete(branch)}
                    className="text-red-600 hover:text-red-900"
                    title="Eliminar"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de formulario de sede */}
      {showModal && (
        <BranchForm
          branch={editingBranch}
          onClose={() => {
            setShowModal(false);
            setEditingBranch(null);
          }}
          onSuccess={() => {
            fetchBranches();
            setShowModal(false);
            setEditingBranch(null);
          }}
        />
      )}

      {/* Modal de configuración de módulos */}
      {showModulesModal && selectedBranch && (
        <BranchModules
          branch={selectedBranch}
          onClose={() => {
            setShowModulesModal(false);
            setSelectedBranch(null);
          }}
          onSuccess={() => {
            fetchBranches();
            setShowModulesModal(false);
            setSelectedBranch(null);
          }}
        />
      )}
    </div>
  );
}

export default BranchesPage;