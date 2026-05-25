/**
 * ======================================================
 * ARCHIVO: main.jsx
 * UBICACIÓN: menu-qr-system/admin-panel/src/main.jsx
 * FASE: F2
 * VERSIÓN: 1.1
 * ÚLTIMA ACTUALIZACIÓN: 2024-05-22 20:30
 *
 * 🎯 PROPÓSITO:
 * Punto de entrada principal del panel administrativo.
 * VERSIÓN CORREGIDA - Configuración future flags.
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.1 - 2024-05-22 20:30
 *    ✅ Corregido: Añadidos future flags para React Router v7
 *    ✅ Corregido: Configuración storage para Zustand
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 19:00
 *    ✅ Creación inicial del archivo
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
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
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