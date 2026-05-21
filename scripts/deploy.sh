#!/bin/bash
# ======================================================
# ARCHIVO: deploy.sh
# UBICACIÓN: menu-qr-system/scripts/deploy.sh
# FASE: F6
# VERSIÓN: 1.0
# ÚLTIMA ACTUALIZACIÓN: 2024-01-17 12:30
# ======================================================
# 🎯 PROPÓSITO:
# Script para desplegar la aplicación en el servidor
# de producción. Soporta despliegue local, remoto vía
# SSH, y rolling update.
# ======================================================

# ======================================================
# CONFIGURACIÓN
# ======================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Variables
ENVIRONMENT="production"
COMPOSE_FILE="docker-compose.prod.yml"
REMOTE_USER=""
REMOTE_HOST=""
REMOTE_PATH="/var/www/menu-qr-system"
BACKUP_BEFORE_DEPLOY=true
ROLLBACK_ON_ERROR=true
SKIP_MIGRATIONS=false
SKIP_BUILD=false

# ======================================================
# FUNCIONES
# ======================================================

print_usage() {
    echo "Uso: $0 [OPCIONES]"
    echo ""
    echo "Opciones:"
    echo "  -e, --env ENV       Entorno (development, staging, production) [default: production]"
    echo "  -u, --user USER     Usuario SSH para despliegue remoto"
    echo "  -h, --host HOST     Host SSH para despliegue remoto"
    echo "  -p, --path PATH     Ruta remota del proyecto"
    echo "  --no-backup         No hacer backup antes de desplegar"
    echo "  --no-rollback       No hacer rollback automático en caso de error"
    echo "  --skip-migrations   Saltar migraciones de base de datos"
    echo "  --skip-build        Saltar construcción de imágenes"
    echo "  --help              Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0                          Despliegue local en producción"
    echo "  $0 -e staging               Despliegue local en staging"
    echo "  $0 -u root -h 192.168.1.100 Despliegue remoto"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

create_backup() {
    if [ "$BACKUP_BEFORE_DEPLOY" != true ]; then
        return
    fi
    
    log_info "Creando backup antes del despliegue..."
    
    if [ -n "$REMOTE_HOST" ]; then
        ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_PATH} && ./scripts/backup.sh"
    else
        ./scripts/backup.sh
    fi
    
    log_success "Backup creado"
}

build_images() {
    if [ "$SKIP_BUILD" = true ]; then
        log_warning "Saltando construcción de imágenes"
        return
    fi
    
    log_info "Construyendo imágenes Docker..."
    
    if [ -n "$REMOTE_HOST" ]; then
        ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_PATH} && docker compose -f ${COMPOSE_FILE} build"
    else
        docker compose -f ${COMPOSE_FILE} build
    fi
    
    log_success "Imágenes construidas"
}

pull_images() {
    log_info "Actualizando imágenes..."
    
    if [ -n "$REMOTE_HOST" ]; then
        ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_PATH} && docker compose -f ${COMPOSE_FILE} pull"
    else
        docker compose -f ${COMPOSE_FILE} pull
    fi
    
    log_success "Imágenes actualizadas"
}

stop_services() {
    log_info "Deteniendo servicios..."
    
    if [ -n "$REMOTE_HOST" ]; then
        ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_PATH} && docker compose -f ${COMPOSE_FILE} stop"
    else
        docker compose -f ${COMPOSE_FILE} stop
    fi
    
    log_success "Servicios detenidos"
}

start_services() {
    log_info "Iniciando servicios..."
    
    if [ -n "$REMOTE_HOST" ]; then
        ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_PATH} && docker compose -f ${COMPOSE_FILE} up -d"
    else
        docker compose -f ${COMPOSE_FILE} up -d
    fi
    
    log_success "Servicios iniciados"
}

