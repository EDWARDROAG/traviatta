/**
 * ======================================================
 * ARCHIVO: whatsappService.js
 * UBICACIÓN: menu-qr-system/backend/src/services/whatsappService.js
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-15 18:00
 *
 * 🎯 PROPÓSITO:
 * Servicio para la generación de mensajes estructurados
 * de pedidos y envío automático a WhatsApp. Soporta
 * dos modos: enlace directo wa.me (gratuito) y
 * WhatsApp Business API (opcional para mayor
 * automatización).
 *
 * 📦 DEPENDENCIAS:
 * - ../utils/logger: Logging
 *
 * 🔗 RELACIONES:
 * - Importa de: ../utils/logger
 * - Es importado por: services/orderService.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-15 18:00
 *    ✅ Creación inicial del archivo
 *    ✅ Generación de mensajes estructurados
 *    ✅ Formateo de productos y totales
 *    ✅ Enlace wa.me para envío automático
 *    ✅ Soporte para notificaciones de estado
 *    ✅ Mensajes de confirmación al cliente
 * ======================================================
 */

const logger = require('../utils/logger');

// ======================================================
// CONSTANTES
// ======================================================

const WHATSAPP_API_URL = 'https://wa.me/';
const WHATSAPP_API_VERSION = 'v17.0';

const MESSAGE_TYPES = {
  ORDER_CONFIRMATION: 'order_confirmation',
  ORDER_READY: 'order_ready',
  ORDER_ON_WAY: 'order_on_way',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  TABLE_REQUEST: 'table_request',
};

// Emojis para formato
const EMOJIS = {
  RESTAURANT: '🍽️',
  PACKAGE: '📦',
  CLOCK: '⏰',
  MONEY: '💰',
  LOCATION: '📍',
  PHONE: '📞',
  CHECK: '✅',
  WARNING: '⚠️',
  FIRE: '🔥',
  STAR: '⭐',
  BELL: '🔔',
  FOOD: '🍕',
  DRINK: '🥤',
  USER: '👤',
  ADDRESS: '🏠',
  NOTES: '📝',
  DELIVERY: '🚚',
  TABLE: '🪑',
};

// ======================================================
// GENERACIÓN DE MENSAJES
// ======================================================

/**
 * Genera mensaje completo de pedido para WhatsApp
 * @param {Object} orderData - Datos del pedido
 * @returns {string} Mensaje formateado
 */
const generateOrderMessage = (orderData) => {
  const {
    order_number,
    customer_name,
    customer_phone,
    delivery_address,
    branch_name,
    items,
    subtotal,
    delivery_cost = 0,
    discount = 0,
    total,
    payment_method,
    notes,
    order_type = 'delivery',
    table_number = null,
  } = orderData;
  
  let message = '';
  
  // Header
  message += `${EMOJIS.RESTAURANT} *NUEVO PEDIDO* ${EMOJIS.RESTAURANT}\n`;
  message += `${EMOJIS.FOOD} ${branch_name}\n`;
  message += `${EMOJIS.BELL} Pedido #${order_number}\n`;
  message += `${EMOJIS.CLOCK} ${new Date().toLocaleString()}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  // Información del cliente
  message += `${EMOJIS.USER} *Cliente:* ${customer_name}\n`;
  message += `${EMOJIS.PHONE} *Teléfono:* ${customer_phone}\n`;
  
  if (order_type === 'delivery' && delivery_address) {
    message += `${EMOJIS.ADDRESS} *Dirección:* ${delivery_address}\n`;
  }
  
  if (order_type === 'table' && table_number) {
    message += `${EMOJIS.TABLE} *Mesa:* ${table_number}\n`;
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
  message += `${EMOJIS.PACKAGE} *Subtotal:* ${formatCurrency(subtotal)}\n`;
  
  if (delivery_cost > 0) {
    message += `${EMOJIS.DELIVERY} *Envío:* ${formatCurrency(delivery_cost)}\n`;
  } else if (delivery_cost === 0 && order_type === 'delivery') {
    message += `${EMOJIS.DELIVERY} *Envío:* GRATIS\n`;
  }
  
  if (discount > 0) {
    message += `${EMOJIS.STAR} *Descuento:* -${formatCurrency(discount)}\n`;
  }
  
  message += `*💰 TOTAL:* ${formatCurrency(total)}\n\n`;
  
  // Método de pago
  message += `*💳 Método de pago:* ${getPaymentMethodName(payment_method)}\n\n`;
  
  // Notas especiales
  if (notes) {
    message += `${EMOJIS.NOTES} *Notas:*\n${notes}\n\n`;
  }
  
  // Footer
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `${EMOJIS.CHECK} Pedido generado automáticamente\n`;
  message += `${EMOJIS.PHONE} Responde a este mensaje para confirmar\n`;
  
  return message;
};

/**
 * Genera mensaje de confirmación para el cliente
 * @param {Object} orderData - Datos del pedido
 * @returns {string} Mensaje formateado
 */
const generateCustomerConfirmationMessage = (orderData) => {
  const {
    order_number,
    branch_name,
    branch_phone,
    branch_address,
    items,
    total,
    estimated_time,
  } = orderData;
  
  let message = '';
  
  message += `${EMOJIS.CHECK} *¡Pedido Recibido!* ${EMOJIS.CHECK}\n\n`;
  message += `Hemos recibido tu pedido #${order_number}\n`;
  message += `de ${branch_name}.\n\n`;
  
  message += `*Resumen:*\n`;
  for (const item of items) {
    message += `• ${item.quantity}x ${item.name}\n`;
  }
  
  message += `\n*Total:* ${formatCurrency(total)}\n\n`;
  
  if (estimated_time) {
    message += `${EMOJIS.CLOCK} *Tiempo estimado:* ${estimated_time} minutos\n\n`;
  }
  
  message += `El restaurante se pondrá en contacto contigo para confirmar.\n\n`;
  message += `${EMOJIS.PHONE} *Contacto:* ${branch_phone}\n`;
  
  if (branch_address) {
    message += `${EMOJIS.LOCATION} *Dirección:* ${branch_address}\n`;
  }
  
  return message;
};

