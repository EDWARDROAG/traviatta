-- ======================================================
-- ARCHIVO: 003_add_branch_modules.sql
-- UBICACIÓN: menu-qr-system/database/migrations/003_add_branch_modules.sql
-- FASE: F3
-- VERSIÓN: 1.0 (ADAPTADO PARA TRAVIATTA)
-- ÚLTIMA ACTUALIZACIÓN: 2024-05-23 10:45
-- ======================================================
-- 🎯 PROPÓSITO:
-- Agrega la tabla de módulos activables por sede
-- para controlar los diferentes servicios de TRAVIATTA:
-- - Comida (todo el día)
-- - Bar/Tragos (horario nocturno)
-- - Domicilios
-- - Reservas
-- - Eventos especiales
-- ======================================================

-- ======================================================
-- TABLA: branch_modules (Módulos por sede)
-- ======================================================

CREATE TABLE branch_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    module_name VARCHAR(30) NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    schedule JSONB DEFAULT '{
        "monday": {"start": "11:00", "end": "22:00", "enabled": true},
        "tuesday": {"start": "11:00", "end": "22:00", "enabled": true},
        "wednesday": {"start": "11:00", "end": "22:00", "enabled": true},
        "thursday": {"start": "11:00", "end": "22:00", "enabled": true},
        "friday": {"start": "11:00", "end": "23:00", "enabled": true},
        "saturday": {"start": "11:00", "end": "23:00", "enabled": true},
        "sunday": {"start": "11:00", "end": "21:00", "enabled": true}
    }',
    settings JSONB DEFAULT '{}',
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(branch_id, module_name)
);

-- Índices
CREATE INDEX idx_branch_modules_branch_id ON branch_modules(branch_id);
CREATE INDEX idx_branch_modules_module_name ON branch_modules(module_name);
CREATE INDEX idx_branch_modules_is_enabled ON branch_modules(is_enabled);

-- ======================================================
-- DATOS INICIALES - MÓDULOS PARA TRAVIATTA
-- ======================================================

-- NOTA: Ejecutar después de insertar el branch
-- Módulo de COMIDA (siempre activo)
INSERT INTO branch_modules (branch_id, module_name, is_enabled, display_order, schedule)
SELECT 
    id, 
    'food', 
    true, 
    1,
    '{
        "monday": {"start": "11:00", "end": "22:00", "enabled": true},
        "tuesday": {"start": "11:00", "end": "22:00", "enabled": true},
        "wednesday": {"start": "11:00", "end": "22:00", "enabled": true},
        "thursday": {"start": "11:00", "end": "22:00", "enabled": true},
        "friday": {"start": "11:00", "end": "23:00", "enabled": true},
        "saturday": {"start": "11:00", "end": "23:00", "enabled": true},
        "sunday": {"start": "11:00", "end": "21:00", "enabled": true}
    }'::jsonb
FROM branches 
LIMIT 1;

-- Módulo de BAR (activo en horario nocturno)
INSERT INTO branch_modules (branch_id, module_name, is_enabled, display_order, schedule)
SELECT 
    id, 
    'bar', 
    true, 
    2,
    '{
        "monday": {"start": "17:00", "end": "22:00", "enabled": true},
        "tuesday": {"start": "17:00", "end": "22:00", "enabled": true},
        "wednesday": {"start": "17:00", "end": "22:00", "enabled": true},
        "thursday": {"start": "17:00", "end": "22:00", "enabled": true},
        "friday": {"start": "17:00", "end": "23:00", "enabled": true},
        "saturday": {"start": "17:00", "end": "23:00", "enabled": true},
        "sunday": {"start": "17:00", "end": "21:00", "enabled": true}
    }'::jsonb
FROM branches 
LIMIT 1;

-- Módulo de DOMICILIOS
INSERT INTO branch_modules (branch_id, module_name, is_enabled, display_order, schedule)
SELECT 
    id, 
    'delivery', 
    true, 
    3,
    '{
        "monday": {"start": "11:00", "end": "21:30", "enabled": true},
        "tuesday": {"start": "11:00", "end": "21:30", "enabled": true},
        "wednesday": {"start": "11:00", "end": "21:30", "enabled": true},
        "thursday": {"start": "11:00", "end": "21:30", "enabled": true},
        "friday": {"start": "11:00", "end": "22:30", "enabled": true},
        "saturday": {"start": "11:00", "end": "22:30", "enabled": true},
        "sunday": {"start": "11:00", "end": "20:30", "enabled": true}
    }'::jsonb
FROM branches 
LIMIT 1;

-- Módulo de RESERVAS
INSERT INTO branch_modules (branch_id, module_name, is_enabled, display_order, schedule)
SELECT 
    id, 
    'reservations', 
    true, 
    4,
    '{
        "monday": {"start": "10:00", "end": "20:00", "enabled": true},
        "tuesday": {"start": "10:00", "end": "20:00", "enabled": true},
        "wednesday": {"start": "10:00", "end": "20:00", "enabled": true},
        "thursday": {"start": "10:00", "end": "20:00", "enabled": true},
        "friday": {"start": "10:00", "end": "21:00", "enabled": true},
        "saturday": {"start": "10:00", "end": "21:00", "enabled": true},
        "sunday": {"start": "10:00", "end": "19:00", "enabled": true}
    }'::jsonb
FROM branches 
LIMIT 1;

-- ======================================================
-- MÓDULOS DISPONIBLES PARA TRAVIATTA
-- ======================================================
-- 
-- | module_name    | Descripción                          |
-- |----------------|--------------------------------------|
-- | food           | Comida (pizzas, pastas, entradas)    |
-- | bar            | Tragos y bebidas alcohólicas         |
-- | delivery       | Servicio a domicilio                  |
-- | reservations   | Reservas de mesas                     |
-- | events         | Eventos especiales (opcional)        |
-- | takeaway       | Para llevar (opcional)               |
--
-- ======================================================

-- ======================================================
-- TRIGGER: Actualizar updated_at
-- ======================================================

CREATE TRIGGER update_branch_modules_updated_at
    BEFORE UPDATE ON branch_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ======================================================
-- FUNCIÓN: Verificar si un módulo está activo según horario
-- ======================================================

CREATE OR REPLACE FUNCTION is_module_available(
    p_branch_id UUID,
    p_module_name VARCHAR(30),
    p_current_time TIME DEFAULT CURRENT_TIME,
    p_current_day INTEGER DEFAULT EXTRACT(DOW FROM CURRENT_DATE)
)
RETURNS BOOLEAN AS $$
DECLARE
    v_module RECORD;
    v_day_key TEXT;
    v_day_mapping TEXT[];
BEGIN
    -- Mapeo de días: 0=Domingo, 1=Lunes, ..., 6=Sábado
    v_day_mapping := ARRAY['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    v_day_key := v_day_mapping[p_current_day + 1];
    
    -- Buscar el módulo
    SELECT * INTO v_module
    FROM branch_modules
    WHERE branch_id = p_branch_id 
      AND module_name = p_module_name
      AND is_enabled = true;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Verificar horario para el día específico
    IF v_module.schedule ? v_day_key THEN
        RETURN (
            (v_module.schedule->v_day_key->>'enabled')::boolean = true
            AND p_current_time >= (v_module.schedule->v_day_key->>'start')::time
            AND p_current_time <= (v_module.schedule->v_day_key->>'end')::time
        );
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql;