#!/bin/bash
# ======================================================
# ARCHIVO: build.sh
# UBICACIÓN: menu-qr-system/scripts/build.sh
# FASE: F6
# VERSIÓN: 1.0
# ÚLTIMA ACTUALIZACIÓN: 2024-01-17 12:15
# ======================================================
# 🎯 PROPÓSITO:
# Script para construir las imágenes Docker del sistema.
# Permite construir servicios específicos o todos,
# con opción de versión y push a registro.
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
VERSION=${1:-latest}
REGISTRY=${DOCKER_REGISTRY:-}
PROJECT_NAME="menu-qr-system"
BUILD_ALL=false
SERVICE=""
PUSH=false
NO_CACHE=false

# ======================================================
# FUNCIONES
# ======================================================

print_usage() {
    echo "Uso: $0 [VERSION] [OPCIONES]"
    echo ""
    echo "Opciones:"
    echo "  -a, --all          Construir todos los servicios"
    echo "  -s, --service NAME Construir solo un servicio específico"
    echo "  -p, --push         Pushear imágenes al registro después de construir"
    echo "  --no-cache         Construir sin caché"
    echo "  -h, --help         Mostrar esta ayuda"
    echo ""
    echo "Servicios disponibles: backend, frontend, admin"
    echo ""
    echo "Ejemplos:"
    echo "  $0 v1.0.0 -a               Construir todos con versión v1.0.0"
    echo "  $0 latest -s backend       Construir solo backend"
    echo "  $0 v1.0.0 -a -p            Construir todos y pushear"
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

check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker no está instalado"
        exit 1
    fi
    log_info "Docker disponible"
}

build_backend() {
    log_info "Construyendo backend..."
    
    local flags=""
    if [ "$NO_CACHE" = true ]; then
        flags="--no-cache"
    fi
    
    docker build $flags -t ${REGISTRY}${PROJECT_NAME}-backend:${VERSION} ./backend
    
    if [ $? -eq 0 ]; then
        log_success "Backend construido: ${REGISTRY}${PROJECT_NAME}-backend:${VERSION}"
    else
        log_error "Error construyendo backend"
        exit 1
    fi
}

build_frontend() {
    log_info "Construyendo frontend..."
    
    local flags=""
    if [ "$NO_CACHE" = true ]; then
        flags="--no-cache"
    fi
    
    docker build $flags -t ${REGISTRY}${PROJECT_NAME}-frontend:${VERSION} ./frontend
    
    if [ $? -eq 0 ]; then
        log_success "Frontend construido: ${REGISTRY}${PROJECT_NAME}-frontend:${VERSION}"
    else
        log_error "Error construyendo frontend"
        exit 1
    fi
}

build_admin() {
    log_info "Construyendo admin panel..."
    
    local flags=""
    if [ "$NO_CACHE" = true ]; then
        flags="--no-cache"
    fi
    
    docker build $flags -t ${REGISTRY}${PROJECT_NAME}-admin:${VERSION} ./admin-panel
    
    if [ $? -eq 0 ]; then
        log_success "Admin panel construido: ${REGISTRY}${PROJECT_NAME}-admin:${VERSION}"
    else
        log_error "Error construyendo admin panel"
        exit 1
    fi
}

push_images() {
    if [ "$PUSH" != true ]; then
        return
    fi
    
    log_info "Pusheando imágenes al registro..."
    
    if [ -z "$REGISTRY" ]; then
        log_error "REGISTRY no configurado. Usa DOCKER_REGISTRY o --registry"
        exit 1
    fi
    
    if [ "$BUILD_ALL" = true ] || [ "$SERVICE" = "backend" ] || [ -z "$SERVICE" ]; then
        docker push ${REGISTRY}${PROJECT_NAME}-backend:${VERSION}
        log_success "Backend pusheado"
    fi
    
    if [ "$BUILD_ALL" = true ] || [ "$SERVICE" = "frontend" ] || [ -z "$SERVICE" ]; then
        docker push ${REGISTRY}${PROJECT_NAME}-frontend:${VERSION}
        log_success "Frontend pusheado"
    fi
    
    if [ "$BUILD_ALL" = true ] || [ "$SERVICE" = "admin" ] || [ -z "$SERVICE" ]; then
        docker push ${REGISTRY}${PROJECT_NAME}-admin:${VERSION}
        log_success "Admin panel pusheado"
    fi
}

# ======================================================
# PARSER DE ARGUMENTOS
# ======================================================

while [[ $# -gt 0 ]]; do
    case $1 in
        -a|--all)
            BUILD_ALL=true
            shift
            ;;
        -s|--service)
            SERVICE="$2"
            shift 2
            ;;
        -p|--push)
            PUSH=true
            shift
            ;;
        --no-cache)
            NO_CACHE=true
            shift
            ;;
        -h|--help)
            print_usage
            exit 0
            ;;
        *)
            # Si es una versión (no comienza con -)
            if [[ ! "$1" =~ ^- ]]; then
                VERSION="$1"
            fi
            shift
            ;;
    esac
done

# ======================================================
# EJECUCIÓN PRINCIPAL
# ======================================================

main() {
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🚀 Construcción de imágenes Docker${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    log_info "Versión: ${VERSION}"
    log_info "Registry: ${REGISTRY:-<local>}"
    log_info "Push: ${PUSH}"
    log_info "No cache: ${NO_CACHE}"
    echo ""
    
    check_docker
    
    if [ "$BUILD_ALL" = true ]; then
        log_info "Construyendo todos los servicios..."
        build_backend
        build_frontend
        build_admin
    elif [ -n "$SERVICE" ]; then
        case $SERVICE in
            backend)
                build_backend
                ;;
            frontend)
                build_frontend
                ;;
            admin)
                build_admin
                ;;
            *)
                log_error "Servicio desconocido: $SERVICE"
                print_usage
                exit 1
                ;;
        esac
    else
        log_warning "No se especificó servicio. Usando backend por defecto."
        build_backend
    fi
    
    push_images
    
    echo ""
    log_success "¡Construcción completada!"
}

main