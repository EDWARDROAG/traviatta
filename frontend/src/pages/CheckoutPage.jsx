/**
 * Contrato: checkout Menú QR — armar mensaje y abrir WhatsApp (con o sin API).
 * Consumidores: App ruta `/checkout`.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useCart from '../hooks/useCart';
import { createOrder } from '../services/api';
import { sendWhatsAppMessage, formatCurrency } from '../services/whatsapp';
import {
  CARTA_PATH,
  DEFAULT_MENU_SLUG,
  SITE,
  USE_STATIC_MENU,
} from '../data/site';

function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, getTotal, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [orderCreated, setOrderCreated] = useState(null);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_address: '',
    notes: '',
    payment_method: 'cash',
    order_type: 'delivery',
  });

  const branch = useMemo(() => {
    const fromState = location.state?.branch;
    if (fromState?.id) return fromState;
    return {
      id: 'traviatta-pizza-gourmet-branch',
      name: SITE.fullName,
      whatsapp_number: SITE.whatsappE164,
      phone: SITE.whatsapp,
      slug: DEFAULT_MENU_SLUG,
      requires_delivery_address: true,
      free_delivery_min_amount: 60000,
    };
  }, [location.state]);

  const branchWhatsapp = SITE.whatsappE164;
  const total = getTotal();
  const deliveryCost =
    formData.order_type === 'delivery'
      ? deliveryInfo?.is_free
        ? 0
        : deliveryInfo?.cost || 4500
      : 0;
  const finalTotal = total + deliveryCost;

  useEffect(() => {
    if (items.length === 0 && !orderCreated) {
      navigate(CARTA_PATH);
    }
  }, [items, navigate, orderCreated]);

  useEffect(() => {
    if (formData.order_type !== 'delivery') {
      setDeliveryInfo(null);
      return;
    }
    setDeliveryInfo({
      cost: 4500,
      is_free: total >= (branch.free_delivery_min_amount || 60000),
      is_covered: true,
    });
  }, [formData.order_type, total, branch.free_delivery_min_amount]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getPaymentMethodName = (method) => {
    const methods = {
      cash: 'Efectivo contra entrega',
      card: 'Tarjeta (datáfono)',
      transfer: 'Transferencia bancaria',
      nequi: 'Nequi',
      daviplata: 'Daviplata',
    };
    return methods[method] || method;
  };

  const generateWhatsAppMessage = (orderMeta) => {
    const orderNumber = orderMeta.order_number || orderMeta.id;
    const itemsList = items
      .map((item) => {
        const mods =
          item.modifiers && item.modifiers.length > 0
            ? ` (${item.modifiers.map((m) => m.name).join(', ')})`
            : '';
        const itemTotal =
          (item.price +
            (item.modifiers || []).reduce((s, m) => s + (m.price || 0), 0)) *
          item.quantity;
        return `${item.quantity}x ${item.name}${mods} - ${formatCurrency(itemTotal)}`;
      })
      .join('\n');

    let message = `🍽️ *NUEVO PEDIDO #${orderNumber}* 🍽️\n`;
    message += `🍕 ${branch.name || SITE.fullName}\n`;
    message += `📍 ${SITE.sedeName}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `👤 *Cliente:* ${formData.customer_name}\n`;
    message += `📞 *Teléfono:* ${formData.customer_phone}\n`;

    if (formData.order_type === 'delivery' && formData.delivery_address) {
      message += `🏠 *Dirección:* ${formData.delivery_address}\n`;
    } else if (formData.order_type === 'pickup') {
      message += `📦 *Tipo:* Recoger en local\n`;
    }

    message += `\n📋 *DETALLE DEL PEDIDO:*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `${itemsList}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📦 *Subtotal:* ${formatCurrency(total)}\n`;

    if (formData.order_type === 'delivery') {
      if (deliveryCost > 0) {
        message += `🚚 *Envío:* ${formatCurrency(deliveryCost)}\n`;
      } else {
        message += `🚚 *Envío:* GRATIS\n`;
      }
    }

    message += `💰 *TOTAL:* ${formatCurrency(finalTotal)}\n\n`;
    message += `💳 *Pago:* ${getPaymentMethodName(formData.payment_method)}\n\n`;

    if (formData.notes) {
      message += `📝 *Notas:*\n${formData.notes}\n\n`;
    }

    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `✅ Pedido Menú QR Traviatta\n`;
    message += `📞 Confirma respondiendo a este mensaje\n`;

    return message;
  };

  const finishWithWhatsApp = (orderMeta) => {
    setOrderCreated(orderMeta);
    const message = generateWhatsAppMessage(orderMeta);
    const opened = sendWhatsAppMessage(branchWhatsapp, message);
    clearCart();
    if (opened) {
      alert(
        `✅ Pedido #${orderMeta.order_number} listo.\n\nSe abrió WhatsApp con el mensaje para la pizzería. Solo confirma el envío.`
      );
    } else {
      alert('Pedido armado, pero no se pudo abrir WhatsApp. Revisa el número configurado.');
    }
    navigate(CARTA_PATH);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customer_name || !formData.customer_phone) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (formData.order_type === 'delivery' && !formData.delivery_address) {
      alert('Por favor ingresa tu dirección de entrega');
      return;
    }

    if (items.length === 0) {
      alert('No hay productos en el carrito');
      return;
    }

    setSubmitting(true);

    const localOrder = {
      id: `qr-${Date.now()}`,
      order_number: `QR-${Date.now().toString().slice(-6)}`,
    };

    try {
      // MVP sin backend: ir directo a WhatsApp con el pedido concatenado
      if (USE_STATIC_MENU) {
        finishWithWhatsApp(localOrder);
        return;
      }

      const orderPayload = {
        branch_id: branch.id,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        order_type: formData.order_type,
        payment_method: formData.payment_method,
        notes: formData.notes,
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          modifiers: item.modifiers || [],
        })),
      };

      if (formData.order_type === 'delivery' && formData.delivery_address) {
        orderPayload.delivery_address = formData.delivery_address;
      }

      if (deliveryCost > 0) {
        orderPayload.delivery_cost = deliveryCost;
      }

      const orderResponse = await createOrder(orderPayload);

      if (orderResponse?.success && orderResponse?.data) {
        finishWithWhatsApp(orderResponse.data);
        return;
      }

      // API falló → igual enviamos por WhatsApp (experiencia Menú QR)
      finishWithWhatsApp(localOrder);
    } catch {
      finishWithWhatsApp(localOrder);
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !orderCreated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cream py-8 sm:py-12">
      <div className="container-premium max-w-5xl">
        <div className="text-center mb-8 sm:mb-10 px-2">
          <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal">
            Finalizar Pedido
          </h1>
          <p className="text-stone mt-2 text-xs sm:text-sm">
            {SITE.sedeName} · Al confirmar se abre WhatsApp con tu pedido
          </p>
          <div className="separator-organic mt-4 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="card-premium p-5 sm:p-6 md:p-8 order-2 md:order-1">
            <h2 className="font-heading text-lg sm:text-xl font-semibold text-charcoal mb-5 sm:mb-6">Tus datos</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  className="input-premium"
                  placeholder="Ej: Juan Pérez"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Teléfono *</label>
                <input
                  type="tel"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleInputChange}
                  placeholder="3001234567"
                  className="input-premium"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Tipo de pedido *
                </label>
                <select
                  name="order_type"
                  value={formData.order_type}
                  onChange={handleInputChange}
                  className="input-premium appearance-none"
                  disabled={submitting}
                >
                  <option value="delivery">🚚 Domicilio</option>
                  <option value="pickup">📦 Recoger en local</option>
                </select>
              </div>

              {formData.order_type === 'delivery' && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Dirección de entrega *
                  </label>
                  <input
                    type="text"
                    name="delivery_address"
                    value={formData.delivery_address}
                    onChange={handleInputChange}
                    placeholder="Calle, número, barrio"
                    className="input-premium"
                    disabled={submitting}
                  />
                  {deliveryInfo && (
                    <p
                      className={`text-xs mt-2 ${
                        deliveryInfo.is_free ? 'text-green-600' : 'text-terracotta'
                      }`}
                    >
                      {deliveryInfo.is_free
                        ? '✅ Envío gratis en esta zona'
                        : `🚚 Costo de envío: ${formatCurrency(deliveryInfo.cost)}`}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Método de pago
                </label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleInputChange}
                  className="input-premium appearance-none"
                  disabled={submitting}
                >
                  <option value="cash">💰 Efectivo contra entrega</option>
                  <option value="card">💳 Tarjeta (datáfono)</option>
                  <option value="transfer">🏦 Transferencia bancaria</option>
                  <option value="nequi">📱 Nequi</option>
                  <option value="daviplata">📱 Daviplata</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Notas especiales
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Sin cebolla, entrada por la calle 123, etc."
                  className="input-premium resize-none"
                  disabled={submitting}
                />
              </div>
            </form>
          </div>

          <div className="card-premium p-5 sm:p-6 md:p-8 h-fit md:sticky md:top-24 order-1 md:order-2">
            <h2 className="font-heading text-lg sm:text-xl font-semibold text-charcoal mb-5 sm:mb-6">
              Resumen del pedido
            </h2>

            <div className="space-y-3 max-h-80 overflow-y-auto mb-6 pr-2">
              {items.map((item) => (
                <div
                  key={`${item.id}-${JSON.stringify(item.modifiers)}`}
                  className="flex justify-between text-sm py-2 border-b border-stone/20 last:border-0"
                >
                  <span className="text-charcoal">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-medium text-terracotta">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-stone/30 pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-stone">Subtotal</span>
                <span className="text-charcoal">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone">Envío</span>
                <span className="text-charcoal">
                  {formData.order_type === 'pickup'
                    ? '—'
                    : deliveryCost === 0
                      ? 'Gratis'
                      : formatCurrency(deliveryCost)}
                </span>
              </div>
              <div className="flex justify-between font-heading text-xl font-bold pt-3 border-t border-stone/30">
                <span>Total</span>
                <span className="text-terracotta">{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary w-full mt-8 py-3.5 text-base font-semibold"
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Abriendo WhatsApp...
                </div>
              ) : (
                `Enviar pedido por WhatsApp • ${formatCurrency(finalTotal)}`
              )}
            </button>

            <button
              onClick={() => navigate(CARTA_PATH)}
              disabled={submitting}
              className="w-full mt-3 text-stone text-sm hover:text-terracotta transition-smooth"
            >
              ← Volver al menú QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
