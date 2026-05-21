/**
 * ======================================================
 * ARCHIVO: App.jsx
 * UBICACIÓN: menu-qr-system/admin-panel/src/App.jsx
 * FASE: F2
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 19:15
 *
 * 🎯 PROPÓSITO:
 * Componente principal del panel administrativo.
 * Maneja la autenticación y el enrutamiento protegido,
 * mostrando el layout con sidebar solo cuando el
 * usuario está autenticado.
 *
 * 📦 DEPENDENCIAS:
 * - react-router-dom: Enrutamiento
 * - react-hot-toast: Notificaciones
 * - ./hooks/useAuth: Autenticación
 * - ./components/Sidebar: Barra lateral
 * - ./components/Header: Cabecera
 * - ./pages/LoginPage: Página de login
 *
 * 🔗 RELACIONES:
 * - Importa los componentes de página
 * - Es el componente raíz del admin panel
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 19:15
 *    ✅ Creación inicial del archivo
 *    ✅ Rutas protegidas con autenticación
 *    ✅ Layout con sidebar para páginas protegidas
 *    ✅ Redirección a login si no autenticado
 * ======================================================
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ProductsPage from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage';
import BranchesPage from './pages/BranchesPage';
import TablesPage from './pages/TablesPage';
import OrdersPage from './pages/OrdersPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <AdminLayout>
            <Dashboard />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/products" element={
        <ProtectedRoute>
          <AdminLayout>
            <ProductsPage />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/categories" element={
        <ProtectedRoute>
          <AdminLayout>
            <CategoriesPage />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/branches" element={
        <ProtectedRoute>
          <AdminLayout>
            <BranchesPage />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/tables" element={
        <ProtectedRoute>
          <AdminLayout>
            <TablesPage />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/orders" element={
        <ProtectedRoute>
          <AdminLayout>
            <OrdersPage />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <AdminLayout>
            <SettingsPage />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;