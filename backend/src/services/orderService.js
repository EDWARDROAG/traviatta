/**
 * ======================================================
 * ARCHIVO: orderService.js
 * UBICACIÓN: menu-qr-system/backend/src/services/orderService.js
 * FASE: F1
 * VERSIÓN: 1.1 - CORREGIDO
 * ÚLTIMA ACTUALIZACIÓN: 2024-05-22 18:55
 *
 * 🎯 PROPÓSITO:
 * Servicio principal para la gestión de pedidos.
 * VERSIÓN CORREGIDA - Serialización JSON para PostgreSQL.
 *
 * 🐛 CORRECCIÓN: Los items ahora se serializan correctamente
 *    como JSONB para PostgreSQL.
 * ======================================================
 */

const Order = require('../models/Order');
const Table = require('../models/Table');
const Branch = require('../models/Branch');
const Product = require('../models/Product');
const rabbitmq = require('../config/rabbitmq');
const redis = require('../config/redis');
const whatsappService = require('./whatsappService');
const logger = require('../utils/logger');

// ======================================================
// CONSTANTES
// ======================================================

const QUEUE_OPTIONS = {
  persistent: true,
  timestamp: Date.now(),
};

// ======================================================
// FUNCIÓN PRINCIPAL - CREAR PEDIDO (CORREGIDA)
// ======================================================

/**
 * Crea un nuevo pedido (domicilio o para llevar)
 * @param {Object} orderData - Datos del pedido
 * @returns {Promise<Object>} Pedido creado y encolado
 */
const createOrder = async (orderData) => {
  const startTime = Date.now();
  
  try {
    logger.info('📦 [createOrder] Iniciando creación de pedido');
    logger.info('📦 [createOrder] Datos recibidos:', JSON.stringify(orderData, null, 2));
    
    // Validar sede
    const branch = await Branch.findById(orderData.branch_id);
    if (!branch) {
      throw new Error('Sede no encontrada');
    }
    
    logger.info('✅ [createOrder] Sede encontrada:', branch.id, branch.name);
    
    // Validar productos y precios
    const validatedItems = await validateProducts(orderData.items);
    logger.info('✅ [createOrder] Productos validados:', validatedItems.length);
    
    // Calcular totales
    const subtotal = calculateSubtotal(validatedItems);
    const deliveryCost = orderData.order_type === Order.ORDER_TYPES.DELIVERY 
      ? await calculateDeliveryCost(branch, orderData.delivery_address)
      : 0;
    const discount = orderData.discount || 0;
    const total = subtotal + deliveryCost - discount;
    
    logger.info('💰 [createOrder] Totales - Subtotal:', subtotal, 'Delivery:', deliveryCost, 'Total:', total);
    
    // ==================================================
    // 🔧 CORRECCIÓN CRÍTICA: Convertir items a JSONB
    // ==================================================
    // PostgreSQL espera el campo 'items' como JSONB.
    // Convertimos el array de objetos a un string JSON.
    const itemsForDatabase = JSON.stringify(validatedItems);
    
    // Obtener tenant_id de la sede
    const tenantId = branch.tenant_id;
    
    // Construir pedido para la base de datos
    const orderPayload = {
      tenant_id: tenantId,
      branch_id: orderData.branch_id,
      table_id: null,
      order_type: orderData.order_type || Order.ORDER_TYPES.DELIVERY,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      customer_email: orderData.customer_email,
      delivery_address: orderData.delivery_address,
      delivery_latitude: orderData.delivery_latitude,
      delivery_longitude: orderData.delivery_longitude,
      items: itemsForDatabase,  // 🔧 String JSON, no objeto
      subtotal,
      delivery_cost: deliveryCost,
      discount,
      total,
      payment_method: orderData.payment_method || Order.PAYMENT_METHODS.CASH,
      notes: orderData.notes,
    };
    
    logger.info('📝 [createOrder] Payload preparado, items serializados');
    
    // Crear pedido en base de datos
    const order = await Order.create(orderPayload);
    
    logger.info('✅ [createOrder] Pedido creado en BD:', order.id, order.order_number);
    
    // Encolar para procesamiento asíncrono (usar objeto, no string)
    await rabbitmq.publishOrder({
      order_id: order.id,
      order_number: order.order_number,
      items: validatedItems,  // Para la cola usar el objeto
      branch_id: orderData.branch_id,
      branch_name: branch.name,
      customer_name: orderData.customer_name,
      delivery_address: orderData.delivery_address,
      notes: orderData.notes,
      payment_method: orderData.payment_method,
      total,
    });
    
    const duration = Date.now() - startTime;
    logger.info(`✅ Order ${order.order_number} created and queued in ${duration}ms`);
    
    return {
      success: true,
      data: {
        order_id: order.id,
        order_number: order.order_number,
        total: order.total,
        message: 'Pedido recibido. El restaurante te confirmará pronto.',
      }
    };
  } catch (error) {
    logger.error('❌ Error creating order:', error.message);
    logger.error('❌ Stack:', error.stack);
    throw error;
  }
};

// ======================================================
// PEDIDO DESDE MESA (CORREGIDO)
// ======================================================

/**
 * Crea un pedido desde una mesa (servicio en local)
 * @param {string} tableId - ID de la mesa
 * @param {Object} orderData - Datos del pedido
 * @returns {Promise<Object>} Pedido creado
 */
const createTableOrder = async (tableId, orderData) => {
  try {
    // Verificar mesa
    const table = await Table.findById(tableId);
    if (!table) {
      throw new Error('Mesa no encontrada');
    }
    
    if (table.status === Table.TABLE_STATUS.OCCUPIED && table.current_order_id) {
      // Si ya hay un pedido activo, agregar items
      return addItemsToExistingOrder(table.current_order_id, orderData.items);
    }
    
    // Validar productos
    const validatedItems = await validateProducts(orderData.items);
    const subtotal = calculateSubtotal(validatedItems);
    
    // Serializar items para la BD
    const itemsForDatabase = JSON.stringify(validatedItems);
    
    // Crear pedido de mesa
    const orderPayload = {
      tenant_id: orderData.tenant_id,
      branch_id: table.branch_id,
      table_id: tableId,
      order_type: Order.ORDER_TYPES.TABLE,
      customer_name: orderData.customer_name || 'Cliente en mesa',
      customer_phone: orderData.customer_phone || table.branch_phone,
      items: itemsForDatabase,  // 🔧 String JSON
      subtotal,
      delivery_cost: 0,
      discount: 0,
      total: subtotal,
      payment_method: Order.PAYMENT_METHODS.CASH,
      notes: orderData.notes,
    };
    
    const order = await Order.create(orderPayload);
    
    // Actualizar estado de la mesa a ocupada
    await Table.changeStatus(tableId, Table.TABLE_STATUS.OCCUPIED, order.id);
    
    // Encolar para notificación a cocina
    await rabbitmq.publishTableUpdate({
      table_id: tableId,
      order_id: order.id,
      items: validatedItems,
    });
    
    logger.info(`✅ Table order created for table ${table.table_number}: ${order.order_number}`);
    
    return {
      success: true,
      data: {
        order_id: order.id,
        order_number: order.order_number,
        total: order.total,
      }
    };
  } catch (error) {
    logger.error('Error creating table order:', error.message);
    throw error;
  }
};

// ======================================================
// PROCESAMIENTO DE COLA (WORKER)
// ======================================================

/**
 * Procesa un pedido desde la cola (enviar WhatsApp, notificar)
 * @param {Object} orderData - Datos del pedido
 * @returns {Promise<void>}
 */
const processOrderFromQueue = async (orderData) => {
  try {
    const { order_id, order_number, branch_id, customer_name, items, total } = orderData;
    
    // Obtener información de la sede
    const branch = await Branch.findById(branch_id);
    if (!branch) {
      logger.error(`Branch not found for order ${order_id}`);
      return;
    }
    
    // Generar mensaje de WhatsApp
    const whatsappMessage = whatsappService.generateOrderMessage({
      order_number,
      customer_name,
      branch_name: branch.name,
      items,
      total,
      delivery_address: orderData.delivery_address,
      notes: orderData.notes,
      payment_method: orderData.payment_method,
    });
    
    // Enviar a WhatsApp (usando enlace o API)
    const whatsappNumber = branch.whatsapp_number || branch.tenant_whatsapp;
    await whatsappService.sendWhatsAppMessage(whatsappNumber, whatsappMessage);
    
    // Actualizar estado del pedido a confirmed
    await Order.updateStatus(order_id, Order.ORDER_STATUS.CONFIRMED);
    
    logger.info(`✅ Order ${order_number} processed and sent to WhatsApp`);
  } catch (error) {
    logger.error('Error processing order from queue:', error.message);
    throw error;
  }
};

// ======================================================
// FUNCIONES DE VALIDACIÓN Y CÁLCULO
// ======================================================

/**
 * Valida productos y precios
 * @param {Array} items - Items del pedido
 * @returns {Promise<Array>} Items validados con precios actuales
 */
const validateProducts = async (items) => {
  const validatedItems = [];
  
  for (const item of items) {
    const product = await Product.findById(item.product_id);
    
    if (!product) {
      throw new Error(`Producto no encontrado: ${item.product_id}`);
    }
    
    if (!product.is_available) {
      throw new Error(`Producto no disponible: ${product.name}`);
    }
    
    // Calcular precio con modificadores
    let modifiersTotal = 0;
    const validatedModifiers = [];
    
    if (item.modifiers && item.modifiers.length > 0) {
      for (const modifier of item.modifiers) {
        const foundModifier = product.modifiers.find(m => m.name === modifier.name);
        if (foundModifier) {
          validatedModifiers.push({
            name: foundModifier.name,
            price: foundModifier.price,
          });
          modifiersTotal += foundModifier.price;
        }
      }
    }
    
    validatedItems.push({
      product_id: product.id,
      name: product.name,
      quantity: item.quantity,
      price: parseFloat(product.price),
      modifiers: validatedModifiers,
      modifiers_total: modifiersTotal,
      subtotal: (parseFloat(product.price) + modifiersTotal) * item.quantity,
    });
  }
  
  return validatedItems;
};

/**
 * Calcula el subtotal de los items
 * @param {Array} items - Items validados
 * @returns {number} Subtotal
 */
const calculateSubtotal = (items) => {
  return items.reduce((sum, item) => sum + item.subtotal, 0);
};

/**
 * Calcula costo de envío basado en distancia (simplificado)
 * @param {Object} branch - Sede
 * @param {string} address - Dirección de entrega
 * @returns {Promise<number>} Costo de envío
 */
const calculateDeliveryCost = async (branch, address) => {
  // Por ahora, costo fijo o basado en configuración
  const deliverySettings = branch.delivery_settings || {};
  return deliverySettings.cost || 3000;
};

// ======================================================
// GESTIÓN DE PEDIDOS EXISTENTES
// ======================================================

/**
 * Agrega items a un pedido existente (para mesas)
 * @param {string} orderId - ID del pedido
 * @param {Array} newItems - Nuevos items
 * @returns {Promise<Object>} Pedido actualizado
 */
const addItemsToExistingOrder = async (orderId, newItems) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Pedido no encontrado');
  }
  
  const validatedNewItems = await validateProducts(newItems);
  
  // Parsear items existentes (vienen como string JSON de la BD)
  const existingItems = typeof order.items === 'string' 
    ? JSON.parse(order.items) 
    : order.items;
    
  const allItems = [...existingItems, ...validatedNewItems];
  
  // Recalcular totales
  const subtotal = calculateSubtotal(allItems);
  const total = subtotal + (order.delivery_cost || 0) - (order.discount || 0);
  
  // Serializar para la BD
  const itemsForDatabase = JSON.stringify(allItems);
  
  // Actualizar pedido
  const updatedOrder = await Order.update(orderId, {
    items: itemsForDatabase,
    subtotal,
    total,
  });
  
  // Notificar a cocina
  await rabbitmq.publishTableUpdate({
    table_id: order.table_id,
    order_id: orderId,
    items: validatedNewItems,
    is_addition: true,
  });
  
  return updatedOrder;
};

/**
 * Cierra un pedido de mesa (finalizar cuenta)
 * @param {string} orderId - ID del pedido
 * @returns {Promise<Object>} Pedido cerrado
 */
const closeTableOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Pedido no encontrado');
  }
  
  // Actualizar estado del pedido
  const updatedOrder = await Order.updateStatus(orderId, Order.ORDER_STATUS.DELIVERED);
  
  // Liberar mesa
  if (order.table_id) {
    await Table.changeStatus(order.table_id, Table.TABLE_STATUS.CLEANING);
  }
  
  logger.info(`✅ Table order ${order.order_number} closed`);
  
  return updatedOrder;
};

// ======================================================
// CONSULTAS Y ESTADÍSTICAS
// ======================================================

/**
 * Obtiene pedidos activos de una mesa
 * @param {string} tableId - ID de la mesa
 * @returns {Promise<Array>} Pedidos activos
 */
const getActiveOrdersByTable = async (tableId) => {
  const orders = await Order.findByTable(tableId, { onlyActive: true });
  return orders;
};

/**
 * Obtiene historial de pedidos de un cliente
 * @param {string} phone - Teléfono del cliente
 * @param {string} tenantId - ID del restaurante
 * @returns {Promise<Array>} Historial de pedidos
 */
const getCustomerOrderHistory = async (phone, tenantId) => {
  const orders = await Order.findByCustomer(phone, tenantId);
  return orders;
};

/**
 * Obtiene estadísticas diarias de una sede
 * @param {string} branchId - ID de la sede
 * @returns {Promise<Object>} Estadísticas
 */
const getDailyStats = async (branchId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const stats = await Order.getStats(branchId, today, tomorrow);
  const topProducts = await Order.getTopProducts(branchId, 5);
  
  return {
    ...stats,
    top_products: topProducts,
    date: today.toISOString().split('T')[0],
  };
};

// ======================================================
// INICIALIZAR WORKER (para el proceso independiente)
// ======================================================

/**
 * Inicia el worker que consume pedidos de la cola
 */
const startOrderWorker = async () => {
  logger.info('Starting order worker...');
  
  await rabbitmq.consumeOrders(async (orderData, msg) => {
    try {
      await processOrderFromQueue(orderData);
      return true;
    } catch (error) {
      logger.error('Worker failed to process order:', error.message);
      return false;
    }
  });
  
  logger.info('Order worker started successfully');
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  // Creación de pedidos
  createOrder,
  createTableOrder,
  addItemsToExistingOrder,
  closeTableOrder,
  
  // Procesamiento
  processOrderFromQueue,
  startOrderWorker,
  
  // Validación y cálculo
  validateProducts,
  calculateSubtotal,
  calculateDeliveryCost,
  
  // Consultas
  getActiveOrdersByTable,
  getCustomerOrderHistory,
  getDailyStats,
};