-- ======================================================
-- ARCHIVO: 01_tenants.sql
-- UBICACIÓN: menu-qr-system/database/seeders/01_tenants.sql
-- FASE: F1
-- VERSIÓN: 1.0
-- ÚLTIMA ACTUALIZACIÓN: 2024-01-17 11:00
-- ======================================================
-- 🎯 PROPÓSITO:
-- Datos de ejemplo para la tabla de restaurantes (tenants)
-- ======================================================

-- ======================================================
-- RESTAURANTES DE EJEMPLO
-- ======================================================

-- Restaurante 1: El Sabor Costeño
INSERT INTO tenants (id, name, slug, logo_url, primary_color, whatsapp_number, email, phone, address, is_active, subscription_tier, settings)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'El Sabor Costeño',
    'el-sabor-costeno',
    'https://res.cloudinary.com/demo/image/upload/v1/samples/food/fish-vegetables',
    '#FF6B35',
    '573001112233',
    'contacto@elsaborcosteno.com',
    '6011234567',
    'Calle 50 #20-30, Bogotá',
    true,
    'premium',
    '{"theme": "light", "currency": "COP", "language": "es"}'
);

-- Restaurante 2: Pizza House
INSERT INTO tenants (id, name, slug, logo_url, primary_color, whatsapp_number, email, phone, address, is_active, subscription_tier, settings)
VALUES (
    '11111111-1111-1111-1111-111111111112',
    'Pizza House',
    'pizza-house',
    'https://res.cloudinary.com/demo/image/upload/v1/samples/food/pizza',
    '#E53935',
    '573002223344',
    'contacto@pizzahouse.com',
    '6017654321',
    'Carrera 15 #80-12, Bogotá',
    true,
    'pro',
    '{"theme": "dark", "currency": "COP", "language": "es"}'
);

-- Restaurante 3: Sushi Bar
INSERT INTO tenants (id, name, slug, logo_url, primary_color, whatsapp_number, email, phone, address, is_active, subscription_tier, settings)
VALUES (
    '11111111-1111-1111-1111-111111111113',
    'Sushi Bar',
    'sushi-bar',
    'https://res.cloudinary.com/demo/image/upload/v1/samples/food/sushi',
    '#4CAF50',
    '573003334455',
    'contacto@sushibar.com',
    '6019876543',
    'Calle 85 #10-05, Bogotá',
    true,
    'basic',
    '{"theme": "light", "currency": "COP", "language": "es"}'
);

-- Restaurante 4: La Hamburguesería
INSERT INTO tenants (id, name, slug, logo_url, primary_color, whatsapp_number, email, phone, address, is_active, subscription_tier, settings)
VALUES (
    '11111111-1111-1111-1111-111111111114',
    'La Hamburguesería',
    'la-hamburgueseria',
    'https://res.cloudinary.com/demo/image/upload/v1/samples/food/burger',
    '#FF9800',
    '573004445566',
    'contacto@lahamburgueseria.com',
    '6015566778',
    'Calle 100 #15-30, Bogotá',
    true,
    'pro',
    '{"theme": "light", "currency": "COP", "language": "es"}'
);

-- Restaurante 5: Café Central
INSERT INTO tenants (id, name, slug, logo_url, primary_color, whatsapp_number, email, phone, address, is_active, subscription_tier, settings)
VALUES (
    '11111111-1111-1111-1111-111111111115',
    'Café Central',
    'cafe-central',
    'https://res.cloudinary.com/demo/image/upload/v1/samples/food/coffee',
    '#795548',
    '573005556677',
    'contacto@cafecentral.com',
    '6011239876',
    'Carrera 7 #45-20, Bogotá',
    true,
    'basic',
    '{"theme": "light", "currency": "COP", "language": "es"}'
);