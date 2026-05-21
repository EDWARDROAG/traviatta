/**
 * ======================================================
 * ARCHIVO: geoUtils.js
 * UBICACIÓN: menu-qr-system/backend/src/utils/geoUtils.js
 * FASE: F3
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 07:00
 *
 * 🎯 PROPÓSITO:
 * Utilidades geográficas para validación de zonas de
 * domicilio, cálculo de distancias, verificación de
 * puntos dentro de polígonos, y geocodificación.
 * Soporta múltiples tipos de zonas: radio (círculo),
 * polígono, y lista de barrios.
 *
 * 📦 DEPENDENCIAS:
 * - ninguna (cálculos matemáticos puros)
 *
 * 🔗 RELACIONES:
 * - Importa de: ninguna
 * - Es importado por: services/branchService.js,
 *   models/Branch.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 07:00
 *    ✅ Creación inicial del archivo
 *    ✅ Cálculo de distancia Haversine
 *    ✅ Verificación punto en círculo
 *    ✅ Verificación punto en polígono (ray casting)
 *    ✅ Validación de zonas de domicilio
 *    ✅ Geocodificación (placeholder)
 *    ✅ Formateo de coordenadas
 * ======================================================
 */

// ======================================================
// CONSTANTES
// ======================================================

const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_M = 6371000;

// ======================================================
// CÁLCULO DE DISTANCIAS
// ======================================================

/**
 * Calcula la distancia entre dos puntos usando la fórmula de Haversine
 * @param {number} lat1 - Latitud del punto 1
 * @param {number} lon1 - Longitud del punto 1
 * @param {number} lat2 - Latitud del punto 2
 * @param {number} lon2 - Longitud del punto 2
 * @param {string} unit - Unidad de medida ('km' o 'm')
 * @returns {number} Distancia calculada
 */
const calculateDistance = (lat1, lon1, lat2, lon2, unit = 'km') => {
  const toRad = (value) => (value * Math.PI) / 180;
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const radius = unit === 'm' ? EARTH_RADIUS_M : EARTH_RADIUS_KM;
  
  return radius * c;
};

/**
 * Calcula la distancia en kilómetros
 * @param {number} lat1 - Latitud del punto 1
 * @param {number} lon1 - Longitud del punto 1
 * @param {number} lat2 - Latitud del punto 2
 * @param {number} lon2 - Longitud del punto 2
 * @returns {number} Distancia en kilómetros
 */
const distanceInKm = (lat1, lon1, lat2, lon2) => {
  return calculateDistance(lat1, lon1, lat2, lon2, 'km');
};

/**
 * Calcula la distancia en metros
 * @param {number} lat1 - Latitud del punto 1
 * @param {number} lon1 - Longitud del punto 1
 * @param {number} lat2 - Latitud del punto 2
 * @param {number} lon2 - Longitud del punto 2
 * @returns {number} Distancia en metros
 */
const distanceInMeters = (lat1, lon1, lat2, lon2) => {
  return calculateDistance(lat1, lon1, lat2, lon2, 'm');
};

// ======================================================
// VERIFICACIÓN DE PUNTOS EN ZONAS
// ======================================================

/**
 * Verifica si un punto está dentro de un círculo (radio)
 * @param {number} pointLat - Latitud del punto
 * @param {number} pointLon - Longitud del punto
 * @param {number} centerLat - Latitud del centro
 * @param {number} centerLon - Longitud del centro
 * @param {number} radiusKm - Radio en kilómetros
 * @returns {boolean} True si está dentro del círculo
 */
const isPointInCircle = (pointLat, pointLon, centerLat, centerLon, radiusKm) => {
  const distance = distanceInKm(pointLat, pointLon, centerLat, centerLon);
  return distance <= radiusKm;
};

/**
 * Verifica si un punto está dentro de un polígono (Ray Casting Algorithm)
 * @param {number} pointLat - Latitud del punto
 * @param {number} pointLon - Longitud del punto
 * @param {Array} polygon - Array de puntos [{lat, lon}, ...]
 * @returns {boolean} True si está dentro del polígono
 */