/**
 * Genera mensaje de notificación de estado
 * @param {string} type - Tipo de mensaje
 * @param {Object} data - Datos adicionales
 * @returns {string} Mensaje formateado
 */
const generateStatusMessage = (type, data) => {
  const { order_number, customer_name, estimated_time, reason } = data;
  
  const messages = {
    [MESSAGE_TYPES.ORDER_READY]: `
${EMOJIS.FIRE} *¡Pedido Listo!* ${EMOJIS.FIRE}

El pedido #${order_number} de ${customer_name} está listo para entregar.

${EMOJIS.CLOCK} Listo desde: ${new Date().toLocaleTimeString()}
    `,
    
    [MESSAGE_TYPES.ORDER_ON_WAY]: `
${EMOJIS.DELIVERY} *Pedido en Camino* ${EMOJIS.DELIVERY}

El pedido #${order_number} de ${customer_name} está en camino.

Tiempo estimado de llegada: ${estimated_time} minutos.
    `,
    
    [MESSAGE_TYPES.ORDER_DELIVERED]: `
${EMOJIS.CHECK} *Pedido Entregado* ${EMOJIS.CHECK}

El pedido #${order_number} de ${customer_name} ha sido entregado.

¡Gracias por tu compra!
    `,
    
    [MESSAGE_TYPES.ORDER_CANCELLED]: `
${EMOJIS.WARNING} *Pedido Cancelado* ${EMOJIS.WARNING}

El pedido #${order_number} de ${customer_name} ha sido cancelado.

Motivo: ${reason || 'No especificado'}
    `,
  };
  
  return messages[type] || messages[MESSAGE_TYPES.ORDER_READY];
};

// ======================================================
// ENVÍO DE MENSAJES
// ======================================================

/**
 * Genera enlace de WhatsApp para enviar mensaje
 * @param {string} phoneNumber - Número de teléfono (con código país)
 * @param {string} message - Mensaje a enviar
 * @returns {string} URL de WhatsApp
 */
const generateWhatsAppLink = (phoneNumber, message) => {
  // Limpiar número (solo dígitos)
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  
  // Codificar mensaje para URL
  const encodedMessage = encodeURIComponent(message);
  
  return `${WHATSAPP_API_URL}${cleanNumber}?text=${encodedMessage}`;
};

/**
 * Envía mensaje a WhatsApp usando enlace directo
 * @param {string} phoneNumber - Número de teléfono
 * @param {string} message - Mensaje a enviar
 * @returns {Object} Resultado con URL generada
 */
const sendWhatsAppLink = (phoneNumber, message) => {
  const url = generateWhatsAppLink(phoneNumber, message);
  
  logger.info(`WhatsApp link generated for ${phoneNumber}`);
  
  return {
    success: true,
    url,
    method: 'link',
  };
};

