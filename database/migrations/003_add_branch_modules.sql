-- ======================================================
-- ARCHIVO: 003_add_branch_modules.sql
-- UBICACIÓN: menu-qr-system/database/migrations/003_add_branch_modules.sql
-- FASE: F3
-- VERSIÓN: 1.0
-- ÚLTIMA ACTUALIZACIÓN: 2024-01-17 10:30
-- ======================================================
-- 🎯 PROPÓSITO:
-- Agrega la tabla de módulos activables por sede
-- para controlar desayunos, almuerzos, comida rápida y bar.
-- ======================================================

-- ======================================================
-- TABLA: branch_modules (Módulos por sede)
-- ======================================================

CREATE TABLE branch_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    module_name VARCHAR(30) NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    schedule JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(branch_id, module_name)
);

-- Índices
CREATE INDEX idx_branch_modules_branch_id ON branch_modules(branch_id);
CREATE INDEX idx_branch_modules_module_name ON branch_modules(module_name);
CREATE INDEX idx_branch_modules_is_enabled ON branch_modules(is_enabled);

-- ======================================================
-- FUNCIÓN: actualizar updated_at automáticamente
-- ======================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ======================================================
-- TRIGGERS
-- ======================================================

CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branches_updated_at
    BEFORE UPDATE ON branches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tables_updated_at
    BEFORE UPDATE ON tables
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branch_modules_updated_at
    BEFORE UPDATE ON branch_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();