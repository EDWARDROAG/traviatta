/**
 * ======================================================
 * ARCHIVO: server.js
 * UBICACIÓN: menu-qr-system/backend/src/server.js
 * FASE: F0
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 08:00
 *
 * 🎯 PROPÓSITO:
 * Punto de entrada principal del servidor backend.
 * Inicializa la aplicación Express, establece conexiones
 * con bases de datos, Redis, RabbitMQ, y arranca los
 * workers de procesamiento asíncrono.
 *
 * 📦 DEPENDENCIAS:
 * - ./app: Aplicación Express configurada
 * - ./config/database: Conexión a PostgreSQL
 * - ./config/redis: Conexión a Redis
 * - ./config/rabbitmq: Conexión a RabbitMQ
 * - ./services/orderService: Worker de pedidos
 * - ./services/queueService: Colas de mensajes
 * - ./utils/logger: Logging
 *
 * 🔗 RELACIONES:
 * - Importa de: ./app, ./config/*, ./services/*
 * - Es ejecutado por: node src/server.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 08:00
 *    ✅ Creación inicial del archivo
 *    ✅ Configuración de variables de entorno
 *    ✅ Inicialización de conexiones
 *    ✅ Arranque del servidor HTTP
 *    ✅ Arranque de workers asíncronos
 *    ✅ Manejo de señales de terminación
 * ======================================================
 */

require('dotenv').config();
const app = require('./app');
const { healthCheck: dbHealthCheck } = require('./config/database');
const { healthCheck: redisHealthCheck, closeConnection: closeRedis } = require('./config/redis');
const { healthCheck: rabbitHealthCheck, closeConnection: closeRabbit } = require('./config/rabbitmq');
const { startConsumers } = require('./services/queueService');
const logger = require('./utils/logger');

// ======================================================
// CONSTANTES
// ======================================================

const PORT = process.env.PORT || 3005;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ======================================================
// FUNCIONES AUXILIARES
// ======================================================

/**
 * Verifica la salud de todas las dependencias
 * @returns {Promise<boolean>}
 */
const checkDependenciesHealth = async () => {
  try {
    const dbHealth = await dbHealthCheck();
    const redisHealth = await redisHealthCheck();
    const rabbitHealth = await rabbitHealthCheck();
    
    const allHealthy = dbHealth.healthy && redisHealth.healthy && rabbitHealth.healthy;
    
    if (!allHealthy) {
      logger.warn('Dependencies health check failed:', {
        database: dbHealth,
        redis: redisHealth,
        rabbitmq: rabbitHealth,
      });
    }
    
    return allHealthy;
  } catch (error) {
    logger.error('Error checking dependencies health:', error.message);
    return false;
  }
};

/**
 * Maneja el cierre graceful del servidor
 * @param {Server} server - Servidor HTTP
 */
const gracefulShutdown = async (server) => {
  logger.info('Received shutdown signal, closing gracefully...');
  
  // Cerrar servidor HTTP (no aceptar nuevas conexiones)
  server.close(async () => {
    logger.info('HTTP server closed');
    
    try {
      // Cerrar conexiones a servicios
      await closeRedis();
      await closeRabbit();
      
      logger.info('All connections closed, exiting...');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error.message);
      process.exit(1);
    }
  });
  
  // Forzar cierre después de 30 segundos
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// ======================================================
// INICIALIZACIÓN DEL SERVIDOR
// ======================================================

/**
 * Inicializa y arranca el servidor
 */
const startServer = async () => {
  try {
    logger.info('Starting MENU QR PLUS Backend...');
    logger.info(`Environment: ${NODE_ENV}`);
    
    // Verificar dependencias antes de arrancar
    const dependenciesHealthy = await checkDependenciesHealth();
    
    if (!dependenciesHealthy && NODE_ENV === 'production') {
      throw new Error('Dependencies health check failed. Cannot start server.');
    }
    
    if (!dependenciesHealthy) {
      logger.warn('Some dependencies are unhealthy, but continuing in development mode');
    }
    
    // Iniciar consumidores de colas
    await startConsumers();
    logger.info('Queue consumers started');
    
    // Iniciar servidor HTTP
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📝 API Documentation: http://localhost:${PORT}/api/docs`);
      logger.info(`❤️ Health check: http://localhost:${PORT}/health`);
    });
    
    // Configurar manejo de señales de terminación
    process.on('SIGTERM', () => gracefulShutdown(server));
    process.on('SIGINT', () => gracefulShutdown(server));
    
    // Manejar excepciones no capturadas
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown(server);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown(server);
    });
    
    return server;
  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// ======================================================
// EJECUTAR SERVIDOR
// ======================================================

// Solo ejecutar si no estamos en entorno de prueba
if (require.main === module) {
  startServer();
}

// ======================================================
// EXPORTACIONES (para pruebas)
// ======================================================

module.exports = {
  startServer,
  checkDependenciesHealth,
};