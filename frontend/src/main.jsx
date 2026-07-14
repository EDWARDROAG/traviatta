/**
 * ======================================================
 * ARCHIVO: main.jsx
 * UBICACIÓN: menu-qr-system/frontend/src/main.jsx
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 12:45
 *
 * 🎯 PROPÓSITO:
 * Punto de entrada principal de la aplicación React.
 * Renderiza el componente App en el DOM y configura
 * el enrutamiento de la aplicación.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - react-dom: Renderizado en DOM
 * - react-router-dom: Enrutamiento
 * - ./App: Componente principal
 *
 * 🔗 RELACIONES:
 * - Importado por: index.html
 * - Es el punto de entrada de React
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 12:45
 *    ✅ Creación inicial del archivo
 *    ✅ Configuración de React Router
 *    ✅ Importación de estilos globales
 * ======================================================
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/globals.css';

const rawBase = import.meta.env.BASE_URL || '/';
const basename = rawBase === '/' ? undefined : rawBase.replace(/\/$/, '');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);