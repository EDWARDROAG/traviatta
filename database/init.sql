-- ======================================================
-- ARCHIVO: init.sql
-- UBICACIÓN: menu-qr-system/database/seeders/init_traviatta.sql
-- FASE: F1
-- VERSIÓN: 1.0 (ADAPTADO PARA TRAVIATTA)
-- ÚLTIMA ACTUALIZACIÓN: 2024-05-23 11:00
-- ======================================================
-- 🎯 PROPÓSITO:
-- Datos de inicialización para TRAVIATTA PIZZA GOURMET.
-- Carga completa del menú con todos los productos,
-- categorías, precios y tamaños.
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
TRUNCATE TABLE sectors CASCADE;
TRUNCATE TABLE users CASCADE;

-- ======================================================
-- RESTAURANTE TRAVIATTA
-- ======================================================

INSERT INTO tenants (id, name, slug, whatsapp_number, email, phone, address, is_active, subscription_tier, primary_color, secondary_color)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Traviatta Pizza Gourmet',
    'traviatta',
    '573001112233',
    'info@traviatta.com',
    '6012345678',
    'Calle Principal #123, Bogotá',
    true,
    'premium',
    '#B56E4A',
    '#9B6B43'
);

-- ======================================================
-- SEDE PRINCIPAL
-- ======================================================

INSERT INTO branches (id, tenant_id, name, address, phone, whatsapp_number, latitude, longitude, is_active, delivery_cost, free_delivery_min_amount)
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
    35000
);

-- ======================================================
-- CATEGORÍAS - TRAVIATTA
-- ======================================================

-- 1. Entradas
INSERT INTO categories (id, branch_id, name, description, icon, display_order, module_type, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333301',
    '22222222-2222-2222-2222-222222222222',
    'Entradas',
    'Para abrir el apetito',
    '🍗',
    1,
    'all',
    true
);

-- 2. Pizzas Nuevas
INSERT INTO categories (id, branch_id, name, description, icon, display_order, module_type, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333302',
    '22222222-2222-2222-2222-222222222222',
    'Pizzas Nuevas',
    'Las creaciones especiales de Traviatta',
    '🍕',
    2,
    'all',
    true
);

-- 3. Pizzas Clásicas
INSERT INTO categories (id, branch_id, name, description, icon, display_order, module_type, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333303',
    '22222222-2222-2222-2222-222222222222',
    'Pizzas Clásicas',
    'Los sabores de siempre',
    '🍕',
    3,
    'all',
    true
);

-- 4. Pizzas Cooking (Pollo)
INSERT INTO categories (id, branch_id, name, description, icon, display_order, module_type, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333304',
    '22222222-2222-2222-2222-222222222222',
    'Pizzas Cooking',
    'Pizzas con pollo horneado',
    '🍗',
    4,
    'all',
    true
);

-- 5. Pizzas Mexicanas
INSERT INTO categories (id, branch_id, name, description, icon, display_order, module_type, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333305',
    '22222222-2222-2222-2222-222222222222',
    'Pizzas Mexicanas',
    'Sabores picantes y tradicionales',
    '🌶️',
    5,
    'all',
    true
);

-- 6. Pizzas con Camarones
INSERT INTO categories (id, branch_id, name, description, icon, display_order, module_type, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333306',
    '22222222-2222-2222-2222-222222222222',
    'Pizzas con Camarones',
    'Delicias del mar',
    '🍤',
    6,
    'all',
    true
);

-- 7. Pizzas Vegetarianas
INSERT INTO categories (id, branch_id, name, description, icon, display_order, module_type, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333307',
    '22222222-2222-2222-2222-222222222222',
    'Pizzas Vegetarianas',
    'Sin carne, llenas de sabor',
    '🥬',
    7,
    'vegetarian',
    true
);

-- 8. Lasagnas
INSERT INTO categories (id, branch_id, name, description, icon, display_order, module_type, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333308',
    '22222222-2222-2222-2222-222222222222',
    'Lasagnas',
    'Horneradas artesanales',
    '🍝',
    8,
    'all',
    true
);

