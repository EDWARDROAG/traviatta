/**
 * ======================================================
 * ARCHIVO: admin.js
 * UBICACIÓN: menu-qr-system/backend/src/routes/admin.js
 * FASE: F2
 * VERSIÓN: 1.3
 * ÚLTIMA ACTUALIZACIÓN: 2026-05-23 12:45
 *
 * 🎯 PROPÓSITO:
 * Definición de todas las rutas administrativas de la API
 * que requieren autenticación JWT.
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.3 - 2026-05-23 12:45
 *    ✅ Agregada ruta GET /admin/categories
 * ------------------------------------------------------
 * 1.2 - 2026-05-23 11:50
 *    ✅ Agregadas rutas /orders/top-products
 *    ✅ Agregadas rutas /orders/recent
 *    ✅ Agregada ruta /tables/occupancy
 * ------------------------------------------------------
 * 1.1 - 2024-05-23 14:00
 *    ✅ Agregada ruta GET /admin/orders/stats
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 04:30
 *    ✅ Creación inicial del archivo
 * ======================================================
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configuración de multer para subida de imágenes
const upload = multer({ storage: multer.memoryStorage() });

// Controladores administrativos
const authController = require('../controllers/admin/authController');
const productController = require('../controllers/admin/productController');
const categoryController = require('../controllers/admin/categoryController');
const branchController = require('../controllers/admin/branchController');
const tableController = require('../controllers/admin/tableController');
const orderController = require('../controllers/admin/orderController');
const settingsController = require('../controllers/admin/settingsController');
const dashboardController = require('../controllers/admin/dashboardController');

// Middleware
const { authMiddleware, requireOwner } = require('../middleware/auth');
const { adminLimiter, loginLimiter, registerLimiter } = require('../middleware/rateLimit');
const { invalidateMenuCache, invalidateSettingsCache } = require('../middleware/cache');
const { validate } = require('../middleware/validation');
const {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  productSchema,
  productUpdateSchema,
  categorySchema,
  categoryReorderSchema,
  branchSchema,
  scheduleSchema,
  tableSchema,
  tablePositionsSchema,
  settingsSchema,
  colorsSchema,
} = require('../middleware/validation');

// ======================================================
// RUTAS DE AUTENTICACIÓN (sin auth para login/register)
// ======================================================

/**
 * POST /admin/auth/login
 * Inicia sesión de un restaurante
 */
router.post('/auth/login', loginLimiter, validate(loginSchema), authController.login);

/**
 * POST /admin/auth/register
 * Registra un nuevo restaurante
 */
router.post('/auth/register', registerLimiter, validate(registerSchema), authController.register);

/**
 * POST /admin/auth/logout
 * Cierra sesión
 */
router.post('/auth/logout', authMiddleware, authController.logout);

/**
 * POST /admin/auth/refresh-token
 * Refresca el token JWT
 */
router.post('/auth/refresh-token', authController.refreshToken);

/**
 * POST /admin/auth/change-password
 * Cambia la contraseña del restaurante
 */
router.post('/auth/change-password', authMiddleware, validate(changePasswordSchema), authController.changePassword);

/**
 * POST /admin/auth/forgot-password
 * Solicita recuperación de contraseña
 */
router.post('/auth/forgot-password', authController.forgotPassword);

/**
 * POST /admin/auth/reset-password
 * Restablece la contraseña con token
 */
router.post('/auth/reset-password', authController.resetPassword);

/**
 * GET /admin/auth/verify
 * Verifica el token JWT
 */
router.get('/auth/verify', authMiddleware, authController.verify);

/**
 * GET /admin/dashboard/stats
 * Estadísticas generales del panel (por restaurante)
 */
router.get('/dashboard/stats', authMiddleware, adminLimiter, dashboardController.getStats);

/**
 * GET /admin/dashboard/revenue
 * Ingresos por período
 */
router.get('/dashboard/revenue', authMiddleware, adminLimiter, dashboardController.getRevenue);

/**
 * GET /admin/dashboard/top-products
 * Productos más vendidos agregados por tenant
 */
router.get('/dashboard/top-products', authMiddleware, adminLimiter, dashboardController.getTopProducts);

// ======================================================
// RUTAS DE PRODUCTOS (requieren autenticación)
// ======================================================

router.use(authMiddleware);

/**
 * GET /admin/products
 * Obtiene todos los productos con paginación
 */
router.get('/products', adminLimiter, productController.getAllProducts);

