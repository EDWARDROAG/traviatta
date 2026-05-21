/**
 * ======================================================
 * ARCHIVO: ProductCard.jsx
 * UBICACIÓN: menu-qr-system/frontend/src/components/ProductCard.jsx
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 14:00
 *
 * 🎯 PROPÓSITO:
 * Componente que muestra la información de un producto
 * en el menú digital. Incluye imagen, nombre, descripción,
 * precio, etiquetas (popular, nuevo, vegano) y botón
 * de agregar al carrito.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 *
 * 🔗 RELACIONES:
 * - Importado por: MenuPage.jsx, TableMenuPage.jsx
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 14:00
 *    ✅ Creación inicial del archivo
 *    ✅ Visualización de imagen producto
 *    ✅ Etiquetas promocionales
 *    ✅ Botón agregar con cantidad
 *    ✅ Soporte para modificadores/extras
 * ======================================================
 */

import React, { useState } from 'react';

function ProductCard({ product, onAddToCart, showDelivery = true }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState({});
  const [showModifiers, setShowModifiers] = useState(false);

  const hasModifiers = product.modifiers && product.modifiers.length > 0;

  const handleAddToCart = () => {
    const modifiersList = Object.keys(selectedModifiers)
      .filter(key => selectedModifiers[key])
      .map(key => {
        const modifier = product.modifiers.find(m => m.name === key);
        return modifier;
      })
      .filter(m => m);

    onAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      modifiers: modifiersList,
      image_url: product.image_url,
    });
    
    setQuantity(1);
    setSelectedModifiers({});
    setShowModifiers(false);
  };

  const toggleModifier = (modifierName) => {
    setSelectedModifiers(prev => ({
      ...prev,
      [modifierName]: !prev[modifierName]
    }));
  };

  const getModifiersTotal = () => {
    return Object.keys(selectedModifiers)
      .filter(key => selectedModifiers[key])
      .reduce((total, key) => {
        const modifier = product.modifiers.find(m => m.name === key);
        return total + (modifier?.price || 0);
      }, 0);
  };

  const totalPrice = product.price + getModifiersTotal();
  const finalPrice = totalPrice * quantity;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
      <div className="flex">
        {/* Imagen del producto */}
        {product.image_url && (
          <div className="w-24 h-24 flex-shrink-0">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        
        {/* Información del producto */}
        <div className="flex-1 p-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-800">{product.name}</h3>
              {product.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
              )}
            </div>
            <span className="font-bold text-orange-600 text-sm">
              ${product.price.toLocaleString()}
            </span>
          </div>
          
          {/* Etiquetas */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.tags.includes('popular') && (
                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">🔥 Popular</span>
              )}
              {product.tags.includes('nuevo') && (
                <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded">✨ Nuevo</span>
              )}
              {product.tags.includes('vegano') && (
                <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded">🌱 Vegano</span>
              )}
              {product.tags.includes('sin_gluten') && (
                <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">🚫 Sin gluten</span>
              )}
            </div>
          )}
          
          {/* Modificadores/extras */}
          {hasModifiers && (
            <div className="mt-2">
              <button
                onClick={() => setShowModifiers(!showModifiers)}
                className="text-xs text-orange-600 underline"
              >
                {showModifiers ? 'Ocultar extras' : '+ Agregar extras'}
              </button>
              
              {showModifiers && (
                <div className="mt-2 space-y-1">
                  {product.modifiers.map((modifier) => (
                    <label key={modifier.name} className="flex items-center text-xs">
                      <input
                        type="checkbox"
                        checked={!!selectedModifiers[modifier.name]}
                        onChange={() => toggleModifier(modifier.name)}
                        className="mr-2"
                      />
                      <span>{modifier.name}</span>
                      <span className="ml-auto text-gray-500">+${modifier.price.toLocaleString()}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Control de cantidad y botón agregar */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-2 py-1 text-gray-600 hover:bg-gray-100"
              >
                -
              </button>
              <span className="w-8 text-center text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-2 py-1 text-gray-600 hover:bg-gray-100"
              >
                +
              </button>
            </div>
            
            {!product.is_available ? (
              <span className="text-red-500 text-sm">No disponible</span>
            ) : (
              <button
                onClick={handleAddToCart}
                className="bg-orange-600 text-white px-4 py-1 rounded-lg text-sm font-medium hover:bg-orange-700 transition"
              >
                Agregar ${finalPrice.toLocaleString()}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;