const isPointInPolygon = (pointLat, pointLon, polygon) => {
  if (!polygon || polygon.length < 3) {
    return false;
  }
  
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lon;
    const yi = polygon[i].lat;
    const xj = polygon[j].lon;
    const yj = polygon[j].lat;
    
    const intersect = ((yi > pointLat) !== (yj > pointLat)) &&
      (pointLon < (xj - xi) * (pointLat - yi) / (yj - yi) + xi);
    
    if (intersect) {
      inside = !inside;
    }
  }
  
  return inside;
};

/**
 * Verifica si una dirección está en una lista de barrios
 * @param {string} address - Dirección completa
 * @param {Array} neighborhoods - Lista de barrios
 * @returns {boolean} True si la dirección contiene algún barrio de la lista
 */
const isAddressInNeighborhoods = (address, neighborhoods) => {
  if (!address || !neighborhoods || neighborhoods.length === 0) {
    return false;
  }
  
  const addressLower = address.toLowerCase();
  
  for (const neighborhood of neighborhoods) {
    if (addressLower.includes(neighborhood.toLowerCase())) {
      return true;
    }
  }
  
  return false;
};

// ======================================================
// VALIDACIÓN DE ZONAS DE DOMICILIO
// ======================================================

/**
 * Valida una zona de domicilio
 * @param {Object} zone - Zona a validar
 * @returns {Object} { valid: boolean, error: string }
 */
const validateDeliveryZone = (zone) => {
  if (!zone.name || typeof zone.name !== 'string') {
    return { valid: false, error: 'El nombre de la zona es requerido' };
  }
  
  if (!zone.type || !['polygon', 'radius', 'neighborhoods'].includes(zone.type)) {
    return { valid: false, error: 'Tipo de zona inválido' };
  }
  
  if (zone.type === 'radius') {
    if (!zone.lat || !zone.lng || !zone.radius) {
      return { valid: false, error: 'Para zona de radio se requiere lat, lng y radius' };
    }
    if (zone.radius <= 0 || zone.radius > 100) {
      return { valid: false, error: 'El radio debe estar entre 1 y 100 km' };
    }
  }
  
  if (zone.type === 'polygon') {
    if (!zone.coordinates || zone.coordinates.length < 3) {
      return { valid: false, error: 'Para zona de polígono se requieren al menos 3 coordenadas' };
    }
    for (const coord of zone.coordinates) {
      if (!coord.lat || !coord.lng) {
        return { valid: false, error: 'Coordenadas inválidas en el polígono' };
      }
    }
  }
  
  if (zone.type === 'neighborhoods') {
    if (!zone.neighborhoods || zone.neighborhoods.length === 0) {
      return { valid: false, error: 'Para zona de barrios se requiere al menos un barrio' };
    }
  }
  
  return { valid: true, error: null };
};

/**
 * Verifica si una ubicación está cubierta por una zona de domicilio
 * @param {Object} location - Ubicación { lat, lng, address }
 * @param {Object} zone - Zona de domicilio
 * @param {Object} branchLocation - Ubicación de la sede { lat, lng }
 * @returns {boolean} True si está cubierta
 */
const isLocationCoveredByZone = (location, zone, branchLocation) => {
  if (!location || !zone) {
    return false;
  }
  
  switch (zone.type) {
    case 'radius':
      if (!location.lat || !location.lng || !branchLocation?.lat || !branchLocation?.lng) {
        return false;
      }
      return isPointInCircle(
        location.lat, location.lng,
        branchLocation.lat, branchLocation.lng,
        zone.radius
      );
    
    case 'polygon':
      if (!location.lat || !location.lng || !zone.coordinates) {
        return false;
      }
      return isPointInPolygon(location.lat, location.lng, zone.coordinates);
    
    case 'neighborhoods':
      if (!location.address || !zone.neighborhoods) {
        return false;
      }
      return isAddressInNeighborhoods(location.address, zone.neighborhoods);
    
    default:
      return false;
  }
};

