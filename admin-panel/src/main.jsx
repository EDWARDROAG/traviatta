/**
 * ======================================================
 * ARCHIVO: main.jsx
 * UBICACIÓN: menu-qr-system/admin-panel/src/main.jsx
 * FASE: F2
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 19:00
 *
 * 🎯 PROPÓSITO:
 * Punto de entrada principal del panel administrativo.
 * Renderiza el componente App en el DOM y configura
 * el enrutamiento y proveedores globales.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - react-dom: Renderizado en DOM
 * - react-router-dom: Enrutamiento
 * - react-hot-toast: Notificaciones
 * - ./App: Componente principal
 *
 * 🔗 RELACIONES:
 * - Importado por: index.html
 * - Es el punto de entrada de React
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 19:00
 *    ✅ Creación inicial del archivo
 *    ✅ Configuración de React Router
 *    ✅ Configuración de Toaster para notificaciones
 *    ✅ Importación de estilos globales
 * ======================================================
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);