/**
 * GET /admin/products/:productId
 * Obtiene un producto por ID
 */
router.get('/products/:productId', adminLimiter, productController.getProductById);

/**
 * GET /admin/category/:categoryId/products
 * Obtiene productos por categoría
 */
router.get('/category/:categoryId/products', adminLimiter, productController.getProductsByCategory);

/**
 * POST /admin/products
 * Crea un nuevo producto (con imagen)
 */
router.post('/products', adminLimiter, upload.single('image'), validate(productSchema), productController.createProduct);

/**
 * PUT /admin/products/:productId
 * Actualiza un producto
 */
router.put('/products/:productId', adminLimiter, upload.single('image'), validate(productUpdateSchema), productController.updateProduct);

/**
 * DELETE /admin/products/:productId
 * Elimina un producto
 */
router.delete('/products/:productId', adminLimiter, productController.deleteProduct);

/**
 * PUT /admin/products/:productId/availability
 * Cambia la disponibilidad de un producto
 */
router.put('/products/:productId/availability', adminLimiter, productController.setProductAvailability);

/**
 * PUT /admin/products/availability/batch
 * Cambia disponibilidad de múltiples productos
 */
router.put('/products/availability/batch', adminLimiter, productController.setMultipleAvailability);

/**
 * PUT /admin/category/:categoryId/products/reorder
 * Reordena productos en una categoría
 */
router.put('/category/:categoryId/products/reorder', adminLimiter, validate(categoryReorderSchema), productController.reorderProducts);

/**
 * POST /admin/products/:productId/duplicate
 * Duplica un producto
 */
router.post('/products/:productId/duplicate', adminLimiter, productController.duplicateProduct);

// ======================================================
// RUTAS DE CATEGORÍAS
// ======================================================

/**
 * 🔧 NUEVA RUTA: GET /admin/categories
 * Obtiene todas las categorías del restaurante (sin branch_id)
 */
router.get('/categories', adminLimiter, categoryController.getAllCategories);

/**
 * GET /admin/branch/:branchId/categories
 * Obtiene todas las categorías de una sede
 */
router.get('/branch/:branchId/categories', adminLimiter, categoryController.getCategoriesByBranch);

/**
 * GET /admin/categories/:categoryId
 * Obtiene una categoría por ID
 */
router.get('/categories/:categoryId', adminLimiter, categoryController.getCategoryById);

/**
 * POST /admin/branch/:branchId/categories
 * Crea una nueva categoría
 */
router.post('/branch/:branchId/categories', adminLimiter, validate(categorySchema), categoryController.createCategory);

/**
 * PUT /admin/categories/:categoryId
 * Actualiza una categoría
 */
router.put('/categories/:categoryId', adminLimiter, validate(categorySchema), categoryController.updateCategory);

/**
 * DELETE /admin/categories/:categoryId
 * Elimina una categoría
 */
router.delete('/categories/:categoryId', adminLimiter, categoryController.deleteCategory);

/**
 * PUT /admin/categories/:categoryId/activate
 * Activa una categoría
 */
router.put('/categories/:categoryId/activate', adminLimiter, categoryController.activateCategory);

/**
 * PUT /admin/categories/:categoryId/deactivate
 * Desactiva una categoría
 */
router.put('/categories/:categoryId/deactivate', adminLimiter, categoryController.deactivateCategory);

/**
 * PUT /admin/branch/:branchId/categories/reorder
 * Reordena categorías en una sede
 */
router.put('/branch/:branchId/categories/reorder', adminLimiter, validate(categoryReorderSchema), categoryController.reorderCategories);

/**
 * PUT /admin/categories/:categoryId/schedule
 * Actualiza horarios de una categoría
 */
router.put('/categories/:categoryId/schedule', adminLimiter, categoryController.updateCategorySchedule);

// ======================================================
// RUTAS DE SEDES
// ======================================================

/**
 * GET /admin/branches
 * Obtiene todas las sedes del restaurante
 */
router.get('/branches', adminLimiter, branchController.getAllBranches);

/**
 * GET /admin/branches/:branchId
 * Obtiene una sede por ID
 */
router.get('/branches/:branchId', adminLimiter, branchController.getBranchById);

/**
 * GET /admin/branches/:branchId/dashboard
 * Obtiene dashboard con estadísticas de la sede
 */
router.get('/branches/:branchId/dashboard', adminLimiter, branchController.getBranchDashboard);

