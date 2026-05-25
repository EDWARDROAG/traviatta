/**
 * ======================================================
 * ARCHIVO: Order.js
 * UBICACIÓN: menu-qr-system/backend/src/models/Order.js
 * FASE: F1
 * VERSIÓN: 1.3
 * ÚLTIMA ACTUALIZACIÓN: 2026-05-23 12:00
 *
 * 🎯 PROPÓSITO:
 * Modelo de datos para la gestión de pedidos.
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.3 - 2026-05-23 12:00
 *    ✅ Agregada función getGlobalTopProducts
 *    ✅ Agregada función getRecentOrders
 * ------------------------------------------------------
 * 1.2 - 2026-05-23 10:30
 *    ✅ Agregada función getGlobalStats
 * ------------------------------------------------------
 * 1.1 - 2026-05-22 19:15
 *    ✅ Serialización JSONB corregida
 * ------------------------------------------------------
 * 1.0 - 2026-01-15 15:30
 *    ✅ Creación inicial del archivo
 * ======================================================
 */

const { writeQuery, readQuery, transaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// ======================================================
// CONSTANTES
// ======================================================

const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

const ORDER_TYPES = {
  DELIVERY: 'delivery',
  TAKEAWAY: 'takeaway',
  TABLE: 'table',
};

const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  TRANSFER: 'transfer',
  NEQUI: 'nequi',
  DAVIPLATA: 'daviplata',
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
};

// ======================================================
// VALIDACIONES
// ======================================================

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
  
  if (!data.items || data.items.length === 0) {
    errors.push('El pedido debe contener al menos un producto');
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

const calculateTotals = (data) => {
  // Si data.items es string, parsearlo primero
  let items = data.items;
  if (typeof items === 'string') {
    try {
      items = JSON.parse(items);
    } catch (e) {
      items = [];
    }
  }
  
  const subtotal = items.reduce((sum, item) => {
    let itemTotal = item.price * item.quantity;
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
 * Crea un nuevo pedido - CORREGIDO
 */
const create = async (data) => {
  // 🔧 CORRECCIÓN CRÍTICA: Asegurar que items sea string JSON
  let itemsForDb = data.items;
  if (typeof itemsForDb !== 'string') {
    itemsForDb = JSON.stringify(itemsForDb);
  }
  
  // Preparar datos para validación (usando el objeto original si existe)
  const dataForValidation = {
    ...data,
    items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items,
  };
  
  const totals = calculateTotals(dataForValidation);
  const subtotal = data.subtotal || totals.subtotal;
  const total = data.total || totals.total;
  
  const orderData = {
    ...dataForValidation,
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
    itemsForDb,
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

/**
 * 🔧 NUEVA FUNCIÓN: getGlobalStats
 * Obtiene estadísticas globales de todas las sedes de un tenant
 */
const getGlobalStats = async (tenantId, startDate, endDate) => {
  const query = `
    SELECT 
      COUNT(DISTINCT o.id) as total_orders,
      SUM(o.total) as total_revenue,
      AVG(o.total) as avg_order_value,
      COUNT(CASE WHEN o.order_status = 'delivered' THEN 1 END) as completed_orders,
      COUNT(CASE WHEN o.order_status = 'cancelled' THEN 1 END) as cancelled_orders,
      COUNT(CASE WHEN o.order_type = 'delivery' THEN 1 END) as delivery_orders,
      COUNT(CASE WHEN o.order_type = 'table' THEN 1 END) as table_orders,
      COUNT(CASE WHEN o.order_type = 'takeaway' THEN 1 END) as takeaway_orders
    FROM orders o
    JOIN branches b ON o.branch_id = b.id
    WHERE b.tenant_id = $1 
      AND o.created_at >= $2 
      AND o.created_at <= $3
  `;
  const result = await readQuery(query, [tenantId, startDate, endDate]);
  
  const row = result.rows[0];
  
  // Obtener productos más vendidos a nivel global
  const topProductsQuery = `
    SELECT 
      jsonb_array_elements(o.items)->>'name' as product_name,
      SUM((jsonb_array_elements(o.items)->>'quantity')::int) as total_quantity,
      COUNT(DISTINCT o.id) as order_count
    FROM orders o
    JOIN branches b ON o.branch_id = b.id
    CROSS JOIN jsonb_array_elements(o.items)
    WHERE b.tenant_id = $1 
      AND o.created_at >= $2 
      AND o.created_at <= $3
      AND o.order_status IN ('delivered', 'confirmed', 'preparing')
    GROUP BY product_name
    ORDER BY total_quantity DESC
    LIMIT 5
  `;
  
  const topResult = await readQuery(topProductsQuery, [tenantId, startDate, endDate]);
  
  return {
    total_orders: parseInt(row?.total_orders) || 0,
    total_revenue: parseFloat(row?.total_revenue) || 0,
    avg_order_value: parseFloat(row?.avg_order_value) || 0,
    completed_orders: parseInt(row?.completed_orders) || 0,
    cancelled_orders: parseInt(row?.cancelled_orders) || 0,
    delivery_orders: parseInt(row?.delivery_orders) || 0,
    table_orders: parseInt(row?.table_orders) || 0,
    takeaway_orders: parseInt(row?.takeaway_orders) || 0,
    top_products: topResult.rows || [],
  };
};

/**
 * 🔧 NUEVA FUNCIÓN: getGlobalTopProducts
 * Obtiene productos más vendidos a nivel global
 */
const getGlobalTopProducts = async (tenantId, limit = 5) => {
  const query = `
    SELECT 
      jsonb_array_elements(o.items)->>'name' as product_name,
      SUM((jsonb_array_elements(o.items)->>'quantity')::int) as total_quantity,
      COUNT(DISTINCT o.id) as order_count
    FROM orders o
    JOIN branches b ON o.branch_id = b.id
    CROSS JOIN jsonb_array_elements(o.items)
    WHERE b.tenant_id = $1 
      AND o.order_status IN ('delivered', 'confirmed', 'preparing')
    GROUP BY product_name
    ORDER BY total_quantity DESC
    LIMIT $2
  `;
  const result = await readQuery(query, [tenantId, limit]);
  return result.rows;
};

/**
 * 🔧 NUEVA FUNCIÓN: getRecentOrders
 * Obtiene pedidos recientes de todas las sedes del tenant
 */
const getRecentOrders = async (tenantId, limit = 5) => {
  const query = `
    SELECT 
      o.id, o.order_number, o.customer_name, o.total, o.order_status, o.created_at,
      b.name as branch_name
    FROM orders o
    JOIN branches b ON o.branch_id = b.id
    WHERE b.tenant_id = $1
    ORDER BY o.created_at DESC
    LIMIT $2
  `;
  const result = await readQuery(query, [tenantId, limit]);
  return result.rows;
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  ORDER_STATUS,
  ORDER_TYPES,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  validateOrder,
  calculateTotals,
  create,
  findById,
  findByBranch,
  findByTable,
  findByCustomer,
  updateStatus,
  updatePaymentStatus,
  cancel,
  generateOrderNumber,
  getStats,
  getTopProducts,
  getGlobalStats,
  getGlobalTopProducts,
  getRecentOrders,
};