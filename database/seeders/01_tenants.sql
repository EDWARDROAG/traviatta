-- ======================================================
-- ARCHIVO: 01_tenants.sql
-- UBICACIÓN: menu-qr-system/database/seeders/01_tenants.sql
-- FASE: F1
-- VERSIÓN: 1.0 (TRAVIATTA PIZZA GOURMET)
-- ÚLTIMA ACTUALIZACIÓN: 2024-05-23 11:30
-- ======================================================
-- 🎯 PROPÓSITO:
-- Datos del restaurante TRAVIATTA PIZZA GOURMET
-- ======================================================

-- ======================================================
-- RESTAURANTE TRAVIATTA PIZZA GOURMET
-- ======================================================

INSERT INTO tenants (id, name, slug, logo_url, primary_color, whatsapp_number, email, phone, address, is_active, subscription_tier, settings)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Traviatta Pizza Gourmet',
    'traviatta',
    'https://res.cloudinary.com/demo/image/upload/v1/samples/food/pizza',
    '#B56E4A',
    '573001112233',
    'info@traviatta.com',
    '6012345678',
    'Calle Principal #123, Bogotá',
    true,
    'premium',
    '{"theme": "light", "currency": "COP", "language": "es", "primary_color": "#B56E4A", "secondary_color": "#9B6B43"}'
);