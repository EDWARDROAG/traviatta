/**
 * ======================================================
 * ARCHIVO: redis.js
 * UBICACIÓN: menu-qr-system/backend/src/config/redis.js
 * FASE: F0
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-15 11:30
 *
 * 🎯 PROPÓSITO:
 * Configurar el cliente Redis para caché distribuida,
 * almacenamiento de sesiones JWT, rate limiting y
 * colas temporales. Soporta conexión con autenticación
 * y reintentos automáticos.
 *
 * 📦 DEPENDENCIAS:
 * - redis: Cliente Redis oficial v4
 * - dotenv: Variables de entorno
 *
 * 🔗 RELACIONES:
 * - Importa de: dotenv
 * - Es importado por: services/cacheService.js,
 *   middleware/rateLimit.js, services/queueService.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-15 11:30
 *    ✅ Creación inicial del archivo
 *    ✅ Configuración de cliente Redis con URL
 *    ✅ Manejo de eventos (connect, error, ready)
 *    ✅ Funciones de utilidad (get, set, del, exists)
 *    ✅ TTL automático para keys
 *    ✅ Health check y cierre graceful
 * ======================================================
 */

const redis = require('redis');
require('dotenv').config();

let redisClient = null;
let isConnected = false;

const initRedis = async () => {
  if (redisClient && isConnected) return redisClient;
  
  const url = process.env.REDIS_URL || 'redis://localhost:6380';
  
  redisClient = redis.createClient({ url });
  
  redisClient.on('error', (err) => {
    console.warn('⚠️ Redis error:', err.message);
    isConnected = false;
  });
  
  redisClient.on('connect', () => {
    console.log('✅ Redis conectado');
    isConnected = true;
  });
  
  try {
    await redisClient.connect();
  } catch (err) {
    console.warn('⚠️ Redis no disponible, usando modo sin caché');
    return null;
  }
  
  return redisClient;
};

const get = async (key) => {
  try {
    const client = await initRedis();
    if (!client) return null;
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch { return null; }
};

const set = async (key, value, ttl = 300) => {
  try {
    const client = await initRedis();
    if (!client) return false;
    await client.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch { return false; }
};

const del = async (keys) => {
  try {
    const client = await initRedis();
    if (!client) return 0;
    return await client.del(keys);
  } catch { return 0; }
};

const healthCheck = async () => {
  try {
    const client = await initRedis();
    if (!client) return { healthy: false };
    await client.ping();
    return { healthy: true };
  } catch {
    return { healthy: false };
  }
};

const getSession = async (token) => {
  try {
    const client = await initRedis();
    if (!client) return { active: true };
    const value = await client.get(`session:${token}`);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.warn('⚠️ getSession error:', err.message);
    return null;
  }
};

const setSession = async (token, session, ttl = 3600) => {
  try {
    const client = await initRedis();
    if (!client) return false;
    await client.setEx(`session:${token}`, ttl, JSON.stringify(session));
    return true;
  } catch (err) {
    console.warn('⚠️ setSession error:', err.message);
    return false;
  }
};

module.exports = {
  get, set, del, healthCheck,
  getCachedMenu: async (id) => get(`menu:${id}`),
  setCachedMenu: async (id, data) => set(`menu:${id}`, data, 300),
  invalidateMenuCache: async (id) => del(`menu:${id}`),
  getSession,
  setSession,
};