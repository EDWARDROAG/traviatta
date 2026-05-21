-- ======================================================
-- ARCHIVO: 02_branches.sql
-- UBICACIÓN: menu-qr-system/database/seeders/02_branches.sql
-- FASE: F3
-- VERSIÓN: 1.0
-- ÚLTIMA ACTUALIZACIÓN: 2024-01-17 11:15
-- ======================================================
-- 🎯 PROPÓSITO:
-- Datos de ejemplo para la tabla de sedes (branches)
-- ======================================================

-- ======================================================
-- SEDES PARA EL SABOR COSTEÑO
-- ======================================================

-- Sede Principal
INSERT INTO branches (id, tenant_id, name, address, phone, whatsapp_number, latitude, longitude, is_active, delivery_cost, free_delivery_min_amount, delivery_zones)
VALUES (
    '22222222-2222-2222-2222-222222222221',
    '11111111-1111-1111-1111-111111111111',
    'Sede Principal',
    'Calle 50 #20-30, Bogotá',
    '6011234567',
    '573001112233',
    4.7110,
    -74.0721,
    true,
    3000,
    30000,
    '[{"type":"radius","name":"Zona Centro","lat":4.7110,"lng":-74.0721,"radius":5}]'
);

-- Sede Norte
INSERT INTO branches (id, tenant_id, name, address, phone, whatsapp_number, latitude, longitude, is_active, delivery_cost, free_delivery_min_amount, delivery_zones)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Sede Norte',
    'Calle 127 #15-20, Bogotá',
    '6017654321',
    '573001112234',
    4.7500,
    -74.0500,
    true,
    5000,
    40000,
    '[{"type":"radius","name":"Zona Norte","lat":4.7500,"lng":-74.0500,"radius":8}]'
);

-- Sede Sur
INSERT INTO branches (id, tenant_id, name, address, phone, whatsapp_number, latitude, longitude, is_active, delivery_cost, free_delivery_min_amount, delivery_zones)
VALUES (
    '22222222-2222-2222-2222-222222222223',
    '11111111-1111-1111-1111-111111111111',
    'Sede Sur',
    'Calle 19 #10-50, Bogotá',
    '6019876543',
    '573001112235',
    4.6000,
    -74.0800,
    true,
    4000,
    35000,
    '[{"type":"radius","name":"Zona Sur","lat":4.6000,"lng":-74.0800,"radius":6}]'
);

-- ======================================================
-- SEDES PARA PIZZA HOUSE
-- ======================================================

INSERT INTO branches (id, tenant_id, name, address, phone, whatsapp_number, latitude, longitude, is_active, delivery_cost, free_delivery_min_amount)
VALUES (
    '22222222-2222-2222-2222-222222222224',
    '11111111-1111-1111-1111-111111111112',
    'Pizza House Usaquén',
    'Carrera 15 #80-12, Bogotá',
    '6017654321',
    '573002223344',
    4.7300,
    -74.0300,
    true,
    3000,
    35000
);

-- ======================================================
-- SEDES PARA SUSHI BAR
-- ======================================================

INSERT INTO branches (id, tenant_id, name, address, phone, whatsapp_number, latitude, longitude, is_active, delivery_cost, free_delivery_min_amount)
VALUES (
    '22222222-2222-2222-2222-222222222225',
    '11111111-1111-1111-1111-111111111113',
    'Sushi Bar Zona Rosa',
    'Calle 85 #10-05, Bogotá',
    '6019876543',
    '573003334455',
    4.6900,
    -74.0450,
    true,
    5000,
    50000
);

-- ======================================================
-- SEDES PARA LA HAMBURGUESERÍA
-- ======================================================

INSERT INTO branches (id, tenant_id, name, address, phone, whatsapp_number, latitude, longitude, is_active, delivery_cost, free_delivery_min_amount)
VALUES (
    '22222222-2222-2222-2222-222222222226',
    '11111111-1111-1111-1111-111111111114',
    'La Hamburguesería Chapinero',
    'Calle 100 #15-30, Bogotá',
    '6015566778',
    '573004445566',
    4.6700,
    -74.0600,
    true,
    3000,
    30000
);

-- ======================================================
-- SEDES PARA CAFÉ CENTRAL
-- ======================================================

INSERT INTO branches (id, tenant_id, name, address, phone, whatsapp_number, latitude, longitude, is_active, delivery_cost, free_delivery_min_amount)
VALUES (
    '22222222-2222-2222-2222-222222222227',
    '11111111-1111-1111-1111-111111111115',
    'Café Central Calle 7',
    'Carrera 7 #45-20, Bogotá',
    '6011239876',
    '573005556677',
    4.6200,
    -74.0700,
    true,
    2000,
    20000
);