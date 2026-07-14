1. ENDPOINTS PÚBLICOS (Frontend Cliente)
Método	Endpoint	Descripción	Estado
GET	/:slug/menu	Obtener menú completo por slug	✅ Implementado
GET	/branch/:branchId/menu	Obtener menú por ID de sede	✅ Implementado
GET	/table/:tableId/menu	Obtener menú específico para una mesa	✅ Implementado
GET	/:slug/featured	Obtener productos destacados	✅ Implementado
GET	/:slug/daily-menu	Obtener menú del día	✅ Implementado
GET	/:slug/search	Buscar productos en el menú	✅ Implementado
GET	/branch/:branchId/status	Verificar estado de una sede (abierta/cerrada)	⚠️ Parcial
POST	/order	Crear nuevo pedido (domicilio/para llevar)	✅ Implementado
GET	/order/:orderId/status	Obtener estado de un pedido	✅ Implementado
POST	/order/:orderId/cancel	Cancelar un pedido	✅ Implementado
POST	/branch/:branchId/calculate-delivery	Calcular costo de envío	⚠️ Parcial
POST	/branch/:branchId/check-coverage	Verificar cobertura de domicilio	❌ No implementado
GET	/table/:tableId/info	Obtener información de una mesa	❌ No implementado
GET	/table/:tableId/status	Obtener estado de una mesa (libre/ocupada)	❌ No implementado
GET	/table/:tableId/active-order	Obtener pedido activo de una mesa	❌ No implementado
GET	/table/:tableId/order-history	Historial de pedidos de una mesa	❌ No implementado
POST	/table/:tableId/order	Crear pedido desde una mesa	✅ Implementado
POST	/table/:tableId/order/:orderId/add-items	Agregar items a pedido de mesa	✅ Implementado
PUT	/table/:tableId/order/:orderId/close	Cerrar pedido de mesa (finalizar cuenta)	✅ Implementado
POST	/table/:tableId/request-service	Solicitar atención del mesero	❌ No implementado
POST	/table/:tableId/request-bill	Solicitar la cuenta	❌ No implementado
GET	/health	Health check del servicio	✅ Implementado

ENDPOINTS ADMINISTRATIVOS (Panel de Control)
2.1 Autenticación
Método	Endpoint	Descripción	Estado
POST	/admin/auth/login	Iniciar sesión	✅ Implementado
POST	/admin/auth/logout	Cerrar sesión	✅ Implementado
GET	/admin/auth/verify	Verificar token JWT	✅ Implementado
POST	/admin/auth/register	Registrar nuevo restaurante	✅ Implementado
POST	/admin/auth/change-password	Cambiar contraseña	✅ Implementado
POST	/admin/auth/forgot-password	Recuperar contraseña	✅ Implementado
POST	/admin/auth/reset-password	Restablecer contraseña	✅ Implementado
2.2 Dashboard
Método	Endpoint	Descripción	Estado
GET	/admin/dashboard/stats	Estadísticas generales del día	✅ Implementado
GET	/admin/dashboard/revenue	Ingresos por período	✅ Implementado
GET	/admin/dashboard/top-products	Productos más vendidos	✅ Implementado
GET	/admin/orders/stats	Estadísticas de pedidos	✅ Implementado
2.3 Gestión de Productos
Método	Endpoint	Descripción	Estado
GET	/admin/products	Listar todos los productos	✅ Implementado
GET	/admin/products/:id	Obtener producto por ID	✅ Implementado
POST	/admin/products	Crear nuevo producto	✅ Implementado
PUT	/admin/products/:id	Actualizar producto	✅ Implementado
DELETE	/admin/products/:id	Eliminar producto	✅ Implementado
POST	/admin/products/:id/image	Subir imagen de producto	⚠️ No existe ruta dedicada; usa /admin/products o /admin/products/:id con field image
DELETE	/admin/products/:id/image	Eliminar imagen de producto	⚠️ No existe ruta dedicada
2.4 Gestión de Categorías
Método	Endpoint	Descripción	Estado
GET	/admin/categories	Listar categorías	✅ Implementado
POST	/admin/categories	Crear categoría	❌ No implementado (usa /admin/branch/:branchId/categories)
PUT	/admin/categories/:id	Actualizar categoría	✅ Implementado
DELETE	/admin/categories/:id	Eliminar categoría	✅ Implementado
PUT	/admin/categories/reorder	Reordenar categorías	⚠️ No existe ruta exacta; usa /admin/branch/:branchId/categories/reorder
2.5 Gestión de Sedes (Branches)
Método	Endpoint	Descripción	Estado
GET	/admin/branches	Listar sedes	✅ Implementado
GET	/admin/branches/:id	Obtener sede por ID	✅ Implementado
POST	/admin/branches	Crear nueva sede	✅ Implementado
PUT	/admin/branches/:id	Actualizar sede	✅ Implementado
DELETE	/admin/branches/:id	Eliminar sede	✅ Implementado
GET	/admin/branches/:id/modules	Obtener módulos de la sede	✅ Implementado
PUT	/admin/branches/:id/modules	Configurar módulos de la sede	✅ Implementado
2.6 Gestión de Mesas
Método	Endpoint	Descripción	Estado
GET	/admin/branches/:branchId/tables	Listar mesas de una sede	✅ Implementado
POST	/admin/branches/:branchId/tables	Crear nueva mesa	✅ Implementado
PUT	/admin/tables/:id	Actualizar mesa	✅ Implementado
DELETE	/admin/tables/:id	Eliminar mesa	✅ Implementado
PUT	/admin/tables/reorder	Reordenar mesas (mapa visual)	⚠️ No existe ruta exacta; usa /admin/branch/:branchId/tables/layout
2.7 Gestión de Pedidos (Admin)
Método	Endpoint	Descripción	Estado
GET	/admin/orders	Listar pedidos (con filtros)	✅ Implementado
GET	/admin/orders/:id	Obtener detalle de pedido	✅ Implementado
PUT	/admin/orders/:id/status	Actualizar estado del pedido	✅ Implementado
GET	/admin/orders/export	Exportar pedidos a CSV/Excel	❌ No implementado
2.8 Configuración
Método	Endpoint	Descripción	Estado
GET	/admin/settings	Obtener configuración general	✅ Implementado
PUT	/admin/settings	Actualizar configuración general	✅ Implementado
PUT	/admin/settings/appearance	Actualizar colores, logo, tema	⚠️ No existe ruta exacta; usa /admin/settings/colors, /admin/settings/logo, /admin/settings/whatsapp
GET	/admin/settings/qr/:branchId	Generar QR para sede/mesa	❌ No implementado
🟡 3. ENDPOINTS DE WEBHOOKS
Método	Endpoint	Descripción	Estado
POST	/webhook/whatsapp	Webhook de WhatsApp Business API	❌ No implementado
POST	/webhook/payment	Webhook de pasarela de pagos	❌ No implementado
📊 RESUMEN POR ESTADO
Estado	Cantidad	Porcentaje
✅ Implementado	~40	~50%
⚠️ Parcial	~6	~7.5%
❌ No implementado	~33	~42.5%
TOTAL	~79	100%

