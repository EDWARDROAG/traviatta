-- ======================================================
-- ARCHIVO: init.sql
-- UBICACIÓN: menu-qr-system/database/seeders/init.sql
-- FASE: F1
-- VERSIÓN: 1.0
-- ÚLTIMA ACTUALIZACIÓN: 2024-01-17 10:45
-- ======================================================
-- 🎯 PROPÓSITO:
-- Datos de inicialización para desarrollo y pruebas.
-- Crea un restaurante de demostración con datos de ejemplo.
-- ======================================================

-- ======================================================
-- LIMPIAR DATOS EXISTENTES
-- ======================================================

TRUNCATE TABLE branch_modules CASCADE;
TRUNCATE TABLE tables CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE branches CASCADE;
TRUNCATE TABLE tenants CASCADE;

-- ======================================================
-- RESTAURANTE DE EJEMPLO
-- ======================================================

INSERT INTO tenants (id, name, slug, whatsapp_number, email, phone, address, is_active, subscription_tier)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'El Sabor Costeño',
    'el-sabor-costeno',
    '573001112233',
    'contacto@elsaborcosteno.com',
    '6011234567',
    'Calle 50 #20-30, Bogotá',
    true,
    'premium'
);

-- ======================================================
-- SEDE PRINCIPAL
-- ======================================================

INSERT INTO branches (id, tenant_id, name, address, phone, whatsapp_number, latitude, longitude, is_active, delivery_cost, free_delivery_min_amount)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Sede Principal',
    'Calle 50 #20-30, Bogotá',
    '6011234567',
    '573001112233',
    4.7110,
    -74.0721,
    true,
    3000,
    30000
);

-- ======================================================
-- CATEGORÍAS
-- ======================================================

-- Almuerzos
INSERT INTO categories (id, branch_id, name, description, icon, display_order, module_type, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333331',
    '22222222-2222-2222-2222-222222222222',
    'Almuerzos',
    'Nuestros deliciosos almuerzos ejecutivos',
    '🍽️',
    0,
    'lunch',
    true
);

-- Comida Rápida
INSERT INTO categories (id, branch_id, name, description, icon, display_order, module_type, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333332',
    '22222222-2222-2222-2222-222222222222',
    'Comida Rápida',
    'Hamburguesas, perros y más',
    '🍔',
    1,
    'fastfood',
    true
);

-- Bebidas
INSERT INTO categories (id, branch_id, name, description, icon, display_order, module_type, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'Bebidas',
    'Refrescos, jugos y cervezas',
    '🥤',
    2,
    'all',
    true
);

-- ======================================================
-- PRODUCTOS
-- ======================================================

-- Bandeja Paisa (Almuerzos)
INSERT INTO products (id, category_id, name, description, price, is_available, is_featured, preparation_time)
VALUES (
    '44444444-4444-4444-4444-444444444441',
    '33333333-3333-3333-3333-333333333331',
    'Bandeja Paisa',
    'Arroz, frijol, carne molida, chicharrón, huevo frito, aguacate, arepa',
    28000,
    true,
    true,
    20
);

-- Sopa de Mondongo (Almuerzos)
INSERT INTO products (id, category_id, name, description, price, is_available, is_featured, preparation_time)
VALUES (
    '44444444-4444-4444-4444-444444444442',
    '33333333-3333-3333-3333-333333333331',
    'Sopa de Mondongo',
    'Mondongo, papa, cilantro, aliños',
    15000,
    true,
    false,
    15
);

-- Hamburguesa Clásica (Comida Rápida)
INSERT INTO products (id, category_id, name, description, price, is_available, is_featured, preparation_time, modifiers)
VALUES (
    '44444444-4444-4444-4444-444444444443',
    '33333333-3333-3333-3333-333333333332',
    'Hamburguesa Clásica',
    '180g de carne, queso americano, lechuga, tomate, cebolla caramelizada',
    18000,
    true,
    true,
    10,
    '[{"name":"Queso extra","price":3000},{"name":"Tocineta","price":4000},{"name":"Papas a la francesa","price":5000}]'
);

-- Perro Caliente (Comida Rápida)
INSERT INTO products (id, category_id, name, description, price, is_available, is_featured, preparation_time)
VALUES (
    '44444444-4444-4444-4444-444444444444',
    '33333333-3333-3333-3333-333333333332',
    'Perro Caliente',
    'Salchicha americana, pan artesanal, papitas, salsas',
    12000,
    true,
    false,
    8
);