/**
 * POST /admin/branches
 * Crea una nueva sede
 */
router.post('/branches', adminLimiter, validate(branchSchema), branchController.createBranch);

/**
 * PUT /admin/branches/:branchId
 * Actualiza una sede
 */
router.put('/branches/:branchId', adminLimiter, validate(branchSchema), branchController.updateBranch);

/**
 * DELETE /admin/branches/:branchId
 * Elimina una sede
 */
router.delete('/branches/:branchId', adminLimiter, branchController.deleteBranch);

/**
 * GET /admin/branches/:branchId/modules
 * Obtiene los módulos configurados para una sede
 */
router.get('/branches/:branchId/modules', adminLimiter, branchController.getBranchModules);

/**
 * PUT /admin/branches/:branchId/modules/:moduleName
 * Actualiza la configuración de un módulo
 */
router.put('/branches/:branchId/modules/:moduleName', adminLimiter, branchController.updateBranchModule);

/**
 * PUT /admin/branches/:branchId/delivery-zones
 * Actualiza zonas de domicilio de una sede
 */
router.put('/branches/:branchId/delivery-zones', adminLimiter, branchController.updateDeliveryZones);

/**
 * POST /admin/branches/:branchId/check-coverage
 * Verifica cobertura de domicilio (prueba)
 */
router.post('/branches/:branchId/check-coverage', adminLimiter, branchController.testDeliveryCoverage);

/**
 * PUT /admin/branches/:branchId/schedule
 * Actualiza horarios de una sede
 */
router.put('/branches/:branchId/schedule', adminLimiter, validate(scheduleSchema), branchController.updateBranchSchedule);

/**
 * GET /admin/branches/:branchId/status
 * Verifica si la sede está abierta
 */
router.get('/branches/:branchId/status', adminLimiter, branchController.getBranchStatus);

// ======================================================
// RUTAS DE MESAS
// ======================================================

/**
 * GET /admin/branch/:branchId/tables
 * Obtiene todas las mesas de una sede
 */
router.get('/branch/:branchId/tables', adminLimiter, tableController.getTablesByBranch);

/**
 * GET /admin/table/:tableId
 * Obtiene una mesa por ID
 */
router.get('/table/:tableId', adminLimiter, tableController.getTableById);

/**
 * POST /admin/branch/:branchId/tables
 * Crea una nueva mesa
 */
router.post('/branch/:branchId/tables', adminLimiter, validate(tableSchema), tableController.createTable);

/**
 * PUT /admin/table/:tableId
 * Actualiza una mesa
 */
router.put('/table/:tableId', adminLimiter, validate(tableSchema), tableController.updateTable);

/**
 * DELETE /admin/table/:tableId
 * Elimina una mesa
 */
router.delete('/table/:tableId', adminLimiter, tableController.deleteTable);

/**
 * GET /admin/branch/:branchId/tables/layout
 * Obtiene el layout de mesas para el mapa visual
 */
router.get('/branch/:branchId/tables/layout', adminLimiter, tableController.getTableLayout);

/**
 * PUT /admin/branch/:branchId/tables/layout
 * Actualiza las posiciones de múltiples mesas
 */
router.put('/branch/:branchId/tables/layout', adminLimiter, validate(tablePositionsSchema), tableController.updateTablePositions);

/**
 * PUT /admin/table/:tableId/status
 * Cambia el estado de una mesa
 */
router.put('/table/:tableId/status', adminLimiter, tableController.changeTableStatus);

/**
 * POST /admin/table/:tableId/generate-qr
 * Genera código QR para una mesa
 */
router.post('/admin/table/:tableId/generate-qr', adminLimiter, tableController.generateTableQR);

/**
 * POST /admin/branch/:branchId/tables/regenerate-qrs
 * Regenera QR para todas las mesas de una sede
 */
router.post('/branch/:branchId/tables/regenerate-qrs', adminLimiter, tableController.regenerateAllTableQRs);

/**
 * GET /admin/branch/:branchId/tables/dashboard
 * Obtiene dashboard de ocupación de mesas
 */
router.get('/branch/:branchId/tables/dashboard', adminLimiter, tableController.getOccupancyDashboard);

/**
 * POST /admin/branch/:branchId/tables/release-all
 * Libera todas las mesas de una sede
 */
router.post('/branch/:branchId/tables/release-all', adminLimiter, tableController.releaseAllTables);

