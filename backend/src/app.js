/**
 * ======================================================
 * ARCHIVO: app.js
 * UBICACIÓN: menu-qr-system/backend/src/app.js
 * FASE: F0
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 07:30
 *
 * 🎯 PROPÓSITO:
 * Configuración principal de la aplicación Express.
 * Inicializa middlewares globales, rutas públicas y
 * administrativas, manejo de errores, y configuración
 * de seguridad (CORS, Helmet, compression).
 *
 * 📦 DEPENDENCIAS:
 * - express: Framework web
 * - cors: Políticas CORS
 * - helmet: Seguridad HTTP
 * - compression: Compresión de respuestas
 * - morgan: Logging de peticiones HTTP
 * - express-rate-limit: Rate limiting
 * - ../middleware/errorHandler: Manejo de errores
 * - ../routes/*: Rutas de la API
 *
 * 🔗 RELACIONES:
 * - Importa de: express, cors, helmet, compression, morgan
 * - Es importado por: server.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 07:30
 *    ✅ Creación inicial del archivo
 *    ✅ Configuración de middlewares globales
 *    ✅ Registro de rutas públicas y admin
 *    ✅ Configuración de CORS y seguridad
 *    ✅ Manejo de errores 404 y global
 * ======================================================
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

// Importar rutas
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const webhookRoutes = require('./routes/webhook');

// Importar middleware de error
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Importar logger
const logger = require('./utils/logger');

// Crear aplicación Express
const app = express();

// ======================================================
// CONFIGURACIÓN DE SEGURIDAD
// ======================================================

// Helmet para seguridad de headers HTTP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https://wa.me", "https://api.whatsapp.com"],
    },
  },
}));

// CORS configurado
app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Skip-Cache'],
}));

// Compression para respuestas
app.use(compression());

// ======================================================
// LOGGING
// ======================================================

// Morgan para logging de peticiones HTTP
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  }));
}

// ======================================================
// PARSERS
// ======================================================

// Parsear JSON
app.use(express.json({ limit: '10mb' }));

// Parsear URL-encoded
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Archivos estáticos (para uploads temporales)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ======================================================
// RUTAS DE LA API
// ======================================================

// Health check (sin rate limiting)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Ready check para Kubernetes
app.get('/ready', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ready',
    timestamp: new Date().toISOString(),
  });
});

// Rutas públicas (menú, pedidos, mesas)
app.use('/api', publicRoutes);

// Rutas administrativas (protegidas por JWT)
app.use('/api/admin', adminRoutes);

// Rutas de webhooks (integración externa)
app.use('/webhook', webhookRoutes);

// ======================================================
// MANEJO DE ERRORES
// ======================================================

// Middleware para rutas no encontradas (404)
app.use(notFoundHandler);

// Middleware global de manejo de errores
app.use(errorHandler);

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = app;