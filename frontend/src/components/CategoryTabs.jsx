/**
 * ======================================================
 * ARCHIVO: CategoryTabs.jsx
 * UBICACIÓN: menu-qr-system/frontend/src/components/CategoryTabs.jsx
 * FASE: UI/UX Premium
 * VERSIÓN: 2.0
 * ÚLTIMA ACTUALIZACIÓN: 2026-05-24
 * ======================================================
 * 🎯 PROPÓSITO:
 * Componente de pestañas horizontales para navegar entre
 * categorías del menú. Diseño elegante con indicadores
 * suaves y scroll fluido.
 *
 * 🎨 MEJORAS VISUALES:
 * - Fondo crema cálido en lugar de blanco
 * - Bordes redondeados orgánicos
 * - Transiciones suaves en hover y selección
 * - Indicador visual con borde inferior elegante
 * - Iconos integrados en las pestañas
 * - Sombra sutil en estado sticky
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

  // Mapeo de iconos por nombre de categoría
  const getCategoryIcon = (categoryName, fallbackIcon) => {
    const icons = {
      Entradas: '🍗',
      'Pizzas Nuevas': '🍕',
      'Pizzas Clásicas': '🍕',
      'Pizzas Cooking': '🍗',
      'Pizzas Mexicanas': '🌶️',
      'Pizzas con Camarones': '🍤',
      'Pizzas Vegetarianas': '🥬',
      Lasagnas: '🍝',
      Spaghetti: '🍝',
      Salchipapas: '🍟',
      'Crepes de Sal': '🥞',
      'Crepes Dulces': '🥞',
      Waffles: '🧇',
      Tragos: '🍹',
      Hamburguesas: '🍔',
      'Perros calientes': '🌭',
    };
    return icons[categoryName] || fallbackIcon || '🍽️';
  };

  return (
    <div className="sticky top-14 md:top-16 z-20 bg-cream/95 backdrop-blur-sm border-b border-stone/40 shadow-sm">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide px-3 sm:px-4 py-2.5 sm:py-3 gap-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {/* Botón "Todos" */}
        <button
          onClick={handleSelectAll}
          className={`
            relative px-4 sm:px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-medium 
            transition-all duration-300 ease-out min-h-[40px] shrink-0
            ${showAll
              ? 'bg-terracotta text-white shadow-warm'
              : 'bg-white/80 text-charcoal hover:bg-white hover:shadow-sm border border-stone/50'
            }
          `}
        >
          <span className="relative z-10">Todos</span>
          {showAll && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-white/50 rounded-full" />
          )}
        </button>

        {/* Botones por categoría */}
        {categories.map((category) => {
          const isActive = !showAll && selectedCategory === category.id;
          const icon = getCategoryIcon(category.name, category.icon);
          
          return (
            <button
              key={category.id}
              data-category-id={category.id}
              onClick={() => handleSelectCategory(category.id)}
              className={`
                relative px-3.5 sm:px-4 py-2.5 rounded-full whitespace-nowrap text-sm font-medium 
                transition-all duration-300 ease-out flex items-center gap-1.5 sm:gap-2 min-h-[40px] shrink-0
                ${isActive
                  ? 'bg-terracotta text-white shadow-warm'
                  : 'bg-white/80 text-charcoal hover:bg-white hover:shadow-sm border border-stone/50'
                }
              `}
            >
              <span className="text-base">{icon}</span>
              <span>{category.name}</span>
              {category.products_count > 0 && (
                <span className={`
                  text-xs ml-0.5
                  ${isActive
                    ? 'text-white/80'
                    : 'text-stone'
                  }
                `}>
                  ({category.products_count})
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-white/50 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryTabs;