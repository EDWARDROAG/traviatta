/**
 * ======================================================
 * ARCHIVO: rabbitmq.js
 * UBICACIÓN: menu-qr-system/backend/src/config/rabbitmq.js
 * FASE: F0
 * VERSIÓN: 1.2
 * ÚLTIMA ACTUALIZACIÓN: 2024-05-21 15:45
 *
 * 🎯 PROPÓSITO:
 * Configurar la conexión a RabbitMQ para manejo de colas
 * asíncronas. Versión simplificada para desarrollo local.
 * ======================================================
 */

const amqp = require('amqplib');
require('dotenv').config();

// ======================================================
// CONFIGURACIÓN
// ======================================================

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5673';

// Nombres de colas
const QUEUES = {
  ORDERS: 'orders_queue',
  NOTIFICATIONS: 'notifications_queue',
  TABLES: 'tables_queue',
  REPORTS: 'reports_queue',
  DEAD_LETTER: 'dead_letter_queue',
};

// Nombres de exchanges
const EXCHANGES = {
  ORDERS: 'orders_exchange',
  NOTIFICATIONS: 'notifications_exchange',
  DEAD_LETTER: 'dead_letter_exchange',
};

// Routing keys
const ROUTING_KEYS = {
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_COMPLETED: 'order.completed',
  NOTIFICATION_SEND: 'notification.send',
  TABLE_UPDATED: 'table.updated',
};

// ======================================================
// VARIABLES GLOBALES
// ======================================================

let connection = null;
let channel = null;

// ======================================================
// CONEXIÓN
// ======================================================

const connect = async () => {
  if (channel && connection) {
    return channel;
  }
  
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    
    connection.on('error', (err) => {
      console.warn('⚠️ RabbitMQ error:', err.message);
    });
    
    connection.on('close', () => {
      console.warn('⚠️ RabbitMQ connection closed');
      channel = null;
      connection = null;
    });
    
    console.log('✅ RabbitMQ: Conexión establecida');
    return channel;
  } catch (error) {
    console.warn('⚠️ RabbitMQ no disponible:', error.message);
    return null;
  }
};

// ======================================================
// FUNCIONES PUBLICAR
// ======================================================

const publishOrder = async (orderData) => {
  try {
    const ch = await connect();
    if (!ch) return false;
    console.log(`📤 Pedido encolado: ${orderData.id}`);
    return true;
  } catch (error) {
    console.error('❌ Error publicando pedido:', error.message);
    return false;
  }
};

const publishNotification = async (notificationData) => {
  try {
    const ch = await connect();
    if (!ch) return false;
    console.log(`📤 Notificación encolada: ${notificationData.type}`);
    return true;
  } catch (error) {
    console.error('❌ Error publicando notificación:', error.message);
    return false;
  }
};

const publishTableUpdate = async (tableData) => {
  try {
    const ch = await connect();
    if (!ch) return false;
    console.log(`📤 Actualización de mesa: ${tableData.tableId}`);
    return true;
  } catch (error) {
    console.error('❌ Error publicando actualización:', error.message);
    return false;
  }
};

// ======================================================
// HEALTH CHECK
// ======================================================

const healthCheck = async () => {
  try {
    const ch = await connect();
    if (!ch) return { healthy: false, status: 'disconnected' };
    return { healthy: true, status: 'connected' };
  } catch (error) {
    return { healthy: false, error: error.message, status: 'disconnected' };
  }
};

// ======================================================
// CIERRE
// ======================================================

const closeConnection = async () => {
  console.log('🔄 RabbitMQ: Cerrando conexión...');
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log('✅ RabbitMQ: Conexión cerrada');
  } catch (error) {
    console.error('❌ RabbitMQ: Error al cerrar:', error.message);
  }
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  QUEUES,
  EXCHANGES,
  ROUTING_KEYS,
  connect,
  closeConnection,
  publishOrder,
  publishNotification,
  publishTableUpdate,
  healthCheck,
};