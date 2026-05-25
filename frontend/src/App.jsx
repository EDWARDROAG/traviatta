/**
 * ======================================================
 * ARCHIVO: App.jsx
 * UBICACIÓN: menu-qr-system/frontend/src/App.jsx
 * FASE: F1
 * VERSIÓN: 1.1
 * ÚLTIMA ACTUALIZACIÓN: 2024-05-22 16:45
 *
 * 🎯 PROPÓSITO:
 * Componente principal de la aplicación que maneja el
 * enrutamiento y la estructura general. Define las rutas
 * disponibles: menú principal, vista de mesa y checkout.
 *
 * 📦 DEPENDENCIAS:
 * - react-router-dom: Enrutamiento
 * - ./pages/MenuPage: Página principal del menú
 * - ./pages/TableMenuPage: Menú desde mesa
 * - ./pages/CheckoutPage: Finalizar pedido
 *
 * 🔗 RELACIONES:
 * - Importa los componentes de página
 * - Es el componente raíz de la aplicación
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.1 - 2024-05-22 16:45
 *    ✅ Agregada ruta raíz "/" que redirige a menú demo
 *    ✅ Agregada ruta catch-all "/*" para manejo de errores
 *    ✅ Mejorado manejo de páginas no encontradas
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 13:00
 *    ✅ Creación inicial del archivo
 *    ✅ Configuración de rutas
 * ======================================================
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MenuPage from './pages/MenuPage';
import TableMenuPage from './pages/TableMenuPage';
import CheckoutPage from './pages/CheckoutPage';

// Componente simple para página no encontrada
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center p-8">
      <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <p className="text-gray-600 mb-4">Página no encontrada</p>
      <a href="/" className="text-orange-600 hover:underline">
        Volver al inicio
      </a>
    </div>
  </div>
);

function App() {
  return (
    <Routes>
      {/* Ruta raíz - redirige al menú de Traviatta */}
      <Route path="/" element={<Navigate to="/traviatta-pizza-gourmet/menu" replace />} />
      
      {/* Rutas principales */}
      <Route path="/:slug/menu" element={<MenuPage />} />
      <Route path="/mesa/:slug/:tableId" element={<TableMenuPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      
      {/* Ruta catch-all para páginas no encontradas */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;