/**
 * ======================================================
 * ARCHIVO: TablesPage.jsx
 * UBICACIÓN: menu-qr-system/admin-panel/src/pages/TablesPage.jsx
 * FASE: F4
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 21:30
 *
 * 🎯 PROPÓSITO:
 * Página de gestión de mesas con mapa visual interactivo.
 * Permite crear, editar, eliminar, posicionar mesas
 * arrastrándolas en el canvas y generar códigos QR
 * individuales por mesa.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - react-hot-toast: Notificaciones
 * - react-konva: Canvas interactivo
 * - ../services/api: Llamadas a API
 * - ../components/TableForm: Formulario de mesa
 * - ../components/TableMap: Mapa visual
 *
 * 🔗 RELACIONES:
 * - Es importado por: App.jsx
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 21:30
 *    ✅ Creación inicial del archivo
 *    ✅ Mapa visual de mesas
 *    ✅ Arrastrar y soltar mesas
 *    ✅ CRUD de mesas
 *    ✅ Generación de QR por mesa
 *    ✅ Dashboard de ocupación
 * ======================================================
 */

import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  QrCodeIcon,
  Square2StackIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';
import TableMap from '../components/TableMap';
import TableForm from '../components/TableForm';

function TablesPage() {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchTables();
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

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/branch/${selectedBranch}/tables`);
      if (response.data.success) {
        setTables(response.data.data.tables || []);
      }
    } catch (error) {
      toast.error('Error al cargar las mesas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (table) => {
    if (!confirm(`¿Eliminar la mesa "${table.table_number}"?`)) return;
    
    try {
      const response = await api.delete(`/admin/table/${table.id}`);
      if (response.data.success) {
        toast.success('Mesa eliminada');
        fetchTables();
      }
    } catch (error) {
      toast.error('Error al eliminar la mesa');
    }
  };

  const handleGenerateQR = async (table) => {
    try {
      const response = await api.post(`/admin/table/${table.id}/generate-qr`);
      if (response.data.success) {
        setQrData(response.data.data);
        setShowQRModal(true);
      }
    } catch (error) {
      toast.error('Error al generar el QR');
    }
  };

  const handleRegenerateAllQRs = async () => {
    if (!confirm('¿Regenerar códigos QR para todas las mesas? Los QR anteriores dejarán de funcionar.')) return;
    
    setRegenerating(true);
    try {
      const response = await api.post(`/admin/branch/${selectedBranch}/tables/regenerate-qrs`);
      if (response.data.success) {
        toast.success(`Se regeneraron ${response.data.data.tables.length} códigos QR`);
        fetchTables();
      }
    } catch (error) {
      toast.error('Error al regenerar los QR');
    } finally {
      setRegenerating(false);
    }
  };

  const downloadQR = () => {
    if (!qrData) return;
    
    const link = document.createElement('a');
    link.href = qrData.image;
    link.download = `qr_mesa_${qrData.table_number}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { label: 'Libre', color: 'bg-green-100 text-green-800' },
      occupied: { label: 'Ocupada', color: 'bg-red-100 text-red-800' },
      reserved: { label: 'Reservada', color: 'bg-yellow-100 text-yellow-800' },
      cleaning: { label: 'Limpieza', color: 'bg-blue-100 text-blue-800' }
    };
    const config = statusConfig[status] || statusConfig.available;
    return <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>{config.label}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mesas</h1>
          <p className="text-gray-600 mt-1">Gestiona la distribución de mesas del local</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRegenerateAllQRs}
            disabled={regenerating || tables.length === 0}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 disabled:opacity-50"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Regenerar QR
          </button>
          <button
            onClick={() => {
              setEditingTable(null);
              setShowModal(true);
            }}
            disabled={!selectedBranch}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 disabled:opacity-50"
          >
            <PlusIcon className="h-5 w-5" />
            Nueva mesa
          </button>
        </div>
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

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : !selectedBranch ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">Selecciona una sede para gestionar sus mesas</p>
        </div>
      ) : (
        <>
          {/* Mapa visual de mesas */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución del local</h3>
            <TableMap
              tables={tables}
              branchId={selectedBranch}
              onTablesUpdate={fetchTables}
            />
          </div>

          {/* Lista de mesas */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Lista de mesas</h3>
            </div>
            {tables.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No hay mesas registradas</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-4 text-orange-600 hover:text-orange-700"
                >
                  Agregar primera mesa
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacidad</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posición</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tables.map((table) => (
                      <tr key={table.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {table.table_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {table.table_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {table.capacity} personas
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(table.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ({table.position_x || 0}, {table.position_y || 0})
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleGenerateQR(table)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Ver QR"
                            >
                              <QrCodeIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingTable(table);
                                setShowModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="Editar"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(table)}
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
          </div>
        </>
      )}

      {/* Modal de formulario */}
      {showModal && (
        <TableForm
          table={editingTable}
          branchId={selectedBranch}
          onClose={() => {
            setShowModal(false);
            setEditingTable(null);
          }}
          onSuccess={() => {
            fetchTables();
            setShowModal(false);
            setEditingTable(null);
          }}
        />
      )}

      {/* Modal de QR */}
      {showQRModal && qrData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Código QR - Mesa {qrData.table_number}</h2>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 text-center">
              <img
                src={qrData.image}
                alt={`QR Mesa ${qrData.table_number}`}
                className="mx-auto w-64 h-64"
              />
              <p className="mt-4 text-sm text-gray-600">
                Escanea este código QR para acceder al menú desde la mesa
              </p>
              <p className="text-xs text-gray-400 mt-1 break-all">
                {qrData.url}
              </p>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t">
              <button
                onClick={downloadQR}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Descargar QR
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TablesPage;