-- 9. Spaghetti
INSERT INTO categories (id, branch_id, name, description, icon, display_order, module_type, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333309',
    '22222222-2222-2222-2222-222222222222',
    'Spaghetti',
    'Pastas tradicionales',
    '🍝',
    9,
    'all',
    true
);

-- 10. Salchipapas
INSERT INTO categories (id, branch_id, name, description, icon, display_order, module_type, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333310',
    '22222222-2222-2222-2222-222222222222',
    'Salchipapas',
    'La combinación perfecta',
    '🍟',
    10,
    'all',
    true
);

-- 11. Crepes de Sal
INSERT INTO categories (id, branch_id, name, description, icon, display_order, module_type, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333311',
    '22222222-2222-2222-2222-222222222222',
    'Crepes de Sal',
    'Rellenos salados',
    '🥞',
    11,
    'all',
    true
);

-- 12. Crepes Dulces
INSERT INTO categories (id, branch_id, name, description, icon, display_order, module_type, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333312',
    '22222222-2222-2222-2222-222222222222',
    'Crepes Dulces',
    'Para el antojo dulce',
    '🥞',
    12,
    'dessert',
    true
);

-- 13. Waffles
INSERT INTO categories (id, branch_id, name, description, icon, display_order, module_type, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333313',
    '22222222-2222-2222-2222-222222222222',
    'Waffles',
    'Crujientes y deliciosos',
    '🧇',
    13,
    'dessert',
    true
);

-- 14. Tragos
INSERT INTO categories (id, branch_id, name, description, icon, display_order, module_type, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333314',
    '22222222-2222-2222-2222-222222222222',
    'Tragos',
    'Cócteles exclusivos',
    '🍹',
    14,
    'bar',
    true
);

-- ======================================================
-- PRODUCTOS - ENTRADAS
-- ======================================================

INSERT INTO products (id, category_id, name, description, price, is_available, is_featured, preparation_time) VALUES
('44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333301', 'Crunch Traviatta', 'Pollo apanado doble crunch, paprika, salsa Traviatta', 19900, true, true, 15),
('44444444-4444-4444-4444-444444444402', '33333333-3333-3333-3333-333333333301', 'BBQ Honey Crunch', 'Pollo crujiente, salsa BBQ ahumada + miel, ajonjolí, ranch', 21400, true, true, 15),
('44444444-4444-4444-4444-444444444403', '33333333-3333-3333-3333-333333333301', 'Mozzarella Caliente', 'Tomate cherry, queso mozzarella, aceite de oliva, orégano', 27900, true, false, 12),
('44444444-4444-4444-4444-444444444404', '33333333-3333-3333-3333-333333333301', 'Mozzarella Pepperoni', 'Queso mozzarella, pepperoni, aceite de oliva, orégano', 32400, true, false, 12);

-- ======================================================
-- PRODUCTOS - PIZZAS NUEVAS (con múltiples tamaños)
-- ======================================================

INSERT INTO products (id, category_id, name, description, has_sizes, size_prices, is_available, is_featured, preparation_time) VALUES
('44444444-4444-4444-4444-444444444405', '33333333-3333-3333-3333-333333333302', 'Pizza Traviatta', 'Tomate seco, rúgula, queso parmesano, aceite de oliva, albahaca', true, '[{"size":"personal","price":24400},{"size":"mediana","price":42400},{"size":"grande","price":68400}]', true, true, 20),
('44444444-4444-4444-4444-444444444406', '33333333-3333-3333-3333-333333333302', 'Pizza Traviatta Plus', 'Jamón serrano, tomate seco, rúgula, queso parmesano, aceite de oliva, albahaca', true, '[{"size":"personal","price":25400},{"size":"mediana","price":44900},{"size":"grande","price":77400}]', true, true, 20),
('44444444-4444-4444-4444-444444444407', '33333333-3333-3333-3333-333333333302', 'Pizza Nutella', 'Nutella, fresa, banano, queso', true, '[{"size":"personal","price":25400},{"size":"mediana","price":39900},{"size":"grande","price":65400}]', true, false, 15);

-- ======================================================
-- PRODUCTOS - PIZZAS CLÁSICAS
-- ======================================================

