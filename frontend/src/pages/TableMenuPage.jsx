/**
 * ======================================================
 * ARCHIVO: TableMenuPage.jsx
 * UBICACIÓN: menu-qr-system/frontend/src/pages/TableMenuPage.jsx
 * FASE: F4
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 13:30
 *
 * 🎯 PROPÓSITO:
 * Página de menú específica para clientes que escanean
 * el QR de una mesa. Incluye información de la mesa,
 * opción de pedir desde la mesa (sin domicilio),
 * y solicitar cuenta.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - react-router-dom: Navegación
 * - ../hooks/useMenu: Hook para obtener menú
 * - ../hooks/useCart: Hook para manejo de carrito
 * - ../services/api: Llamadas a API
 * - ../components/ProductCard: Tarjeta de producto
 * - ../components/CategoryTabs: Pestañas de categorías
 *
 * 🔗 RELACIONES:
 * - Es importado por: App.jsx
 * - Importa componentes y hooks
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 13:30
 *    ✅ Creación inicial del archivo
 *    ✅ Información de mesa visible
 *    ✅ Flujo de pedido sin domicilio
 *    ✅ Opción de solicitar cuenta
 * ======================================================
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useMenu from '../hooks/useMenu';
import useCart from '../hooks/useCart';
import { createTableOrder, requestTableBill } from '../services/api';
import ProductCard from '../components/ProductCard';
import CategoryTabs from '../components/CategoryTabs';
import CartFloating from '../components/CartFloating';

function TableMenuPage() {
  const { slug, tableId } = useParams();
  const navigate = useNavigate();
  const { menu, loading, error, fetchMenu } = useMenu();
  const { items, addItem, updateQuantity, removeItem, getTotal, getItemCount, clearCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [tableInfo, setTableInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMenu(slug, { tableId });
    fetchTableInfo();
  }, [slug, tableId]);

  const fetchTableInfo = async () => {
    try {
      const response = await fetch(`/api/table/${tableId}/info`);
      const data = await response.json();
      if (data.success) {
        setTableInfo(data.data);
      }
    } catch (error) {
      console.error('Error fetching table info:', error);
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;

    setSubmitting(true);
    try {
      const orderData = {
        items: items.map(item => ({
          product_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          modifiers: item.modifiers || [],
        })),
        notes: '',
      };

      const result = await createTableOrder(tableId, orderData);
      
      if (result.success) {
        clearCart();
        alert(`Pedido #${result.data.order_number} enviado a cocina`);
        navigate(`/mesa/${slug}/${tableId}`);
      } else {
        alert('Error al enviar el pedido');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error al enviar el pedido');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestBill = async () => {
    try {
      const result = await requestTableBill(tableId);
      if (result.success) {
        alert('Solicitud de cuenta enviada. Un mesero se acercará.');
      }
    } catch (error) {
      console.error('Error requesting bill:', error);
      alert('Error al solicitar la cuenta');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-600">Error: {error}</p>
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
      {/* Header con información de mesa */}
      <div className="bg-orange-600 text-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-bold">{menu.branch?.name}</h1>
              {tableInfo && (
                <p className="text-sm opacity-90">
                  Mesa {tableInfo.number} - Capacidad: {tableInfo.capacity} personas
                </p>
              )}
            </div>
            <button
              onClick={handleRequestBill}
              className="bg-white text-orange-600 px-4 py-1 rounded-lg text-sm font-medium"
            >
              Pedir Cuenta
            </button>
          </div>
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
            <div className="space-y-3">
              {category.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addItem}
                  showDelivery={false}
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
          onCheckout={handlePlaceOrder}
          isSubmitting={submitting}
          checkoutText="Pedir a Cocina"
          showDeliveryInfo={false}
        />
      )}
    </div>
  );
}

export default TableMenuPage;