/**
 * ======================================================
 * ARCHIVO: Order.js
 * UBICACIÓN: menu-qr-system/backend/src/models/Order.js
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-15 15:30
 *
 * 🎯 PROPÓSITO:
 * Modelo de datos para la gestión de pedidos, tanto
 * de domicilio como de servicio en mesa. Define la
 * estructura, validaciones y operaciones CRUD para
 * la tabla de orders, incluyendo items, estados,
 * cálculo de totales y gestión del ciclo de vida.
 *
 * 📦 DEPENDENCIAS:
 * - ../config/database: Conexión a PostgreSQL
 * - uuid: Generación de IDs únicos
 *
 * 🔗 RELACIONES:
 * - Importa de: ../config/database, uuid
 * - Es importado por: services/orderService.js,
 *   controllers/public/orderController.js,
 *   controllers/admin/orderController.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-15 15:30
 *    ✅ Creación inicial del archivo
 *    ✅ Definición del modelo Order
 *    ✅ Estados del pedido: pending, confirmed, preparing, ready, delivered, cancelled
 *    ✅ Tipos de pedido: delivery, takeaway, table
 *    ✅ Métodos CRUD completos
 *    ✅ Cálculo de totales
 *    ✅ Historial por cliente y sede
 *    ✅ Estadísticas de pedidos
 * ======================================================
 */

const { writeQuery, readQuery, transaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// ======================================================
// CONSTANTES
// ======================================================

const ORDER_STATUS = {
  PENDING: 'pending',       // Pedido recibido, pendiente de confirmar
  CONFIRMED: 'confirmed',   // Confirmado por el restaurante
  PREPARING: 'preparing',   // En preparación
  READY: 'ready',           // Listo para entregar
  DELIVERED: 'delivered',   // Entregado (domicilio) o finalizado (mesa)
  CANCELLED: 'cancelled',   // Cancelado
};

const ORDER_TYPES = {
  DELIVERY: 'delivery',     // Domicilio
  TAKEAWAY: 'takeaway',     // Para llevar
  TABLE: 'table',           // Servicio en mesa
};

const PAYMENT_METHODS = {
  CASH: 'cash',             // Efectivo contra entrega
  CARD: 'card',             // Tarjeta en datáfono
  TRANSFER: 'transfer',     // Transferencia bancaria
  NEQUI: 'nequi',           // Nequi
  DAVIPLATA: 'daviplata',   // Daviplata
};

const PAYMENT_STATUS = {
  PENDING: 'pending',       // Pendiente de pago
  PAID: 'paid',             // Pagado
  FAILED: 'failed',         // Fallido
};

// ======================================================
// VALIDACIONES
// ======================================================

/**
 * Valida los datos de un pedido
 * @param {Object} data - Datos del pedido
 * @returns {Object} { valid: boolean, errors: Array }
 */
const validateOrder = (data) => {
  const errors = [];
  
  if (!data.tenant_id) {
    errors.push('El ID del restaurante es requerido');
  }
  
  if (!data.branch_id) {
    errors.push('El ID de la sede es requerido');
  }
  
  if (!data.customer_name || data.customer_name.trim().length < 2) {
    errors.push('El nombre del cliente es requerido');
  }
  
  if (!data.customer_phone || data.customer_phone.replace(/[^0-9]/g, '').length < 7) {
    errors.push('El teléfono del cliente es requerido (mínimo 7 dígitos)');
  }
  
  if (!data.order_type || !Object.values(ORDER_TYPES).includes(data.order_type)) {
    errors.push(`Tipo de pedido inválido. Opciones: ${Object.values(ORDER_TYPES).join(', ')}`);
  }
  
  if (data.order_type === ORDER_TYPES.DELIVERY && !data.delivery_address) {
    errors.push('Para pedidos a domicilio, la dirección es requerida');
  }
  
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push('El pedido debe contener al menos un producto');
  }
  
  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    if (!item.product_id || !item.name || !item.quantity || item.quantity <= 0) {
      errors.push(`Item ${i}: producto, nombre y cantidad requeridos`);
    }
    if (item.price === undefined || item.price < 0) {
      errors.push(`Item ${i}: precio requerido y debe ser mayor a 0`);
    }
  }
  
  if (data.payment_method && !Object.values(PAYMENT_METHODS).includes(data.payment_method)) {
    errors.push(`Método de pago inválido. Opciones: ${Object.values(PAYMENT_METHODS).join(', ')}`);
  }
  
  if (data.subtotal < 0) {
    errors.push('El subtotal no puede ser negativo');
  }
  
  if (data.total < 0) {
    errors.push('El total no puede ser negativo');
  }
  
  return { valid: errors.length === 0, errors };
};