run_migrations() {
    if [ "$SKIP_MIGRATIONS" = true ]; then
        log_warning "Saltando migraciones de base de datos"
        return
    fi
    
    log_info "Ejecutando migraciones..."
    
    if [ -n "$REMOTE_HOST" ]; then
        ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_PATH} && docker compose -f ${COMPOSE_FILE} exec backend npm run migrate"
    else
        docker compose -f ${COMPOSE_FILE} exec backend npm run migrate
    fi
    
    log_success "Migraciones completadas"
}

health_check() {
    log_info "Verificando health check..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if [ -n "$REMOTE_HOST" ]; then
            STATUS=$(ssh ${REMOTE_USER}@${REMOTE_HOST} "curl -s -o /dev/null -w '%{http_code}' http://localhost:3005/health")
        else
            STATUS=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3005/health)
        fi
        
        if [ "$STATUS" = "200" ]; then
            log_success "Health check pasado"
            return 0
        fi
        
        log_info "Esperando servicio... (${attempt}/${max_attempts})"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    log_error "Health check falló después de ${max_attempts} intentos"
    return 1
}

rollback() {
    if [ "$ROLLBACK_ON_ERROR" != true ]; then
        log_warning "Rollback deshabilitado. Revisa manualmente."
        return
    fi
    
    log_warning "Iniciando rollback..."
    
    if [ -n "$REMOTE_HOST" ]; then
        ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_PATH} && docker compose -f ${COMPOSE_FILE} down && docker compose -f ${COMPOSE_FILE} up -d"
    else
        docker compose -f ${COMPOSE_FILE} down
        docker compose -f ${COMPOSE_FILE} up -d
    fi
    
    log_success "Rollback completado"
}

cleanup() {
    log_info "Limpiando recursos no utilizados..."
    
    if [ -n "$REMOTE_HOST" ]; then
        ssh ${REMOTE_USER}@${REMOTE_HOST} "docker system prune -f"
    else
        docker system prune -f
    fi
    
    log_success "Limpieza completada"
}

# ======================================================
# PARSER DE ARGUMENTOS
# ======================================================

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -u|--user)
            REMOTE_USER="$2"
            shift 2
            ;;
        -h|--host)
            REMOTE_HOST="$2"
            shift 2
            ;;
        -p|--path)
            REMOTE_PATH="$2"
            shift 2
            ;;
        --no-backup)
            BACKUP_BEFORE_DEPLOY=false
            shift
            ;;
        --no-rollback)
            ROLLBACK_ON_ERROR=false
            shift
            ;;
        --skip-migrations)
            SKIP_MIGRATIONS=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --help)
            print_usage
            exit 0
            ;;
        *)
            log_error "Opción desconocida: $1"
            print_usage
            exit 1
            ;;
    esac
done

# ======================================================
# EJECUCIÓN PRINCIPAL
# ======================================================

main() {
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🚀 Despliegue de MENU QR PLUS${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    log_info "Entorno: ${ENVIRONMENT}"
    if [ -n "$REMOTE_HOST" ]; then
        log_info "Despliegue remoto: ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"
    else
        log_info "Despliegue local"
    fi
    echo ""
    
    # Crear backup
    create_backup
    
    # Construir imágenes
    build_images
    
    # Pull imágenes
    pull_images
    
    # Detener servicios
    stop_services
    
    # Iniciar servicios
    start_services
    
    # Health check y rollback
    if ! health_check; then
        log_error "Health check fallido"
        rollback
        exit 1
    fi
    
    # Ejecutar migraciones
    run_migrations
    
    # Limpieza
    cleanup
    
    echo ""
    log_success "¡Despliegue completado exitosamente!"
    echo ""
    
    if [ -n "$REMOTE_HOST" ]; then
        echo "🌐 Frontend: https://menu.${REMOTE_HOST}"
        echo "🔧 Admin: https://admin.${REMOTE_HOST}"
    else
        echo "🌐 Frontend: http://localhost:8080"
        echo "🔧 Admin: http://localhost:3006"
        echo "📡 API: http://localhost:3005"
    fi
}

main