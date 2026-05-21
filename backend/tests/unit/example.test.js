/**
 * ======================================================
 * ARCHIVO: example.test.js
 * UBICACIÓN: menu-qr-system/backend/tests/unit/example.test.js
 * FASE: F0
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 08:30
 *
 * 🎯 PROPÓSITO:
 * Pruebas unitarias de ejemplo para demostrar la
 * configuración de Jest y verificar que el entorno
 * de pruebas funciona correctamente.
 *
 * 📦 DEPENDENCIAS:
 * - jest: Framework de pruebas
 *
 * 🔗 RELACIONES:
 * - Importa de: ninguna
 * - Es ejecutado por: npm test
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 08:30
 *    ✅ Creación inicial del archivo
 *    ✅ Prueba de ejemplo básica
 *    ✅ Prueba de suma como demostración
 * ======================================================
 */

// ======================================================
// PRUEBAS DE EJEMPLO
// ======================================================

describe('Example Test Suite', () => {
  
  test('should pass a basic assertion', () => {
    expect(true).toBe(true);
  });
  
  test('should add two numbers correctly', () => {
    const sum = (a, b) => a + b;
    expect(sum(2, 3)).toBe(5);
    expect(sum(-1, 1)).toBe(0);
  });
  
  test('should work with strings', () => {
    const greeting = 'Hello World';
    expect(greeting).toContain('World');
    expect(greeting.length).toBeGreaterThan(0);
  });
  
  test('should handle async operations', async () => {
    const asyncFunction = async () => {
      return 'resolved';
    };
    
    const result = await asyncFunction();
    expect(result).toBe('resolved');
  });
});

// ======================================================
// PRUEBA DE LA FUNCIÓN DE FORMATO DE MONEDA
// ======================================================

describe('Currency Formatter', () => {
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  test('should format Colombian pesos correctly', () => {
    expect(formatCurrency(10000)).toMatch(/10\.?000/);
    expect(formatCurrency(25000)).toMatch(/25\.?000/);
  });
  
  test('should handle zero', () => {
    expect(formatCurrency(0)).toMatch(/0/);
  });
});

// ======================================================
// EXPORTACIONES (ninguna para pruebas)
// ======================================================