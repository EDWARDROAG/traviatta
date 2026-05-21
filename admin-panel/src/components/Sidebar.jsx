/**
 * ======================================================
 * ARCHIVO: Sidebar.jsx
 * UBICACIÓN: menu-qr-system/admin-panel/src/components/Sidebar.jsx
 * FASE: F2
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 22:00
 *
 * 🎯 PROPÓSITO:
 * Componente de barra lateral de navegación para el
 * panel administrativo. Muestra el menú principal
 * con acceso a todas las secciones del panel.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - react-router-dom: Navegación
 * - @heroicons/react: Iconos
 *
 * 🔗 RELACIONES:
 * - Importado por: App.jsx
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 22:00
 *    ✅ Creación inicial del archivo
 *    ✅ Menú de navegación principal
 *    ✅ Indicador de ruta activa
 *    ✅ Colapsable en móvil
 *    ✅ Logout
 * ======================================================
 */

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  ShoppingBagIcon,
  TagIcon,
  MapPinIcon,
  TableCellsIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: HomeIcon },
  { path: '/products', label: 'Productos', icon: ShoppingBagIcon },
  { path: '/categories', label: 'Categorías', icon: TagIcon },
  { path: '/branches', label: 'Sedes', icon: MapPinIcon },
  { path: '/tables', label: 'Mesas', icon: TableCellsIcon },
  { path: '/orders', label: 'Pedidos', icon: ClipboardDocumentListIcon },
  { path: '/settings', label: 'Configuración', icon: Cog6ToothIcon },
];

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobile = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Botón de menú móvil */}
      <button
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-50 p-2 bg-orange-600 text-white rounded-lg lg:hidden"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Overlay móvil */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-gray-900 text-white transition-all duration-300 z-50
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-orange-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">QR</span>
              </div>
              <span className="font-semibold">Menu QR Plus</span>
            </div>
          )}
          {isCollapsed && (
            <div className="w-full flex justify-center">
              <div className="h-8 w-8 bg-orange-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">QR</span>
              </div>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="hidden lg:block text-gray-400 hover:text-white"
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={closeMobile}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 transition-colors
                    ${isActive 
                      ? 'bg-orange-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer - Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? 'Cerrar sesión' : ''}
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            {!isCollapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;