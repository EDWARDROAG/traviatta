/**
 * ======================================================
 * ARCHIVO: public.js
 * UBICACIÓN: menu-qr-system/backend/src/routes/public.js
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 04:00
 *
 * 🎯 PROPÓSITO:
 * Definición de todas las rutas públicas de la API
 * que no requieren autenticación. Incluye endpoints
 * para menú, pedidos, consulta de mesas, y verificación
 * de cobertura de domicilio.
 *
 * 📦 DEPENDENCIAS:
 * - express: Framework web
 * - ../controllers/public/menuController: Controlador de menú
 * - ../controllers/public/orderController: Controlador de pedidos
 * - ../controllers/public/tableController: Controlador de mesas
 * - ../middleware/rateLimit: Rate limiting público
 * - ../middleware/cache: Caché de respuestas
 * - ../middleware/validation: Validación de datos
 *
 * 🔗 RELACIONES:
 * - Importa de: express, ../controllers/*, ../middleware/*
 * - Es importado por: ../app.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 04:00
 *    ✅ Creación inicial del archivo
 *    ✅ Rutas de menú público
 *    ✅ Rutas de pedidos
 *    ✅ Rutas de mesas
 *    ✅ Rutas de verificación de domicilio
 *    ✅ Aplicación de rate limiting y caché
 * ======================================================
 */

const express = require('express');
const router = express.Router();

// Controladores públicos
const menuController = require('../controllers/public/menuController');
const orderController = require('../controllers/public/orderController');
const tableController = require('../controllers/public/tableController');

// Middleware
const { publicApiLimiter, strictLimiter, orderLimiter } = require('../middleware/rateLimit');
const { menuCacheMiddleware, featuredCacheMiddleware } = require('../middleware/cache');
const { validate } = require('../middleware/validation');
const { orderSchema, orderCancelSchema } = require('../middleware/validation');

// ======================================================
// RUTAS DE MENÚ
// ======================================================

/**
 * GET /:slug/menu
 * Obtiene el menú completo de un restaurante por slug
 */
router.get('/:slug/menu', publicApiLimiter, menuCacheMiddleware, menuController.getMenuBySlug);

/**
 * GET /branch/:branchId/menu
 * Obtiene el menú directamente por ID de sede
 */
router.get('/branch/:branchId/menu', publicApiLimiter, menuCacheMiddleware, menuController.getMenuByBranchId);

/**
 * GET /table/:tableId/menu
 * Obtiene el menú específico para una mesa
 */
router.get('/table/:tableId/menu', publicApiLimiter, menuCacheMiddleware, menuController.getMenuByTable);

/**
 * GET /:slug/featured
 * Obtiene productos destacados de un restaurante
 */
router.get('/:slug/featured', publicApiLimiter, featuredCacheMiddleware, menuController.getFeaturedProducts);

/**
 * GET /:slug/daily-menu
 * Obtiene el menú del día (para almuerzos ejecutivos)
 */
router.get('/:slug/daily-menu', publicApiLimiter, menuCacheMiddleware, menuController.getDailyMenu);

/**
 * GET /:slug/search
 * Busca productos en el menú
 */
router.get('/:slug/search', publicApiLimiter, menuController.searchProducts);

/**
 * GET /branch/:branchId/status
 * Verifica el estado de una sede (abierta/cerrada)
 */
router.get('/branch/:branchId/status', publicApiLimiter, menuController.getBranchStatus);

// ======================================================
// RUTAS DE PEDIDOS
// ======================================================

/**
 * POST /order
 * Crea un nuevo pedido (domicilio o para llevar)
 */
router.post('/order', orderLimiter, validate(orderSchema), orderController.createOrder);

/**
 * POST /table/:tableId/order
 * Crea un pedido desde una mesa
 */
router.post('/table/:tableId/order', strictLimiter, orderController.createTableOrder);

/**
 * POST /table/:tableId/order/:orderId/add-items
 * Agrega items a un pedido existente de mesa
 */
router.post('/table/:tableId/order/:orderId/add-items', strictLimiter, orderController.addItemsToTableOrder);

/**
 * PUT /table/:tableId/order/:orderId/close
 * Cierra un pedido de mesa (finaliza cuenta)
 */
router.put('/table/:tableId/order/:orderId/close', strictLimiter, orderController.closeTableOrder);

/**
 * GET /order/:orderId/status
 * Obtiene el estado de un pedido
 */
router.get('/order/:orderId/status', publicApiLimiter, orderController.getOrderStatus);

/**
 * POST /order/:orderId/cancel
 * Cancela un pedido
 */
router.post('/order/:orderId/cancel', strictLimiter, validate(orderCancelSchema), orderController.cancelOrder);

/**
 * POST /branch/:branchId/calculate-delivery
 * Calcula costo de envío para una dirección
 */
router.post('/branch/:branchId/calculate-delivery', publicApiLimiter, orderController.calculateDeliveryCost);

// ======================================================
// RUTAS DE MESAS (PÚBLICAS)
// ======================================================

/**
 * GET /table/:tableId/info
 * Obtiene información básica de una mesa
 */
router.get('/table/:tableId/info', publicApiLimiter, tableController.getTableInfo);

/**
 * GET /table/:tableId/status
 * Obtiene el estado actual de una mesa
 */
router.get('/table/:tableId/status', publicApiLimiter, tableController.getTableStatus);

/**
 * GET /table/:tableId/active-order
 * Obtiene el pedido activo de una mesa (si existe)
 */
router.get('/table/:tableId/active-order', publicApiLimiter, tableController.getActiveOrder);

/**
 * GET /table/:tableId/order-history
 * Obtiene el historial de pedidos de una mesa
 */
router.get('/table/:tableId/order-history', publicApiLimiter, tableController.getTableOrderHistory);

/**
 * POST /table/:tableId/request-service
 * Solicita atención del mesero para una mesa
 */
router.post('/table/:tableId/request-service', strictLimiter, tableController.requestService);

/**
 * POST /table/:tableId/request-bill
 * Solicita la cuenta para una mesa
 */
router.post('/table/:tableId/request-bill', strictLimiter, tableController.requestBill);

/**
 * GET /table/:tableId/qr
 * Obtiene el código QR de una mesa
 */
router.get('/table/:tableId/qr', publicApiLimiter, tableController.getTableQR);

/**
 * POST /table/:tableId/notify-ready
 * Notifica que el pedido está listo
 */
router.post('/table/:tableId/notify-ready', strictLimiter, tableController.notifyOrderReady);

// ======================================================
// RUTAS DE VERIFICACIÓN DE DOMICILIO
// ======================================================

/**
 * POST /branch/:branchId/check-coverage
 * Verifica cobertura de domicilio
 */
router.post('/branch/:branchId/check-coverage', publicApiLimiter, menuController.checkDeliveryCoverage);

// ======================================================
// HEALTH CHECK
// ======================================================

/**
 * GET /health
 * Health check del servicio
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = router;