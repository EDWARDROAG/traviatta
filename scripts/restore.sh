#!/bin/bash
# ======================================================
# ARCHIVO: restore.sh
# UBICACIÓN: menu-qr-system/scripts/restore.sh
# FASE: F6
# VERSIÓN: 1.0
# ÚLTIMA ACTUALIZACIÓN: 2024-01-17 13:00
# ======================================================
# 🎯 PROPÓSITO:
# Script para restaurar la base de datos desde un backup.
# Permite listar backups disponibles y seleccionar cuál
# restaurar, con opción de backup previo a la restauración.
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
BACKUP_DIR="/backups/postgres"
BACKUP_FILE=""
CREATE_BACKUP_BEFORE_RESTORE=true
SKIP_CONFIRMATION=false
LIST_BACKUPS=false

# ======================================================
# FUNCIONES
# ======================================================

print_usage() {
    echo "Uso: $0 [OPCIONES] [ARCHIVO_BACKUP]"
    echo ""
    echo "Opciones:"
    echo "  -l, --list          Listar backups disponibles"
    echo "  -f, --file FILE     Especificar archivo de backup"
    echo "  --no-pre-backup     No crear backup antes de restaurar"
    echo "  -y, --yes           Omitir confirmación"
    echo "  -h, --help          Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 -l                              Listar backups"
    echo "  $0 -f backup_20240101.sql.gz       Restaurar backup específico"
    echo "  $0 -y -f backup_20240101.sql.gz    Restaurar sin confirmación"
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
}

check_postgres() {
    if ! docker ps | grep -q "menu_postgres"; then
        log_error "Contenedor de PostgreSQL no está corriendo"
        exit 1
    fi
}

