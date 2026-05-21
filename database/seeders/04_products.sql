-- ======================================================
-- ARCHIVO: 04_products.sql
-- UBICACIÓN: menu-qr-system/database/seeders/04_products.sql
-- FASE: F2
-- VERSIÓN: 1.0
-- ÚLTIMA ACTUALIZACIÓN: 2024-01-17 11:45
-- ======================================================
-- 🎯 PROPÓSITO:
-- Datos de ejemplo para la tabla de productos
-- ======================================================

-- ======================================================
-- PRODUCTOS PARA EL SABOR COSTEÑO
-- ======================================================

-- Desayunos
INSERT INTO products (id, category_id, name, description, price, is_available, is_featured, preparation_time, tags)
VALUES 
    ('44444444-4444-4444-4444-444444444411', '33333333-3333-3333-3333-333333333311', 'Calentado', 'Arroz, frijol, huevo, carne', 12000, true, true, 10, ARRAY['popular']),
    ('44444444-4444-4444-4444-444444444412', '33333333-3333-3333-3333-333333333311', 'Arepa con Huevo', 'Arepa de maíz con huevo perico', 8000, true, false, 5, ARRAY[]),
    ('44444444-4444-4444-4444-444444444413', '33333333-3333-3333-3333-333333333311', 'Chocolate con Queso', 'Chocolate santafereño', 7000, true, false, 5, ARRAY[]);

-- Almuerzos
INSERT INTO products (id, category_id, name, description, price, is_available, is_featured, preparation_time, tags, modifiers)
VALUES 
    ('44444444-4444-4444-4444-444444444421', '33333333-3333-3333-3333-333333333312', 'Bandeja Paisa', 'Arroz, frijol, carne molida, chicharrón, huevo frito, aguacate, arepa', 28000, true, true, 20, ARRAY['popular'], '[{"name":"Extra chicharrón","price":5000},{"name":"Huevo extra","price":2000}]'),
    ('44444444-4444-4444-4444-444444444422', '33333333-3333-3333-3333-333333333312', 'Sopa de Mondongo', 'Mondongo, papa, cilantro, aliños', 15000, true, false, 15, ARRAY[], '[]'),
    ('44444444-4444-4444-4444-444444444423', '33333333-3333-3333-3333-333333333312', 'Sobrebarriga', 'Sobrebarriga con papas, arroz y ensalada', 25000, true, true, 25, ARRAY['popular'], '[{"name":"Salsa de champiñones","price":4000}]');

-- Comida Rápida
INSERT INTO products (id, category_id, name, description, price, is_available, is_featured, preparation_time, tags, modifiers)
VALUES 
    ('44444444-4444-4444-4444-444444444431', '33333333-3333-3333-3333-333333333313', 'Hamburguesa Clásica', '180g de carne, queso americano, lechuga, tomate, cebolla caramelizada', 18000, true, true, 10, ARRAY['popular'], '[{"name":"Queso extra","price":3000},{"name":"Tocineta","price":4000},{"name":"Papas a la francesa","price":5000}]'),
    ('44444444-4444-4444-4444-444444444432', '33333333-3333-3333-3333-333333333313', 'Perro Caliente', 'Salchicha americana, pan artesanal, papitas, salsas', 12000, true, false, 8, ARRAY[], '[{"name":"Queso","price":2000},{"name":"Tocineta","price":3000}]');

-- Bebidas
INSERT INTO products (id, category_id, name, description, price, is_available, is_featured, preparation_time)
VALUES 
    ('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333314', 'Gaseosa 350ml', 'Coca-Cola, Sprite, Pepsi', 4000, true, false, 1),
    ('44444444-4444-4444-4444-444444444442', '33333333-3333-3333-3333-333333333314', 'Jugo Natural', 'Mora, Lulo, Maracuyá', 5000, true, true, 3),
    ('44444444-4444-4444-4444-444444444443', '33333333-3333-3333-3333-333333333314', 'Cerveza', 'Águila, Club Colombia, Poker', 6000, true, false, 1);

-- Postres
INSERT INTO products (id, category_id, name, description, price, is_available, is_featured, preparation_time)
VALUES 
    ('44444444-4444-4444-4444-444444444451', '33333333-3333-3333-3333-333333333315', 'Flan', 'Flan de vainilla con caramelo', 6000, true, false, 5),
    ('44444444-4444-4444-4444-444444444452', '33333333-3333-3333-3333-333333333315', 'Tres Leches', 'Pastel tres leches', 8000, true, true, 5);

