/**
 * ======================================================
 * ARCHIVO: api.test.js
 * UBICACIÓN: menu-qr-system/backend/tests/integration/api.test.js
 * FASE: F0
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 09:00
 *
 * 🎯 PROPÓSITO:
 * Pruebas de integración para los endpoints principales
 * de la API. Verifica que las rutas respondan correctamente
 * y que la autenticación funcione como se espera.
 *
 * 📦 DEPENDENCIAS:
 * - supertest: Cliente HTTP para pruebas
 * - ../src/app: Aplicación Express
 *
 * 🔗 RELACIONES:
 * - Importa de: supertest, ../src/app
 * - Es ejecutado por: npm test
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 09:00
 *    ✅ Creación inicial del archivo
 *    ✅ Prueba de health check
 *    ✅ Prueba de rutas públicas
 *    ✅ Prueba de autenticación
 *    ✅ Configuración de supertest
 * ======================================================
 */

const request = require('supertest');
const app = require('../../src/app');

// ======================================================
// PRUEBAS DE HEALTH CHECK
// ======================================================

describe('Health Check Endpoints', () => {
  
  test('GET /health should return 200 and healthy status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('timestamp');
  });
  
  test('GET /ready should return 200 and ready status', async () => {
    const response = await request(app)
      .get('/ready')
      .expect(200);
    
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).tohaveProperty('status', 'ready');
  });
});

// ======================================================
// PRUEBAS DE RUTAS PÚBLICAS
// ======================================================

describe('Public Routes', () => {
  
  describe('GET /api/:slug/menu', () => {
    
    test('should return 404 for non-existent restaurant', async () => {
      const response = await request(app)
        .get('/api/restaurante-inexistente/menu')
        .expect(404);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('GET /api/branch/:branchId/status', () => {
    
    test('should return 404 for non-existent branch', async () => {
      const response = await request(app)
        .get('/api/branch/00000000-0000-0000-0000-000000000000/status')
        .expect(404);
      
      expect(response.body).toHaveProperty('success', false);
    });
  });
});

// ======================================================
// PRUEBAS DE ERROR 404
// ======================================================

describe('404 Not Found', () => {
  
  test('should return 404 for non-existent route', async () => {
    const response = await request(app)
      .get('/ruta-que-no-existe')
      .expect(404);
    
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
  });
  
  test('should return 404 for non-existent API route', async () => {
    const response = await request(app)
      .get('/api/endpoint-inexistente')
      .expect(404);
    
    expect(response.body).toHaveProperty('success', false);
  });
});

// ======================================================
// PRUEBAS DE AUTENTICACIÓN
// ======================================================

describe('Authentication', () => {
  
  describe('POST /api/admin/auth/login', () => {
    
    test('should return 400 when email and slug are missing', async () => {
      const response = await request(app)
        .post('/api/admin/auth/login')
        .send({ password: 'test123' })
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
    });
    
    test('should return 401 with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/admin/auth/login')
        .send({ 
          email: 'no-existe@test.com',
          password: 'wrongpassword' 
        })
        .expect(401);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('POST /api/admin/auth/register', () => {
    
    test('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/admin/auth/register')
        .send({ 
          email: 'test@test.com',
          password: 'test123' 
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
    });
  });
});

// ======================================================
// EXPORTACIONES (ninguna para pruebas)
// ======================================================