-- Gaseosa (Bebidas)
INSERT INTO products (id, category_id, name, description, price, is_available, is_featured, preparation_time)
VALUES (
    '44444444-4444-4444-4444-444444444445',
    '33333333-3333-3333-3333-333333333333',
    'Gaseosa 350ml',
    'Coca-Cola, Sprite, Pepsi',
    4000,
    true,
    false,
    1
);

-- Jugo Natural (Bebidas)
INSERT INTO products (id, category_id, name, description, price, is_available, is_featured, preparation_time)
VALUES (
    '44444444-4444-4444-4444-444444444446',
    '33333333-3333-3333-3333-333333333333',
    'Jugo Natural',
    'Mora, Lulo, Maracuyá',
    5000,
    true,
    true,
    3
);

-- ======================================================
-- MÓDULOS POR SEDE
-- ======================================================

-- Desayunos (desactivado por defecto)
INSERT INTO branch_modules (branch_id, module_name, is_enabled, settings)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'breakfast',
    false,
    '{"end_time":"10:30","has_combos":true}'
);

-- Almuerzos (activado)
INSERT INTO branch_modules (branch_id, module_name, is_enabled, settings)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'lunch',
    true,
    '{"start_time":"11:00","end_time":"15:00","has_soup_option":true}'
);

-- Comida Rápida (activado)
INSERT INTO branch_modules (branch_id, module_name, is_enabled, settings)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'fastfood',
    true,
    '{"start_time":"12:00","end_time":"22:00","allow_customization":true}'
);

-- Bar (activado para fines de semana)
INSERT INTO branch_modules (branch_id, module_name, is_enabled, settings)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'bar',
    true,
    '{"start_time":"18:00","end_time":"02:00","happy_hour_enabled":true,"happy_hour_start":"19:00","happy_hour_end":"21:00","happy_hour_discount":20}'
);

-- Domicilio (activado)
INSERT INTO branch_modules (branch_id, module_name, is_enabled, settings)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'delivery',
    true,
    '{"enabled":true,"estimated_time":"30-45","min_amount":15000,"cost":3000,"free_delivery_min_amount":30000,"max_distance_km":10}'
);

-- Mesas (activado)
INSERT INTO branch_modules (branch_id, module_name, is_enabled, settings)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'tables',
    true,
    '{"enabled":true,"allow_reservations":true,"max_reservation_time_minutes":120}'
);

-- ======================================================
-- MESAS DE EJEMPLO
-- ======================================================

INSERT INTO tables (id, branch_id, table_number, table_name, capacity, position_x, position_y, shape, status)
VALUES 
    ('55555555-5555-5555-5555-555555555551', '22222222-2222-2222-2222-222222222222', '1', 'Ventanal', 4, 100, 150, 'circle', 'available'),
    ('55555555-5555-5555-5555-555555555552', '22222222-2222-2222-2222-222222222222', '2', 'Centro', 4, 200, 150, 'circle', 'available'),
    ('55555555-5555-5555-5555-555555555553', '22222222-2222-2222-2222-222222222222', '3', 'Terraza', 6, 300, 150, 'rectangle', 'available'),
    ('55555555-5555-5555-5555-555555555554', '22222222-2222-2222-2222-222222222222', '4', 'Barra', 2, 150, 250, 'square', 'available'),
    ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', '5', 'VIP', 8, 250, 250, 'rectangle', 'occupied');

-- ======================================================
-- VERIFICAR DATOS INSERTADOS
-- ======================================================

DO $$
BEGIN
    RAISE NOTICE '=== DATOS INSERTADOS ===';
    RAISE NOTICE 'Tenants: %', (SELECT COUNT(*) FROM tenants);
    RAISE NOTICE 'Branches: %', (SELECT COUNT(*) FROM branches);
    RAISE NOTICE 'Categories: %', (SELECT COUNT(*) FROM categories);
    RAISE NOTICE 'Products: %', (SELECT COUNT(*) FROM products);
    RAISE NOTICE 'Branch Modules: %', (SELECT COUNT(*) FROM branch_modules);
    RAISE NOTICE 'Tables: %', (SELECT COUNT(*) FROM tables);
END $$;