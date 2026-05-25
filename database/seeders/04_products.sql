-- ======================================================
-- ARCHIVO: 04_products.sql
-- UBICACIÓN: menu-qr-system/database/seeders/04_products.sql
-- FASE: F2
-- VERSIÓN: 1.1 (TRAVIATTA PIZZA GOURMET - CORREGIDO)
-- ÚLTIMA ACTUALIZACIÓN: 2024-05-23 13:30
-- ======================================================
-- 🎯 PROPÓSITO:
-- Datos de productos del menú de TRAVIATTA PIZZA GOURMET
-- ======================================================

-- ======================================================
-- PRODUCTOS - ENTRADAS
-- ======================================================

INSERT INTO products (id, category_id, name, description, price, is_available, is_featured, preparation_time, tags)
VALUES 
    ('44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333301', 'Crunch Traviatta', 'Pollo apanado doble crunch, paprika, salsa Traviatta', 19900, true, true, 15, ARRAY['popular']),
    ('44444444-4444-4444-4444-444444444402', '33333333-3333-3333-3333-333333333301', 'BBQ Honey Crunch', 'Pollo crujiente, salsa BBQ ahumada + miel, ajonjolí, ranch', 21400, true, true, 15, ARRAY['popular']),
    ('44444444-4444-4444-4444-444444444403', '33333333-3333-3333-3333-333333333301', 'Mozzarella Caliente', 'Tomate cherry, queso mozzarella, aceite de oliva, orégano', 27900, true, false, 12, ARRAY[]::varchar[]),
    ('44444444-4444-4444-4444-444444444404', '33333333-3333-3333-3333-333333333301', 'Mozzarella Pepperoni', 'Queso mozzarella, pepperoni, aceite de oliva, orégano', 32400, true, false, 12, ARRAY[]::varchar[]);

-- ======================================================
-- PRODUCTOS - PIZZAS NUEVAS (con múltiples tamaños)
-- ======================================================

INSERT INTO products (id, category_id, name, description, has_sizes, size_prices, is_available, is_featured, preparation_time, tags)
VALUES 
    ('44444444-4444-4444-4444-444444444405', '33333333-3333-3333-3333-333333333302', 'Pizza Traviatta', 'Tomate seco, rúgula, queso parmesano, aceite de oliva, albahaca', true, '[{"size":"personal","price":24400},{"size":"mediana","price":42400},{"size":"grande","price":68400}]', true, true, 20, ARRAY['popular']),
    ('44444444-4444-4444-4444-444444444406', '33333333-3333-3333-3333-333333333302', 'Pizza Traviatta Plus', 'Jamón serrano, tomate seco, rúgula, queso parmesano, aceite de oliva, albahaca', true, '[{"size":"personal","price":25400},{"size":"mediana","price":44900},{"size":"grande","price":77400}]', true, true, 20, ARRAY['popular']),
    ('44444444-4444-4444-4444-444444444407', '33333333-3333-3333-3333-333333333302', 'Pizza Nutella', 'Nutella, fresa, banano, queso', true, '[{"size":"personal","price":25400},{"size":"mediana","price":39900},{"size":"grande","price":65400}]', true, false, 15, ARRAY[]::varchar[]);

-- ======================================================
-- PRODUCTOS - PIZZAS CLÁSICAS
-- ======================================================

INSERT INTO products (id, category_id, name, description, has_sizes, size_prices, is_available, is_featured, preparation_time)
VALUES 
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

INSERT INTO products (id, category_id, name, description, has_sizes, size_prices, is_available, is_featured)
VALUES 
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

INSERT INTO products (id, category_id, name, description, has_sizes, size_prices, is_available, is_featured, is_spicy)
VALUES 
    ('44444444-4444-4444-4444-444444444422', '33333333-3333-3333-3333-333333333305', 'Chile', 'Frijol, salsa picante, salsa bolognesa, queso', true, '[{"size":"personal","price":21400},{"size":"mediana","price":36900},{"size":"grande","price":57900}]', true, false, true),
    ('44444444-4444-4444-4444-444444444423', '33333333-3333-3333-3333-333333333305', 'Jalisco', 'Salsa bolognesa, chorizo especial, frijol, orégano, queso', true, '[{"size":"personal","price":24400},{"size":"mediana","price":36900},{"size":"grande","price":57900}]', true, false, false),
    ('44444444-4444-4444-4444-444444444424', '33333333-3333-3333-3333-333333333305', 'Picaleña', 'Pepperoni, jalapeños, pimentón, cebolla', true, '[{"size":"personal","price":21900},{"size":"mediana","price":37400},{"size":"grande","price":59900}]', true, true, true),
    ('44444444-4444-4444-4444-444444444425', '33333333-3333-3333-3333-333333333305', 'Carolina Reaper', 'Salsa bolognesa, ají carolina reaper, aguacate, pico de gallo (MUY PICANTE)', true, '[{"size":"personal","price":24400},{"size":"mediana","price":41900},{"size":"grande","price":65400}]', true, false, true);

-- ======================================================
-- PRODUCTOS - PIZZAS CON CAMARONES
-- ======================================================

INSERT INTO products (id, category_id, name, description, has_sizes, size_prices, is_available, is_featured)
VALUES 
    ('44444444-4444-4444-4444-444444444426', '33333333-3333-3333-3333-333333333306', 'Camarón al BBQ', 'Camarones salteados en salsa BBQ y queso', true, '[{"size":"personal","price":24400},{"size":"mediana","price":42400},{"size":"grande","price":68900}]', true, true),
    ('44444444-4444-4444-4444-444444444427', '33333333-3333-3333-3333-333333333306', 'Camarones al Curry', 'Camarones salteados en salsa curry, queso y orégano', true, '[{"size":"personal","price":24900},{"size":"mediana","price":42400},{"size":"grande","price":68900}]', true, false),
    ('44444444-4444-4444-4444-444444444428', '33333333-3333-3333-3333-333333333306', 'Camarón y Jamón', 'Camarones salteados, jamón, queso', true, '[{"size":"personal","price":24900},{"size":"mediana","price":42400},{"size":"grande","price":68900}]', true, false);

-- ======================================================
-- PRODUCTOS - PIZZAS VEGETARIANAS
-- ======================================================

INSERT INTO products (id, category_id, name, description, has_sizes, size_prices, is_available, is_featured, is_vegetarian)
VALUES 
    ('44444444-4444-4444-4444-444444444429', '33333333-3333-3333-3333-333333333307', 'Napolitana', 'Rodajas de tomate, queso', true, '[{"size":"personal","price":19400},{"size":"mediana","price":32400},{"size":"grande","price":51400}]', true, false, true),
    ('44444444-4444-4444-4444-444444444430', '33333333-3333-3333-3333-333333333307', 'Vegetariana Suprema', 'Vegetales, champiñones, cebolla roja, pimentón, aceitunas verdes', true, '[{"size":"personal","price":19900},{"size":"mediana","price":32900},{"size":"grande","price":54900}]', true, true, true),
    ('44444444-4444-4444-4444-444444444431', '33333333-3333-3333-3333-333333333307', 'Vegetariana Premium', 'Vegetales, champiñones, pimentón, cebolla roja, maíz', true, '[{"size":"personal","price":19900},{"size":"mediana","price":33400},{"size":"grande","price":54900}]', true, false, true);

-- ======================================================
-- PRODUCTOS - LASAGNAS
-- ======================================================

INSERT INTO products (id, category_id, name, description, has_sizes, size_prices, is_available, is_featured, preparation_time)
VALUES 
    ('44444444-4444-4444-4444-444444444432', '33333333-3333-3333-3333-333333333308', 'Lasagna Traviatta', 'Plátano madurito, pollo horneado, jamón ahumado, salsa bolognesa, queso', true, '[{"size":"pequeña","price":30900},{"size":"grande","price":36900}]', true, true, 25),
    ('44444444-4444-4444-4444-444444444433', '33333333-3333-3333-3333-333333333308', 'Lomo BBQ Crunch', 'Lomo de cerdo, queso cheddar, queso parmesano, salsa BBQ, pan de ajo', true, '[{"size":"pequeña","price":35900},{"size":"grande","price":41900}]', true, true, 25),
    ('44444444-4444-4444-4444-444444444434', '33333333-3333-3333-3333-333333333308', 'Camarón Coco Braseado', 'Camarones, salsa de coco, queso, pan de ajo', true, '[{"size":"pequeña","price":41900},{"size":"grande","price":52900}]', true, false, 25),
    ('44444444-4444-4444-4444-444444444435', '33333333-3333-3333-3333-333333333308', 'Bolognesa', 'Salsa bolognesa, queso, pan de ajo', true, '[{"size":"pequeña","price":28400},{"size":"grande","price":34400}]', true, false, 20),
    ('44444444-4444-4444-4444-444444444436', '33333333-3333-3333-3333-333333333308', 'Especial de la Casa', 'Pollo, jamón, champiñones, salsa bolognesa, queso', true, '[{"size":"pequeña","price":28400},{"size":"grande","price":34400}]', true, false, 20),
    ('44444444-4444-4444-4444-444444444437', '33333333-3333-3333-3333-333333333308', 'Pollo Bechamel', 'Pollo horneado, champiñones, salsa bechamel, queso', true, '[{"size":"pequeña","price":28400},{"size":"grande","price":34400}]', true, false, 20),
    ('44444444-4444-4444-4444-444444444438', '33333333-3333-3333-3333-333333333308', 'Pollo Carbonara', 'Pollo, tocineta, crema de leche, salsa bechamel, queso', true, '[{"size":"pequeña","price":28400},{"size":"grande","price":34400}]', true, false, 20);

-- ======================================================
-- PRODUCTOS - SPAGHETTI
-- ======================================================

INSERT INTO products (id, category_id, name, description, has_sizes, size_prices, is_available, is_featured, preparation_time)
VALUES 
    ('44444444-4444-4444-4444-444444444439', '33333333-3333-3333-3333-333333333309', 'Camarones Marineros y Ajo', 'Camarones, cebolla, queso parmesano, salsa bechamel, pan de ajo', true, '[{"size":"pequeña","price":32900},{"size":"grande","price":37900}]', true, true, 20),
    ('44444444-4444-4444-4444-444444444440', '33333333-3333-3333-3333-333333333309', 'Pollo Carbonara', 'Pollo horneado, tocineta, queso parmesano, crema de leche, salsa bechamel', true, '[{"size":"pequeña","price":28900},{"size":"grande","price":34400}]', true, false, 20),
    ('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333309', 'Pollo Bechamel', 'Pollo horneado, salsa bechamel, champiñones, queso parmesano', true, '[{"size":"pequeña","price":28900},{"size":"grande","price":34400}]', true, false, 20),
    ('44444444-4444-4444-4444-444444444442', '33333333-3333-3333-3333-333333333309', 'Bolognesa', 'Salsa bolognesa, queso parmesano, pan de ajo', true, '[{"size":"pequeña","price":28900},{"size":"grande","price":34400}]', true, false, 20);

-- ======================================================
-- PRODUCTOS - SALCHIPAPAS
-- ======================================================

INSERT INTO products (id, category_id, name, description, price, is_available, is_featured, preparation_time)
VALUES 
    ('44444444-4444-4444-4444-444444444443', '33333333-3333-3333-3333-333333333310', 'Salchipapa Sencilla', 'Papa, salchicha americana ZENU', 14400, true, false, 12),
    ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333310', 'Salchipapa con Queso', 'Papa, salchicha americana ZENU, queso', 15400, true, false, 12),
    ('44444444-4444-4444-4444-444444444445', '33333333-3333-3333-3333-333333333310', 'Salchipollo', 'Papa, salchicha americana ZENU, queso, pollo, papa chip', 17900, true, true, 15),
    ('44444444-4444-4444-4444-444444444446', '33333333-3333-3333-3333-333333333310', 'Choripapa', 'Papa, chorizo, butifarra, salchicha americana ZENU, queso, papa chip', 21400, true, true, 15);

-- ======================================================
-- PRODUCTOS - CREPES DE SAL
-- ======================================================

INSERT INTO products (id, category_id, name, description, price, is_available, is_featured, preparation_time)
VALUES 
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

INSERT INTO products (id, category_id, name, description, price, is_available, is_featured, preparation_time)
VALUES 
    ('44444444-4444-4444-4444-444444444454', '33333333-3333-3333-3333-333333333312', 'Sencillo', 'Arequipe, queso y una salsa', 17900, true, false, 10),
    ('44444444-4444-4444-4444-444444444455', '33333333-3333-3333-3333-333333333312', 'Tradicional', 'Banano, fresas y una salsa', 18900, true, true, 10),
    ('44444444-4444-4444-4444-444444444456', '33333333-3333-3333-3333-333333333312', 'Tentación', 'Nutella, fresa, banano y crema chantilly', 21400, true, true, 10);

-- ======================================================
-- PRODUCTOS - WAFFLES
-- ======================================================

INSERT INTO products (id, category_id, name, description, price, is_available, is_featured, preparation_time)
VALUES 
    ('44444444-4444-4444-4444-444444444457', '33333333-3333-3333-3333-333333333313', 'Sencillo', 'Bola de helado, crema chantilly, fresas y salsas', 19400, true, false, 12),
    ('44444444-4444-4444-4444-444444444458', '33333333-3333-3333-3333-333333333313', 'Especial', 'Dos bolas de helado, fresas, banano, crema chantilly, masmelos y salsas', 24400, true, true, 12),
    ('44444444-4444-4444-4444-444444444459', '33333333-3333-3333-3333-333333333313', 'Nutella', 'Helado de vainilla, nutella, banano, fresas y crema chantilly', 24400, true, true, 12),
    ('44444444-4444-4444-4444-444444444460', '33333333-3333-3333-3333-333333333313', 'Tentación Chocolate', 'Helado de chocolate, crema chantilly, barrita Kinder, M&Ms, salsas, galletas Oreo', 24400, true, false, 12);

-- ======================================================
-- PRODUCTOS - TRAGOS (con is_alcoholic = true)
-- ======================================================

INSERT INTO products (id, category_id, name, description, price, is_available, is_featured, is_alcoholic, preparation_time)
VALUES 
    ('44444444-4444-4444-4444-444444444461', '33333333-3333-3333-3333-333333333314', 'Mojito Traviatta Fresh', 'Ron blanco, azúcar, limón, hierbabuena, soda', 19900, true, true, true, 5),
    ('44444444-4444-4444-4444-444444444462', '33333333-3333-3333-3333-333333333314', 'Sunrise Tropical', 'Tequila, jugo de naranja, granadina', 22900, true, true, true, 5),
    ('44444444-4444-4444-4444-444444444463', '33333333-3333-3333-3333-333333333314', 'Blue Lagoon XL Traviatta', 'Vodka, sour mix, curaçao azul', 23900, true, false, true, 5),
    ('44444444-4444-4444-4444-444444444464', '33333333-3333-3333-3333-333333333314', 'Coco Breeze Punch', 'Vodka, licor de coco, jugo de piña, jugo de arándano', 24900, true, true, true, 5),
    ('44444444-4444-4444-4444-444444444465', '33333333-3333-3333-3333-333333333314', 'Naranja Sunrise Vodka', 'Vodka y jugo de naranja', 18900, true, false, true, 5);

-- ======================================================
-- VERIFICAR DATOS INSERTADOS
-- ======================================================

DO $$
BEGIN
    RAISE NOTICE '=== TRAVIATTA PIZZA GOURMET - PRODUCTOS INSERTADOS ===';
    RAISE NOTICE 'Total productos: %', (SELECT COUNT(*) FROM products);
    RAISE NOTICE '  - Entradas: %', (SELECT COUNT(*) FROM products WHERE category_id = '33333333-3333-3333-3333-333333333301');
    RAISE NOTICE '  - Pizzas Nuevas: %', (SELECT COUNT(*) FROM products WHERE category_id = '33333333-3333-3333-3333-333333333302');
    RAISE NOTICE '  - Pizzas Clásicas: %', (SELECT COUNT(*) FROM products WHERE category_id = '33333333-3333-3333-3333-333333333303');
    RAISE NOTICE '  - Pizzas Cooking: %', (SELECT COUNT(*) FROM products WHERE category_id = '33333333-3333-3333-3333-333333333304');
    RAISE NOTICE '  - Pizzas Mexicanas: %', (SELECT COUNT(*) FROM products WHERE category_id = '33333333-3333-3333-3333-333333333305');
    RAISE NOTICE '  - Pizzas con Camarones: %', (SELECT COUNT(*) FROM products WHERE category_id = '33333333-3333-3333-3333-333333333306');
    RAISE NOTICE '  - Pizzas Vegetarianas: %', (SELECT COUNT(*) FROM products WHERE category_id = '33333333-3333-3333-3333-333333333307');
    RAISE NOTICE '  - Lasagnas: %', (SELECT COUNT(*) FROM products WHERE category_id = '33333333-3333-3333-3333-333333333308');
    RAISE NOTICE '  - Spaghetti: %', (SELECT COUNT(*) FROM products WHERE category_id = '33333333-3333-3333-3333-333333333309');
    RAISE NOTICE '  - Salchipapas: %', (SELECT COUNT(*) FROM products WHERE category_id = '33333333-3333-3333-3333-333333333310');
    RAISE NOTICE '  - Crepes de Sal: %', (SELECT COUNT(*) FROM products WHERE category_id = '33333333-3333-3333-3333-333333333311');
    RAISE NOTICE '  - Crepes Dulces: %', (SELECT COUNT(*) FROM products WHERE category_id = '33333333-3333-3333-3333-333333333312');
    RAISE NOTICE '  - Waffles: %', (SELECT COUNT(*) FROM products WHERE category_id = '33333333-3333-3333-3333-333333333313');
    RAISE NOTICE '  - Tragos: %', (SELECT COUNT(*) FROM products WHERE category_id = '33333333-3333-3333-3333-333333333314');
END $$;