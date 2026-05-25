/**
 * ======================================================
 * ARCHIVO: MenuPage.jsx
 * UBICACIÓN: menu-qr-system/frontend/src/pages/MenuPage.jsx
 * FASE: F1 - DEBUG
 * VERSIÓN: 1.2-DEBUG
 * ÚLTIMA ACTUALIZACIÓN: 2024-05-22 17:30
 *
 * 🎯 PROPÓSITO:
 * Página principal que muestra el menú completo del
 * restaurante. VERSIÓN CON LOGS PARA DEBUG.
 *
 * 🐛 DEBUG ACTIVADO: SI
 * ======================================================
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useMenu from '../hooks/useMenu';
import useCart from '../hooks/useCart';
import ProductCard from '../components/ProductCard';
import CategoryTabs from '../components/CategoryTabs';
import CartFloating from '../components/CartFloating';

function MenuPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { menu, loading, error, fetchMenu } = useMenu();
  const { items, addItem, updateQuantity, removeItem, getTotal, getItemCount } = useCart();
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ==================================================
  // DEBUG: LOGS DE INICIALIZACIÓN
  // ==================================================
  console.log('🐛 [MenuPage] Inicializado con slug:', slug);
  console.log('🐛 [MenuPage] navigate disponible:', !!navigate);

  useEffect(() => {
    console.log('🐛 [MenuPage] useEffect - fetchMenu para slug:', slug);
    fetchMenu(slug);
  }, [slug, fetchMenu]);

  // ==================================================
  // DEBUG: LOGS DE ESTADO DEL CARRITO
  // ==================================================
  useEffect(() => {
    console.log('🐛 [MenuPage] Carrito actualizado - Items:', getItemCount());
    console.log('🐛 [MenuPage] Items detalle:', items);
  }, [items, getItemCount]);

  if (loading) {
    console.log('🐛 [MenuPage] Estado: CARGANDO...');
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
    console.error('🐛 [MenuPage] Estado: ERROR -', error);
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

  if (!menu) {
    console.log('🐛 [MenuPage] Estado: SIN MENÚ (null)');
    return null;
  }

  console.log('🐛 [MenuPage] Estado: MENÚ CARGADO');
  console.log('🐛 [MenuPage] menu.branch:', menu.branch);

  const categories = menu.categories || [];
  const displayCategories = selectedCategory
    ? categories.filter(c => c.id === selectedCategory)
    : categories;

  // Preparar datos de la sucursal para el checkout
  const branchData = {
    id: menu.branch?.id,
    name: menu.branch?.name,
    whatsapp_number: menu.branch?.whatsapp_number || menu.branch?.phone,
    phone: menu.branch?.phone,
    slug: slug,
    requires_delivery_address: menu.branch?.requires_delivery_address ?? true,
  };

  console.log('🐛 [MenuPage] branchData preparado:', branchData);

  // ==================================================
  // FUNCIÓN DE CHECKOUT CON LOGS
  // ==================================================
  const handleCheckout = () => {
    console.log('🐛 [MenuPage] 🔴🔴🔴 CLIC EN IR A PAGAR 🔴🔴🔴');
    console.log('🐛 [MenuPage] branchData a enviar:', branchData);
    console.log('🐛 [MenuPage] Items en carrito:', items.length);
    console.log('🐛 [MenuPage] Navegando a /checkout...');
    
    try {
      navigate('/checkout', { state: { branch: branchData } });
      console.log('🐛 [MenuPage] ✅ navigate ejecutado correctamente');
    } catch (err) {
      console.error('🐛 [MenuPage] ❌ Error en navigate:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* BANNER DEBUG - VISIBLE SOLO EN DESARROLLO */}
      <div className="bg-yellow-100 text-yellow-800 text-xs text-center py-1 sticky top-0 z-20">
        🐛 MODO DEBUG ACTIVADO | Items: {getItemCount()} | Branch ID: {branchData.id || 'NO ID'}
      </div>

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
          onCheckout={handleCheckout}
        />
      )}
    </div>
  );
}

export default MenuPage;