#!/usr/bin/env python3
# ======================================================
# ARCHIVO: create_admin_user.py
# UBICACIÓN: menu-qr-system/scripts/create_admin_user.py
# FASE: F2
# VERSIÓN: 1.0
# ÚLTIMA ACTUALIZACIÓN: 2024-05-22 21:00
#
# 🎯 PROPÓSITO:
# Script para crear un usuario administrador en la base
# de datos del sistema MENU QR PLUS.
#
# 📦 DEPENDENCIAS:
# - psycopg2: Conexión a PostgreSQL
# - bcrypt: Hashing de contraseñas
# - uuid: Generación de IDs únicos
#
# 🔗 RELACIONES:
# - Conecta directamente a PostgreSQL
# - Crea tenant, branch y usuario admin
#
# 📋 HISTORIAL DE CAMBIOS:
# ------------------------------------------------------
# 1.0 - 2024-05-22 21:00
#    ✅ Creación inicial del script
#    ✅ Conexión a PostgreSQL
#    ✅ Hashing de contraseña con bcrypt
#    ✅ Creación de tenant, branch y admin
# ======================================================

import os
import sys
import uuid
import bcrypt
import psycopg2
from psycopg2 import sql
from datetime import datetime

# ======================================================
# CONFIGURACIÓN
# ======================================================

# Datos del usuario administrador
ADMIN_EMAIL = "admin@restaurante.com"
ADMIN_PASSWORD = "admin123"
ADMIN_NAME = "Administrador"

# Datos del restaurante (tenant)
TENANT_NAME = "Mi Restaurante"
TENANT_SLUG = "mi-restaurante"
TENANT_WHATSAPP = "573001112233"

# Datos de la sucursal (branch)
BRANCH_NAME = "Sede Principal"
BRANCH_ADDRESS = "Calle Principal #123"
BRANCH_PHONE = "6012345678"
BRANCH_WHATSAPP = "573001112233"

# ======================================================
# CONEXIÓN A POSTGRESQL
# ======================================================

def get_db_connection():
    """Establece conexión con PostgreSQL"""
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', '5432'),
            database=os.getenv('DB_NAME', 'menu_db'),
            user=os.getenv('DB_USER', 'menu_user'),
            password=os.getenv('DB_PASSWORD', 'secure_password')
        )
        return conn
    except psycopg2.Error as e:
        print(f"❌ Error de conexión a PostgreSQL: {e}")
        sys.exit(1)

# ======================================================
# FUNCIONES PRINCIPALES
# ======================================================

def create_tenant(conn):
    """Crea un nuevo restaurante (tenant)"""
    tenant_id = str(uuid.uuid4())
    now = datetime.now()
    
    try:
        with conn.cursor() as cur:
            # Verificar si ya existe un tenant
            cur.execute("SELECT id FROM tenants WHERE slug = %s", (TENANT_SLUG,))
            existing = cur.fetchone()
            
            if existing:
                print(f"⚠️ El tenant '{TENANT_SLUG}' ya existe. Usando ID: {existing[0]}")
                return existing[0]
            
            query = """
                INSERT INTO tenants (id, name, slug, email, whatsapp_number, is_active, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """
            cur.execute(query, (
                tenant_id,
                TENANT_NAME,
                TENANT_SLUG,
                ADMIN_EMAIL,
                TENANT_WHATSAPP,
                True,
                now,
                now
            ))
            conn.commit()
            print(f"✅ Tenant creado: {TENANT_NAME} (ID: {tenant_id})")
            return tenant_id
    except psycopg2.Error as e:
        conn.rollback()
        print(f"❌ Error creando tenant: {e}")
        sys.exit(1)

def create_branch(conn, tenant_id):
    """Crea una sucursal para el restaurante"""
    branch_id = str(uuid.uuid4())
    now = datetime.now()
    
    try:
        with conn.cursor() as cur:
            # Verificar si ya existe una sucursal con ese nombre
            cur.execute("SELECT id FROM branches WHERE tenant_id = %s AND name = %s", (tenant_id, BRANCH_NAME))
            existing = cur.fetchone()
            
            if existing:
                print(f"⚠️ La sucursal '{BRANCH_NAME}' ya existe. Usando ID: {existing[0]}")
                return existing[0]
            
            query = """
                INSERT INTO branches (
                    id, tenant_id, name, address, phone, whatsapp_number,
                    is_active, delivery_cost, free_delivery_min_amount,
                    created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """
            cur.execute(query, (
                branch_id,
                tenant_id,
                BRANCH_NAME,
                BRANCH_ADDRESS,
                BRANCH_PHONE,
                BRANCH_WHATSAPP,
                True,
                3000,  # delivery_cost
                30000, # free_delivery_min_amount
                now,
                now
            ))
            conn.commit()
            print(f"✅ Sucursal creada: {BRANCH_NAME} (ID: {branch_id})")
            return branch_id
    except psycopg2.Error as e:
        conn.rollback()
        print(f"❌ Error creando sucursal: {e}")
        sys.exit(1)

