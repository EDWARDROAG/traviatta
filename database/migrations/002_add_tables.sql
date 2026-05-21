-- ======================================================
-- ARCHIVO: 002_add_tables.sql
-- UBICACIÓN: menu-qr-system/database/migrations/002_add_tables.sql
-- FASE: F4
-- VERSIÓN: 1.0
-- ÚLTIMA ACTUALIZACIÓN: 2024-01-17 10:15
-- ======================================================
-- 🎯 PROPÓSITO:
-- Agrega la tabla de mesas para el servicio en local
-- y la relación con pedidos.
-- ======================================================

-- ======================================================
-- TABLA: tables (Mesas)
-- ======================================================

CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    table_number VARCHAR(20) NOT NULL,
    table_name VARCHAR(50),
    qr_code TEXT,
    capacity INT DEFAULT 4,
    position_x INT DEFAULT 0,
    position_y INT DEFAULT 0,
    shape VARCHAR(20) DEFAULT 'circle',
    width INT DEFAULT 60,
    height INT DEFAULT 60,
    status VARCHAR(20) DEFAULT 'available',
    current_order_id UUID,
    is_active BOOLEAN DEFAULT true,
    occupied_since TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_tables_branch_id ON tables(branch_id);
CREATE INDEX idx_tables_status ON tables(status);
CREATE INDEX idx_tables_current_order_id ON tables(current_order_id);

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