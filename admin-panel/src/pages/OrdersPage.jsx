/**
 * ======================================================
 * ARCHIVO: OrdersPage.jsx
 * UBICACIÓN: menu-qr-system/admin-panel/src/pages/OrdersPage.jsx
 * FASE: F2
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 21:00
 *
 * 🎯 PROPÓSITO:
 * Página de gestión de pedidos del panel administrativo.
 * Permite ver, filtrar, actualizar estado y gestionar
 * pedidos de domicilio, para llevar y servicio en mesa.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - react-hot-toast: Notificaciones
 * - date-fns: Formateo de fechas
 * - ../services/api: Llamadas a API
 * - ../components/OrderDetailModal: Modal de detalle
 *
 * 🔗 RELACIONES:
 * - Es importado por: App.jsx
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 21:00
 *    ✅ Creación inicial del archivo
 *    ✅ Lista de pedidos con filtros
 *    ✅ Actualización de estado
 *    ✅ Detalle de pedido modal
 *    ✅ Filtros por fecha y estado
 *    ✅ Exportar pedidos
 * ======================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  EyeIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  TruckIcon,
  MapPinIcon,
  FunnelIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../services/api';
import OrderDetailModal from '../components/OrderDetailModal';

const ORDER_STATUS = [
  { value: 'pending', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmado', color: 'bg-blue-100 text-blue-800' },
  { value: 'preparing', label: 'Preparando', color: 'bg-orange-100 text-orange-800' },
  { value: 'ready', label: 'Listo', color: 'bg-green-100 text-green-800' },
  { value: 'delivered', label: 'Entregado', color: 'bg-gray-100 text-gray-800' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
];

const ORDER_TYPES = [
  { value: 'delivery', label: 'Domicilio', icon: '🚚' },
  { value: 'takeaway', label: 'Para llevar', icon: '📦' },
  { value: 'table', label: 'Mesa', icon: '🪑' },
];

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchOrders();
    }
  }, [selectedBranch, statusFilter, typeFilter, dateFrom, dateTo]);

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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        branch_id: selectedBranch,
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { order_type: typeFilter }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo }),
      };
      
      const response = await api.get('/admin/orders', { params });
      if (response.data.success) {
        setOrders(response.data.data.data || []);
      }
    } catch (error) {
      toast.error('Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    try {
      const response = await api.put(`/admin/orders/${orderId}/status`, {
        status: newStatus
      });
      if (response.data.success) {
        toast.success(`Estado actualizado a ${ORDER_STATUS.find(s => s.value === newStatus)?.label}`);
        fetchOrders();
      }
    } catch (error) {
      toast.error('Error al actualizar el estado');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = ORDER_STATUS.find(s => s.value === status);
    return statusConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const statusConfig = ORDER_STATUS.find(s => s.value === status);
    return statusConfig?.label || status;
  };

  const getTypeIcon = (type) => {
    const typeConfig = ORDER_TYPES.find(t => t.value === type);
    return typeConfig?.icon || '📋';
  };

  const getTypeLabel = (type) => {
    const typeConfig = ORDER_TYPES.find(t => t.value === type);
    return typeConfig?.label || type;
  };

  const resetFilters = () => {
    setStatusFilter('');
    setTypeFilter('');
    setDateFrom('');
    setDateTo('');
  };

  const exportOrders = async () => {
    try {
      const params = {
        branch_id: selectedBranch,
        ...(statusFilter && { status: statusFilter }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo }),
      };
      
      const response = await api.get('/admin/orders/export', { params, responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pedidos_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Pedidos exportados');
    } catch (error) {
      toast.error('Error al exportar los pedidos');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-600 mt-1">Gestiona los pedidos de tu restaurante</p>
        </div>
        <button
          onClick={exportOrders}
          disabled={orders.length === 0}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 disabled:opacity-50"
        >
          <DocumentArrowDownIcon className="h-5 w-5" />
          Exportar
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <FunnelIcon className="h-5 w-5" />
            Filtros
          </h3>
          <button
            onClick={resetFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Limpiar
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sede</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Todas las sedes</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Todos</option>
              {ORDER_STATUS.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Todos</option>
              {ORDER_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Tabla de pedidos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay pedidos que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#Pedido</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm text-gray-900">{order.customer_name}</p>
                        <p className="text-xs text-gray-500">{order.customer_phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {getTypeIcon(order.order_type)} {getTypeLabel(order.order_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${order.total?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.order_status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        disabled={updatingStatus === order.id}
                        className={`px-2 py-1 text-xs rounded-full border-0 focus:ring-2 focus:ring-orange-500 ${getStatusBadge(order.order_status)}`}
                      >
                        {ORDER_STATUS.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalle"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {showDetailModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedOrder(null);
          }}
          onStatusUpdate={() => {
            fetchOrders();
            setShowDetailModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}

export default OrdersPage;