list_backups() {
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}📋 Backups disponibles en ${BACKUP_DIR}${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ ! -d "$BACKUP_DIR" ]; then
        log_warning "El directorio de backups no existe: ${BACKUP_DIR}"
        return
    fi
    
    local backups=$(ls -lh ${BACKUP_DIR}/*.sql.gz 2>/dev/null | awk '{print $9, "(" $5 ")"}' | nl)
    
    if [ -z "$backups" ]; then
        log_warning "No se encontraron backups en ${BACKUP_DIR}"
    else
        echo "$backups"
    fi
    
    echo ""
}

select_backup() {
    echo -e "${YELLOW}Selecciona un backup para restaurar:${NC}"
    echo ""
    
    local i=1
    local backups=()
    
    for file in ${BACKUP_DIR}/*.sql.gz; do
        if [ -f "$file" ]; then
            backups[$i]=$(basename "$file")
            local size=$(du -h "$file" | cut -f1)
            echo "  $i) $(basename "$file") (${size})"
            i=$((i+1))
        fi
    done
    
    if [ ${#backups[@]} -eq 0 ]; then
        log_error "No hay backups disponibles"
        exit 1
    fi
    
    echo ""
    read -p "Opción [1-$(($i-1))]: " selection
    
    if [[ ! "$selection" =~ ^[0-9]+$ ]] || [ $selection -lt 1 ] || [ $selection -ge $i ]; then
        log_error "Selección inválida"
        exit 1
    fi
    
    BACKUP_FILE="${BACKUP_DIR}/${backups[$selection]}"
    log_info "Backup seleccionado: $(basename "$BACKUP_FILE")"
}

create_pre_restore_backup() {
    if [ "$CREATE_BACKUP_BEFORE_RESTORE" != true ]; then
        log_warning "No se creará backup previo a la restauración"
        return
    fi
    
    log_info "Creando backup de seguridad antes de restaurar..."
    
    local pre_backup_file="${BACKUP_DIR}/pre_restore_$(date +%Y%m%d_%H%M%S).sql.gz"
    
    docker exec menu_postgres pg_dump -U menu_user menu_db | gzip > "$pre_backup_file"
    
    if [ $? -eq 0 ]; then
        local size=$(du -h "$pre_backup_file" | cut -f1)
        log_success "Backup de seguridad creado: $(basename "$pre_backup_file") (${size})"
    else
        log_error "Error al crear backup de seguridad"
        exit 1
    fi
}

stop_applications() {
    log_info "Deteniendo aplicaciones que usan la base de datos..."
    
    docker stop menu_backend 2>/dev/null || true
    log_success "Backend detenido"
}

restore_database() {
    log_info "Restaurando base de datos desde: $(basename "$BACKUP_FILE")"
    
    # Dropear conexiones existentes
    docker exec menu_postgres psql -U menu_user -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'menu_db';" 2>/dev/null || true
    
    # Dropear y recrear base de datos
    docker exec menu_postgres psql -U menu_user -d postgres -c "DROP DATABASE IF EXISTS menu_db;" 2>/dev/null || true
    docker exec menu_postgres psql -U menu_user -d postgres -c "CREATE DATABASE menu_db;" 2>/dev/null || true
    
    # Restaurar desde backup
    gunzip -c "$BACKUP_FILE" | docker exec -i menu_postgres psql -U menu_user -d menu_db
    
    if [ $? -eq 0 ]; then
        log_success "Base de datos restaurada correctamente"
    else
        log_error "Error al restaurar la base de datos"
        exit 1
    fi
}

start_applications() {
    log_info "Reiniciando aplicaciones..."
    
    docker start menu_backend 2>/dev/null || true
    sleep 5
    
    log_success "Aplicaciones reiniciadas"
}

verify_restore() {
    log_info "Verificando restauración..."
    
    local table_count=$(docker exec menu_postgres psql -U menu_user -d menu_db -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
    
    log_success "Tablas restauradas: ${table_count}"
}

# ======================================================
# CONFIRMACIÓN
# ======================================================

confirm_restore() {
    if [ "$SKIP_CONFIRMATION" = true ]; then
        return
    fi
    
    echo ""
    echo -e "${RED}⚠️  ADVERTENCIA ⚠️${NC}"
    echo -e "Esta acción reemplazará TODOS los datos actuales de la base de datos."
    echo -e "Se creará un backup automático antes de proceder."
    echo ""
    read -p "¿Estás seguro de que deseas continuar? (sí/NO): " confirmation
    
    if [[ ! "$confirmation" =~ ^[Ss][Iií] ]]; then
        log_warning "Restauración cancelada"
        exit 0
    fi
}

# ======================================================
# EJECUCIÓN PRINCIPAL
# ======================================================

main() {
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🔄 Restauración de Base de Datos${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    check_docker
    check_postgres
    
    if [ "$LIST_BACKUPS" = true ]; then
        list_backups
        exit 0
    fi
    
    if [ -z "$BACKUP_FILE" ]; then
        list_backups
        select_backup
    elif [ ! -f "$BACKUP_FILE" ]; then
        log_error "Archivo de backup no encontrado: $BACKUP_FILE"
        exit 1
    fi
    
    confirm_restore
    
    create_pre_restore_backup
    stop_applications
    restore_database
    start_applications
    verify_restore
    
    echo ""
    log_success "¡Restauración completada exitosamente!"
}

# ======================================================
# PARSER DE ARGUMENTOS
# ======================================================

while [[ $# -gt 0 ]]; do
    case $1 in
        -l|--list)
            LIST_BACKUPS=true
            shift
            ;;
        -f|--file)
            BACKUP_FILE="$2"
            shift 2
            ;;
        --no-pre-backup)
            CREATE_BACKUP_BEFORE_RESTORE=false
            shift
            ;;
        -y|--yes)
            SKIP_CONFIRMATION=true
            shift
            ;;
        -h|--help)
            print_usage
            exit 0
            ;;
        *)
            BACKUP_FILE="$1"
            shift
            ;;
    esac
done

main