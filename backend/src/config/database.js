/**
 * ======================================================
 * ARCHIVO: database.js
 * UBICACIÓN: menu-qr-system/backend/src/config/database.js
 * FASE: F0
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-15 11:00
 *
 * 🎯 PROPÓSITO:
 * Configurar la conexión a PostgreSQL con soporte para
 * múltiples read replicas (escalabilidad horizontal).
 * Implementa round-robin para distribuir lecturas entre
 * réplicas y canaliza escrituras al master.
 *
 * 📦 DEPENDENCIAS:
 * - pg: Cliente PostgreSQL nativo (Pool)
 * - dotenv: Variables de entorno
 *
 * 🔗 RELACIONES:
 * - Importa de: dotenv
 * - Es importado por: models/*, services/*, app.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-15 11:00
 *    ✅ Creación inicial del archivo
 *    ✅ Configuración de Pool master (escrituras)
 *    ✅ Configuración de múltiples read replicas
 *    ✅ Implementación round-robin para réplicas
 *    ✅ Health check y manejo de errores
 *    ✅ Event listeners para eventos de conexión
 * ======================================================
 */

const { Pool } = require('pg');
require('dotenv').config();

// ======================================================
// CONFIGURACIÓN BASE
// ======================================================

const dbConfig = {
  max: process.env.DB_MAX_CONNECTIONS || 20,
  idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT || 30000,
  connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT || 2000,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

// ======================================================
// POOL MASTER (Escrituras y lecturas críticas)
// ======================================================

const masterPool = new Pool({
  ...dbConfig,
  connectionString: process.env.DATABASE_URL,
});

// ======================================================
// READ REPLICAS (Solo lecturas - escalabilidad)
// ======================================================

const replicaConfigs = [];

// Replica 1
if (process.env.DATABASE_URL_REPLICA_1) {
  replicaConfigs.push({
    ...dbConfig,
    connectionString: process.env.DATABASE_URL_REPLICA_1,
    name: 'replica1',
  });
}

// Replica 2
if (process.env.DATABASE_URL_REPLICA_2) {
  replicaConfigs.push({
    ...dbConfig,
    connectionString: process.env.DATABASE_URL_REPLICA_2,
    name: 'replica2',
  });
}

// Replica 3 (opcional)
if (process.env.DATABASE_URL_REPLICA_3) {
  replicaConfigs.push({
    ...dbConfig,
    connectionString: process.env.DATABASE_URL_REPLICA_3,
    name: 'replica3',
  });
}

// Crear pools para cada réplica
const replicaPools = replicaConfigs.map(config => ({
  pool: new Pool(config),
  name: config.name,
  isHealthy: true,
}));

// ======================================================
// ROUND-ROBIN PARA REPARTIR LECTURAS
// ======================================================

let currentReplicaIndex = 0;

/**
 * Obtiene el siguiente pool de réplica en round-robin
 * @returns {Object} Pool de réplica
 */
const getNextReplica = () => {
  if (replicaPools.length === 0) {
    // Si no hay réplicas, usar master
    return { pool: masterPool, name: 'master' };
  }
  
  // Filtrar réplicas saludables
  const healthyReplicas = replicaPools.filter(r => r.isHealthy);
  
  if (healthyReplicas.length === 0) {
    console.warn('⚠️ No hay réplicas saludables, usando master para lectura');
    return { pool: masterPool, name: 'master' };
  }
  
  currentReplicaIndex = (currentReplicaIndex + 1) % healthyReplicas.length;
  return healthyReplicas[currentReplicaIndex];
};

// ======================================================
// FUNCIONES DE CONEXIÓN
// ======================================================

/**
 * Obtiene conexión para escritura (siempre master)
 * @returns {Pool} Pool de master
 */
const getWriteConnection = () => masterPool;

/**
 * Obtiene conexión para lectura (round-robin entre réplicas)
 * @returns {Pool} Pool de réplica o master
 */
const getReadConnection = () => getNextReplica().pool;

/**
 * Ejecuta una consulta en el pool especificado
 * @param {string} query - Consulta SQL
 * @param {Array} params - Parámetros de la consulta
 * @param {Pool} pool - Pool específico (opcional)
 * @returns {Promise<Object>} Resultado de la consulta
 */
const query = async (query, params = [], pool = null) => {
  const targetPool = pool || masterPool;
  const startTime = Date.now();
  
  try {
    const result = await targetPool.query(query, params);
    const duration = Date.now() - startTime;
    
    // Log de consultas lentas (> 500ms)
    if (duration > 500) {
      console.warn(`⚠️ Consulta lenta (${duration}ms): ${query.substring(0, 100)}`);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error en consulta:', error.message);
    throw error;
  }
};

/**
 * Ejecuta una consulta de lectura (usa réplica)
 * @param {string} query - Consulta SQL
 * @param {Array} params - Parámetros de la consulta
 * @returns {Promise<Object>} Resultado de la consulta
 */
const readQuery = async (query, params = []) => {
  const replica = getNextReplica();
  return query(query, params, replica.pool);
};

/**
 * Ejecuta una consulta de escritura (usa master)
 * @param {string} query - Consulta SQL
 * @param {Array} params - Parámetros de la consulta
 * @returns {Promise<Object>} Resultado de la consulta
 */
const writeQuery = async (query, params = []) => {
  return query(query, params, masterPool);
};

/**
 * Ejecuta una transacción
 * @param {Function} callback - Función que recibe el cliente de transacción
 * @returns {Promise<any>} Resultado de la transacción
 */
const transaction = async (callback) => {
  const client = await masterPool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// ======================================================
// HEALTH CHECK Y MONITOREO
// ======================================================

/**
 * Verifica la salud de todas las conexiones
 * @returns {Promise<Object>} Estado de las conexiones
 */
const healthCheck = async () => {
  const results = {
    master: { healthy: false, latency: null },
    replicas: [],
  };
  
  // Verificar master
  const masterStart = Date.now();
  try {
    await masterPool.query('SELECT 1');
    results.master.healthy = true;
    results.master.latency = Date.now() - masterStart;
  } catch (error) {
    results.master.healthy = false;
    results.master.error = error.message;
  }
  
  // Verificar réplicas
  for (const replica of replicaPools) {
    const replicaStart = Date.now();
    try {
      await replica.pool.query('SELECT 1');
      replica.isHealthy = true;
      results.replicas.push({
        name: replica.name,
        healthy: true,
        latency: Date.now() - replicaStart,
      });
    } catch (error) {
      replica.isHealthy = false;
      results.replicas.push({
        name: replica.name,
        healthy: false,
        error: error.message,
      });
    }
  }
  
  return results;
};

// ======================================================
// EVENTOS DEL POOL (Logging y monitoreo)
// ======================================================

// Eventos para master pool
masterPool.on('connect', () => {
  console.log('✅ PostgreSQL Master: Nueva conexión establecida');
});

masterPool.on('error', (err) => {
  console.error('❌ PostgreSQL Master Error:', err.message);
});

masterPool.on('acquire', () => {
  // Cliente adquirido del pool
});

masterPool.on('remove', () => {
  console.warn('⚠️ PostgreSQL Master: Cliente removido del pool');
});

// Eventos para réplicas
replicaPools.forEach(replica => {
  replica.pool.on('error', (err) => {
    console.error(`❌ PostgreSQL ${replica.name} Error:`, err.message);
    replica.isHealthy = false;
  });
  
  replica.pool.on('connect', () => {
    console.log(`✅ PostgreSQL ${replica.name}: Conexión establecida`);
    replica.isHealthy = true;
  });
});

// ======================================================
// CIERRE GRACIOSO DE CONEXIONES
// ======================================================

/**
 * Cierra todas las conexiones a la base de datos
 */
const closeConnections = async () => {
  console.log('🔄 Cerrando conexiones a PostgreSQL...');
  
  await masterPool.end();
  
  for (const replica of replicaPools) {
    await replica.pool.end();
  }
  
  console.log('✅ Conexiones PostgreSQL cerradas');
};

// Manejar cierre graceful en la aplicación
process.on('SIGTERM', async () => {
  await closeConnections();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await closeConnections();
  process.exit(0);
});

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  // Pools directos
  masterPool,
  replicaPools,
  
  // Funciones de conexión
  getWriteConnection,
  getReadConnection,
  query,
  readQuery,
  writeQuery,
  transaction,
  
  // Utilidades
  healthCheck,
  closeConnections,
};