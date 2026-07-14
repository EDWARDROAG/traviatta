/**
 * ======================================================
 * ARCHIVO: whatsapp.js
 * UBICACIÓN: menu-qr-system/frontend/src/services/whatsapp.js
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 16:45
 *
 * 🎯 PROPÓSITO:
 * Servicio para generar el mensaje del pedido y abrir
 * WhatsApp con el mensaje pre-construido. El cliente
 * solo debe presionar enviar.
 *
 * 📦 DEPENDENCIAS:
 * - ninguna
 *
 * 🔗 RELACIONES:
 * - Importado por: componentes de checkout
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 16:45
 *    ✅ Creación inicial del archivo
 *    ✅ Generación de mensaje estructurado
 *    ✅ Formateo de moneda
 *    ✅ Apertura de WhatsApp con enlace
 * ======================================================
 */

/**
 * Formatea un número como moneda (COP)
 * @param {number} amount - Cantidad a formatear
 * @returns {string} Cantidad formateada
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Limpia el número de teléfono (solo dígitos)
 * @param {string} phone - Número de teléfono
 * @returns {string} Número limpio
 */
const cleanPhoneNumber = (phone) => {
  return phone.replace(/[^0-9]/g, '');
};

/**
 * Genera el mensaje completo del pedido para WhatsApp
 * @param {Object} orderData - Datos del pedido
 * @returns {string} Mensaje formateado
 */
const generateOrderMessage = (orderData) => {
  const {
    branch_name,
    customer_name,
    customer_phone,
    delivery_address,
    items,
    subtotal,
    delivery_cost = 0,
    total,
    payment_method,
    notes,
  } = orderData;

  let message = '';

  // Header
  message += `🍽️ *NUEVO PEDIDO* 🍽️\n`;
  message += `🍕 ${branch_name}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Información del cliente
  message += `👤 *Cliente:* ${customer_name}\n`;
  message += `📞 *Teléfono:* ${customer_phone}\n`;
  
  if (delivery_address) {
    message += `🏠 *Dirección:* ${delivery_address}\n`;
  }
  
  message += `\n`;

  // Detalle del pedido
  message += `*📋 DETALLE DEL PEDIDO:*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

  for (const item of items) {
    const itemTotal = item.price * item.quantity;
    message += `${item.quantity}x ${item.name}`;
    
    // Mostrar modificadores/extras
    if (item.modifiers && item.modifiers.length > 0) {
      const modifiersText = item.modifiers
        .map(m => ` + ${m.name} (+${formatCurrency(m.price)})`)
        .join('');
      message += modifiersText;
    }
    
    message += ` - ${formatCurrency(itemTotal)}\n`;
  }

  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

  // Totales
  message += `📦 *Subtotal:* ${formatCurrency(subtotal)}\n`;
  
  if (delivery_cost > 0) {
    message += `🚚 *Envío:* ${formatCurrency(delivery_cost)}\n`;
  } else {
    message += `🚚 *Envío:* GRATIS\n`;
  }
  
  message += `*💰 TOTAL:* ${formatCurrency(total)}\n\n`;

  // Método de pago
  message += `*💳 Método de pago:* ${getPaymentMethodName(payment_method)}\n\n`;

  // Notas especiales
  if (notes) {
    message += `📝 *Notas:*\n${notes}\n\n`;
  }

  // Footer
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `✅ Pedido generado automáticamente\n`;
  message += `📞 Responde a este mensaje para confirmar\n`;

  return message;
};

/**
 * Obtiene el nombre legible del método de pago
 * @param {string} method - Método de pago
 * @returns {string} Nombre legible
 */
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

/**
 * Genera el enlace de WhatsApp y abre el mensaje
 * @param {string} phoneNumber - Número de teléfono del restaurante
 * @param {string} message - Mensaje a enviar
 * @returns {boolean} True si se pudo abrir WhatsApp
 */
/**
 * Genera el enlace de WhatsApp y abre el mensaje.
 * Normaliza a E164 CO si llega un celular de 10 dígitos (3…).
 */
const sendWhatsAppMessage = (phoneNumber, message) => {
  if (!phoneNumber) {
    console.error('WhatsApp number is required');
    return false;
  }

  let cleanNumber = cleanPhoneNumber(phoneNumber);
  if (cleanNumber.length === 10 && cleanNumber.startsWith('3')) {
    cleanNumber = `57${cleanNumber}`;
  }
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

  window.open(url, '_blank');
  return true;
};

/**
 * Envía el pedido completo al restaurante por WhatsApp
 * @param {Object} orderData - Datos completos del pedido
 * @returns {boolean} True si se pudo enviar
 */
const sendOrderToWhatsApp = (orderData) => {
  const { branch_whatsapp, branch_phone, ...orderDetails } = orderData;
  const restaurantNumber = branch_whatsapp || branch_phone;

  if (!restaurantNumber) {
    console.error('WhatsApp number not configured for this branch');
    return false;
  }
  
  const message = generateOrderMessage(orderDetails);
  return sendWhatsAppMessage(restaurantNumber, message);
};

/**
 * Envía un mensaje de confirmación al cliente
 * @param {string} customerPhone - Teléfono del cliente
 * @param {Object} orderData - Datos del pedido
 * @returns {boolean} True si se pudo enviar
 */
const sendConfirmationToCustomer = (customerPhone, orderData) => {
  const { branch_name, order_number, total } = orderData;
  
  const message = `✅ *¡Pedido Recibido!* ✅\n\n` +
    `Hemos recibido tu pedido #${order_number}\n` +
    `de ${branch_name}.\n\n` +
    `*Total:* ${formatCurrency(total)}\n\n` +
    `El restaurante se pondrá en contacto contigo para confirmar.\n\n` +
    `¡Gracias por tu compra!`;
  
  return sendWhatsAppMessage(customerPhone, message);
};

/**
 * Abre WhatsApp con un mensaje personalizado
 * @param {string} phoneNumber - Número de teléfono
 * @param {string} message - Mensaje a enviar
 * @returns {boolean}
 */
const openWhatsApp = (phoneNumber, message) => {
  return sendWhatsAppMessage(phoneNumber, message);
};

// ======================================================
// EXPORTACIONES
// ======================================================

export {
  formatCurrency,
  cleanPhoneNumber,
  generateOrderMessage,
  getPaymentMethodName,
  sendWhatsAppMessage,
  sendOrderToWhatsApp,
  sendConfirmationToCustomer,
  openWhatsApp,
};

export default {
  formatCurrency,
  cleanPhoneNumber,
  generateOrderMessage,
  getPaymentMethodName,
  sendWhatsAppMessage,
  sendOrderToWhatsApp,
  sendConfirmationToCustomer,
  openWhatsApp,
};