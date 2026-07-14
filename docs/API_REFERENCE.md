<!--
  ======================================================
  ARCHIVO: API_REFERENCE.md
  UBICACIÓN: menu-qr-system/docs/API_REFERENCE.md
  FASE: DOC
  VERSIÓN: 1.0
  ÚLTIMA ACTUALIZACIÓN: 2024-01-17 02:45
  ======================================================
  🎯 PROPÓSITO:
  Documentación completa de referencia de la API REST
  del sistema MENU QR PLUS. Incluye todos los endpoints,
  parámetros, ejemplos de respuesta y códigos de error.

  📋 HISTORIAL DE CAMBIOS:
  ------------------------------------------------------
  1.0 - 2024-01-17 02:45
      ✅ Creación inicial del documento
      ✅ Endpoints públicos
      ✅ Endpoints administrativos
      ✅ Ejemplos de uso
  ======================================================
-->

# API Reference - MENU QR PLUS

## Base URL

| Entorno | URL |
|---------|-----|
| Desarrollo | `http://localhost:3005/api` |
| Producción | `https://api.menu.dominio.com/api` |

## Autenticación

Los endpoints administrativos requieren un token JWT en el header:
Authorization: Bearer <token>

text

---

## Índice de Endpoints

### Públicos
- [Menú](#menú)
- [Pedidos](#pedidos)
- [Mesas](#mesas-públicas)
- [Verificación de Domicilio](#verificación-de-domicilio)

### Administrativos
- [Autenticación](#autenticación)
- [Productos](#productos-admin)
- [Categorías](#categorías-admin)
- [Sedes](#sedes-admin)
- [Mesas](#mesas-admin)
- [Pedidos](#pedidos-admin)
- [Configuración](#configuración)

---

## Códigos de Respuesta

| Código | Descripción |
|--------|-------------|
| 200 | OK - Petición exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

---

## ENDPOINTS PÚBLICOS

### Menú

#### GET /:slug/menu

Obtiene el menú completo de un restaurante.

**Parámetros de ruta:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| slug | string | Slug del restaurante |

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| branch_id | string | ID de la sede (opcional) |
| skip_cache | boolean | Forzar refresco (opcional) |

**Ejemplo de respuesta:**

```json
{
  "success": true,
  "data": {
    "branch": {
      "id": "uuid",
      "name": "El Sabor Costeño",
      "logo_url": "https://cloudinary.com/...",
      "whatsapp_number": "3193856893",
      "is_open": true
    },
    "modules": [
      { "name": "lunch", "display_name": "Almuerzos", "icon": "🍽️" }
    ],
    "categories": [
      {
        "id": "uuid",
        "name": "Almuerzos",
        "products": [
          {
            "id": "uuid",
            "name": "Bandeja Paisa",
            "description": "Arroz, frijol, carne...",
            "price": 28000,
            "image_url": "https://...",
            "modifiers": [
              { "name": "Queso extra", "price": 3000 }
            ]
          }
        ]
      }
    ]
  },
  "timestamp": "2024-01-17T02:45:00.000Z"
}
GET /branch/:branchId/menu
Obtiene el menú directamente por ID de sede.

Parámetros de ruta:

Parámetro	Tipo	Descripción
branchId	string	ID de la sede
Pedidos
POST /order
Crea un nuevo pedido (domicilio o para llevar).

Body de la petición:

json
{
  "branch_id": "uuid",
  "customer_name": "Juan Pérez",
  "customer_phone": "3001234567",
  "order_type": "delivery",
  "delivery_address": "Calle 123 #45-67",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2,
      "modifiers": [
        { "name": "Queso extra", "price": 3000 }
      ]
    }
  ],
  "payment_method": "cash",
  "notes": "Sin cebolla"
}
Ejemplo de respuesta:

json
{
  "success": true,
  "data": {
    "order_id": "uuid",
    "order_number": 1234,
    "total": 86000,
    "message": "Pedido recibido"
  },
  "timestamp": "2024-01-17T02:45:00.000Z"
}
GET /order/:orderId/status
Obtiene el estado de un pedido.

Ejemplo de respuesta:

json
{
  "success": true,
  "data": {
    "order_id": "uuid",
    "order_number": 1234,
    "status": "confirmed",
    "payment_status": "pending",
    "created_at": "2024-01-17T02:45:00.000Z"
  }
}
POST /order/:orderId/cancel
Cancela un pedido.

Body de la petición:

json
{
  "phone": "3001234567",
  "reason": "Cambio de opinión"
}
Mesas (Públicas)
GET /table/:tableId/menu
Obtiene el menú específico para una mesa.

GET /table/:tableId/status
Obtiene el estado actual de una mesa.

POST /table/:tableId/order
Crea un pedido desde una mesa.

POST /table/:tableId/request-service
Solicita atención del mesero.

POST /table/:tableId/request-bill
Solicita la cuenta.

Verificación de Domicilio
POST /branch/:branchId/calculate-delivery
Calcula costo de envío para una dirección.

Body de la petición:

json
{
  "address": "Calle 123 #45-67",
  "subtotal": 50000
}
Ejemplo de respuesta:

json
{
  "success": true,
  "data": {
    "is_covered": true,
    "cost": 0,
    "is_free": true,
    "free_delivery_min_amount": 30000,
    "remaining_for_free": 0
  }
}
ENDPOINTS ADMINISTRATIVOS
Autenticación
POST /admin/auth/login
Inicia sesión.

Body de la petición:

json
{
  "email": "admin@restaurante.com",
  "password": "password123"
}
Ejemplo de respuesta:

json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "name": "Mi Restaurante",
      "email": "admin@restaurante.com",
      "slug": "mi-restaurante"
    }
  }
}
POST /admin/auth/logout
Cierra sesión.

POST /admin/auth/register
Registra un nuevo restaurante y tenant.

Body de la petición:

json
{
  "name": "Mi Restaurante",
  "email": "admin@restaurante.com",
  "password": "password123",
  "phone": "3193856893"
}

POST /admin/auth/verify
Verifica el token JWT del administrador.

Headers:
Authorization: Bearer <token>

POST /admin/auth/change-password
Cambia la contraseña del administrador.

Body de la petición:

json
{
  "current_password": "password123",
  "new_password": "password456"
}

POST /admin/auth/forgot-password
Inicia el flujo de recuperación de contraseña.

Body de la petición:

json
{
  "email": "admin@restaurante.com"
}

POST /admin/auth/reset-password
Restablece la contraseña con token de recuperación.

Body de la petición:

json
{
  "token": "reset-token",
  "new_password": "password456"
}

POST /admin/auth/refresh-token
Refresca el token JWT.

Productos (Admin)
GET /admin/products
Obtiene todos los productos (paginado).

Query Parameters:

Parámetro	Tipo	Descripción
page	integer	Número de página
limit	integer	Items por página
category_id	string	Filtrar por categoría
branch_id	string	Filtrar por sede
search	string	Búsqueda por nombre
is_available	boolean	Filtrar por disponibilidad
POST /admin/products
Crea un nuevo producto (multipart/form-data).

Campos del formulario:

Campo	Tipo	Descripción
name	string	Nombre del producto
description	string	Descripción
price	number	Precio
category_id	string	ID de categoría
image	file	Imagen del producto
is_available	boolean	Disponibilidad
modifiers	string	JSON de modificadores
PUT /admin/products/:productId
Actualiza un producto.

DELETE /admin/products/:productId
Elimina un producto.

PUT /admin/products/:productId/availability
Cambia disponibilidad.

json
{
  "is_available": false
}
Categorías (Admin)
GET /admin/branch/:branchId/categories
Obtiene categorías de una sede.

POST /admin/branch/:branchId/categories
Crea una nueva categoría.

json
{
  "name": "Hamburguesas",
  "description": "Nuestras mejores hamburguesas",
  "module_type": "fastfood",
  "start_time": "12:00",
  "end_time": "22:00"
}
PUT /admin/categories/:categoryId
Actualiza una categoría.

DELETE /admin/categories/:categoryId
Elimina una categoría.

PUT /admin/branch/:branchId/categories/reorder
Reordena categorías.

json
{
  "categories": [
    { "id": "uuid1", "display_order": 0 },
    { "id": "uuid2", "display_order": 1 }
  ]
}
Sedes (Admin)
GET /admin/branches
Obtiene todas las sedes.

POST /admin/branches
Crea una nueva sede.

json
{
  "name": "Sede Norte",
  "address": "Calle 123",
  "phone": "1234567",
  "whatsapp_number": "3193856893",
  "delivery_cost": 3000,
  "free_delivery_min_amount": 30000
}
PUT /admin/branches/:branchId
Actualiza una sede.

DELETE /admin/branches/:branchId
Elimina una sede.

GET /admin/branches/:branchId/modules
Obtiene módulos configurados.

PUT /admin/branches/:branchId/modules/:moduleName
Actualiza configuración de un módulo.

json
{
  "is_enabled": true,
  "settings": {
    "start_time": "18:00",
    "end_time": "02:00",
    "happy_hour_enabled": true
  }
}
Mesas (Admin)
GET /admin/branch/:branchId/tables
Obtiene todas las mesas de una sede.

POST /admin/branch/:branchId/tables
Crea una nueva mesa.

json
{
  "table_number": "1",
  "table_name": "Ventanal",
  "capacity": 4,
  "shape": "circle",
  "position_x": 100,
  "position_y": 200
}
PUT /admin/table/:tableId
Actualiza una mesa.

DELETE /admin/table/:tableId
Elimina una mesa.

PUT /admin/table/:tableId/status
Cambia el estado de una mesa.

json
{
  "status": "occupied",
  "order_id": "uuid"
}
GET /admin/branch/:branchId/tables/layout
Obtiene layout visual de mesas.

PUT /admin/branch/:branchId/tables/layout
Actualiza posiciones de mesas.

json
{
  "tables": [
    { "id": "uuid1", "position_x": 150, "position_y": 200 },
    { "id": "uuid2", "position_x": 250, "position_y": 200 }
  ]
}
Pedidos (Admin)
GET /admin/orders
Obtiene todos los pedidos (paginado).

Query Parameters:

Parámetro	Tipo	Descripción
branch_id	string	Filtrar por sede
status	string	Filtrar por estado
date_from	string	Fecha inicio (YYYY-MM-DD)
date_to	string	Fecha fin (YYYY-MM-DD)
PUT /admin/orders/:orderId/status
Actualiza el estado de un pedido.

json
{
  "status": "preparing"
}
GET /admin/orders/stats
Obtiene estadísticas de pedidos.

Configuración
GET /admin/settings
Obtiene configuración del restaurante.

PUT /admin/settings
Actualiza configuración general.

json
{
  "name": "Mi Restaurante",
  "whatsapp_number": "3193856893",
  "primary_color": "#FF6B35"
}
POST /admin/settings/logo
Actualiza el logo (multipart/form-data).

DELETE /admin/settings/logo
Elimina el logo.

PUT /admin/settings/colors
Actualiza colores.

json
{
  "primary_color": "#FF6B35",
  "secondary_color": "#25D366"
}
PUT /admin/settings/schedule
Actualiza horarios.

json
{
  "schedule": {
    "monday": { "open": "09:00", "close": "22:00", "closed": false }
  }
}
Webhooks
POST /webhook/whatsapp
Endpoint para webhooks de WhatsApp Business API.

POST /webhook/payment
Endpoint para webhooks de pasarelas de pago.

Errores Comunes
json
{
  "success": false,
  "error": "Mensaje de error descriptivo",
  "timestamp": "2024-01-17T02:45:00.000Z"
}
Error	Código	Descripción
Token inválido	401	El token JWT expiró o es inválido
Recurso no encontrado	404	El ID solicitado no existe
Validación fallida	400	Los datos enviados no son válidos
Sin permisos	403	El usuario no tiene permisos para esta acción