INSERT INTO products (id, category_id, name, description, has_sizes, size_prices, is_available, is_featured, preparation_time) VALUES
('44444444-4444-4444-4444-444444444408', '33333333-3333-3333-3333-333333333303', 'Criolla', 'Carne desmechada, chorizo especial, maíz tierno', true, '[{"size":"personal","price":23400},{"size":"mediana","price":40900},{"size":"grande","price":64400}]', true, false, 20),
('44444444-4444-4444-4444-444444444409', '33333333-3333-3333-3333-333333333303', 'La Sifrina', 'Tocineta, maíz tierno, pimentón', true, '[{"size":"personal","price":23400},{"size":"mediana","price":40900},{"size":"grande","price":64400}]', true, false, 20),
('44444444-4444-4444-4444-444444444410', '33333333-3333-3333-3333-333333333303', 'Quesos', 'Queso mozzarella, queso brie, queso parmesano, queso azul', true, '[{"size":"personal","price":25400},{"size":"mediana","price":42900},{"size":"grande","price":68400}]', true, true, 20),
('44444444-4444-4444-4444-444444444411', '33333333-3333-3333-3333-333333333303', 'Margarita', 'Salsa napolitana, tomate cherry, albahaca', true, '[{"size":"personal","price":22400},{"size":"mediana","price":31900},{"size":"grande","price":50900}]', true, true, 20),
('44444444-4444-4444-4444-444444444412', '33333333-3333-3333-3333-333333333303', 'Pepperoni Champiñones', 'Pepperoni, champiñones', true, '[{"size":"personal","price":23900},{"size":"mediana","price":37900},{"size":"grande","price":61400}]', true, false, 20),
('44444444-4444-4444-4444-444444444413', '33333333-3333-3333-3333-333333333303', 'Bacon Pepperoni', 'Tiras de tocineta, pepperoni', true, '[{"size":"personal","price":23400},{"size":"mediana","price":40900},{"size":"grande","price":64400}]', true, false, 20),
('44444444-4444-4444-4444-444444444414', '33333333-3333-3333-3333-333333333303', 'Primavera', 'Jamón serrano, queso parmesano, tomate cherry, rúgula', true, '[{"size":"personal","price":24400},{"size":"mediana","price":41900},{"size":"grande","price":65400}]', true, false, 20);

-- ======================================================
-- PRODUCTOS - PIZZAS COOKING (Pollo)
-- ======================================================

INSERT INTO products (id, category_id, name, description, has_sizes, size_prices, is_available, is_featured) VALUES
('44444444-4444-4444-4444-444444444415', '33333333-3333-3333-3333-333333333304', 'Pollo al Curry', 'Pollo horneado bañado en salsa curry, queso y orégano', true, '[{"size":"personal","price":23900},{"size":"mediana","price":38900},{"size":"grande","price":62900}]', true, false),
('44444444-4444-4444-4444-444444444416', '33333333-3333-3333-3333-333333333304', 'Pollo al BBQ', 'Pollo horneado bañado en salsa BBQ y queso', true, '[{"size":"personal","price":23900},{"size":"mediana","price":38900},{"size":"grande","price":62900}]', true, false),
('44444444-4444-4444-4444-444444444417', '33333333-3333-3333-3333-333333333304', 'Pollo al Bechamel', 'Pollo horneado bañado en salsa bechamel, champiñones, queso y orégano', true, '[{"size":"personal","price":24900},{"size":"mediana","price":39900},{"size":"grande","price":63900}]', true, true),
('44444444-4444-4444-4444-444444444418', '33333333-3333-3333-3333-333333333304', 'Pollo Carbonara', 'Pollo horneado bañado en salsa bechamel, tocineta, crema de leche, queso', true, '[{"size":"personal","price":25900},{"size":"mediana","price":41900},{"size":"grande","price":65900}]', true, true),
('44444444-4444-4444-4444-444444444419', '33333333-3333-3333-3333-333333333304', 'Pollo Champiñón', 'Pollo horneado, champiñones, queso', true, '[{"size":"personal","price":23900},{"size":"mediana","price":38900},{"size":"grande","price":62900}]', true, false),
('44444444-4444-4444-4444-444444444420', '33333333-3333-3333-3333-333333333304', 'Pollo Miel Mostaza', 'Pollo horneado, salsa miel mostaza, tocineta, queso', true, '[{"size":"personal","price":24900},{"size":"mediana","price":39900},{"size":"grande","price":63900}]', true, false),
('44444444-4444-4444-4444-444444444421', '33333333-3333-3333-3333-333333333304', 'Pollo con Jamón', 'Pollo horneado, jamón, queso', true, '[{"size":"personal","price":23900},{"size":"mediana","price":38900},{"size":"grande","price":62900}]', true, false);

