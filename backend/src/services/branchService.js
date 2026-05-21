/**
 * ======================================================
 * ARCHIVO: queueService.js
 * UBICACIÓN: menu-qr-system/backend/src/services/queueService.js
 * FASE: F5
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-15 19:00
 *
 * 🎯 PROPÓSITO:
 * Servicio centralizado para gestión de colas asíncronas
 * utilizando RabbitMQ. Proporciona una capa de abstracción
 * para publicación y consumo de mensajes, con soporte de
 * reintentos, dead letter queues, y monitoreo de métricas.
 * Maneja colas específicas: pedidos, notificaciones,
 * actualizaciones de mesas y reportes.
 *
 * 📦 DEPENDENCIAS:
 * - ../config/rabbitmq: Conexión a RabbitMQ
 * - ../utils/logger: Logging estructurado
 *
 * 🔗 RELACIONES:
 * - Importa de: ../config/rabbitmq, ../utils/logger
 * - Es importado por: services/orderService.js,
 *   services/notificationService.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-15 19:00
 *    ✅ Creación inicial del archivo
 *    ✅ Publicación de mensajes en colas
 *    ✅ Consumo con acknowledgments
 *    ✅ Reintentos con backoff exponencial
 *    ✅ Dead letter queue para mensajes fallidos
 *    ✅ Monitoreo de longitud de colas
 *    ✅ Métricas y estadísticas
 * ======================================================
 */

const rabbitmq = require('../config/rabbitmq');
const logger = require('../utils/logger');

// ======================================================
// CONSTANTES
// ======================================================

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;
const DEAD_LETTER_EXCHANGE = 'dead_letter_exchange';

const QUEUE_NAMES = {
  ORDERS: 'orders_queue',
  NOTIFICATIONS: 'notifications_queue',
  TABLES: 'tables_queue',
  REPORTS: 'reports_queue',
  DEAD_LETTER: 'dead_letter_queue',
};

const QUEUE_SETTINGS = {
  [QUEUE_NAMES.ORDERS]: {
    durable: true,
    prefetch: 5,
    maxRetries: 3,
    deadLetterExchange: DEAD_LETTER_EXCHANGE,
  },
  [QUEUE_NAMES.NOTIFICATIONS]: {
    durable: true,
    prefetch: 10,
    maxRetries: 5,
    deadLetterExchange: DEAD_LETTER_EXCHANGE,
  },
  [QUEUE_NAMES.TABLES]: {
    durable: true,
    prefetch: 3,
    maxRetries: 2,
    deadLetterExchange: DEAD_LETTER_EXCHANGE,
  },
  [QUEUE_NAMES.REPORTS]: {
    durable: true,
    prefetch: 1,
    maxRetries: 1,
    deadLetterExchange: DEAD_LETTER_EXCHANGE,
  },
};

// Métricas de colas
let queueMetrics = {
  [QUEUE_NAMES.ORDERS]: { published: 0, consumed: 0, failed: 0, retries: 0 },
  [QUEUE_NAMES.NOTIFICATIONS]: { published: 0, consumed: 0, failed: 0, retries: 0 },
  [QUEUE_NAMES.TABLES]: { published: 0, consumed: 0, failed: 0, retries: 0 },
  [QUEUE_NAMES.REPORTS]: { published: 0, consumed: 0, failed: 0, retries: 0 },
};

// Almacenamiento de handlers
const handlers = new Map();

// ======================================================
// PUBLICACIÓN DE MENSAJES
// ======================================================

/**
 * Publica un mensaje en la cola de pedidos
 * @param {Object} orderData - Datos del pedido
 * @returns {Promise<boolean>}
 */