// ======================================================
// RUTAS DE PEDIDOS (ADMIN)
// ======================================================

/**
 * 🔧 IMPORTANTE: Las rutas específicas DEBEN ir antes que las rutas con parámetros dinámicos
 */

// RUTAS ESPECÍFICAS (sin parámetros dinámicos)
/**
 * GET /admin/orders/stats
 * Obtiene estadísticas globales de pedidos para el dashboard (sin branch_id)
 */
router.get('/orders/stats', adminLimiter, orderController.getGlobalOrderStats);

/**
 * GET /admin/orders/top-products
 * Obtiene los productos más vendidos
 */
router.get('/orders/top-products', adminLimiter, orderController.getTopProducts);

/**
 * GET /admin/orders/recent
 * Obtiene pedidos recientes
 */
router.get('/orders/recent', adminLimiter, orderController.getRecentOrders);

/**
 * GET /admin/orders
 * Obtiene todos los pedidos con paginación
 */
router.get('/orders', adminLimiter, orderController.getAllOrders);

// RUTAS CON PARÁMETROS DINÁMICOS (van después)
/**
 * GET /admin/orders/:orderId
 * Obtiene un pedido por ID
 */
router.get('/orders/:orderId', adminLimiter, orderController.getOrderById);

/**
 * PUT /admin/orders/:orderId/status
 * Actualiza el estado de un pedido
 */
router.put('/orders/:orderId/status', adminLimiter, orderController.updateOrderStatus);

/**
 * PUT /admin/orders/:orderId/payment-status
 * Actualiza el estado de pago de un pedido
 */
router.put('/orders/:orderId/payment-status', adminLimiter, orderController.updatePaymentStatus);

/**
 * POST /admin/orders/:orderId/assign-table
 * Asigna un pedido a una mesa
 */
router.post('/orders/:orderId/assign-table', adminLimiter, orderController.assignOrderToTable);

/**
 * GET /admin/branch/:branchId/orders
 * Obtiene pedidos por sede
 */
router.get('/branch/:branchId/orders', adminLimiter, orderController.getOrdersByBranch);

/**
 * GET /admin/branch/:branchId/orders/stats
 * Obtiene estadísticas de pedidos por sede
 */
router.get('/branch/:branchId/orders/stats', adminLimiter, orderController.getOrderStats);

// ======================================================
// RUTAS DE TABLES (ADMIN) - ENDPOINTS ADICIONALES
// ======================================================

/**
 * GET /admin/tables/occupancy
 * Obtiene ocupación de mesas (todas las sedes del tenant)
 */
router.get('/tables/occupancy', adminLimiter, tableController.getOccupancyStats);

// ======================================================
// RUTAS DE CONFIGURACIÓN
// ======================================================

/**
 * GET /admin/settings
 * Obtiene la configuración del restaurante
 */
router.get('/settings', adminLimiter, settingsController.getSettings);

/**
 * PUT /admin/settings
 * Actualiza la configuración general
 */
router.put('/settings', adminLimiter, validate(settingsSchema), invalidateSettingsCache, settingsController.updateSettings);

/**
 * POST /admin/settings/logo
 * Actualiza el logo del restaurante
 */
router.post('/settings/logo', adminLimiter, upload.single('logo'), settingsController.updateLogo);

/**
 * DELETE /admin/settings/logo
 * Elimina el logo del restaurante
 */
router.delete('/settings/logo', adminLimiter, settingsController.deleteLogo);

/**
 * PUT /admin/settings/colors
 * Actualiza los colores del restaurante
 */
router.put('/settings/colors', adminLimiter, validate(colorsSchema), settingsController.updateColors);

/**
 * PUT /admin/settings/whatsapp
 * Actualiza el número de WhatsApp
 */
router.put('/settings/whatsapp', adminLimiter, settingsController.updateWhatsApp);

/**
 * PUT /admin/settings/schedule
 * Actualiza horarios generales del restaurante
 */
router.put('/settings/schedule', adminLimiter, validate(scheduleSchema), settingsController.updateGeneralSchedule);

/**
 * PUT /admin/settings/delivery
 * Actualiza configuración de domicilio global
 */
router.put('/settings/delivery', adminLimiter, settingsController.updateGlobalDelivery);

/**
 * GET /admin/settings/subscription
 * Obtiene información de la suscripción
 */
router.get('/settings/subscription', adminLimiter, settingsController.getSubscriptionInfo);

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = router;