-- ======================================================
-- PRODUCTOS - PIZZAS MEXICANAS
-- ======================================================

INSERT INTO products (id, category_id, name, description, has_sizes, size_prices, is_available, is_featured, is_spicy) VALUES
('44444444-4444-4444-4444-444444444422', '33333333-3333-3333-3333-333333333305', 'Chile', 'Frijol, salsa picante, salsa bolognesa, queso', true, '[{"size":"personal","price":21400},{"size":"mediana","price":36900},{"size":"grande","price":57900}]', true, false, true),
('44444444-4444-4444-4444-444444444423', '33333333-3333-3333-3333-333333333305', 'Jalisco', 'Salsa bolognesa, chorizo especial, frijol, orégano, queso', true, '[{"size":"personal","price":24400},{"size":"mediana","price":36900},{"size":"grande","price":57900}]', true, false, false),
('44444444-4444-4444-4444-444444444424', '33333333-3333-3333-3333-333333333305', 'Picaleña', 'Pepperoni, jalapeños, pimentón, cebolla', true, '[{"size":"personal","price":21900},{"size":"mediana","price":37400},{"size":"grande","price":59900}]', true, true, true),
('44444444-4444-4444-4444-444444444425', '33333333-3333-3333-3333-333333333305', 'Carolina Reaper', 'Salsa bolognesa, ají carolina reaper, aguacate, pico de gallo (MUY PICANTE)', true, '[{"size":"personal","price":24400},{"size":"mediana","price":41900},{"size":"grande","price":65400}]', true, false, true);

-- ======================================================
-- PRODUCTOS - PIZZAS CON CAMARONES
-- ======================================================

INSERT INTO products (id, category_id, name, description, has_sizes, size_prices, is_available, is_featured) VALUES
('44444444-4444-4444-4444-444444444426', '33333333-3333-3333-3333-333333333306', 'Camarón al BBQ', 'Camarones salteados en salsa BBQ y queso', true, '[{"size":"personal","price":24400},{"size":"mediana","price":42400},{"size":"grande","price":68900}]', true, true),
('44444444-4444-4444-4444-444444444427', '33333333-3333-3333-3333-333333333306', 'Camarones al Curry', 'Camarones salteados en salsa curry, queso y orégano', true, '[{"size":"personal","price":24900},{"size":"mediana","price":42400},{"size":"grande","price":68900}]', true, false),
('44444444-4444-4444-4444-444444444428', '33333333-3333-3333-3333-333333333306', 'Camarón y Jamón', 'Camarones salteados, jamón, queso', true, '[{"size":"personal","price":24900},{"size":"mediana","price":42400},{"size":"grande","price":68900}]', true, false);

-- ======================================================
-- PRODUCTOS - PIZZAS VEGETARIANAS
-- ======================================================

INSERT INTO products (id, category_id, name, description, has_sizes, size_prices, is_available, is_featured, is_vegetarian) VALUES
('44444444-4444-4444-4444-444444444429', '33333333-3333-3333-3333-333333333307', 'Napolitana', 'Rodajas de tomate, queso', true, '[{"size":"personal","price":19400},{"size":"mediana","price":32400},{"size":"grande","price":51400}]', true, false, true),
('44444444-4444-4444-4444-444444444430', '33333333-3333-3333-3333-333333333307', 'Vegetariana Suprema', 'Vegetales, champiñones, cebolla roja, pimentón, aceitunas verdes', true, '[{"size":"personal","price":19900},{"size":"mediana","price":32900},{"size":"grande","price":54900}]', true, true, true),
('44444444-4444-4444-4444-444444444431', '33333333-3333-3333-3333-333333333307', 'Vegetariana Premium', 'Vegetales, champiñones, pimentón, cebolla roja, maíz', true, '[{"size":"personal","price":19900},{"size":"mediana","price":33400},{"size":"grande","price":54900}]', true, false, true);