-- ======================================================
-- PRODUCTOS PARA PIZZA HOUSE
-- ======================================================

INSERT INTO products (id, category_id, name, description, price, is_available, is_featured, preparation_time, modifiers)
VALUES 
    ('44444444-4444-4444-4444-444444444461', '33333333-3333-3333-3333-333333333321', 'Pizza Pepperoni', 'Salsa de tomate, queso mozzarella, pepperoni', 32000, true, true, 15, '[{"name":"Orilla rellena de queso","price":5000},{"name":"Extra pepperoni","price":6000}]'),
    ('44444444-4444-4444-4444-444444444462', '33333333-3333-3333-3333-333333333321', 'Pizza Vegetariana', 'Salsa de tomate, queso, champiñones, pimentón, cebolla', 30000, true, false, 15, '[]'),
    ('44444444-4444-4444-4444-444444444463', '33333333-3333-3333-3333-333333333322', 'Pasta Alfredo', 'Fettuccine con salsa Alfredo, pollo y champiñones', 25000, true, false, 12, '[{"name":"Queso parmesano","price":3000}]');

-- ======================================================
-- PRODUCTOS PARA SUSHI BAR
-- ======================================================

INSERT INTO products (id, category_id, name, description, price, is_available, is_featured, preparation_time, modifiers)
VALUES 
    ('44444444-4444-4444-4444-444444444471', '33333333-3333-3333-3333-333333333331', 'California Roll', 'Cangrejo, aguacate, pepino, salsa de soja', 25000, true, true, 10, '[{"name":"Sésamo","price":1000},{"name":"Wasabi extra","price":2000}]'),
    ('44444444-4444-4444-4444-444444444472', '33333333-3333-3333-3333-333333333331', 'Philadelphia Roll', 'Salmón, queso crema, aguacate', 28000, true, false, 10, '[]'),
    ('44444444-4444-4444-4444-444444444473', '33333333-3333-3333-3333-333333333332', 'Sashimi Salmón', '5 piezas de salmón fresco', 22000, true, false, 8, '[]');

-- ======================================================
-- PRODUCTOS PARA LA HAMBURGUESERÍA
-- ======================================================

INSERT INTO products (id, category_id, name, description, price, is_available, is_featured, preparation_time, modifiers)
VALUES 
    ('44444444-4444-4444-4444-444444444481', '33333333-3333-3333-3333-333333333341', 'La Clásica', 'Carne 180g, lechuga, tomate, cebolla, queso americano', 18000, true, true, 10, '[{"name":"Tocineta","price":4000},{"name":"Huevo","price":2000},{"name":"Queso extra","price":3000}]'),
    ('44444444-4444-4444-4444-444444444482', '33333333-3333-3333-3333-333333333341', 'La BBQ', 'Carne 200g, salsa BBQ, aros de cebolla, queso cheddar', 22000, true, false, 12, '[{"name":"Tocineta","price":4000}]'),
    ('44444444-4444-4444-4444-444444444483', '33333333-3333-3333-3333-333333333342', 'Perro Americano', 'Salchicha americana, pan, papitas, salsas', 12000, true, false, 8, '[{"name":"Queso","price":2000},{"name":"Tocineta","price":3000}]');

-- ======================================================
-- VERIFICAR DATOS INSERTADOS
-- ======================================================

DO $$
BEGIN
    RAISE NOTICE '=== PRODUCTOS INSERTADOS ===';
    RAISE NOTICE 'Productos: %', (SELECT COUNT(*) FROM products);
    RAISE NOTICE '  - El Sabor Costeño: %', (SELECT COUNT(*) FROM products p JOIN categories c ON p.category_id = c.id WHERE c.branch_id = '22222222-2222-2222-2222-222222222221');
    RAISE NOTICE '  - Pizza House: %', (SELECT COUNT(*) FROM products p JOIN categories c ON p.category_id = c.id WHERE c.branch_id = '22222222-2222-2222-2222-222222222224');
    RAISE NOTICE '  - Sushi Bar: %', (SELECT COUNT(*) FROM products p JOIN categories c ON p.category_id = c.id WHERE c.branch_id = '22222222-2222-2222-2222-222222222225');
    RAISE NOTICE '  - La Hamburguesería: %', (SELECT COUNT(*) FROM products p JOIN categories c ON p.category_id = c.id WHERE c.branch_id = '22222222-2222-2222-2222-222222222226');
END $$;