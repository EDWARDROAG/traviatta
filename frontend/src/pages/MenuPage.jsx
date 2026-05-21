/**
 * ======================================================
 * ARCHIVO: MenuPage.jsx
 * UBICACIÓN: menu-qr-system/frontend/src/pages/MenuPage.jsx
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 13:15
 *
 * 🎯 PROPÓSITO:
 * Página principal que muestra el menú completo del
 * restaurante. Incluye categorías, lista de productos,
 * carrito flotante y estado de carga.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - react-router-dom: Navegación
 * - ../hooks/useMenu: Hook para obtener menú
 * - ../hooks/useCart: Hook para manejo de carrito
 * - ../components/ProductCard: Tarjeta de producto
 * - ../components/CategoryTabs: Pestañas de categorías
 * - ../components/CartFloating: Carrito flotante
 *
 * 🔗 RELACIONES:
 * - Es importado por: App.jsx
 * - Importa componentes y hooks
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 13:15
 *    ✅ Creación inicial del archivo
 *    ✅ Integración con hook useMenu
 *    ✅ Integración con hook useCart
 *    ✅ Renderizado de categorías y productos
 *    ✅ Carrito flotante
 * ======================================================
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useMenu from '../hooks/useMenu';
import useCart from '../hooks/useCart';
import ProductCard from '../components/ProductCard';
import CategoryTabs from '../components/CategoryTabs';
import CartFloating from '../components/CartFloating';

function MenuPage() {
  const { slug } = useParams();
  const { menu, loading, error, fetchMenu } = useMenu();
  const { items, addItem, updateQuantity, removeItem, getTotal, getItemCount } = useCart();
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchMenu(slug);
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando menú...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
          <button
            onClick={() => fetchMenu(slug)}
            className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!menu) return null;

  const categories = menu.categories || [];
  const displayCategories = selectedCategory
    ? categories.filter(c => c.id === selectedCategory)
    : categories;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header con logo */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {menu.branch?.logo_url && (
            <img
              src={menu.branch.logo_url}
              alt={menu.branch.name}
              className="h-12 mx-auto"
            />
          )}
          <h1 className="text-xl font-bold text-center mt-2">{menu.branch?.name}</h1>
          {menu.branch?.is_open?.isOpen === false && (
            <p className="text-center text-red-600 text-sm mt-1">
              Cerrado - Abre a las {menu.branch.is_open.open_time}
            </p>
          )}
        </div>
      </div>

      {/* Pestañas de categorías */}
      <CategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Lista de productos */}
      <div className="max-w-2xl mx-auto px-4">
        {displayCategories.map((category) => (
          <div key={category.id} className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">{category.name}</h2>
            {category.description && (
              <p className="text-sm text-gray-500 mb-3">{category.description}</p>
            )}
            <div className="space-y-3">
              {category.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addItem}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Carrito flotante */}
      {getItemCount() > 0 && (
        <CartFloating
          itemCount={getItemCount()}
          total={getTotal()}
          items={items}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
        />
      )}
    </div>
  );
}

export default MenuPage;