/**
 * ======================================================
 * ARCHIVO: OrderCard.jsx
 * UBICACIÓN: menu-qr-system/admin-panel/src/components/OrderCard.jsx
 * FASE: F2
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 22:15
 *
 * 🎯 PROPÓSITO:
 * Componente de tarjeta para mostrar un pedido en listados
 * y dashboard. Muestra información resumida del pedido
 * y permite acciones rápidas como cambiar estado o ver
 * detalles.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - date-fns: Formateo de fechas
 *
 * 🔗 RELACIONES:
 * - Importado por: OrdersPage.jsx, Dashboard.jsx
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 22:15
 *    ✅ Creación inicial del archivo
 *    ✅ Tarjeta con información del pedido
 *    ✅ Selector de estado
 *    ✅ Badge de tipo de pedido
 *    ✅ Botón de ver detalle
 * ======================================================
 */

import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { EyeIcon, ClockIcon, MapPinIcon, UserIcon } from '@heroicons/react/24/outline';

const ORDER_STATUS = [
  { value: 'pending', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmado', color: 'bg-blue-100 text-blue-800' },
  { value: 'preparing', label: 'Preparando', color: 'bg-orange-100 text-orange-800' },
  { value: 'ready', label: 'Listo', color: 'bg-green-100 text-green-800' },
  { value: 'delivered', label: 'Entregado', color: 'bg-gray-100 text-gray-800' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
];

const ORDER_TYPE_CONFIG = {
  delivery: { label: 'Domicilio', icon: '🚚', color: 'bg-blue-100 text-blue-800' },
  takeaway: { label: 'Para llevar', icon: '📦', color: 'bg-purple-100 text-purple-800' },
  table: { label: 'Mesa', icon: '🪑', color: 'bg-green-100 text-green-800' },
};

function OrderCard({ order, onStatusChange, onViewDetails, updating }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === order.order_status) return;
    
    setIsUpdating(true);
    try {
      await onStatusChange(order.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusConfig = (status) => {
    return ORDER_STATUS.find(s => s.value === status) || ORDER_STATUS[0];
  };

  const getTypeConfig = (type) => {
    return ORDER_TYPE_CONFIG[type] || ORDER_TYPE_CONFIG.delivery;
  };

  const statusConfig = getStatusConfig(order.order_status);
  const typeConfig = getTypeConfig(order.order_type);
  const createdAt = new Date(order.created_at);
  const isToday = createdAt.toDateString() === new Date().toDateString();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition p-4">
      {/* Header: número y estado */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">#{order.order_number}</span>
            <span className={`px-2 py-0.5 text-xs rounded-full ${typeConfig.color}`}>
              {typeConfig.icon} {typeConfig.label}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
            <ClockIcon className="h-3 w-3" />
            <span>
              {format(createdAt, "d 'de' MMMM, HH:mm", { locale: es })}
              {isToday && <span className="ml-1 text-green-600">(Hoy)</span>}
            </span>
          </div>
        </div>
        
        <select
          value={order.order_status}
          onChange={handleStatusChange}
          disabled={updating === order.id || isUpdating}
          className={`px-2 py-1 text-xs rounded-full border-0 focus:ring-2 focus:ring-orange-500 ${statusConfig.color} cursor-pointer`}
        >
          {ORDER_STATUS.map(status => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* Cliente */}
      <div className="flex items-center gap-2 mb-2 text-sm">
        <UserIcon className="h-4 w-4 text-gray-400" />
        <span className="text-gray-700">{order.customer_name}</span>
        <span className="text-gray-400 text-xs">|</span>
        <span className="text-gray-500 text-xs">{order.customer_phone}</span>
      </div>

      {/* Dirección (si es domicilio) */}
      {order.order_type === 'delivery' && order.delivery_address && (
        <div className="flex items-start gap-2 mb-2 text-xs text-gray-500">
          <MapPinIcon className="h-3 w-3 text-gray-400 mt-0.5" />
          <span className="flex-1">{order.delivery_address}</span>
        </div>
      )}

      {/* Mesa (si es servicio en mesa) */}
      {order.order_type === 'table' && order.table_number && (
        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
          <span>🪑</span>
          <span>Mesa {order.table_number}</span>
        </div>
      )}

      {/* Resumen de items */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {order.items_count || order.items?.length || 0} productos
          </div>
          <div className="font-bold text-gray-900">
            ${(order.total || 0).toLocaleString()}
          </div>
        </div>
        
        {/* Items preview */}
        {order.items && order.items.slice(0, 2).map((item, idx) => (
          <div key={idx} className="text-xs text-gray-500 mt-1">
            {item.quantity}x {item.name}
          </div>
        ))}
        {order.items && order.items.length > 2 && (
          <div className="text-xs text-gray-400 mt-1">
            +{order.items.length - 2} productos más
          </div>
        )}
      </div>

      {/* Botón de ver detalle */}
      <button
        onClick={() => onViewDetails(order)}
        className="mt-3 w-full flex items-center justify-center gap-1 text-sm text-orange-600 hover:text-orange-700 transition py-1 border-t border-gray-100 pt-3"
      >
        <EyeIcon className="h-4 w-4" />
        Ver detalles del pedido
      </button>
    </div>
  );
}

export default OrderCard;