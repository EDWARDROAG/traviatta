/**
 * ======================================================
 * ARCHIVO: App.jsx
 * UBICACIÓN: menu-qr-system/frontend/src/App.jsx
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 13:00
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
 * 1.0 - 2024-01-16 13:00
 *    ✅ Creación inicial del archivo
 *    ✅ Configuración de rutas
 *    ✅ Rutas dinámicas para slug y mesa
 * ======================================================
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MenuPage from './pages/MenuPage';
import TableMenuPage from './pages/TableMenuPage';
import CheckoutPage from './pages/CheckoutPage';

function App() {
  return (
    <Routes>
      <Route path="/:slug/menu" element={<MenuPage />} />
      <Route path="/mesa/:slug/:tableId" element={<TableMenuPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
    </Routes>
  );
}

export default App;