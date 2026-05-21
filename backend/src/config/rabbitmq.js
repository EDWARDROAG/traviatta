/**
 * ======================================================
 * ARCHIVO: rabbitmq.js
 * UBICACIÓN: menu-qr-system/backend/src/config/rabbitmq.js
 * FASE: F0
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-15 12:00
 *
 * 🎯 PROPÓSITO:
 * Configurar la conexión a RabbitMQ para manejo de colas
 * asíncronas. Permite encolar pedidos, notificaciones
 * y eventos del sistema para procesamiento en segundo
 * plano, mejorando la capacidad de respuesta de la API.
 *
 * 📦 DEPENDENCIAS:
 * - amqplib: Cliente RabbitMQ oficial
 * - dotenv: Variables de entorno
 *
 * 🔗 RELACIONES:
 * - Importa de: dotenv
 * - Es importado por: services/queueService.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-15 12:00
 *    ✅ Creación inicial del archivo
 *    ✅ Configuración de conexión con reintentos
 *    ✅ Definición de colas y exchanges
 *    ✅ Funciones publish/consume con acknowledgment
 *    ✅ Health check y monitoreo de colas
 *    ✅ Cierre graceful de conexiones
 * ======================================================
 */

const amqp = require('amqplib');
require('dotenv').config();

// ======================================================
// CONFIGURACIÓN
// ======================================================

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5673';
const RABBITMQ_USER = process.env.RABBITMQ_USER || 'guest';
const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD || 'guest';

// Nombres de colas
const QUEUES = {
  ORDERS: 'orders_queue',           // Pedidos para procesar
  NOTIFICATIONS: 'notifications_queue', // Notificaciones WhatsApp
  TABLES: 'tables_queue',           // Actualizaciones de mesas
  REPORTS: 'reports_queue',         // Reportes (largo plazo)
  DEAD_LETTER: 'dead_letter_queue', // Mensajes fallidos
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
let isConnecting = false;
let reconnectTimer = null;

// ======================================================
// CONEXIÓN CON REINTENTOS
// ======================================================

/**
 * Establece conexión con RabbitMQ
 * @returns {Promise<Object>} Canal de comunicación
 */
const connect = async () => {
  if (channel && connection) {
    return channel;
  }
  
  if (isConnecting) {
    // Esperar a que termine la conexión actual
    await new Promise(resolve => setTimeout(resolve, 1000));
    return connect();
  }
  
  isConnecting = true;
  
  try {
    const url = new URL(RABBITMQ_URL);
    url.username = RABBITMQ_USER;
    url.password = RABBITMQ_PASSWORD;
    
    connection = await amqp.connect(url.toString());
    channel = await connection.createChannel();
    
    // Configurar eventos de conexión
    connection.on('error', (err) => {
      console.error('❌ RabbitMQ connection error:', err.message);
      handleDisconnect();
    });
    
    connection.on('close', () => {
      console.warn('⚠️ RabbitMQ connection closed');
      handleDisconnect();
    });
    
    // Configurar canales y colas
    await setupQueuesAndExchanges();
    
    console.log('✅ RabbitMQ: Conexión establecida correctamente');
    isConnecting = false;
    
    return channel;
  } catch (error) {
    console.error('❌ RabbitMQ connection failed:', error.message);
    isConnecting = false;
    handleDisconnect();
    throw error;
  }
};

/**
 * Maneja la desconexión y programa reconexión
 */
const handleDisconnect = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
  }
  
  reconnectTimer = setTimeout(async () => {
    console.log('🔄 RabbitMQ: Intentando reconectar...');
    try {
      await connect();
    } catch (error) {
      console.error('❌ RabbitMQ: Reconexión fallida');
    }
  }, 5000);
};

/**
 * Configura colas y exchanges
 */