/**
 * Encuentra la primera zona que cubre una ubicación
 * @param {Object} location - Ubicación { lat, lng, address }
 * @param {Array} deliveryZones - Lista de zonas de domicilio
 * @param {Object} branchLocation - Ubicación de la sede { lat, lng }
 * @returns {Object|null} Zona que cubre o null
 */
const findCoveringZone = (location, deliveryZones, branchLocation) => {
  if (!deliveryZones || deliveryZones.length === 0) {
    return null;
  }
  
  for (const zone of deliveryZones) {
    if (isLocationCoveredByZone(location, zone, branchLocation)) {
      return zone;
    }
  }
  
  return null;
};

// ======================================================
// GEOCODIFICACIÓN (PLACEHOLDER)
// ======================================================

/**
 * Convierte una dirección en coordenadas (geocodificación)
 * @param {string} address - Dirección a geocodificar
 * @returns {Promise<Object|null>} { lat, lng } o null
 */
const geocodeAddress = async (address) => {
  // Placeholder para integración con servicio de geocodificación
  // Ejemplo: Google Maps API, OpenStreetMap Nominatim, etc.
  console.log(`Geocoding address: ${address}`);
  
  // Por ahora, retorna null indicando que no está implementado
  // En producción, implementar con el servicio deseado
  return null;
};

/**
 * Convierte coordenadas en dirección (geocodificación inversa)
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {Promise<string|null>} Dirección o null
 */
const reverseGeocode = async (lat, lng) => {
  // Placeholder para integración con servicio de geocodificación inversa
  console.log(`Reverse geocoding: ${lat}, ${lng}`);
  
  // Por ahora, retorna null indicando que no está implementado
  return null;
};

// ======================================================
// FUNCIONES DE UTILIDAD
// ======================================================

/**
 * Valida coordenadas geográficas
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {boolean} True si son válidas
 */
const isValidCoordinates = (lat, lng) => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
};

/**
 * Formatea coordenadas para presentación
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @param {number} decimals - Número de decimales
 * @returns {string} Coordenadas formateadas
 */
const formatCoordinates = (lat, lng, decimals = 6) => {
  if (!isValidCoordinates(lat, lng)) {
    return 'Coordenadas inválidas';
  }
  
  const latFixed = lat.toFixed(decimals);
  const lngFixed = lng.toFixed(decimals);
  
  return `${latFixed}, ${lngFixed}`;
};

/**
 * Calcula el bounding box de un conjunto de coordenadas
 * @param {Array} coordinates - Array de puntos { lat, lng }
 * @returns {Object} { minLat, maxLat, minLng, maxLng }
 */
const calculateBoundingBox = (coordinates) => {
  if (!coordinates || coordinates.length === 0) {
    return null;
  }
  
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;
  
  for (const coord of coordinates) {
    minLat = Math.min(minLat, coord.lat);
    maxLat = Math.max(maxLat, coord.lat);
    minLng = Math.min(minLng, coord.lng);
    maxLng = Math.max(maxLng, coord.lng);
  }
  
  return { minLat, maxLat, minLng, maxLng };
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  // Constantes
  EARTH_RADIUS_KM,
  EARTH_RADIUS_M,
  
  // Distancias
  calculateDistance,
  distanceInKm,
  distanceInMeters,
  
  // Verificación de puntos
  isPointInCircle,
  isPointInPolygon,
  isAddressInNeighborhoods,
  
  // Validación de zonas
  validateDeliveryZone,
  isLocationCoveredByZone,
  findCoveringZone,
  
  // Geocodificación (placeholder)
  geocodeAddress,
  reverseGeocode,
  
  // Utilidades
  isValidCoordinates,
  formatCoordinates,
  calculateBoundingBox,
};