/**
 * Calcula el total de un pedido
 * @param {Object} data - Datos del pedido
 * @returns {Object} { subtotal, total }
 */
const calculateTotals = (data) => {
  const subtotal = data.items.reduce((sum, item) => {
    let itemTotal = item.price * item.quantity;
    // Sumar modificadores/extras
    if (item.modifiers && Array.isArray(item.modifiers)) {
      itemTotal += item.modifiers.reduce((modSum, mod) => modSum + (mod.price || 0), 0);
    }
    return sum + itemTotal;
  }, 0);
  
  const total = subtotal + (data.delivery_cost || 0) - (data.discount || 0);
  
  return { subtotal, total };
};

// ======================================================
// MODELO ORDER - CRUD
// ======================================================

/**
 * Genera el número de pedido secuencial por sede
 * @param {string} branchId - ID de la sede
 * @returns {Promise<number>} Número de pedido
 */
const generateOrderNumber = async (branchId) => {
  const query = `
    SELECT COALESCE(MAX(order_number), 0) + 1 as next_number
    FROM orders 
    WHERE branch_id = $1 AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
  `;
  const result = await readQuery(query, [branchId]);
  return result.rows[0].next_number;
};

/**
 * Crea un nuevo pedido
 * @param {Object} data - Datos del pedido
 * @returns {Promise<Object>} Pedido creado
 */
const create = async (data) => {
  // Calcular totals si no vienen
  const totals = calculateTotals(data);
  const subtotal = data.subtotal || totals.subtotal;
  const total = data.total || totals.total;
  
  const orderData = {
    ...data,
    subtotal,
    total,
  };
  
  const validation = validateOrder(orderData);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }
  
  const id = uuidv4();
  const orderNumber = await generateOrderNumber(data.branch_id);
  
  const query = `
    INSERT INTO orders (
      id, tenant_id, branch_id, table_id, order_type, order_number,
      customer_name, customer_phone, customer_email, delivery_address,
      delivery_latitude, delivery_longitude, items, subtotal,
      delivery_cost, discount, total, payment_method, payment_status,
      order_status, notes, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, NOW(), NOW())
    RETURNING *
  `;
  
  const params = [
    id,
    data.tenant_id,
    data.branch_id,
    data.table_id || null,
    data.order_type,
    orderNumber,
    data.customer_name.trim(),
    data.customer_phone,
    data.customer_email || null,
    data.delivery_address || null,
    data.delivery_latitude || null,
    data.delivery_longitude || null,
    data.items,
    subtotal,
    data.delivery_cost || 0,
    data.discount || 0,
    total,
    data.payment_method || PAYMENT_METHODS.CASH,
    PAYMENT_STATUS.PENDING,
    ORDER_STATUS.PENDING,
    data.notes || null,
  ];
  
  const result = await writeQuery(query, params);
  return result.rows[0];
};

/**
 * Busca un pedido por ID
 * @param {string} id - ID del pedido
 * @returns {Promise<Object|null>} Pedido encontrado o null
 */
