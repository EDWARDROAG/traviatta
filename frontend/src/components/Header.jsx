/**
 * ======================================================
 * ARCHIVO: Header.jsx
 * UBICACIÓN: menu-qr-system/frontend/src/components/Header.jsx
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 15:15
 *
 * 🎯 PROPÓSITO:
 * Componente de cabecera que muestra el logo, nombre del
 * restaurante, horario de atención y estado (abierto/cerrado).
 * Se mantiene fijo en la parte superior mientras se navega.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 *
 * 🔗 RELACIONES:
 * - Importado por: MenuPage.jsx, TableMenuPage.jsx
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 15:15
 *    ✅ Creación inicial del archivo
 *    ✅ Logo y nombre del restaurante
 *    ✅ Indicador de horario
 *    ✅ Badge de estado (abierto/cerrado)
 *    ✅ Enlace a WhatsApp del local
 * ======================================================
 */

import React from 'react';

function Header({ branch, showWhatsApp = true }) {
  if (!branch) return null;

  const isOpen = branch.is_open?.isOpen ?? true;
  const openTime = branch.is_open?.openTime;
  const closeTime = branch.is_open?.closeTime;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Logo */}
        {branch.logo_url && (
          <div className="flex justify-center mb-2">
            <img
              src={branch.logo_url}
              alt={branch.name}
              className="h-16 w-auto object-contain"
              loading="lazy"
            />
          </div>
        )}

        {/* Nombre del restaurante */}
        <h1 className="text-xl font-bold text-center text-gray-800">
          {branch.name}
        </h1>

        {/* Estado y horario */}
        <div className="flex justify-center items-center gap-2 mt-1">
          <span
            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
              isOpen
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOpen ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            {isOpen ? 'Abierto' : 'Cerrado'}
          </span>
          
          {openTime && closeTime && (
            <span className="text-xs text-gray-500">
              {openTime} - {closeTime}
            </span>
          )}
        </div>

        {/* Teléfono / WhatsApp */}
        {showWhatsApp && branch.whatsapp_number && (
          <div className="flex justify-center mt-2">
            <a
              href={`https://wa.me/${branch.whatsapp_number.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full hover:bg-green-100 transition"
            >
              <span>📱</span>
              Contactar por WhatsApp
            </a>
          </div>
        )}

        {/* Mensaje de cierre temporal */}
        {!isOpen && branch.next_open && (
          <p className="text-center text-xs text-gray-500 mt-2">
            Abre {branch.next_open} a las {openTime}
          </p>
        )}
      </div>
    </header>
  );
}

export default Header;