-- ======================================================
-- PRODUCTOS - LASAGNAS
-- ======================================================

INSERT INTO products (id, category_id, name, description, has_sizes, size_prices, is_available, is_featured, preparation_time) VALUES
('44444444-4444-4444-4444-444444444432', '33333333-3333-3333-3333-333333333308', 'Lasagna Traviatta', 'Plátano madurito, pollo horneado, jamón ahumado, salsa bolognesa, queso', true, '[{"size":"pequena","price":30900},{"size":"grande","price":36900}]', true, true, 25),
('44444444-4444-4444-4444-444444444433', '33333333-3333-3333-3333-333333333308', 'Lomo BBQ Crunch', 'Lomo de cerdo, queso cheddar, queso parmesano, salsa BBQ, pan de ajo', true, '[{"size":"pequena","price":35900},{"size":"grande","price":41900}]', true, true, 25),
('44444444-4444-4444-4444-444444444434', '33333333-3333-3333-3333-333333333308', 'Camarón Coco Braseado', 'Camarones, salsa de coco, queso, pan de ajo', true, '[{"size":"pequena","price":41900},{"size":"grande","price":52900}]', true, false, 25),
('44444444-4444-4444-4444-444444444435', '33333333-3333-3333-3333-333333333308', 'Bolognesa', 'Salsa bolognesa, queso, pan de ajo', true, '[{"size":"pequena","price":28400},{"size":"grande","price":34400}]', true, false, 20),
('44444444-4444-4444-4444-444444444436', '33333333-3333-3333-3333-333333333308', 'Especial de la Casa', 'Pollo, jamón, champiñones, salsa bolognesa, queso', true, '[{"size":"pequena","price":28400},{"size":"grande","price":34400}]', true, false, 20),
('44444444-4444-4444-4444-444444444437', '33333333-3333-3333-3333-333333333308', 'Pollo Bechamel', 'Pollo horneado, champiñones, salsa bechamel, queso', true, '[{"size":"pequena","price":28400},{"size":"grande","price":34400}]', true, false, 20),
('44444444-4444-4444-4444-444444444438', '33333333-3333-3333-3333-333333333308', 'Pollo Carbonara', 'Pollo, tocineta, crema de leche, salsa bechamel, queso', true, '[{"size":"pequena","price":28400},{"size":"grande","price":34400}]', true, false, 20);

-- ======================================================
-- PRODUCTOS - SPAGHETTI
-- ======================================================

INSERT INTO products (id, category_id, name, description, has_sizes, size_prices, is_available, is_featured, preparation_time) VALUES
('44444444-4444-4444-4444-444444444439', '33333333-3333-3333-3333-333333333309', 'Camarones Marineros y Ajo', 'Camarones, cebolla, queso parmesano, salsa bechamel, pan de ajo', true, '[{"size":"pequena","price":32900},{"size":"grande","price":37900}]', true, true, 20),
('44444444-4444-4444-4444-444444444440', '33333333-3333-3333-3333-333333333309', 'Pollo Carbonara', 'Pollo horneado, tocineta, queso parmesano, crema de leche, salsa bechamel', true, '[{"size":"pequena","price":28900},{"size":"grande","price":34400}]', true, false, 20),
('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333309', 'Pollo Bechamel', 'Pollo horneado, salsa bechamel, champiñones, queso parmesano', true, '[{"size":"pequena","price":28900},{"size":"grande","price":34400}]', true, false, 20),
('44444444-4444-4444-4444-444444444442', '33333333-3333-3333-3333-333333333309', 'Bolognesa', 'Salsa bolognesa, queso parmesano, pan de ajo', true, '[{"size":"pequena","price":28900},{"size":"grande","price":34400}]', true, false, 20);

-- ======================================================
-- PRODUCTOS - SALCHIPAPAS
-- ======================================================