/**
 * Envía mensaje usando WhatsApp Business API (opcional)
 * @param {string} phoneNumber - Número de teléfono
 * @param {string} message - Mensaje a enviar
 * @returns {Promise<Object>} Resultado del envío
 */
const sendWhatsAppAPI = async (phoneNumber, message) => {
  // Esta función requiere configuración de WhatsApp Business API
  // Por ahora, fallback a link
  logger.warn('WhatsApp API not configured, falling back to link method');
  return sendWhatsAppLink(phoneNumber, message);
};

/**
 * Envía mensaje de pedido al restaurante
 * @param {string} restaurantPhone - Teléfono del restaurante
 * @param {Object} orderData - Datos del pedido
 * @returns {Object} Resultado
 */
const sendOrderToRestaurant = (restaurantPhone, orderData) => {
  const message = generateOrderMessage(orderData);
  return sendWhatsAppLink(restaurantPhone, message);
};

/**
 * Envía confirmación al cliente
 * @param {string} customerPhone - Teléfono del cliente
 * @param {Object} orderData - Datos del pedido
 * @returns {Object} Resultado
 */
const sendConfirmationToCustomer = (customerPhone, orderData) => {
  const message = generateCustomerConfirmationMessage(orderData);
  return sendWhatsAppLink(customerPhone, message);
};

// ======================================================
// FUNCIONES DE UTILIDAD
// ======================================================

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
 * Obtiene nombre legible del método de pago
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
 * Valida número de teléfono para WhatsApp
 * @param {string} phone - Número a validar
 * @returns {boolean} Válido o no
 */
const validatePhoneNumber = (phone) => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  // Debe tener entre 10 y 15 dígitos (incluyendo código país)
  return cleanPhone.length >= 10 && cleanPhone.length <= 15;
};

/**
 * Limpia y formatea número de teléfono
 * @param {string} phone - Número a formatear
 * @returns {string} Número formateado
 */
const formatPhoneNumber = (phone) => {
  return phone.replace(/[^0-9]/g, '');
};

/**
 * Extrae mensaje de respuesta de WhatsApp (para webhooks)
 * @param {Object} webhookData - Datos del webhook
 * @returns {Object} Mensaje extraído
 */
const parseWebhookMessage = (webhookData) => {
  // Estructura para webhooks de WhatsApp Business API
  try {
    const entry = webhookData.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];
    
    if (message) {
      return {
        from: message.from,
        text: message.text?.body,
        timestamp: message.timestamp,
        type: message.type,
      };
    }
    
    return null;
  } catch (error) {
    logger.error('Error parsing webhook:', error.message);
    return null;
  }
};

// ======================================================
// MENSAJES RÁPIDOS (TEMPLATES)
// ======================================================

/**
 * Genera mensaje de bienvenida con instrucciones
 * @param {string} restaurantName - Nombre del restaurante
 * @returns {string} Mensaje de bienvenida
 */
const generateWelcomeMessage = (restaurantName) => {
  return `
${EMOJIS.RESTAURANT} *Bienvenido a ${restaurantName}* ${EMOJIS.RESTAURANT}

Para hacer tu pedido:
1. Escanea el código QR en tu mesa o vitrina
2. Selecciona los productos que deseas
3. Completa tus datos
4. Envía el pedido

${EMOJIS.CHECK} ¡Tus pedidos llegan automáticamente aquí!

¿Tienes preguntas? Escríbenos y te atenderemos.
  `;
};

/**
 * Genera mensaje de agradecimiento post-pedido
 * @param {string} customerName - Nombre del cliente
 * @returns {string} Mensaje de agradecimiento
 */
const generateThankYouMessage = (customerName) => {
  return `
${EMOJIS.STAR} *¡Gracias por tu pedido, ${customerName}!* ${EMOJIS.STAR}

Esperamos que disfrutes tu comida.

${EMOJIS.FIRE} ¡Califícanos y ayúdanos a mejorar!

¿Listo para otro pedido? Escanea el QR nuevamente.
  `;
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  // Constantes
  MESSAGE_TYPES,
  EMOJIS,
  
  // Generación de mensajes
  generateOrderMessage,
  generateCustomerConfirmationMessage,
  generateStatusMessage,
  generateWelcomeMessage,
  generateThankYouMessage,
  
  // Envío
  generateWhatsAppLink,
  sendWhatsAppLink,
  sendWhatsAppAPI,
  sendOrderToRestaurant,
  sendConfirmationToCustomer,
  
  // Utilidades
  formatCurrency,
  getPaymentMethodName,
  validatePhoneNumber,
  formatPhoneNumber,
  parseWebhookMessage,
};