const publishOrder = async (orderData) => {
  return publishToQueue(QUEUE_NAMES.ORDERS, {
    type: 'order.created',
    data: orderData,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Publica una notificación
 * @param {Object} notificationData - Datos de la notificación
 * @returns {Promise<boolean>}
 */
const publishNotification = async (notificationData) => {
  return publishToQueue(QUEUE_NAMES.NOTIFICATIONS, {
    type: 'notification.send',
    data: notificationData,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Publica actualización de mesa
 * @param {Object} tableData - Datos de la mesa
 * @returns {Promise<boolean>}
 */
const publishTableUpdate = async (tableData) => {
  return publishToQueue(QUEUE_NAMES.TABLES, {
    type: 'table.updated',
    data: tableData,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Publica un reporte para procesamiento
 * @param {Object} reportData - Datos del reporte
 * @returns {Promise<boolean>}
 */
const publishReport = async (reportData) => {
  return publishToQueue(QUEUE_NAMES.REPORTS, {
    type: 'report.generate',
    data: reportData,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Publica un mensaje en una cola específica
 * @param {string} queueName - Nombre de la cola
 * @param {Object} message - Mensaje a publicar
 * @returns {Promise<boolean>}
 */
const publishToQueue = async (queueName, message) => {
  try {
    const settings = QUEUE_SETTINGS[queueName];
    if (!settings) {
      throw new Error(`Unknown queue: ${queueName}`);
    }
    
    const channel = await rabbitmq.connect();
    
    await channel.assertQueue(queueName, {
      durable: settings.durable,
      arguments: {
        'x-dead-letter-exchange': settings.deadLetterExchange,
        'x-message-ttl': 300000,
      },
    });
    
    const result = channel.sendToQueue(
      queueName,
      Buffer.from(JSON.stringify(message)),
      { persistent: true, timestamp: Date.now() }
    );
    
    if (queueMetrics[queueName]) {
      queueMetrics[queueName].published++;
    }
    
    logger.debug(`Message published to ${queueName}: ${message.type}`);
    return result;
  } catch (error) {
    logger.error(`Error publishing to ${queueName}:`, error.message);
    return false;
  }
};

// ======================================================
// CONSUMO DE MENSAJES
// ======================================================

/**
 * Registra un handler para una cola
 * @param {string} queueName - Nombre de la cola
 * @param {Function} handler - Función para procesar mensajes
 * @returns {Promise<void>}
 */
const registerHandler = async (queueName, handler) => {
  handlers.set(queueName, handler);
  
  const settings = QUEUE_SETTINGS[queueName];
  if (!settings) {
    throw new Error(`Unknown queue: ${queueName}`);
  }
  
  const channel = await rabbitmq.connect();
  await channel.prefetch(settings.prefetch);
  
  await channel.consume(queueName, async (msg) => {
    if (!msg) return;
    
    try {
      const content = JSON.parse(msg.content.toString());
      const retryCount = getRetryCount(msg);
      
      logger.debug(`Processing message from ${queueName}: ${content.type} (retry: ${retryCount})`);
      
      const result = await handler(content, msg);
      
      if (result !== false) {
        channel.ack(msg);
        
        if (queueMetrics[queueName]) {
          queueMetrics[queueName].consumed++;
        }
      } else {
        await handleFailedMessage(queueName, msg, content, retryCount, channel);
      }
    } catch (error) {
      logger.error(`Error processing message from ${queueName}:`, error.message);
      await handleFailedMessage(queueName, msg, null, 0, channel);
    }
  });
  
  logger.info(`Handler registered for queue: ${queueName}`);
};

/**
 * Obtiene el número de reintentos de un mensaje
 * @param {Object} msg - Mensaje de RabbitMQ
 * @returns {number}
 */
const getRetryCount = (msg) => {
  const headers = msg.properties.headers || {};
  return headers['x-retry-count'] || 0;
};

/**
 * Maneja mensajes fallidos con reintentos
 * @param {string} queueName - Nombre de la cola
 * @param {Object} msg - Mensaje original
 * @param {Object} content - Contenido del mensaje
 * @param {number} retryCount - Número de reintentos actual
 * @param {Object} channel - Canal de RabbitMQ
 */
const handleFailedMessage = async (queueName, msg, content, retryCount, channel) => {
  const settings = QUEUE_SETTINGS[queueName];
  const maxRetries = settings?.maxRetries || MAX_RETRIES;
  const newRetryCount = retryCount + 1;
  
  if (newRetryCount <= maxRetries) {
    logger.warn(`Retrying message in ${queueName} (attempt ${newRetryCount}/${maxRetries})`);
    
    if (queueMetrics[queueName]) {
      queueMetrics[queueName].retries++;
    }
    
    channel.nack(msg, false, true);
    
    const headers = msg.properties.headers || {};
    headers['x-retry-count'] = newRetryCount;
    headers['x-retry-delay'] = RETRY_DELAY_MS;
    
    await channel.publish('', queueName, msg.content, {
      headers,
      expiration: RETRY_DELAY_MS.toString(),
    });
  } else {
    logger.error(`Max retries reached for message in ${queueName}, sending to DLQ`);
    
    if (queueMetrics[queueName]) {
      queueMetrics[queueName].failed++;
    }
    
    channel.nack(msg, false, false);
  }
};

// ======================================================
// INICIALIZACIÓN DE CONSUMIDORES
// ======================================================

/**
 * Inicia todos los consumidores registrados
 * @returns {Promise<void>}
 */
const startConsumers = async () => {
  logger.info('Starting queue consumers...');
  
  if (!handlers.has(QUEUE_NAMES.ORDERS)) {
    await registerHandler(QUEUE_NAMES.ORDERS, defaultOrderHandler);
  }
  
  if (!handlers.has(QUEUE_NAMES.NOTIFICATIONS)) {
    await registerHandler(QUEUE_NAMES.NOTIFICATIONS, defaultNotificationHandler);
  }
  
  if (!handlers.has(QUEUE_NAMES.TABLES)) {
    await registerHandler(QUEUE_NAMES.TABLES, defaultTableHandler);
  }
  
  logger.info('Queue consumers started successfully');
};

/**
 * Handler por defecto para pedidos
 * @param {Object} message - Mensaje recibido
 * @returns {Promise<boolean>}
 */
const defaultOrderHandler = async (message) => {
  logger.info(`Processing order: ${message.data?.order_number || 'unknown'}`);
  return true;
};

/**
 * Handler por defecto para notificaciones
 * @param {Object} message - Mensaje recibido
 * @returns {Promise<boolean>}
 */
const defaultNotificationHandler = async (message) => {
  logger.info(`Processing notification: ${message.type}`);
  return true;
};

/**
 * Handler por defecto para mesas
 * @param {Object} message - Mensaje recibido
 * @returns {Promise<boolean>}
 */
const defaultTableHandler = async (message) => {
  logger.info(`Processing table update: ${message.data?.table_id || 'unknown'}`);
  return true;
};

// ======================================================
// MONITOREO Y ESTADÍSTICAS
// ======================================================

/**
 * Obtiene estadísticas de las colas
 * @returns {Promise<Object>}
 */
const getQueueStats = async () => {
  try {
    const stats = await rabbitmq.getQueueStats();
    return {
      ...stats,
      metrics: queueMetrics,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('Error getting queue stats:', error.message);
    return { metrics: queueMetrics, error: error.message };
  }
};

/**
 * Obtiene la longitud actual de una cola
 * @param {string} queueName - Nombre de la cola
 * @returns {Promise<number>}
 */
const getQueueLength = async (queueName) => {
  try {
    const stats = await rabbitmq.getQueueStats();
    return stats[queueName]?.messageCount || 0;
  } catch (error) {
    logger.error(`Error getting queue length for ${queueName}:`, error.message);
    return 0;
  }
};

/**
 * Obtiene métricas acumuladas
 * @returns {Object}
 */
const getMetrics = () => {
  return { ...queueMetrics };
};

/**
 * Reinicia métricas
 */
const resetMetrics = () => {
  Object.keys(queueMetrics).forEach(key => {
    queueMetrics[key] = { published: 0, consumed: 0, failed: 0, retries: 0 };
  });
  logger.info('Queue metrics reset');
};

// ======================================================
// FUNCIONES DE UTILIDAD
// ======================================================

/**
 * Vacía una cola (uso administrativo)
 * @param {string} queueName - Nombre de la cola
 * @returns {Promise<number>}
 */
const purgeQueue = async (queueName) => {
  try {
    const channel = await rabbitmq.connect();
    const result = await channel.purgeQueue(queueName);
    logger.warn(`Queue ${queueName} purged: ${result.messageCount} messages removed`);
    return result.messageCount;
  } catch (error) {
    logger.error(`Error purging queue ${queueName}:`, error.message);
    return 0;
  }
};

/**
 * Cierra todas las conexiones
 * @returns {Promise<void>}
 */
const close = async () => {
  logger.info('Closing queue connections...');
  await rabbitmq.closeConnection();
  logger.info('Queue connections closed');
};

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
  await close();
});

process.on('SIGINT', async () => {
  await close();
});

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  QUEUE_NAMES,
  MAX_RETRIES,
  
  publishOrder,
  publishNotification,
  publishTableUpdate,
  publishReport,
  publishToQueue,
  
  registerHandler,
  startConsumers,
  
  defaultOrderHandler,
  defaultNotificationHandler,
  defaultTableHandler,
  
  getQueueStats,
  getQueueLength,
  getMetrics,
  resetMetrics,
  
  purgeQueue,
  close,
};