# CONTEXTO
Eres un desarrollador backend especializado en Node.js/Express con PostgreSQL. 
Debes implementar los endpoints administrativos faltantes para un sistema 
llamado "MENU QR PLUS" sin afectar el código existente.

# PROYECTO
- Nombre: MENU QR PLUS
- Backend: Node.js + Express
- Base de datos: PostgreSQL
- Autenticación: JWT
- Estructura actual: backend/src/

# REQUISITOS OBLIGATORIOS

## 1. NO MODIFICAR código existente que funcione
- Los endpoints públicos (/:slug/menu, /order, etc.) ya están implementados
- NO tocar los controladores públicos existentes
- Solo AGREGAR nuevos archivos o funciones

## 2. Implementar en este orden (CRÍTICOS primero)

PRIORIDADES PARA QUE EL ADMIN PANEL FUNCIONE
Para que el admin panel sea funcional, necesitas implementar inmediatamente estos endpoints:

🔴 CRÍTICOS (Primera semana)
POST /admin/auth/login - Iniciar sesión

GET /admin/auth/verify - Verificar token

GET /admin/dashboard/stats - Estadísticas del dashboard

GET /admin/orders - Listar pedidos

GET /admin/orders/stats - Estadísticas de pedidos

PUT /admin/orders/:id/status - Actualizar estado de pedido

GET /admin/branches - Listar sedes

GET /admin/products - Listar productos

🟠 IMPORTANTES (Segunda semana)
POST /admin/products - Crear producto

PUT /admin/products/:id - Actualizar producto

DELETE /admin/products/:id - Eliminar producto

GET /admin/categories - Listar categorías

POST /admin/branches - Crear sede

PUT /admin/branches/:id - Actualizar sede

GET /admin/branches/:branchId/tables - Listar mesas

PUT /admin/tables/:id - Actualizar mesa



 LISTA DE ARCHIVOS A IMPLEMENTAR PARA ADMIN PANEL
