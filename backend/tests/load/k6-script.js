/**
 * ======================================================
 * ARCHIVO: k6-script.js
 * UBICACIÓN: menu-qr-system/backend/tests/load/k6-script.js
 * FASE: F5
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 09:30
 *
 * 🎯 PROPÓSITO:
 * Script de pruebas de carga para k6 que simula
 * múltiples usuarios concurrentes accediendo al menú,
 * creando pedidos, y verificando el rendimiento del
 * sistema bajo alta carga.
 *
 * 📦 DEPENDENCIAS:
 * - k6: Herramienta de pruebas de carga
 *
 * 🔗 RELACIONES:
 * - Ejecutado por: k6 run k6-script.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 09:30
 *    ✅ Creación inicial del archivo
 *    ✅ Configuración de stages de carga
 *    ✅ Prueba de endpoint de menú
 *    ✅ Prueba de creación de pedidos
 *    ✅ Métricas y umbrales de rendimiento
 * ======================================================
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter, Trend } from 'k6/metrics';

// ======================================================
// CONFIGURACIÓN
// ======================================================

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3005';
const TEST_SLUG = __ENV.TEST_SLUG || 'restaurante-test';
const TEST_BRANCH_ID = __ENV.TEST_BRANCH_ID || 'test-branch-id';

// ======================================================
// MÉTRICAS PERSONALIZADAS
// ======================================================

const errorRate = new Rate('error_rate');
const orderSuccessRate = new Rate('order_success_rate');
const menuLatency = new Trend('menu_latency', true);
const orderLatency = new Trend('order_latency', true);

// ======================================================
// OPCIONES DE CARGA
// ======================================================

export const options = {
  stages: [
    { duration: '1m', target: 50 },    // Subir a 50 usuarios
    { duration: '2m', target: 200 },   // Subir a 200 usuarios
    { duration: '3m', target: 500 },   // Subir a 500 usuarios
    { duration: '2m', target: 1000 },  // Subir a 1000 usuarios
    { duration: '3m', target: 1000 },  // Mantener en 1000
    { duration: '1m', target: 0 },     // Bajar a 0
  ],
  
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% de requests < 2s
    http_req_failed: ['rate<0.01'],    // Menos de 1% de errores
    error_rate: ['rate<0.05'],          // Menos de 5% de errores
    menu_latency: ['p(95)<1000'],       // Latencia de menú < 1s
    order_latency: ['p(95)<500'],       // Latencia de pedido < 500ms
  },
};

// ======================================================
// FUNCIONES AUXILIARES
// ======================================================

/**
 * Genera datos aleatorios para pedido
 * @returns {Object} Datos del pedido
 */
function generateRandomOrder() {
  return {
    branch_id: TEST_BRANCH_ID,
    customer_name: `Test User ${Math.floor(Math.random() * 1000)}`,
    customer_phone: `300${Math.floor(Math.random() * 10000000)}`,
    order_type: 'delivery',
    delivery_address: `Calle ${Math.floor(Math.random() * 100)} #${Math.floor(Math.random() * 50)}-${Math.floor(Math.random() * 50)}`,
    items: [
      {
        product_id: 'test-product-1',
        quantity: Math.floor(Math.random() * 3) + 1,
        price: 15000,
      },
      {
        product_id: 'test-product-2',
        quantity: Math.floor(Math.random() * 2) + 1,
        price: 8000,
      }
    ],
    payment_method: 'cash',
  };
}

// ======================================================
// ESCENARIOS DE PRUEBA
// ======================================================

// Escenario 1: Usuario normal - ver menú y pedir
export default function () {
  // Simular usuario real
  const randomDelay = Math.random() * 2;
  
  // 1. Obtener menú
  const menuResponse = http.get(`${BASE_URL}/api/${TEST_SLUG}/menu`);
  
  const menuCheck = check(menuResponse, {
    'menu status is 200': (r) => r.status === 200,
    'menu has success true': (r) => r.json('success') === true,
  });
  
  errorRate.add(!menuCheck);
  menuLatency.add(menuResponse.timings.duration);
  
  // Pausa para simular lectura del menú
  sleep(randomDelay);
  
  // 2. Crear pedido (solo si el menú fue exitoso)
  if (menuResponse.status === 200) {
    const orderData = generateRandomOrder();
    
    const orderResponse = http.post(`${BASE_URL}/api/order`, JSON.stringify(orderData), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    const orderCheck = check(orderResponse, {
      'order status is 201': (r) => r.status === 201,
      'order has success true': (r) => r.json('success') === true,
    });
    
    orderSuccessRate.add(orderCheck);
    errorRate.add(!orderCheck);
    orderLatency.add(orderResponse.timings.duration);
  }
  
  // Pausa entre acciones
  sleep(1);
}

// ======================================================
// ESCENARIO ESPECÍFICO: SOLO LECTURA (MENÚ)
// ======================================================

export function onlyRead() {
  const response = http.get(`${BASE_URL}/api/${TEST_SLUG}/menu`);
  
  check(response, {
    'menu status is 200': (r) => r.status === 200,
    'menu response time < 1s': (r) => r.timings.duration < 1000,
  });
  
  sleep(0.5);
}

// ======================================================
// ESCENARIO ESPECÍFICO: CREACIÓN DE PEDIDOS
// ======================================================

export function onlyWrite() {
  const orderData = generateRandomOrder();
  
  const response = http.post(`${BASE_URL}/api/order`, JSON.stringify(orderData), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(response, {
    'order status is 201': (r) => r.status === 201,
    'order response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}

// ======================================================
// ESCENARIO DE ESTRÉS (MÁXIMA CARGA)
// ======================================================

export function stress() {
  const startTime = new Date();
  
  // Múltiples peticiones por usuario
  const menuResponse = http.get(`${BASE_URL}/api/${TEST_SLUG}/menu`);
  const featuredResponse = http.get(`${BASE_URL}/api/${TEST_SLUG}/featured`);
  
  check(menuResponse, {
    'stress menu status ok': (r) => r.status === 200,
  });
  
  check(featuredResponse, {
    'stress featured status ok': (r) => r.status === 200,
  });
  
  const duration = new Date() - startTime;
  
  if (duration < 2000) {
    // Si responde rápido, hacer más peticiones
    http.get(`${BASE_URL}/api/branch/${TEST_BRANCH_ID}/status`);
  }
  
  sleep(0.2);
}