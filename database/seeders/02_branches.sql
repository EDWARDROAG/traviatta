-- ======================================================
-- ARCHIVO: 02_branches.sql
-- UBICACIÓN: menu-qr-system/database/seeders/02_branches.sql
-- FASE: F3
-- VERSIÓN: 1.0 (TRAVIATTA PIZZA GOURMET)
-- ÚLTIMA ACTUALIZACIÓN: 2024-05-23 11:45
-- ======================================================
-- 🎯 PROPÓSITO:
-- Datos de la sede principal de TRAVIATTA PIZZA GOURMET
-- ======================================================

-- ======================================================
-- SEDE PRINCIPAL - TRAVIATTA
-- ======================================================

INSERT INTO branches (id, tenant_id, name, address, phone, whatsapp_number, latitude, longitude, is_active, delivery_cost, free_delivery_min_amount, delivery_zones, schedule, settings)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Traviatta Sede Principal',
    'Calle Principal #123, Bogotá',
    '6012345678',
    '573001112233',
    4.7110,
    -74.0721,
    true,
    5000,
    35000,
    '[{"type":"radius","name":"Zona Centro","lat":4.7110,"lng":-74.0721,"radius":5}]',
    '{
        "monday": {"open": "11:00", "close": "22:00"},
        "tuesday": {"open": "11:00", "close": "22:00"},
        "wednesday": {"open": "11:00", "close": "22:00"},
        "thursday": {"open": "11:00", "close": "22:00"},
        "friday": {"open": "11:00", "close": "23:00"},
        "saturday": {"open": "11:00", "close": "23:00"},
        "sunday": {"open": "11:00", "close": "21:00"}
    }',
    '{"has_delivery": true, "has_table_service": true, "has_pickup": true}'
);