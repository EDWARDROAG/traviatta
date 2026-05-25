/**
 * ======================================================
 * ARCHIVO: dashboardController.js
 * UBICACIÓN: menu-qr-system/backend/src/controllers/admin/dashboardController.js
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2026-05-22
 *
 * Controlador para estadísticas del dashboard del panel
 * administrativo: métricas resumidas, ingresos y productos
 * más vendidos por restaurante.
 * ======================================================
 */

const Order = require('../../models/Order');
const Branch = require('../../models/Branch');
const logger = require('../../utils/logger');

const sendSuccess = (res, data, status = 200) => {
  res.status(status).json({ success: true, data, timestamp: new Date().toISOString() });
};

const sendError = (res, message, status = 500) => {
  res.status(status).json({ success: false, error: message, timestamp: new Date().toISOString() });
};

/**
 * GET /admin/dashboard/stats
 * Devuelve métricas agregadas para el tenant (por defecto: día actual)
 */
const getStats = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { date_from, date_to } = req.query;

    // Obtener sedes del tenant
    const branches = await Branch.findByTenant(tenantId, {});
    if (!branches || branches.length === 0) {
      return sendSuccess(res, {
        total_orders: 0,
        total_revenue: 0,
        avg_order_value: 0,
        completed_orders: 0,
        cancelled_orders: 0,
        delivery_orders: 0,
        table_orders: 0,
        takeaway_orders: 0,
      });
    }

    // Calcular rango de fechas
    let startDate, endDate;
    if (date_from && date_to) {
      startDate = new Date(date_from);
      endDate = new Date(date_to);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    // Agregar estadísticas por sede
    const aggregate = {
      total_orders: 0,
      total_revenue: 0,
      avg_order_value: 0,
      completed_orders: 0,
      cancelled_orders: 0,
      delivery_orders: 0,
      table_orders: 0,
      takeaway_orders: 0,
    };

    let branchesCount = 0;

    for (const b of branches) {
      try {
        const stats = await Order.getStats(b.id, startDate, endDate);
        if (stats) {
          aggregate.total_orders += parseInt(stats.total_orders || 0);
          aggregate.total_revenue += parseFloat(stats.total_revenue || 0);
          aggregate.completed_orders += parseInt(stats.completed_orders || 0);
          aggregate.cancelled_orders += parseInt(stats.cancelled_orders || 0);
          aggregate.delivery_orders += parseInt(stats.delivery_orders || 0);
          aggregate.table_orders += parseInt(stats.table_orders || 0);
          aggregate.takeaway_orders += parseInt(stats.takeaway_orders || 0);
          branchesCount++;
        }
      } catch (err) {
        logger.warn(`Failed to aggregate stats for branch ${b.id}: ${err.message}`);
      }
    }

    aggregate.avg_order_value = aggregate.total_orders > 0 ? (aggregate.total_revenue / aggregate.total_orders) : 0;

    sendSuccess(res, { ...aggregate, branches: branches.length });
  } catch (error) {
    logger.error('Error in dashboard.getStats:', error.message);
    sendError(res, error.message);
  }
};

/**
 * GET /admin/dashboard/revenue
 * Retorna ingresos por período (acepta date_from/date_to)
 */
const getRevenue = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { date_from, date_to } = req.query;

    const branches = await Branch.findByTenant(tenantId, {});
    if (!branches || branches.length === 0) return sendSuccess(res, { total_revenue: 0 });

    let startDate = date_from ? new Date(date_from) : (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })();
    let endDate = date_to ? new Date(date_to) : (() => { const d = new Date(); d.setHours(23,59,59,999); return d; })();

    let totalRevenue = 0;
    for (const b of branches) {
      try {
        const stats = await Order.getStats(b.id, startDate, endDate);
        totalRevenue += parseFloat(stats.total_revenue || 0);
      } catch (err) {
        logger.warn(`Revenue aggregate failed for branch ${b.id}: ${err.message}`);
      }
    }

    sendSuccess(res, { total_revenue: totalRevenue });
  } catch (error) {
    logger.error('Error in dashboard.getRevenue:', error.message);
    sendError(res, error.message);
  }
};

/**
 * GET /admin/dashboard/top-products
 * Retorna productos más vendidos agregados por tenant
 */
const getTopProducts = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const limit = parseInt(req.query.limit) || 10;

    const branches = await Branch.findByTenant(tenantId, {});
    if (!branches || branches.length === 0) return sendSuccess(res, { top_products: [] });

    const map = new Map();

    for (const b of branches) {
      try {
        const list = await Order.getTopProducts(b.id, limit);
        for (const p of list) {
          const name = p.product_name || p.product_name;
          const qty = parseInt(p.total_quantity || 0);
          const ordersCount = parseInt(p.order_count || 0);
          if (!map.has(name)) map.set(name, { product_name: name, total_quantity: 0, order_count: 0 });
          const entry = map.get(name);
          entry.total_quantity += qty;
          entry.order_count += ordersCount;
          map.set(name, entry);
        }
      } catch (err) {
        logger.warn(`Top products failed for branch ${b.id}: ${err.message}`);
      }
    }

    const merged = Array.from(map.values()).sort((a, b) => b.total_quantity - a.total_quantity).slice(0, limit);

    sendSuccess(res, { top_products: merged });
  } catch (error) {
    logger.error('Error in dashboard.getTopProducts:', error.message);
    sendError(res, error.message);
  }
};

module.exports = {
  getStats,
  getRevenue,
  getTopProducts,
};