🔴 CRÍTICOS (Primera semana) - 8 Endpoints
1. Autenticación (3 archivos)
#	Archivo	Endpoint	Método
1	backend/src/controllers/admin/authController.js	/admin/auth/login	POST
2	backend/src/controllers/admin/authController.js	/admin/auth/verify	GET
3	backend/src/controllers/admin/authController.js	/admin/auth/logout	POST
4	backend/src/routes/admin.js	Declaración de rutas de autenticación	-
2. Dashboard (3 archivos)
#	Archivo	Endpoint	Método
5	backend/src/controllers/admin/dashboardController.js	/admin/dashboard/stats	GET
6	backend/src/controllers/admin/dashboardController.js	/admin/orders/stats	GET
7	backend/src/routes/admin.js	Declaración de rutas de dashboard	-
3. Gestión de Pedidos (4 archivos)
#	Archivo	Endpoint	Método
8	backend/src/controllers/admin/orderController.js	/admin/orders	GET
9	backend/src/controllers/admin/orderController.js	/admin/orders/:id/status	PUT
10	backend/src/models/Order.js	Métodos para filtrar pedidos	-
11	backend/src/routes/admin.js	Declaración de rutas de pedidos	-
4. Gestión de Sedes (3 archivos)
#	Archivo	Endpoint	Método
12	backend/src/controllers/admin/branchController.js	/admin/branches	GET
13	backend/src/services/branchService.js	Servicio de sedes	-
14	backend/src/routes/admin.js	Declaración de rutas de sedes	-
5. Gestión de Productos (4 archivos)
#	Archivo	Endpoint	Método
15	backend/src/controllers/admin/productController.js	/admin/products	GET
16	backend/src/services/productService.js	Servicio de productos	-
17	backend/src/models/Product.js	Métodos para listar productos	-
18	backend/src/routes/admin.js	Declaración de rutas de productos	-
🟠 IMPORTANTES (Segunda semana) - 10 Endpoints
6. CRUD Productos (continuación)
#	Archivo	Endpoint	Método
19	backend/src/controllers/admin/productController.js	/admin/products	POST
20	backend/src/controllers/admin/productController.js	/admin/products/:id	PUT
21	backend/src/controllers/admin/productController.js	/admin/products/:id	DELETE
22	backend/src/controllers/admin/productController.js	/admin/products/:id/image	POST
23	backend/src/controllers/admin/productController.js	/admin/products/:id/image	DELETE
7. Gestión de Categorías (5 archivos)
#	Archivo	Endpoint	Método
24	backend/src/controllers/admin/categoryController.js	/admin/categories	GET
25	backend/src/controllers/admin/categoryController.js	/admin/categories	POST
26	backend/src/controllers/admin/categoryController.js	/admin/categories/:id	PUT
27	backend/src/controllers/admin/categoryController.js	/admin/categories/:id	DELETE
28	backend/src/controllers/admin/categoryController.js	/admin/categories/reorder	PUT
8. CRUD Sedes (continuación)
#	Archivo	Endpoint	Método
29	backend/src/controllers/admin/branchController.js	/admin/branches	POST
30	backend/src/controllers/admin/branchController.js	/admin/branches/:id	PUT
31	backend/src/controllers/admin/branchController.js	/admin/branches/:id	DELETE
32	backend/src/controllers/admin/branchController.js	/admin/branches/:id/modules	GET
33	backend/src/controllers/admin/branchController.js	/admin/branches/:id/modules	PUT
9. Gestión de Mesas (5 archivos)
#	Archivo	Endpoint	Método
34	backend/src/controllers/admin/tableController.js	/admin/branches/:branchId/tables	GET
35	backend/src/controllers/admin/tableController.js	/admin/branches/:branchId/tables	POST
36	backend/src/controllers/admin/tableController.js	/admin/tables/:id	PUT
37	backend/src/controllers/admin/tableController.js	/admin/tables/:id	DELETE
38	backend/src/controllers/admin/tableController.js	/admin/tables/reorder	PUT
10. Middleware de Autenticación (2 archivos)
#	Archivo	Propósito
39	backend/src/middleware/auth.js	Verificación de token JWT
40	backend/src/middleware/adminAuth.js	Verificar rol de administrador
📊 RESUMEN DE ARCHIVOS
Tipo	Cantidad
Controladores nuevos	6
Servicios nuevos	2
Modelos a modificar	2
Middleware	2
Rutas	1
TOTAL DE ARCHIVOS	~40
📁 ESTRUCTURA DE ARCHIVOS A CREAR/MODIFICAR
text
backend/src/
├── controllers/admin/
│   ├── authController.js      ← NUEVO (4 endpoints)
│   ├── dashboardController.js ← NUEVO (2 endpoints)
│   ├── orderController.js     ← MODIFICAR (agregar GET y PUT)
│   ├── branchController.js    ← MODIFICAR (agregar CRUD)
│   ├── productController.js   ← MODIFICAR (agregar CRUD)
│   ├── categoryController.js  ← NUEVO (CRUD completo)
│   └── tableController.js     ← MODIFICAR (agregar admin endpoints)
│
├── services/
│   ├── branchService.js       ← MODIFICAR (agregar métodos admin)
│   └── productService.js      ← NUEVO
│
├── models/
│   ├── Order.js               ← MODIFICAR (filtros admin)
│   └── Product.js             ← MODIFICAR (CRUD)
│
├── middleware/
│   ├── auth.js                ← MODIFICAR (JWT verification)
│   └── adminAuth.js           ← NUEVO (rol verification)
│
└── routes/
    └── admin.js               ← MODIFICAR (agregar todas las rutas)