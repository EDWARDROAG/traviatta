-- ======================================================
-- ARCHIVO: 001_initial_schema.sql
-- UBICACIÓN: menu-qr-system/database/migrations/001_initial_schema_traviatta.sql
-- FASE: F1
-- VERSIÓN: 1.0 (ADAPTADO PARA TRAVIATTA)
-- ÚLTIMA ACTUALIZACIÓN: 2024-05-23 10:00
-- ======================================================
-- 🎯 PROPÓSITO:
-- Esquema inicial de la base de datos para TRAVIATTA PIZZA GOURMET.
-- Tablas adaptadas para menú con pizzas de múltiples tamaños,
-- categorías especiales (mexicanas, cooking, vegetarianas, etc.)
-- ======================================================

-- ======================================================
-- EXTENSIONES
-- ======================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================================================
-- TABLA: tenants (Restaurantes)
-- ======================================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#B56E4A',
    secondary_color VARCHAR(7) DEFAULT '#9B6B43',
    whatsapp_number VARCHAR(20),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    subscription_tier VARCHAR(20) DEFAULT 'basic',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_email ON tenants(email);
CREATE INDEX idx_tenants_is_active ON tenants(is_active);

-- ======================================================
-- TABLA: branches (Sedes - única para Traviatta)
-- ======================================================

CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    whatsapp_number VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT true,
    delivery_zones JSONB DEFAULT '[]',
    delivery_cost DECIMAL(10, 2) DEFAULT 5000,
    free_delivery_min_amount DECIMAL(10, 2) DEFAULT 30000,
    schedule JSONB DEFAULT '{
        "monday": {"open": "11:00", "close": "22:00"},
        "tuesday": {"open": "11:00", "close": "22:00"},
        "wednesday": {"open": "11:00", "close": "22:00"},
        "thursday": {"open": "11:00", "close": "22:00"},
        "friday": {"open": "11:00", "close": "23:00"},
        "saturday": {"open": "11:00", "close": "23:00"},
        "sunday": {"open": "11:00", "close": "21:00"}
    }',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_branches_tenant_id ON branches(tenant_id);
CREATE INDEX idx_branches_is_active ON branches(is_active);

-- ======================================================
-- TABLA: categories (Categorías - adaptadas a Traviatta)
-- ======================================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    module_type VARCHAR(30) DEFAULT 'all',
    start_time TIME,
    end_time TIME,
    days_of_week INTEGER[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_categories_branch_id ON categories(branch_id);
CREATE INDEX idx_categories_module_type ON categories(module_type);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- ======================================================
-- TABLA: products (Productos - adaptada para múltiples tamaños)
-- ======================================================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    -- Campos para múltiples tamaños (pizzas)
    has_sizes BOOLEAN DEFAULT false,
    size_prices JSONB DEFAULT '[]', -- Ej: [{"size":"personal","price":24400},{"size":"mediana","price":42400},{"size":"grande","price":68400}]
    -- Campos adicionales
    image_url TEXT,
    image_public_id VARCHAR(200),
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    preparation_time INT DEFAULT 20,
    allergens TEXT[],
    tags VARCHAR(50)[],
    modifiers JSONB DEFAULT '[]',
    is_spicy BOOLEAN DEFAULT false,
    is_vegetarian BOOLEAN DEFAULT false,
    is_alcoholic BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_available ON products(is_available);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_has_sizes ON products(has_sizes);
CREATE INDEX idx_products_is_spicy ON products(is_spicy);
CREATE INDEX idx_products_is_vegetarian ON products(is_vegetarian);

-- ======================================================
-- TABLA: orders (Pedidos)
-- ======================================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    branch_id UUID NOT NULL REFERENCES branches(id),
    table_id UUID,
    order_type VARCHAR(20) NOT NULL,
    order_number SERIAL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(100),
    delivery_address TEXT,
    delivery_latitude DECIMAL(10, 8),
    delivery_longitude DECIMAL(11, 8),
    items JSONB NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_cost DECIMAL(10, 2) DEFAULT 5000,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(30) DEFAULT 'cash',
    payment_status VARCHAR(20) DEFAULT 'pending',
    order_status VARCHAR(20) DEFAULT 'pending',
    estimated_time INTEGER DEFAULT 30,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX idx_orders_branch_id ON orders(branch_id);
CREATE INDEX idx_orders_table_id ON orders(table_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_order_status ON orders(order_status);

-- ======================================================
-- TABLA: users (Usuarios administradores)
-- ======================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);

-- ======================================================
-- DATOS INICIALES - TRAVIATTA PIZZA GOURMET
-- ======================================================

-- 1. Insertar tenant (restaurante)
INSERT INTO tenants (id, name, slug, primary_color, secondary_color, whatsapp_number, email, phone, address)
VALUES (
    uuid_generate_v4(),
    'Traviatta Pizza Gourmet',
    'traviatta',
    '#B56E4A',
    '#9B6B43',
    '573001112233',
    'info@traviatta.com',
    '6012345678',
    'Calle Principal #123, Bogotá'
);

-- 2. Insertar branch (sede)
-- NOTA: Obtener el tenant_id insertado primero
-- INSERT INTO branches (id, tenant_id, name, address, phone, whatsapp_number)
-- VALUES (uuid_generate_v4(), (SELECT id FROM tenants WHERE slug = 'traviatta'), 'Sede Principal', 'Calle Principal #123, Bogotá', '6012345678', '573001112233');

-- ======================================================
-- FUNCIONES DE ACTUALIZACIÓN
-- ======================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();