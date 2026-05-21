#!/usr/bin/env python3
# ======================================================
# SCRIPT: generate_structure.py
# PROYECTO: MENU QR PLUS
# PROPÓSITO: Generar estructura completa de directorios
#            y archivos vacíos (sin cabeceras)
# FECHA: 2024-01-15
# ======================================================

from pathlib import Path

# Configuración
PROJECT_NAME = "menu-qr-system"
BASE_DIR = Path.cwd() / PROJECT_NAME

# Colores para consola
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RED = '\033[91m'
    RESET = '\033[0m'

def create_dirs():
    """Crea todos los directorios necesarios"""
    dirs = [
        # Backend
        "backend/src/config",
        "backend/src/models",
        "backend/src/services",
        "backend/src/controllers/public",
        "backend/src/controllers/admin",
        "backend/src/middleware",
        "backend/src/routes",
        "backend/src/utils",
        "backend/tests/unit",
        "backend/tests/integration",
        "backend/tests/load",
        "backend/migrations",
        "backend/seeders",
        
        # Frontend Cliente
        "frontend/src/pages",
        "frontend/src/components",
        "frontend/src/hooks",
        "frontend/src/services",
        "frontend/src/styles",
        "frontend/src/assets",
        "frontend/public",
        
        # Admin Panel
        "admin-panel/src/pages",
        "admin-panel/src/components",
        "admin-panel/src/hooks",
        "admin-panel/src/services",
        "admin-panel/src/styles",
        "admin-panel/src/assets",
        "admin-panel/public",
        
        # Base de datos
        "database/migrations",
        "database/seeders",
        
        # Scripts
        "scripts",
        
        # Documentación
        "docs/diagrams",
        "docs/api",
        
        # Configuración raíz
        ".github/workflows",
    ]
    
    for dir_path in dirs:
        full_path = BASE_DIR / dir_path
        full_path.mkdir(parents=True, exist_ok=True)
        print(f"{Colors.GREEN}✅ Directorio: {Colors.RESET}{dir_path}")
    
    return True

def create_files():
    """Crea todos los archivos vacíos"""
    
    files = [
        # ============================================
        # BACKEND - Configuración
        # ============================================
        "backend/src/config/database.js",
        "backend/src/config/redis.js",
        "backend/src/config/rabbitmq.js",
        "backend/src/config/cloudinary.js",
        
        # BACKEND - Modelos
        "backend/src/models/Tenant.js",
        "backend/src/models/Branch.js",
        "backend/src/models/Table.js",
        "backend/src/models/Category.js",
        "backend/src/models/Product.js",
        "backend/src/models/Order.js",
        "backend/src/models/BranchModule.js",
        
        # BACKEND - Servicios
        "backend/src/services/menuService.js",
        "backend/src/services/orderService.js",
        "backend/src/services/tableService.js",
        "backend/src/services/whatsappService.js",
        "backend/src/services/cacheService.js",
        "backend/src/services/queueService.js",
        "backend/src/services/branchService.js",
        
        # BACKEND - Controladores públicos
        "backend/src/controllers/public/menuController.js",
        "backend/src/controllers/public/orderController.js",
        "backend/src/controllers/public/tableController.js",
        
        # BACKEND - Controladores admin
        "backend/src/controllers/admin/authController.js",
        "backend/src/controllers/admin/productController.js",
        "backend/src/controllers/admin/categoryController.js",
        "backend/src/controllers/admin/branchController.js",
        "backend/src/controllers/admin/tableController.js",
        "backend/src/controllers/admin/orderController.js",
        "backend/src/controllers/admin/settingsController.js",
        
        # BACKEND - Middleware
        "backend/src/middleware/auth.js",
        "backend/src/middleware/rateLimit.js",
        "backend/src/middleware/cache.js",
        "backend/src/middleware/validation.js",
        "backend/src/middleware/errorHandler.js",
        
        # BACKEND - Rutas
        "backend/src/routes/public.js",
        "backend/src/routes/admin.js",
        "backend/src/routes/webhook.js",
        
        # BACKEND - Utilidades
        "backend/src/utils/logger.js",
        "backend/src/utils/qrGenerator.js",
        "backend/src/utils/slugify.js",
        "backend/src/utils/geoUtils.js",
        
        # BACKEND - Archivos principales
        "backend/src/app.js",
        "backend/src/server.js",
        
        # BACKEND - Tests
        "backend/tests/unit/example.test.js",
        "backend/tests/integration/api.test.js",
        "backend/tests/load/k6-script.js",
        
        # BACKEND - Migraciones
        "backend/migrations/001_create_tenants.sql",
        "backend/migrations/002_create_branches.sql",
        "backend/migrations/003_create_tables.sql",
        "backend/migrations/004_create_categories.sql",
        "backend/migrations/005_create_products.sql",
        "backend/migrations/006_create_orders.sql",
        "backend/migrations/007_create_branch_modules.sql",
        
        # BACKEND - Configuración raíz
        "backend/package.json",
        "backend/Dockerfile",
        "backend/.dockerignore",
        "backend/.env.example",
        
        # ============================================
        # FRONTEND CLIENTE
        # ============================================
        "frontend/src/pages/MenuPage.jsx",
        "frontend/src/pages/CartPage.jsx",
        "frontend/src/pages/TableMenuPage.jsx",
        "frontend/src/pages/CheckoutPage.jsx",
        
        "frontend/src/components/ProductCard.jsx",
        "frontend/src/components/CategoryTabs.jsx",
        "frontend/src/components/CartFloating.jsx",
        "frontend/src/components/CartSidebar.jsx",
        "frontend/src/components/OrderForm.jsx",
        "frontend/src/components/Header.jsx",
        
        "frontend/src/hooks/useCart.js",
        "frontend/src/hooks/useMenu.js",
        "frontend/src/hooks/useOrder.js",
        
        "frontend/src/services/api.js",
        "frontend/src/services/whatsapp.js",
        
        "frontend/src/styles/globals.css",
        "frontend/src/App.jsx",
        "frontend/src/main.jsx",
        
        "frontend/index.html",
        "frontend/package.json",
        "frontend/vite.config.js",
        "frontend/Dockerfile",
        "frontend/nginx.conf",
        "frontend/.env.example",
        
        # ============================================
        # ADMIN PANEL
        # ============================================
        "admin-panel/src/pages/Dashboard.jsx",
        "admin-panel/src/pages/ProductsPage.jsx",
        "admin-panel/src/pages/CategoriesPage.jsx",
        "admin-panel/src/pages/BranchesPage.jsx",
        "admin-panel/src/pages/TablesPage.jsx",
        "admin-panel/src/pages/OrdersPage.jsx",
        "admin-panel/src/pages/SettingsPage.jsx",
        "admin-panel/src/pages/LoginPage.jsx",
        
        "admin-panel/src/components/TableMap.jsx",
        "admin-panel/src/components/ProductForm.jsx",
        "admin-panel/src/components/ImageUpload.jsx",
        "admin-panel/src/components/BranchForm.jsx",
        "admin-panel/src/components/OrderCard.jsx",
        "admin-panel/src/components/Sidebar.jsx",
        "admin-panel/src/components/Header.jsx",
        
        "admin-panel/src/hooks/useAuth.js",
        "admin-panel/src/hooks/useProducts.js",
        "admin-panel/src/hooks/useBranches.js",
        "admin-panel/src/hooks/useTables.js",
        
        "admin-panel/src/services/api.js",
        "admin-panel/src/services/auth.js",
        
        "admin-panel/src/styles/globals.css",
        "admin-panel/src/App.jsx",
        "admin-panel/src/main.jsx",
        
        "admin-panel/index.html",
        "admin-panel/package.json",
        "admin-panel/vite.config.js",
        "admin-panel/Dockerfile",
        "admin-panel/.env.example",
        
        # ============================================
        # BASE DE DATOS
        # ============================================
        "database/init.sql",
        "database/migrations/001_initial_schema.sql",
        "database/migrations/002_add_tables.sql",
        "database/migrations/003_add_branch_modules.sql",
        "database/seeders/01_tenants.sql",
        "database/seeders/02_branches.sql",
        "database/seeders/03_categories.sql",
        "database/seeders/04_products.sql",
        
        # ============================================
        # SCRIPTS
        # ============================================
        "scripts/build.sh",
        "scripts/deploy.sh",
        "scripts/backup.sh",
        "scripts/restore.sh",
        "scripts/monitor.sh",
        
        # ============================================
        # DOCUMENTACIÓN
        # ============================================
        "docs/README.md",
        "docs/ARCHITECTURE.md",
        "docs/API_REFERENCE.md",
        "docs/DEPLOYMENT.md",
        "docs/OWNER_MANUAL.md",
        "docs/diagrams/components.puml",
        "docs/diagrams/sequence.puml",
        "docs/diagrams/er_diagram.puml",
        
        # ============================================
        # CONFIGURACIÓN RAÍZ
        # ============================================
        "docker-compose.yml",
        "docker-compose.prod.yml",
        ".env.example",
        ".gitignore",
        "README.md",
        "LICENSE",
        
        # ============================================
        # GITHUB ACTIONS (CI/CD)
        # ============================================
        ".github/workflows/deploy.yml",
        ".github/workflows/test.yml",
        ".github/workflows/build.yml",
    ]
    
    for file_path in files:
        full_path = BASE_DIR / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        full_path.touch()
        print(f"{Colors.BLUE}📄 Archivo: {Colors.RESET}{file_path}")
    
    return True

def create_readme():
    """Crea un README principal con información del proyecto"""
    readme_path = BASE_DIR / "README.md"
    
    readme_content = '''# MENU QR PLUS

Sistema de Menú Digital con WhatsApp y Gestión de Mesas

## Estructura del Proyecto

Este proyecto contiene:

- `backend`: API y lógica del servidor.
- `frontend`: aplicación cliente de menú digital.
- `admin-panel`: panel de administración.
- `database`: migraciones y seeders.
- `docs`: documentación técnica.
- `scripts`: utilidades de despliegue y mantenimiento.

## Uso

1. Crear la estructura de carpetas y archivos con este script.
2. Configurar variables de entorno en los archivos `.env.example`.
3. Instalar dependencias para cada servicio.
4. Ejecutar el backend, frontend y panel de administración.
'''

    readme_path.parent.mkdir(parents=True, exist_ok=True)
    readme_path.write_text(readme_content, encoding='utf-8')
    print(f"{Colors.GREEN}✅ README creado: {Colors.RESET}{readme_path}")


def main():
    create_dirs()
    create_files()
    create_readme()
    print(f"{Colors.YELLOW}✔ Estructura generada en: {Colors.RESET}{BASE_DIR}")


if __name__ == '__main__':
    main()