const findById = async (id) => {
  const query = `
    SELECT o.*, b.name as branch_name, b.whatsapp_number as branch_whatsapp,
           t.name as tenant_name, t.whatsapp_number as tenant_whatsapp
    FROM orders o
    LEFT JOIN branches b ON o.branch_id = b.id
    LEFT JOIN tenants t ON o.tenant_id = t.id
    WHERE o.id = $1
  `;
  const result = await readQuery(query, [id]);
  return result.rows[0] || null;
};

/**
 * Busca pedidos por sede
 * @param {string} branchId - ID de la sede
 * @param {Object} options - Opciones de filtro y paginación
 * @returns {Promise<Object>} { data, total, page, limit }
 */
const findByBranch = async (branchId, options = {}) => {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 20;
  const offset = (page - 1) * limit;
  
  let query = 'SELECT * FROM orders WHERE branch_id = $1';
  const params = [branchId];
  let paramIndex = 2;
  
  if (options.order_status) {
    query += ` AND order_status = $${paramIndex}`;
    params.push(options.order_status);
    paramIndex++;
  }
  
  if (options.order_type) {
    query += ` AND order_type = $${paramIndex}`;
    params.push(options.order_type);
    paramIndex++;
  }
  
  if (options.start_date) {
    query += ` AND created_at >= $${paramIndex}`;
    params.push(options.start_date);
    paramIndex++;
  }
  
  if (options.end_date) {
    query += ` AND created_at <= $${paramIndex}`;
    params.push(options.end_date);
    paramIndex++;
  }
  
  query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);
  
  const result = await readQuery(query, params);
  
  // Contar total
  let countQuery = 'SELECT COUNT(*) FROM orders WHERE branch_id = $1';
  const countParams = [branchId];
  let countIndex = 2;
  
  if (options.order_status) {
    countQuery += ` AND order_status = $${countIndex}`;
    countParams.push(options.order_status);
    countIndex++;
  }
  
  if (options.start_date) {
    countQuery += ` AND created_at >= $${countIndex}`;
    countParams.push(options.start_date);
    countIndex++;
  }
  
  if (options.end_date) {
    countQuery += ` AND created_at <= $${countIndex}`;
    countParams.push(options.end_date);
    countIndex++;
  }
  
  const countResult = await readQuery(countQuery, countParams);
  const total = parseInt(countResult.rows[0].count);
  
  return {
    data: result.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Busca pedidos por mesa
 * @param {string} tableId - ID de la mesa
 * @param {Object} options - Opciones (incluir activos)
 * @returns {Promise<Array>} Lista de pedidos
 */
const findByTable = async (tableId, options = {}) => {
  let query = `
    SELECT * FROM orders 
    WHERE table_id = $1 AND order_type = 'table'
  `;
  const params = [tableId];
  
  if (options.onlyActive === true) {
    query += ` AND order_status NOT IN ('delivered', 'cancelled')`;
  }
  
  query += ' ORDER BY created_at DESC';
  
  const result = await readQuery(query, params);
  return result.rows;
};

/**
 * Busca pedidos por cliente (teléfono)
 * @param {string} phone - Teléfono del cliente
 * @param {string} tenantId - ID del restaurante
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Array>} Lista de pedidos
 */
const findByCustomer = async (phone, tenantId, limit = 10) => {
  const query = `
    SELECT o.*, b.name as branch_name
    FROM orders o
    LEFT JOIN branches b ON o.branch_id = b.id
    WHERE o.customer_phone = $1 AND o.tenant_id = $2
    ORDER BY o.created_at DESC
    LIMIT $3
  `;
  const result = await readQuery(query, [phone, tenantId, limit]);
  return result.rows;
};

/**
 * Actualiza el estado de un pedido
 * @param {string} id - ID del pedido
 * @param {string} status - Nuevo estado
 * @returns {Promise<Object|null>} Pedido actualizado
 */
const updateStatus = async (id, status) => {
  if (!Object.values(ORDER_STATUS).includes(status)) {
    throw new Error(`Estado inválido: ${status}`);
  }
  
  const query = `
    UPDATE orders 
    SET order_status = $1, updated_at = NOW(),
        completed_at = CASE WHEN $1 = 'delivered' THEN NOW() ELSE completed_at END
    WHERE id = $2
    RETURNING *
  `;
  const result = await writeQuery(query, [status, id]);
  return result.rows[0] || null;
};

/**
 * Actualiza el estado de pago de un pedido
 * @param {string} id - ID del pedido
 * @param {string} paymentStatus - Nuevo estado de pago
 * @returns {Promise<Object|null>} Pedido actualizado
 */
const updatePaymentStatus = async (id, paymentStatus) => {
  if (!Object.values(PAYMENT_STATUS).includes(paymentStatus)) {
    throw new Error(`Estado de pago inválido: ${paymentStatus}`);
  }
  
  const query = `
    UPDATE orders 
    SET payment_status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  const result = await writeQuery(query, [paymentStatus, id]);
  return result.rows[0] || null;
};

/**
 * Cancela un pedido
 * @param {string} id - ID del pedido
 * @param {string} reason - Razón de cancelación (opcional)
 * @returns {Promise<Object|null>} Pedido cancelado
 */
const cancel = async (id, reason = null) => {
  const query = `
    UPDATE orders 
    SET order_status = 'cancelled', updated_at = NOW(),
        notes = CASE WHEN $2 IS NOT NULL THEN CONCAT(notes, ' Cancelado: ', $2) ELSE notes END
    WHERE id = $1
    RETURNING *
  `;
  const result = await writeQuery(query, [id, reason]);
  return result.rows[0] || null;
};

// ======================================================
// ESTADÍSTICAS
// ======================================================

/**
 * Obtiene estadísticas de pedidos para una sede
 * @param {string} branchId - ID de la sede
 * @param {Date} startDate - Fecha inicio
 * @param {Date} endDate - Fecha fin
 * @returns {Promise<Object>} Estadísticas
 */
const getStats = async (branchId, startDate, endDate) => {
  const query = `
    SELECT 
      COUNT(*) as total_orders,
      SUM(total) as total_revenue,
      AVG(total) as avg_order_value,
      COUNT(CASE WHEN order_status = 'delivered' THEN 1 END) as completed_orders,
      COUNT(CASE WHEN order_status = 'cancelled' THEN 1 END) as cancelled_orders,
      COUNT(CASE WHEN order_type = 'delivery' THEN 1 END) as delivery_orders,
      COUNT(CASE WHEN order_type = 'table' THEN 1 END) as table_orders,
      COUNT(CASE WHEN order_type = 'takeaway' THEN 1 END) as takeaway_orders
    FROM orders
    WHERE branch_id = $1 
      AND created_at >= $2 
      AND created_at <= $3
      AND order_status != 'pending'
  `;
  const result = await readQuery(query, [branchId, startDate, endDate]);
  return result.rows[0];
};

/**
 * Obtiene los productos más pedidos
 * @param {string} branchId - ID de la sede
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Array>} Productos más pedidos
 */
const getTopProducts = async (branchId, limit = 10) => {
  const query = `
    SELECT 
      jsonb_array_elements(items)->>'name' as product_name,
      SUM((jsonb_array_elements(items)->>'quantity')::int) as total_quantity,
      COUNT(DISTINCT o.id) as order_count
    FROM orders o
    CROSS JOIN jsonb_array_elements(o.items)
    WHERE o.branch_id = $1 
      AND o.order_status IN ('delivered', 'confirmed', 'preparing')
    GROUP BY product_name
    ORDER BY total_quantity DESC
    LIMIT $2
  `;
  const result = await readQuery(query, [branchId, limit]);
  return result.rows;
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  // Constantes
  ORDER_STATUS,
  ORDER_TYPES,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  
  // Validación
  validateOrder,
  calculateTotals,
  
  // CRUD
  create,
  findById,
  findByBranch,
  findByTable,
  findByCustomer,
  updateStatus,
  updatePaymentStatus,
  cancel,
  generateOrderNumber,
  
  // Estadísticas
  getStats,
  getTopProducts,
};