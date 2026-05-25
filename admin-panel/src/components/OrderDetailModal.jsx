/**
 * ======================================================
 * ARCHIVO: OrderDetailModal.jsx
 * UBICACIÓN: menu-qr-system/admin-panel/src/components/OrderDetailModal.jsx
 * FASE: F2
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-05-22 19:45
 *
 * 🎯 PROPÓSITO:
 * Modal que muestra el detalle completo de un pedido
 * en el panel administrativo. Permite ver items,
 * información del cliente, y actualizar estado.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - @heroicons/react: Iconos
 * - react-hot-toast: Notificaciones
 * - date-fns: Formateo de fechas
 * - ../services/api: Llamadas a API
 *
 * 🔗 RELACIONES:
 * - Importado por: pages/OrdersPage.jsx
 * ======================================================
 */

import React, { useState } from 'react';
import { 
  XMarkIcon, 
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  CurrencyDollarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../services/api';

const ORDER_STATUS = [
  { value: 'pending', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmado', color: 'bg-blue-100 text-blue-800' },
  { value: 'preparing', label: 'Preparando', color: 'bg-orange-100 text-orange-800' },
  { value: 'ready', label: 'Listo', color: 'bg-green-100 text-green-800' },
  { value: 'delivered', label: 'Entregado', color: 'bg-gray-100 text-gray-800' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
];

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

function OrderDetailModal({ order, onClose, onStatusUpdate }) {
  const [updating, setUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(order.order_status);

  const handleStatusChange = async (newStatus) => {
    if (!confirm(`¿Cambiar estado a "${ORDER_STATUS.find(s => s.value === newStatus)?.label}"?`)) return;
    
    setUpdating(true);
    try {
      const response = await api.put(`/admin/orders/${order.id}/status`, {
        status: newStatus
      });
      if (response.data.success) {
        toast.success(`Estado actualizado a ${ORDER_STATUS.find(s => s.value === newStatus)?.label}`);
        setCurrentStatus(newStatus);
        if (onStatusUpdate) onStatusUpdate();
      }
    } catch (error) {
      toast.error('Error al actualizar el estado');
    } finally {
      setUpdating(false);
    }
  };

  const getOrderTypeIcon = (type) => {
    switch (type) {
      case 'delivery': return <TruckIcon className="h-5 w-5" />;
      case 'table': return <span className="text-lg">🪑</span>;
      default: return <span className="text-lg">📦</span>;
    }
  };

  const getOrderTypeLabel = (type) => {
    switch (type) {
      case 'delivery': return 'Domicilio';
      case 'table': return 'Servicio en mesa';
      default: return 'Para llevar';
    }
  };

  // Parsear items si vienen como string JSON
  let items = order.items;
  if (typeof items === 'string') {
    try {
      items = JSON.parse(items);
    } catch (e) {
      items = [];
    }
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
                Pedido #{order.order_number}
              </h2>
              <p className="text-sm text-gray-500">
                {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm:ss')}
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
            
            {/* Estado del pedido */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Estado actual:</span>
                <select
                  value={currentStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updating}
                  className={`px-3 py-1 text-sm rounded-full border-0 focus:ring-2 focus:ring-orange-500 ${ORDER_STATUS.find(s => s.value === currentStatus)?.color}`}
                >
                  {ORDER_STATUS.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Información del cliente */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Información del cliente
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Nombre:</span> {order.customer_name}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Teléfono:</span> {order.customer_phone}
                </p>
                {order.order_type === 'delivery' && order.delivery_address && (
                  <p className="text-sm">
                    <span className="font-medium">Dirección:</span> {order.delivery_address}
                  </p>
                )}
                {order.order_type === 'table' && order.table_id && (
                  <p className="text-sm">
                    <span className="font-medium">Mesa ID:</span> {order.table_id}
                  </p>
                )}
              </div>
            </div>

            {/* Información del pedido */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                {getOrderTypeIcon(order.order_type)}
                {getOrderTypeLabel(order.order_type)}
              </h3>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Producto</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Cant</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Precio</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.name}
                          {item.modifiers && item.modifiers.length > 0 && (
                            <div className="text-xs text-gray-500">
                              {item.modifiers.map(m => `+ ${m.name}`).join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-center text-gray-600">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-2 text-sm text-right text-gray-600">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-4 py-2 text-sm text-right font-medium text-gray-900">
                          {formatCurrency((item.price + (item.modifiers_total || 0)) * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totales */}
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.delivery_cost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Envío</span>
                    <span>{formatCurrency(order.delivery_cost)}</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Descuento</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-orange-600">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Notas */}
            {order.notes && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <DocumentTextIcon className="h-5 w-5" />
                  Notas especiales
                </h3>
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">{order.notes}</p>
                </div>
              </div>
            )}

            {/* Método de pago */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <CurrencyDollarIcon className="h-5 w-5" />
                Método de pago
              </h3>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  {order.payment_method === 'cash' && 'Efectivo contra entrega'}
                  {order.payment_method === 'card' && 'Tarjeta (datáfono)'}
                  {order.payment_method === 'transfer' && 'Transferencia bancaria'}
                  {order.payment_method === 'nequi' && 'Nequi'}
                  {order.payment_method === 'daviplata' && 'Daviplata'}
                  {!order.payment_method && 'No especificado'}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailModal;