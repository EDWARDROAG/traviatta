/**
 * ======================================================
 * ARCHIVO: Dashboard.jsx
 * UBICACIÓN: menu-qr-system/admin-panel/src/pages/Dashboard.jsx
 * FASE: F2
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 19:45
 *
 * 🎯 PROPÓSITO:
 * Dashboard principal del panel administrativo que muestra
 * estadísticas clave del restaurante: pedidos del día,
 * ingresos, productos más vendidos, y ocupación de mesas.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - react-hot-toast: Notificaciones
 * - recharts: Gráficos
 * - date-fns: Formateo de fechas
 * - ../services/api: Llamadas a API
 *
 * 🔗 RELACIONES:
 * - Es importado por: App.jsx
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 19:45
 *    ✅ Creación inicial del archivo
 *    ✅ Tarjetas de estadísticas
 *    ✅ Gráfico de pedidos por hora
 *    ✅ Productos más vendidos
 *    ✅ Ocupación de mesas
 *    ✅ Últimos pedidos
 * ======================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBagIcon, 
  CurrencyDollarIcon, 
  UsersIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../services/api';

const StatCard = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs ayer
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );
};

function Dashboard() {
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    activeTables: 0,
    totalTables: 0,
    avgOrderValue: 0,
  });
  const [hourlyOrders, setHourlyOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Obtener estadísticas de pedidos
      const ordersStats = await api.get('/admin/orders/stats');
      if (ordersStats.data.success) {
        setStats(ordersStats.data.data);
      }
      
      // Obtener productos más vendidos
      const topProductsRes = await api.get('/admin/orders/top-products');
      if (topProductsRes.data.success) {
        setTopProducts(topProductsRes.data.data);
      }
      
      // Obtener pedidos recientes
      const recentOrdersRes = await api.get('/admin/orders/recent?limit=5');
      if (recentOrdersRes.data.success) {
        setRecentOrders(recentOrdersRes.data.data);
      }
      
      // Obtener datos de ocupación de mesas
      const tablesRes = await api.get('/admin/tables/occupancy');
      if (tablesRes.data.success) {
        setStats(prev => ({
          ...prev,
          activeTables: tablesRes.data.data.occupied || 0,
          totalTables: tablesRes.data.data.total || 0,
        }));
      }
      
      // Datos de ejemplo para gráfico horario
      setHourlyOrders([
        { hour: '10:00', orders: 5 },
        { hour: '11:00', orders: 12 },
        { hour: '12:00', orders: 25 },
        { hour: '13:00', orders: 30 },
        { hour: '14:00', orders: 22 },
        { hour: '15:00', orders: 15 },
        { hour: '16:00', orders: 8 },
        { hour: '17:00', orders: 10 },
        { hour: '18:00', orders: 18 },
        { hour: '19:00', orders: 28 },
        { hour: '20:00', orders: 35 },
        { hour: '21:00', orders: 20 },
      ]);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Bienvenido de vuelta</p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pedidos hoy"
          value={stats.todayOrders}
          icon={ShoppingBagIcon}
          color="text-orange-600"
          trend={5}
        />
        <StatCard
          title="Ingresos hoy"
          value={`$${stats.todayRevenue.toLocaleString()}`}
          icon={CurrencyDollarIcon}
          color="text-green-600"
          trend={8}
        />
        <StatCard
          title="Mesas ocupadas"
          value={`${stats.activeTables}/${stats.totalTables}`}
          icon={UsersIcon}
          color="text-blue-600"
        />
        <StatCard
          title="Valor promedio"
          value={`$${stats.avgOrderValue.toLocaleString()}`}
          icon={ChartBarIcon}
          color="text-purple-600"
          trend={-2}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pedidos por hora */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pedidos por hora</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyOrders}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="orders" stroke="#f97316" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Productos más vendidos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos más vendidos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip />
              <Bar dataKey="quantity" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Últimos pedidos */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Últimos pedidos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.order_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {order.customer_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${order.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.order_status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.order_status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                      order.order_status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.order_status === 'delivered' ? 'Entregado' :
                       order.order_status === 'preparing' ? 'Preparando' :
                       order.order_status === 'pending' ? 'Pendiente' : order.order_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;