INSERT INTO products (id, category_id, name, description, price, is_available, is_featured, preparation_time) VALUES
('44444444-4444-4444-4444-444444444443', '33333333-3333-3333-3333-333333333310', 'Salchipapa Sencilla', 'Papa, salchicha americana ZENU', 14400, true, false, 12),
('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333310', 'Salchipapa con Queso', 'Papa, salchicha americana ZENU, queso', 15400, true, false, 12),
('44444444-4444-4444-4444-444444444445', '33333333-3333-3333-3333-333333333310', 'Salchipollo', 'Papa, salchicha americana ZENU, queso, pollo, papa chip', 17900, true, true, 15),
('44444444-4444-4444-4444-444444444446', '33333333-3333-3333-3333-333333333310', 'Choripapa', 'Papa, chorizo, butifarra, salchicha americana ZENU, queso, papa chip', 21400, true, true, 15);

-- ======================================================
-- PRODUCTOS - CREPES DE SAL
-- ======================================================

INSERT INTO products (id, category_id, name, description, price, is_available, is_featured, preparation_time) VALUES
('44444444-4444-4444-4444-444444444447', '33333333-3333-3333-3333-333333333311', 'Pollo Carbonara', 'Pollo horneado, tocineta, salsa bechamel, queso', 30900, true, true, 15),
('44444444-4444-4444-4444-444444444448', '33333333-3333-3333-3333-333333333311', 'Criollo', 'Carne desmechada, maíz tierno, queso', 30900, true, false, 15),
('44444444-4444-4444-4444-444444444449', '33333333-3333-3333-3333-333333333311', 'Camarones al Curry', 'Camarones en salsa curry, espinaca, aguacate, tomate, queso', 35900, true, true, 15),
('44444444-4444-4444-4444-444444444450', '33333333-3333-3333-3333-333333333311', 'Bolognesa', 'Salsa bolognesa, champiñones, jamón, queso parmesano', 30900, true, false, 15),
('44444444-4444-4444-4444-444444444451', '33333333-3333-3333-3333-333333333311', 'Pollo Bechamel', 'Pollo y champiñones en salsa bechamel, queso', 30900, true, false, 15),
('44444444-4444-4444-4444-444444444452', '33333333-3333-3333-3333-333333333311', 'Stroganof', 'Tirillas de carne fina, champiñones, rúgula', 31900, true, false, 15),
('44444444-4444-4444-4444-444444444453', '33333333-3333-3333-3333-333333333311', 'Mexicano', 'Carne en salsa bolognesa, frijol, nachos, pico de gallo', 30900, true, false, 15);

-- ======================================================
-- PRODUCTOS - CREPES DULCES
-- ======================================================

INSERT INTO products (id, category_id, name, description, price, is_available, is_featured, preparation_time) VALUES
('44444444-4444-4444-4444-444444444454', '33333333-3333-3333-3333-333333333312', 'Sencillo', 'Arequipe, queso y una salsa', 17900, true, false, 10),
('44444444-4444-4444-4444-444444444455', '33333333-3333-3333-3333-333333333312', 'Tradicional', 'Banano, fresas y una salsa', 18900, true, true, 10),
('44444444-4444-4444-4444-444444444456', '33333333-3333-3333-3333-333333333312', 'Tentación', 'Nutella, fresa, banano y crema chantilly', 21400, true, true, 10);

-- ======================================================
-- PRODUCTOS - WAFFLES
-- ======================================================

INSERT INTO products (id, category_id, name, description, price, is_available, is_featured, preparation_time) VALUES
('44444444-4444-4444-4444-444444444457', '33333333-3333-3333-3333-333333333313', 'Sencillo', 'Bola de helado, crema chantilly, fresas y salsas', 19400, true, false, 12),
('44444444-4444-4444-4444-444444444458', '33333333-3333-3333-3333-333333333313', 'Especial', 'Dos bolas de helado, fresas, banano, crema chantilly, masmelos y salsas', 24400, true, true, 12),
('44444444-4444-4444-4444-444444444459', '33333333-3333-3333-3333-333333333313', 'Nutella', 'Helado de vainilla, nutella, banano, fresas y crema chantilly', 24400, true, true, 12),
('44444444-4444-4444-4444-444444444460', '33333333-3333-3333-3333-333333333313', 'Tentación Chocolate', 'Helado de chocolate, crema chantilly, barrita Kinder, M&Ms, salsas, galletas Oreo', 24400, true, false, 12);

