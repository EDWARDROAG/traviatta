/**
 * ======================================================
 * ARCHIVO: useCart.js
 * UBICACIÓN: menu-qr-system/frontend/src/hooks/useCart.js
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 15:45
 *
 * 🎯 PROPÓSITO:
 * Hook personalizado que utiliza Zustand para gestionar
 * el estado del carrito de compras. Proporciona funciones
 * para agregar, actualizar, eliminar items y calcular
 * totales. Persiste el carrito en localStorage.
 *
 * 📦 DEPENDENCIAS:
 * - zustand: Estado global
 * - zustand/middleware: Persistencia
 *
 * 🔗 RELACIONES:
 * - Importado por: componentes que necesitan el carrito
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 15:45
 *    ✅ Creación inicial del archivo
 *    ✅ Estado y acciones del carrito
 *    ✅ Persistencia en localStorage
 *    ✅ Cálculo de totales
 *    ✅ Manejo de modificadores/extras
 * ======================================================
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      // Estado
      items: [],
      
      // Acciones
      addItem: (product) => {
        const { items } = get();
        const existingIndex = items.findIndex(
          (item) => item.id === product.id && 
          JSON.stringify(item.modifiers) === JSON.stringify(product.modifiers)
        );
        
        if (existingIndex !== -1) {
          // Actualizar cantidad si ya existe
          const updatedItems = [...items];
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: updatedItems[existingIndex].quantity + product.quantity,
          };
          set({ items: updatedItems });
        } else {
          // Agregar nuevo item
          set({ items: [...items, product] });
        }
      },
      
      updateQuantity: (id, quantity) => {
        const { items } = get();
        const updatedItems = items.map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
        );
        set({ items: updatedItems });
      },
      
      removeItem: (id) => {
        const { items } = get();
        set({ items: items.filter((item) => item.id !== id) });
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      // Getters
      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
      
      getSubtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const itemTotal = item.price * item.quantity;
          const modifiersTotal = (item.modifiers || []).reduce(
            (sum, mod) => sum + (mod.price || 0), 0
          ) * item.quantity;
          return total + itemTotal + modifiersTotal;
        }, 0);
      },
      
      getTotal: () => {
        return get().getSubtotal();
      },
      
      getItems: () => {
        return get().items;
      },
    }),
    {
      name: 'cart-storage',
      getStorage: () => localStorage,
    }
  )
);

function useCart() {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const getItemCount = useCartStore((state) => state.getItemCount);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getTotal = useCartStore((state) => state.getTotal);
  const getItems = useCartStore((state) => state.getItems);
  
  return {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getItemCount,
    getSubtotal,
    getTotal,
    getItems,
  };
}

export default useCart;