def create_admin_user(conn, tenant_id):
    """Crea el usuario administrador"""
    user_id = str(uuid.uuid4())
    now = datetime.now()
    
    # Hashear la contraseña
    hashed_password = bcrypt.hashpw(ADMIN_PASSWORD.encode('utf-8'), bcrypt.gensalt())
    
    try:
        with conn.cursor() as cur:
            # Verificar si ya existe un usuario con ese email
            cur.execute("SELECT id FROM users WHERE email = %s", (ADMIN_EMAIL,))
            existing = cur.fetchone()
            
            if existing:
                print(f"⚠️ El usuario '{ADMIN_EMAIL}' ya existe. ID: {existing[0]}")
                return existing[0]
            
            query = """
                INSERT INTO users (id, tenant_id, name, email, password_hash, role, is_active, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """
            cur.execute(query, (
                user_id,
                tenant_id,
                ADMIN_NAME,
                ADMIN_EMAIL,
                hashed_password.decode('utf-8'),
                'admin',
                True,
                now,
                now
            ))
            conn.commit()
            print(f"✅ Usuario admin creado: {ADMIN_EMAIL} (ID: {user_id})")
            return user_id
    except psycopg2.Error as e:
        conn.rollback()
        print(f"❌ Error creando usuario admin: {e}")
        sys.exit(1)

def create_initial_modules(conn, branch_id):
    """Crea los módulos iniciales para la sucursal"""
    modules = [
        {'name': 'breakfast', 'label': 'Desayunos'},
        {'name': 'lunch', 'label': 'Almuerzos'},
        {'name': 'fastfood', 'label': 'Comida Rápida'},
        {'name': 'bar', 'label': 'Bar'},
        {'name': 'delivery', 'label': 'Domicilios'},
    ]
    
    now = datetime.now()
    
    try:
        with conn.cursor() as cur:
            for module in modules:
                module_id = str(uuid.uuid4())
                
                # Verificar si ya existe
                cur.execute(
                    "SELECT id FROM branch_modules WHERE branch_id = %s AND module_name = %s",
                    (branch_id, module['name'])
                )
                existing = cur.fetchone()
                
                if existing:
                    print(f"⚠️ Módulo '{module['label']}' ya existe")
                    continue
                
                query = """
                    INSERT INTO branch_modules (id, branch_id, module_name, is_enabled, schedule, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """
                cur.execute(query, (
                    module_id,
                    branch_id,
                    module['name'],
                    True if module['name'] == 'delivery' else False,
                    '{"start": "08:00", "end": "22:00", "days": [1,2,3,4,5,6,7]}',
                    now,
                    now
                ))
                print(f"✅ Módulo creado: {module['label']}")
            
            conn.commit()
            print("✅ Todos los módulos creados correctamente")
    except psycopg2.Error as e:
        conn.rollback()
        print(f"❌ Error creando módulos: {e}")

# ======================================================
# FUNCIÓN PRINCIPAL
# ======================================================

def main():
    print("=" * 60)
    print("🔐 MENU QR PLUS - Creación de Usuario Administrador")
    print("=" * 60)
    print()
    print(f"📧 Email: {ADMIN_EMAIL}")
    print(f"🔑 Contraseña: {ADMIN_PASSWORD}")
    print(f"🏪 Restaurante: {TENANT_NAME}")
    print()
    
    # Conectar a la base de datos
    print("🔄 Conectando a PostgreSQL...")
    conn = get_db_connection()
    print("✅ Conexión establecida")
    print()
    
    # Crear tenant
    print("📦 Creando restaurante (tenant)...")
    tenant_id = create_tenant(conn)
    print()
    
    # Crear branch
    print("🏢 Creando sucursal (branch)...")
    branch_id = create_branch(conn, tenant_id)
    print()
    
    # Crear usuario admin
    print("👤 Creando usuario administrador...")
    user_id = create_admin_user(conn, tenant_id)
    print()
    
    # Crear módulos iniciales
    print("📋 Creando módulos de la sede...")
    create_initial_modules(conn, branch_id)
    print()
    
    # Cerrar conexión
    conn.close()
    
    print("=" * 60)
    print("✅ USUARIO ADMINISTRADOR CREADO EXITOSAMENTE")
    print("=" * 60)
    print()
    print("🔐 Credenciales de acceso:")
    print(f"   📧 Email: {ADMIN_EMAIL}")
    print(f"   🔑 Contraseña: {ADMIN_PASSWORD}")
    print()
    print("🌐 Accede al panel administrativo en:")
    print("   http://localhost:3006/login")
    print()
    print("⚠️  Cambia la contraseña después del primer inicio de sesión")

if __name__ == "__main__":
    main()