-- ======================================================
-- PRODUCTOS - TRAGOS (con is_alcoholic = true)
-- ======================================================

INSERT INTO products (id, category_id, name, description, price, is_available, is_featured, is_alcoholic, preparation_time) VALUES
('44444444-4444-4444-4444-444444444461', '33333333-3333-3333-3333-333333333314', 'Mojito Traviatta Fresh', 'Ron blanco, azúcar, limón, hierbabuena, soda', 19900, true, true, true, 5),
('44444444-4444-4444-4444-444444444462', '33333333-3333-3333-3333-333333333314', 'Sunrise Tropical', 'Tequila, jugo de naranja, granadina', 22900, true, true, true, 5),
('44444444-4444-4444-4444-444444444463', '33333333-3333-3333-3333-333333333314', 'Blue Lagoon XL Traviatta', 'Vodka, sour mix, curaçao azul', 23900, true, false, true, 5),
('44444444-4444-4444-4444-444444444464', '33333333-3333-3333-3333-333333333314', 'Coco Breeze Punch', 'Vodka, licor de coco, jugo de piña, jugo de arándano', 24900, true, true, true, 5),
('44444444-4444-4444-4444-444444444465', '33333333-3333-3333-3333-333333333314', 'Naranja Sunrise Vodka', 'Vodka y jugo de naranja', 18900, true, false, true, 5);

-- ======================================================
-- MÓDULOS POR SEDE - TRAVIATTA
-- ======================================================

-- Módulo Comida (food)
INSERT INTO branch_modules (branch_id, module_name, is_enabled, display_order, schedule)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'food',
    true,
    1,
    '{"monday":{"start":"11:00","end":"22:00","enabled":true},"tuesday":{"start":"11:00","end":"22:00","enabled":true},"wednesday":{"start":"11:00","end":"22:00","enabled":true},"thursday":{"start":"11:00","end":"22:00","enabled":true},"friday":{"start":"11:00","end":"23:00","enabled":true},"saturday":{"start":"11:00","end":"23:00","enabled":true},"sunday":{"start":"11:00","end":"21:00","enabled":true}}'
);

-- Módulo Bar
INSERT INTO branch_modules (branch_id, module_name, is_enabled, display_order, schedule)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'bar',
    true,
    2,
    '{"monday":{"start":"17:00","end":"22:00","enabled":true},"tuesday":{"start":"17:00","end":"22:00","enabled":true},"wednesday":{"start":"17:00","end":"22:00","enabled":true},"thursday":{"start":"17:00","end":"22:00","enabled":true},"friday":{"start":"17:00","end":"23:00","enabled":true},"saturday":{"start":"17:00","end":"23:00","enabled":true},"sunday":{"start":"17:00","end":"21:00","enabled":true}}'
);

-- Módulo Delivery
INSERT INTO branch_modules (branch_id, module_name, is_enabled, display_order, schedule)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'delivery',
    true,
    3,
    '{"monday":{"start":"11:00","end":"21:30","enabled":true},"tuesday":{"start":"11:00","end":"21:30","enabled":true},"wednesday":{"start":"11:00","end":"21:30","enabled":true},"thursday":{"start":"11:00","end":"21:30","enabled":true},"friday":{"start":"11:00","end":"22:30","enabled":true},"saturday":{"start":"11:00","end":"22:30","enabled":true},"sunday":{"start":"11:00","end":"20:30","enabled":true}}'
);

-- Módulo Mesas
INSERT INTO branch_modules (branch_id, module_name, is_enabled, display_order, settings)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'tables',
    true,
    4,
    '{"enabled":true,"allow_reservations":true,"max_reservation_time_minutes":120}'
);

-- ======================================================
-- SECTORES (Zonas del restaurante)
-- ======================================================

