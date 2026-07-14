/**
 * ======================================================
 * ARCHIVO: MenuPage.jsx
 * UBICACIÓN: menu-qr-system/frontend/src/pages/MenuPage.jsx
 * FASE: UI/UX Premium
 * VERSIÓN: 2.0
 * ÚLTIMA ACTUALIZACIÓN: 2026-05-24
 * ======================================================
 * 🎯 PROPÓSITO:
 * Página principal que muestra el menú completo del restaurante.
 * Diseño editorial premium con atmósfera cálida y elegante.
 *
 * 🎨 MEJORAS VISUALES:
 * - Fondo crema cálido en lugar de gris
 * - Header con logo centrado y nombre elegante
 * - Tipografía Playfair Display para títulos
 * - Espaciado amplio y aireado
 * - Hero section con imagen de fondo (opcional)
 * - Footer con información del restaurante
 * ======================================================
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useMenu from '../hooks/useMenu';
import useCart from '../hooks/useCart';
import ProductCard from '../components/ProductCard';
import CategoryTabs from '../components/CategoryTabs';
import CartFloating from '../components/CartFloating';
import { DEFAULT_MENU_SLUG, SITE } from '../data/site';

function MenuPage() {
  const { slug: slugParam } = useParams();
  const slug = slugParam || DEFAULT_MENU_SLUG;
  const navigate = useNavigate();
  const { menu, loading, error, fetchMenu } = useMenu();
  const { items, addItem, updateQuantity, removeItem, getTotal, getItemCount } = useCart();
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchMenu(slug);
  }, [slug, fetchMenu]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-terracotta border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-stone font-medium">Cargando nuestro menú...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center max-w-md mx-auto p-8">
          <p className="text-terracotta font-heading text-xl mb-4">Oops...</p>
          <p className="text-stone mb-6">{error}</p>
          <button
            onClick={() => fetchMenu(slug)}
            className="btn-primary"
          >
            Intentar nuevamente
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

  // Preparar datos de la sucursal para el checkout
  const branchData = {
    id: menu.branch?.id,
    name: menu.branch?.name,
    // Siempre el WA oficial de SITE (evita caché/menú viejo con otro número)
    whatsapp_number: SITE.whatsappE164,
    phone: SITE.whatsapp,
    slug: slug,
    requires_delivery_address: menu.branch?.requires_delivery_address ?? true,
    free_delivery_min_amount:
      menu.branch?.delivery_settings?.free_delivery_min_amount || 60000,
  };

  const handleCheckout = () => {
    navigate('/checkout', { state: { branch: branchData } });
  };

  return (
    <div className="min-h-screen bg-cream menu-qr-page">
      {/* Hero */}
      <div className="relative bg-walnut/10 overflow-hidden">
        <div className="relative container-premium py-8 sm:py-12 md:py-16 text-center">
          {menu.branch?.logo_url && (
            <img
              src={menu.branch.logo_url}
              alt={menu.branch.name}
              className="h-14 sm:h-16 md:h-20 mx-auto mb-4"
            />
          )}
          <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal px-2">
            {menu.branch?.name}
          </h1>
          <p className="text-stone text-xs sm:text-sm mt-2 px-4">
            Menú QR · arma tu pedido y envíalo por WhatsApp
          </p>
          {menu.branch?.is_open?.isOpen === false && (
            <p className="text-terracotta text-sm mt-2">
              Cerrado • Abre a las {menu.branch.is_open.open_time}
            </p>
          )}
          <div className="separator-organic mt-4 sm:mt-6" />
        </div>
      </div>

      <CategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div className="container-premium py-6 sm:py-8">
        {displayCategories.map((category, index) => (
          <section
            key={category.id}
            className="mb-8 sm:mb-12 animate-fade-in-up"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="text-center mb-5 sm:mb-8 px-2">
              <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-semibold text-charcoal">
                {category.name}
              </h2>
              {category.description && (
                <p className="text-stone mt-2 max-w-md mx-auto text-sm">
                  {category.description}
                </p>
              )}
              <div className="separator-organic mt-3 sm:mt-4" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {category.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addItem}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="hidden sm:block bg-charcoal text-white/80 py-12 mt-8">
        <div className="container-premium">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="font-heading text-white text-lg mb-3">Horario</h3>
              <p className="text-sm">Lunes a Jueves: 11:00 - 22:00</p>
              <p className="text-sm">Viernes a Sábado: 11:00 - 23:00</p>
              <p className="text-sm">Domingos: 11:00 - 21:00</p>
            </div>
            <div>
              <h3 className="font-heading text-white text-lg mb-3">Contacto</h3>
              <p className="text-sm">📞 {SITE.phoneDisplay}</p>
              <p className="text-sm">💬 WhatsApp: {SITE.phoneDisplay}</p>
              <p className="text-sm">📍 {menu.branch?.address || SITE.city}</p>
            </div>
            <div>
              <h3 className="font-heading text-white text-lg mb-3">Síguenos</h3>
              <div className="flex justify-center md:justify-start gap-4">
                <span className="text-white/50 text-sm">Redes próximamente</span>
              </div>
            </div>
          </div>
          <div className="text-center text-xs text-white/40 mt-8 pt-4 border-t border-white/10">
            © {new Date().getFullYear()} Traviatta Pizza Gourmet. Todos los derechos reservados.
          </div>
        </div>
      </footer>

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