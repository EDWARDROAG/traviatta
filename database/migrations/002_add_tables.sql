-- ======================================================
-- ARCHIVO: 002_add_tables.sql
-- UBICACIÓN: menu-qr-system/database/migrations/002_add_tables.sql
-- FASE: F4
-- VERSIÓN: 1.0 (ADAPTADO PARA TRAVIATTA)
-- ÚLTIMA ACTUALIZACIÓN: 2024-05-23 10:30
-- ======================================================
-- 🎯 PROPÓSITO:
-- Agrega la tabla de mesas para el servicio en local
-- en TRAVIATTA PIZZA GOURMET, incluyendo sectores del
-- restaurante y gestión visual.
-- ======================================================

-- ======================================================
-- TABLA: sectors (Sectores/Zonas del restaurante)
-- ======================================================

CREATE TABLE sectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sectors_branch_id ON sectors(branch_id);
CREATE INDEX idx_sectors_is_active ON sectors(is_active);

-- ======================================================
-- TABLA: tables (Mesas)
-- ======================================================

CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    sector_id UUID REFERENCES sectors(id) ON DELETE SET NULL,
    table_number VARCHAR(20) NOT NULL,
    table_name VARCHAR(50),
    qr_code TEXT,
    qr_code_url TEXT,
    capacity INT DEFAULT 4,
    -- Coordenadas para el mapa visual
    position_x INT DEFAULT 0,
    position_y INT DEFAULT 0,
    shape VARCHAR(20) DEFAULT 'circle',
    width INT DEFAULT 60,
    height INT DEFAULT 60,
    -- Estado de la mesa
    status VARCHAR(20) DEFAULT 'available',
    current_order_id UUID,
    current_order_total DECIMAL(10, 2),
    current_order_items INT DEFAULT 0,
    occupied_since TIMESTAMP WITH TIME ZONE,
    last_service_request TIMESTAMP WITH TIME ZONE,
    -- Flags
    is_active BOOLEAN DEFAULT true,
    requires_attention BOOLEAN DEFAULT false,
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_tables_branch_id ON tables(branch_id);
CREATE INDEX idx_tables_sector_id ON tables(sector_id);
CREATE INDEX idx_tables_status ON tables(status);
CREATE INDEX idx_tables_current_order_id ON tables(current_order_id);
CREATE INDEX idx_tables_is_active ON tables(is_active);
CREATE INDEX idx_tables_requires_attention ON tables(requires_attention);

-- ======================================================
-- TABLA: table_requests (Solicitudes de mesero)
-- ======================================================

CREATE TABLE table_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    request_type VARCHAR(30) NOT NULL, -- 'service', 'bill', 'water', 'menu', 'other'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'attended', 'cancelled'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attended_at TIMESTAMP WITH TIME ZONE,
    attended_by UUID
);

CREATE INDEX idx_table_requests_table_id ON table_requests(table_id);
CREATE INDEX idx_table_requests_status ON table_requests(status);
CREATE INDEX idx_table_requests_created_at ON table_requests(created_at);

-- ======================================================
-- AGREGAR FOREIGN KEY a orders
-- ======================================================

ALTER TABLE orders
ADD CONSTRAINT fk_orders_table_id
FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL;

-- ======================================================
-- AGREGAR FOREIGN KEY a tables.current_order_id
-- ======================================================

ALTER TABLE tables
ADD CONSTRAINT fk_tables_current_order_id
FOREIGN KEY (current_order_id) REFERENCES orders(id) ON DELETE SET NULL;

-- ======================================================
-- DATOS INICIALES - SECTORES PARA TRAVIATTA
-- ======================================================

-- NOTA: Ejecutar después de insertar el branch
-- INSERT INTO sectors (id, branch_id, name, description, display_order) VALUES
-- (uuid_generate_v4(), (SELECT id FROM branches LIMIT 1), 'Terraza', 'Mesas al aire libre', 1),
-- (uuid_generate_v4(), (SELECT id FROM branches LIMIT 1), 'Salón Principal', 'Área central del restaurante', 2),
-- (uuid_generate_v4(), (SELECT id FROM branches LIMIT 1), 'Zona VIP', 'Mesas premium con vista', 3),
-- (uuid_generate_v4(), (SELECT id FROM branches LIMIT 1), 'Barra', 'Asientos en la barra', 4);

-- ======================================================
-- DATOS INICIALES - MESAS PARA TRAVIATTA
-- ======================================================

-- NOTA: Ejecutar después de insertar sectores
-- INSERT INTO tables (id, branch_id, sector_id, table_number, table_name, capacity, position_x, position_y, shape) VALUES
-- (uuid_generate_v4(), (SELECT id FROM branches LIMIT 1), (SELECT id FROM sectors WHERE name = 'Terraza' LIMIT 1), 'T1', 'Terraza 1', 4, 100, 100, 'rectangle'),
-- (uuid_generate_v4(), (SELECT id FROM branches LIMIT 1), (SELECT id FROM sectors WHERE name = 'Terraza' LIMIT 1), 'T2', 'Terraza 2', 4, 250, 100, 'rectangle'),
-- (uuid_generate_v4(), (SELECT id FROM branches LIMIT 1), (SELECT id FROM sectors WHERE name = 'Salón Principal' LIMIT 1), '1', 'Mesa 1', 4, 100, 250, 'circle'),
-- (uuid_generate_v4(), (SELECT id FROM branches LIMIT 1), (SELECT id FROM sectors WHERE name = 'Salón Principal' LIMIT 1), '2', 'Mesa 2', 2, 250, 250, 'circle'),
-- (uuid_generate_v4(), (SELECT id FROM branches LIMIT 1), (SELECT id FROM sectors WHERE name = 'Salón Principal' LIMIT 1), '3', 'Mesa 3', 6, 400, 250, 'rectangle'),
-- (uuid_generate_v4(), (SELECT id FROM branches LIMIT 1), (SELECT id FROM sectors WHERE name = 'Zona VIP' LIMIT 1), 'VIP1', 'VIP Norte', 6, 550, 100, 'rectangle'),
-- (uuid_generate_v4(), (SELECT id FROM branches LIMIT 1), (SELECT id FROM sectors WHERE name = 'Zona VIP' LIMIT 1), 'VIP2', 'VIP Sur', 8, 700, 100, 'rectangle');

-- ======================================================
-- FUNCIÓN: Generar QR para mesas
-- ======================================================

CREATE OR REPLACE FUNCTION generate_table_qr()
RETURNS TRIGGER AS $$
BEGIN
    NEW.qr_code = 'https://menu.traviatta.com/table/' || NEW.id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_table_qr_trigger
BEFORE INSERT ON tables
FOR EACH ROW
WHEN (NEW.qr_code IS NULL)
EXECUTE FUNCTION generate_table_qr();

-- ======================================================
-- TRIGGER: Actualizar updated_at para nuevas tablas
-- ======================================================

CREATE TRIGGER update_sectors_updated_at BEFORE UPDATE ON sectors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON tables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();