const setupQueuesAndExchanges = async () => {
  if (!channel) return;
  
  // ==================================================
  // EXCHANGES
  // ==================================================
  
  // Exchange de pedidos (direct)
  await channel.assertExchange(EXCHANGES.ORDERS, 'direct', {
    durable: true,
  });
  
  // Exchange de notificaciones (direct)
  await channel.assertExchange(EXCHANGES.NOTIFICATIONS, 'direct', {
    durable: true,
  });
  
  // Exchange de dead letters (fanout)
  await channel.assertExchange(EXCHANGES.DEAD_LETTER, 'fanout', {
    durable: true,
  });
  
  // ==================================================
  // COLAS
  // ==================================================
  
  // Cola de pedidos con dead letter
  await channel.assertQueue(QUEUES.ORDERS, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': EXCHANGES.DEAD_LETTER,
      'x-max-retries': 3,
      'x-message-ttl': 300000, // 5 minutos
    },
  });
  
  // Cola de notificaciones
  await channel.assertQueue(QUEUES.NOTIFICATIONS, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': EXCHANGES.DEAD_LETTER,
      'x-max-retries': 5,
    },
  });
  
  // Cola de mesas
  await channel.assertQueue(QUEUES.TABLES, {
    durable: true,
  });
  
  // Cola de reportes (largo plazo)
  await channel.assertQueue(QUEUES.REPORTS, {
    durable: true,
    arguments: {
      'x-message-ttl': 86400000, // 24 horas
    },
  });
  
  // Dead letter queue
  await channel.assertQueue(QUEUES.DEAD_LETTER, {
    durable: true,
  });
  
  // ==================================================
  // BINDINGS
  // ==================================================
  
  // Bind cola de pedidos al exchange
  await channel.bindQueue(QUEUES.ORDERS, EXCHANGES.ORDERS, ROUTING_KEYS.ORDER_CREATED);
  await channel.bindQueue(QUEUES.ORDERS, EXCHANGES.ORDERS, ROUTING_KEYS.ORDER_UPDATED);
  
  // Bind cola de notificaciones
  await channel.bindQueue(QUEUES.NOTIFICATIONS, EXCHANGES.NOTIFICATIONS, ROUTING_KEYS.NOTIFICATION_SEND);
  
  // Bind dead letter queue
  await channel.bindQueue(QUEUES.DEAD_LETTER, EXCHANGES.DEAD_LETTER, '');
  
  console.log('✅ RabbitMQ: Queues y exchanges configurados');
};

// ======================================================
// FUNCIONES PUBLICAR (PRODUCTOR)
// ======================================================

/**
 * Publica un mensaje en la cola de pedidos
 * @param {Object} orderData - Datos del pedido
 * @returns {Promise<boolean>}
 */
const publishOrder = async (orderData) => {
  try {
    const ch = await connect();
    const message = Buffer.from(JSON.stringify(orderData));
    
    const result = ch.publish(EXCHANGES.ORDERS, ROUTING_KEYS.ORDER_CREATED, message, {
      persistent: true,
      timestamp: Date.now(),
      contentType: 'application/json',
    });
    
    console.log(`📤 Pedido publicado: ${orderData.id}`);
    return result;
  } catch (error) {
    console.error('❌ Error publicando pedido:', error.message);
    return false;
  }
};

/**
 * Publica una notificación
 * @param {Object} notificationData - Datos de la notificación
 * @returns {Promise<boolean>}
 */
const publishNotification = async (notificationData) => {
  try {
    const ch = await connect();
    const message = Buffer.from(JSON.stringify(notificationData));
    
    const result = ch.publish(EXCHANGES.NOTIFICATIONS, ROUTING_KEYS.NOTIFICATION_SEND, message, {
      persistent: true,
      timestamp: Date.now(),
    });
    
    console.log(`📤 Notificación publicada: ${notificationData.type}`);
    return result;
  } catch (error) {
    console.error('❌ Error publicando notificación:', error.message);
    return false;
  }
};

/**
 * Publica actualización de mesa
 * @param {Object} tableData - Datos de la mesa
 * @returns {Promise<boolean>}
 */
const publishTableUpdate = async (tableData) => {
  try {
    const ch = await connect();
    const message = Buffer.from(JSON.stringify(tableData));
    
    const result = ch.assertQueue(QUEUES.TABLES);
    ch.sendToQueue(QUEUES.TABLES, message, {
      persistent: true,
    });
    
    console.log(`📤 Mesa actualizada: ${tableData.tableId}`);
    return result;
  } catch (error) {
    console.error('❌ Error publicando actualización de mesa:', error.message);
    return false;
  }
};

