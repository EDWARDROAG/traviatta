/**
 * ======================================================
 * ARCHIVO: CategoryTabs.jsx
 * UBICACIÓN: menu-qr-system/frontend/src/components/CategoryTabs.jsx
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 14:30
 *
 * 🎯 PROPÓSITO:
 * Componente de pestañas horizontales para navegar entre
 * categorías del menú. Permite seleccionar una categoría
 * específica o ver todas. Soporta scroll horizontal en
 * dispositivos móviles.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 *
 * 🔗 RELACIONES:
 * - Importado por: MenuPage.jsx, TableMenuPage.jsx
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 14:30
 *    ✅ Creación inicial del archivo
 *    ✅ Lista horizontal de categorías
 *    ✅ Scroll suave en móvil
 *    ✅ Indicador visual de selección
 *    ✅ Botón "Todos" para mostrar todas
 * ======================================================
 */

import React, { useRef, useEffect } from 'react';

function CategoryTabs({ categories, selectedCategory, onSelectCategory }) {
  const scrollRef = useRef(null);
  const [showAll, setShowAll] = React.useState(true);

  useEffect(() => {
    if (scrollRef.current && selectedCategory) {
      const selectedElement = scrollRef.current.querySelector(`[data-category-id="${selectedCategory}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [selectedCategory]);

  const handleSelectAll = () => {
    setShowAll(true);
    onSelectCategory(null);
  };

  const handleSelectCategory = (categoryId) => {
    setShowAll(false);
    onSelectCategory(categoryId);
  };

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide px-4 py-2 space-x-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Botón "Todos" */}
        <button
          onClick={handleSelectAll}
          className={`
            px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition
            ${showAll
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          Todos
        </button>

        {/* Botones por categoría */}
        {categories.map((category) => (
          <button
            key={category.id}
            data-category-id={category.id}
            onClick={() => handleSelectCategory(category.id)}
            className={`
              px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition flex items-center gap-1
              ${!showAll && selectedCategory === category.id
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {category.icon && <span>{category.icon}</span>}
            <span>{category.name}</span>
            {category.products_count > 0 && (
              <span className={`
                text-xs ml-1
                ${!showAll && selectedCategory === category.id
                  ? 'text-orange-200'
                  : 'text-gray-400'
                }
              `}>
                ({category.products_count})
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategoryTabs;