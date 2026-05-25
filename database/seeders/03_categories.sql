-- ======================================================
-- ARCHIVO: 03_categories.sql
-- UBICACIÓN: menu-qr-system/database/seeders/03_categories.sql
-- FASE: F2
-- VERSIÓN: 1.0 (TRAVIATTA PIZZA GOURMET)
-- ÚLTIMA ACTUALIZACIÓN: 2024-05-23 12:00
-- ======================================================
-- 🎯 PROPÓSITO:
-- Datos de las categorías del menú de TRAVIATTA PIZZA GOURMET
-- ======================================================

-- ======================================================
-- CATEGORÍAS PARA TRAVIATTA (Sede Principal)
-- ======================================================

-- Entradas
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

-- Pizzas Nuevas
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

-- Pizzas Clásicas
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

-- Pizzas Cooking (Pollo)
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

-- Pizzas Mexicanas
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

-- Pizzas con Camarones
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

-- Pizzas Vegetarianas
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

-- Lasagnas
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

-- Spaghetti
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

-- Salchipapas
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

-- Crepes de Sal
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

-- Crepes Dulces
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

-- Waffles
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

-- Tragos
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