// ======================================================
// FUNCIONES CONSUMIR (CONSUMIDOR)
// ======================================================

/**
 * Consume mensajes de una cola
 * @param {string} queue - Nombre de la cola
 * @param {Function} handler - Función que procesa el mensaje
 * @param {Object} options - Opciones adicionales
 */
const consume = async (queue, handler, options = { prefetch: 1 }) => {
  try {
    const ch = await connect();
    
    // Configurar prefetch (cuántos mensajes procesar en paralelo)
    await ch.prefetch(options.prefetch || 1);
    
    // Consumir mensajes
    await ch.consume(queue, async (msg) => {
      if (!msg) return;
      
      try {
        const content = JSON.parse(msg.content.toString());
        const result = await handler(content, msg);
        
        if (result !== false) {
          // Confirmar procesamiento exitoso
          ch.ack(msg);
        } else {
          // Rechazar y reencolar
          ch.nack(msg, false, true);
        }
      } catch (error) {
        console.error(`❌ Error procesando mensaje de ${queue}:`, error.message);
        // Rechazar sin reencolar (va a dead letter)
        ch.nack(msg, false, false);
      }
    });
    
    console.log(`✅ RabbitMQ: Consumiendo cola "${queue}"`);
  } catch (error) {
    console.error(`❌ Error configurando consumidor para ${queue}:`, error.message);
  }
};

/**
 * Consume pedidos de la cola de órdenes
 * @param {Function} handler - Función que procesa el pedido
 */
const consumeOrders = (handler) => {
  return consume(QUEUES.ORDERS, handler, { prefetch: 5 });
};

/**
 * Consume notificaciones de la cola de notificaciones
 * @param {Function} handler - Función que procesa la notificación
 */
const consumeNotifications = (handler) => {
  return consume(QUEUES.NOTIFICATIONS, handler, { prefetch: 10 });
};

/**
 * Consume actualizaciones de mesas
 * @param {Function} handler - Función que procesa la actualización
 */
const consumeTableUpdates = (handler) => {
  return consume(QUEUES.TABLES, handler, { prefetch: 3 });
};

// ======================================================
// UTILIDADES
// ======================================================

/**
 * Obtiene estadísticas de las colas
 * @returns {Promise<Object>} Estadísticas
 */
const getQueueStats = async () => {
  try {
    const ch = await connect();
    const stats = {};
    
    for (const [name, queueName] of Object.entries(QUEUES)) {
      const queueInfo = await ch.assertQueue(queueName, { durable: true });
      stats[name] = {
        name: queueName,
        messageCount: queueInfo.messageCount,
        consumerCount: queueInfo.consumerCount,
      };
    }
    
    return stats;
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error.message);
    return {};
  }
};

/**
 * Health check de RabbitMQ
 * @returns {Promise<Object>}
 */
const healthCheck = async () => {
  const startTime = Date.now();
  
  try {
    const ch = await connect();
    const stats = await getQueueStats();
    const latency = Date.now() - startTime;
    
    return {
      healthy: true,
      latency: `${latency}ms`,
      queues: stats,
      status: 'connected',
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      status: 'disconnected',
    };
  }
};

/**
 * Cierra la conexión a RabbitMQ
 */
const closeConnection = async () => {
  console.log('🔄 RabbitMQ: Cerrando conexión...');
  
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
  }
  
  try {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
    console.log('✅ RabbitMQ: Conexión cerrada');
  } catch (error) {
    console.error('❌ RabbitMQ: Error al cerrar conexión:', error.message);
  }
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  // Constantes
  QUEUES,
  EXCHANGES,
  ROUTING_KEYS,
  
  // Conexión
  connect,
  closeConnection,
  
  // Publicar (productores)
  publishOrder,
  publishNotification,
  publishTableUpdate,
  
  // Consumir (consumidores)
  consumeOrders,
  consumeNotifications,
  consumeTableUpdates,
  consume,
  
  // Utilidades
  getQueueStats,
  healthCheck,
};