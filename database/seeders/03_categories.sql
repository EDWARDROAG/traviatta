-- ======================================================
-- ARCHIVO: 03_categories.sql
-- UBICACIÓN: menu-qr-system/database/seeders/03_categories.sql
-- FASE: F2
-- VERSIÓN: 1.0
-- ÚLTIMA ACTUALIZACIÓN: 2024-01-17 11:30
-- ======================================================
-- 🎯 PROPÓSITO:
-- Datos de ejemplo para la tabla de categorías
-- ======================================================

-- ======================================================
-- CATEGORÍAS PARA EL SABOR COSTEÑO (Sede Principal)
-- ======================================================

-- Desayunos
INSERT INTO categories (id, branch_id, name, description, icon, display_order, module_type, start_time, end_time, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333311',
    '22222222-2222-2222-2222-222222222221',
    'Desayunos',
    'Empieza el día con energía',
    '🌅',
    0,
    'breakfast',
    '06:00',
    '10:30',
    true
);

-- Almuerzos
INSERT INTO categories (id, branch_id, name, description, icon, display_order, module_type, start_time, end_time, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333312',
    '22222222-2222-2222-2222-222222222221',
    'Almuerzos',
    'Menú ejecutivo de lunes a viernes',
    '🍽️',
    1,
    'lunch',
    '11:00',
    '15:00',
    true
);

-- Comida Rápida
INSERT INTO categories (id, branch_id, name, description, icon, display_order, module_type, start_time, end_time, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333313',
    '22222222-2222-2222-2222-222222222221',
    'Comida Rápida',
    'Hamburguesas, perros y más',
    '🍔',
    2,
    'fastfood',
    '12:00',
    '22:00',
    true
);

-- Bebidas
INSERT INTO categories (id, branch_id, name, description, icon, display_order, module_type, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333314',
    '22222222-2222-2222-2222-222222222221',
    'Bebidas',
    'Refrescos, jugos y cervezas',
    '🥤',
    3,
    'all',
    true
);

-- Postres
INSERT INTO categories (id, branch_id, name, description, icon, display_order, module_type, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333315',
    '22222222-2222-2222-2222-222222222221',
    'Postres',
    'El mejor final para tu comida',
    '🍰',
    4,
    'all',
    true
);

-- Bar (Nocturno)
INSERT INTO categories (id, branch_id, name, description, icon, display_order, module_type, start_time, end_time, days_of_week, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333316',
    '22222222-2222-2222-2222-222222222221',
    'Bar',
    'Tragos, cervezas y picadas',
    '🍻',
    5,
    'bar',
    '18:00',
    '02:00',
    ARRAY[5,6],
    true
);

-- ======================================================
-- CATEGORÍAS PARA PIZZA HOUSE
-- ======================================================

INSERT INTO categories (id, branch_id, name, description, icon, display_order, module_type, is_active)
VALUES 
    ('33333333-3333-3333-3333-333333333321', '22222222-2222-2222-2222-222222222224', 'Pizzas', 'Nuestras pizzas artesanales', '🍕', 0, 'fastfood', true),
    ('33333333-3333-3333-3333-333333333322', '22222222-2222-2222-2222-222222222224', 'Pastas', 'Pastas frescas', '🍝', 1, 'fastfood', true),
    ('33333333-3333-3333-3333-333333333323', '22222222-2222-2222-2222-222222222224', 'Entradas', 'Para compartir', '🥗', 2, 'fastfood', true),
    ('33333333-3333-3333-3333-333333333324', '22222222-2222-2222-2222-222222222224', 'Bebidas', 'Refrescos y cervezas', '🥤', 3, 'all', true);

-- ======================================================
-- CATEGORÍAS PARA SUSHI BAR
-- ======================================================

INSERT INTO categories (id, branch_id, name, description, icon, display_order, module_type, is_active)
VALUES 
    ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222225', 'Sushis', 'Rollos tradicionales', '🍣', 0, 'fastfood', true),
    ('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222225', 'Sashimis', 'Pescado fresco', '🐟', 1, 'fastfood', true),
    ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222225', 'Entradas', 'Edamame, gyozas', '🥟', 2, 'fastfood', true),
    ('33333333-3333-3333-3333-333333333334', '22222222-2222-2222-2222-222222222225', 'Bebidas', 'Sake, cerveza, té', '🍶', 3, 'bar', true);

-- ======================================================
-- CATEGORÍAS PARA LA HAMBURGUESERÍA
-- ======================================================

INSERT INTO categories (id, branch_id, name, description, icon, display_order, module_type, is_active)
VALUES 
    ('33333333-3333-3333-3333-333333333341', '22222222-2222-2222-2222-222222222226', 'Hamburguesas', 'Nuestras especialidades', '🍔', 0, 'fastfood', true),
    ('33333333-3333-3333-3333-333333333342', '22222222-2222-2222-2222-222222222226', 'Perros', 'Perros calientes', '🌭', 1, 'fastfood', true),
    ('33333333-3333-3333-3333-333333333343', '22222222-2222-2222-2222-222222222226', 'Papas', 'Papas a la francesa', '🍟', 2, 'fastfood', true),
    ('33333333-3333-3333-3333-333333333344', '22222222-2222-2222-2222-222222222226', 'Bebidas', 'Gaseosas, malteadas', '🥤', 3, 'all', true);

-- ======================================================
-- CATEGORÍAS PARA CAFÉ CENTRAL
-- ======================================================

INSERT INTO categories (id, branch_id, name, description, icon, display_order, module_type, start_time, end_time, is_active)
VALUES 
    ('33333333-3333-3333-3333-333333333351', '22222222-2222-2222-2222-222222222227', 'Desayunos', 'Café, pan, huevos', '☕', 0, 'breakfast', '06:00', '11:00', true),
    ('33333333-3333-3333-3333-333333333352', '22222222-2222-2222-2222-222222222227', 'Almuerzos', 'Menú ejecutivo', '🍽️', 1, 'lunch', '11:30', '15:00', true),
    ('33333333-3333-3333-3333-333333333353', '22222222-2222-2222-2222-222222222227', 'Bebidas calientes', 'Cafés, tés, chocolate', '☕', 2, 'all', true),
    ('33333333-3333-3333-3333-333333333354', '22222222-2222-2222-2222-222222222227', 'Repostería', 'Pasteles, galletas', '🍰', 3, 'all', true);