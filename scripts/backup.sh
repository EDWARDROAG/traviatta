#!/bin/bash
# ======================================================
# ARCHIVO: backup.sh
# UBICACIÓN: menu-qr-system/scripts/backup.sh
# FASE: F6
# VERSIÓN: 1.0
# ÚLTIMA ACTUALIZACIÓN: 2024-01-17 12:00
# ======================================================
# 🎯 PROPÓSITO:
# Script para realizar backup automático de la base de
# datos PostgreSQL. Comprime el backup y lo guarda en
# el directorio configurado. Opcionalmente puede subirlo
# a S3 o servicios de almacenamiento en la nube.
# ======================================================

# ======================================================
# CONFIGURACIÓN
# ======================================================

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
BACKUP_FILE="${BACKUP_DIR}/menu_db_${DATE}.sql.gz"
LOG_FILE="${BACKUP_DIR}/backup_${DATE}.log"
RETENTION_DAYS=30

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ======================================================
# FUNCIONES
# ======================================================

log() {
    echo -e "$1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $2" >> "$LOG_FILE"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        log "${RED}❌ Docker no está instalado${NC}" "ERROR: Docker not found"
        exit 1
    fi
}

check_postgres() {
    if ! docker ps | grep -q "menu_postgres"; then
        log "${RED}❌ Contenedor de PostgreSQL no está corriendo${NC}" "ERROR: PostgreSQL container not running"
        exit 1
    fi
}

create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        log "${GREEN}✅ Directorio de backup creado: $BACKUP_DIR${NC}" "INFO: Created backup directory"
    fi
}

perform_backup() {
    log "${YELLOW}🔄 Iniciando backup de la base de datos...${NC}" "INFO: Starting database backup"
    
    docker exec menu_postgres pg_dump -U menu_user menu_db | gzip > "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        log "${GREEN}✅ Backup completado: $BACKUP_FILE (${FILE_SIZE})${NC}" "INFO: Backup completed: $BACKUP_FILE (${FILE_SIZE})"
    else
        log "${RED}❌ Error al crear el backup${NC}" "ERROR: Backup failed"
        exit 1
    fi
}

clean_old_backups() {
    log "${YELLOW}🔄 Limpiando backups antiguos (más de ${RETENTION_DAYS} días)...${NC}" "INFO: Cleaning old backups"
    
    DELETED_COUNT=$(find "$BACKUP_DIR" -name "*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete -print | wc -l)
    
    if [ $DELETED_COUNT -gt 0 ]; then
        log "${GREEN}✅ Eliminados $DELETED_COUNT backups antiguos${NC}" "INFO: Deleted $DELETED_COUNT old backups"
    else
        log "${YELLOW}⚠️ No se encontraron backups antiguos para eliminar${NC}" "INFO: No old backups found"
    fi
}

# Opcional: Subir a S3
upload_to_s3() {
    if [ -n "$AWS_S3_BUCKET" ]; then
        log "${YELLOW}🔄 Subiendo backup a S3...${NC}" "INFO: Uploading to S3"
        
        aws s3 cp "$BACKUP_FILE" "s3://${AWS_S3_BUCKET}/backups/"
        
        if [ $? -eq 0 ]; then
            log "${GREEN}✅ Backup subido a S3 correctamente${NC}" "INFO: Uploaded to S3 successfully"
        else
            log "${RED}❌ Error al subir backup a S3${NC}" "ERROR: S3 upload failed"
        fi
    fi
}

# ======================================================
# EJECUCIÓN PRINCIPAL
# ======================================================

main() {
    log "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" "INFO: === BACKUP START ==="
    
    check_docker
    check_postgres
    create_backup_dir
    perform_backup
    clean_old_backups
    upload_to_s3
    
    log "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" "INFO: === BACKUP END ==="
}

# Ejecutar
main