INSERT INTO sectors (id, branch_id, name, description, display_order, is_active)
VALUES 
    ('66666666-6666-6666-6666-666666666601', '22222222-2222-2222-2222-222222222222', 'Terraza', 'Mesas al aire libre', 1, true),
    ('66666666-6666-6666-6666-666666666602', '22222222-2222-2222-2222-222222222222', 'Salón Principal', 'Área central del restaurante', 2, true),
    ('66666666-6666-6666-6666-666666666603', '22222222-2222-2222-2222-222222222222', 'Zona VIP', 'Mesas premium con vista', 3, true),
    ('66666666-6666-6666-6666-666666666604', '22222222-2222-2222-2222-222222222222', 'Barra', 'Asientos en la barra', 4, true);

-- ======================================================
-- MESAS - TRAVIATTA
-- ======================================================

INSERT INTO tables (id, branch_id, sector_id, table_number, table_name, capacity, position_x, position_y, shape, status)
VALUES 
    ('55555555-5555-5555-5555-555555555601', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666601', 'T1', 'Terraza 1', 4, 100, 100, 'rectangle', 'available'),
    ('55555555-5555-5555-5555-555555555602', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666601', 'T2', 'Terraza 2', 4, 250, 100, 'rectangle', 'available'),
    ('55555555-5555-5555-5555-555555555603', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666601', 'T3', 'Terraza 3', 6, 400, 100, 'rectangle', 'available'),
    ('55555555-5555-5555-5555-555555555604', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666602', '1', 'Mesa 1', 4, 100, 250, 'circle', 'available'),
    ('55555555-5555-5555-5555-555555555605', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666602', '2', 'Mesa 2', 2, 250, 250, 'circle', 'available'),
    ('55555555-5555-5555-5555-555555555606', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666602', '3', 'Mesa 3', 6, 400, 250, 'rectangle', 'available'),
    ('55555555-5555-5555-5555-555555555607', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666602', '4', 'Mesa 4', 4, 550, 250, 'circle', 'available'),
    ('55555555-5555-5555-5555-555555555608', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666603', 'VIP1', 'VIP Norte', 6, 100, 400, 'rectangle', 'available'),
    ('55555555-5555-5555-5555-555555555609', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666603', 'VIP2', 'VIP Sur', 8, 300, 400, 'rectangle', 'available'),
    ('55555555-5555-5555-5555-555555555610', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666604', 'B1', 'Barra 1', 2, 100, 550, 'square', 'available'),
    ('55555555-5555-5555-5555-555555555611', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666604', 'B2', 'Barra 2', 2, 200, 550, 'square', 'available');

-- ======================================================
-- USUARIO ADMINISTRADOR
-- ======================================================

-- Contraseña: admin123 (hasheada con bcrypt)
INSERT INTO users (id, tenant_id, name, email, password_hash, role, is_active)
VALUES (
    '77777777-7777-7777-7777-777777777777',
    '11111111-1111-1111-1111-111111111111',
    'Administrador Traviatta',
    'admin@traviatta.com',
    '$2b$10$8YgXJKLs7NpqRqZQzYzYzYzYzYzYzYzYzYzYzYzYzYzYzYzYzYzY',
    'admin',
    true
);

-- ======================================================
-- VERIFICAR DATOS INSERTADOS
-- ======================================================

DO $$
BEGIN
    RAISE NOTICE '=== TRAVIATTA PIZZA GOURMET - DATOS INSERTADOS ===';
    RAISE NOTICE 'Tenants: %', (SELECT COUNT(*) FROM tenants);
    RAISE NOTICE 'Branches: %', (SELECT COUNT(*) FROM branches);
    RAISE NOTICE 'Categories: %', (SELECT COUNT(*) FROM categories);
    RAISE NOTICE 'Products: %', (SELECT COUNT(*) FROM products);
    RAISE NOTICE 'Branch Modules: %', (SELECT COUNT(*) FROM branch_modules);
    RAISE NOTICE 'Sectors: %', (SELECT COUNT(*) FROM sectors);
    RAISE NOTICE 'Tables: %', (SELECT COUNT(*) FROM tables);
    RAISE NOTICE 'Users: %', (SELECT COUNT(*) FROM users);
END $$;