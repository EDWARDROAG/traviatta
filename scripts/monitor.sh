#!/bin/bash
# ======================================================
# ARCHIVO: monitor.sh
# UBICACIÓN: menu-qr-system/scripts/monitor.sh
# FASE: F6
# VERSIÓN: 1.0
# ÚLTIMA ACTUALIZACIÓN: 2024-01-17 12:45
# ======================================================
# 🎯 PROPÓSITO:
# Script para monitorear el estado del sistema:
# contenedores, CPU, memoria, discos y health checks.
# Puede ejecutarse manualmente o vía cron.
# ======================================================

# ======================================================
# CONFIGURACIÓN
# ======================================================

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Umbrales
CPU_THRESHOLD=80
MEMORY_THRESHOLD=80
DISK_THRESHOLD=85
ALERT_EMAIL="admin@menuqrplus.com"

# Flags
SEND_ALERTS=false
WATCH_MODE=false
OUTPUT_JSON=false

# ======================================================
# FUNCIONES
# ======================================================

print_usage() {
    echo "Uso: $0 [OPCIONES]"
    echo ""
    echo "Opciones:"
    echo "  -a, --alerts        Enviar alertas por email"
    echo "  -w, --watch         Modo watch (actualización continua)"
    echo "  -j, --json          Salida en formato JSON"
    echo "  -h, --help          Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0                  Monitoreo simple"
    echo "  $0 -w               Monitoreo en tiempo real"
    echo "  $0 -a               Monitoreo con alertas"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[CRITICAL]${NC} $1"
}

send_alert() {
    local subject="$1"
    local message="$2"
    
    if [ "$SEND_ALERTS" != true ]; then
        return
    fi
    
    echo -e "$message" | mail -s "$subject" "$ALERT_EMAIL"
}

check_containers() {
    local status=0
    local output=""
    
    for container in menu_backend menu_frontend menu_admin menu_postgres menu_redis menu_rabbitmq; do
        if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$container.*Up"; then
            log_success "Contenedor $container: corriendo"
            output="${output}✅ $container: running\n"
        else
            log_error "Contenedor $container: DETENIDO"
            output="${output}❌ $container: DOWN\n"
            status=1
            send_alert "ALERTA: Contenedor $container detenido" "El contenedor $container no está corriendo en $(hostname)"
        fi
    done
    
    return $status
}

check_health() {
    local status=0
    
    # Backend health
    if curl -s -f http://localhost:3005/health > /dev/null 2>&1; then
        log_success "Backend API: saludable"
    else
        log_error "Backend API: NO RESPONDE"
        status=1
        send_alert "ALERTA: Backend API no responde" "El health check del backend falló en $(hostname)"
    fi
    
    # Frontend health
    if curl -s -f http://localhost:8080/health > /dev/null 2>&1; then
        log_success "Frontend: saludable"
    else
        log_error "Frontend: NO RESPONDE"
        status=1
    fi
    
    # Admin panel health
    if curl -s -f http://localhost:3006/health > /dev/null 2>&1; then
        log_success "Admin panel: saludable"
    else
        log_warning "Admin panel: NO RESPONDE"
    fi
    
    return $status
}

check_resources() {
    local status=0
    
    # CPU
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    cpu_usage=${cpu_usage%.*}
    
    if [ "$cpu_usage" -gt "$CPU_THRESHOLD" ]; then
        log_warning "CPU: ${cpu_usage}% (umbral: ${CPU_THRESHOLD}%)"
        send_alert "ALERTA: CPU alta" "El uso de CPU es ${cpu_usage}% en $(hostname)"
        status=1
    else
        log_success "CPU: ${cpu_usage}%"
    fi
    
    # Memoria
    local mem_usage=$(free | grep Mem | awk '{print ($3/$2) * 100.0}' | cut -d'.' -f1)
    
    if [ "$mem_usage" -gt "$MEMORY_THRESHOLD" ]; then
        log_warning "Memoria: ${mem_usage}% (umbral: ${MEMORY_THRESHOLD}%)"
        send_alert "ALERTA: Memoria alta" "El uso de memoria es ${mem_usage}% en $(hostname)"
        status=1
    else
        log_success "Memoria: ${mem_usage}%"
    fi
    
    # Disco
    local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -gt "$DISK_THRESHOLD" ]; then
        log_warning "Disco: ${disk_usage}% (umbral: ${DISK_THRESHOLD}%)"
        send_alert "ALERTA: Disco casi lleno" "El uso de disco es ${disk_usage}% en $(hostname)"
        status=1
    else
        log_success "Disco: ${disk_usage}%"
    fi
    
    return $status
}

check_queue_length() {
    local status=0
    
    if docker ps | grep -q rabbitmq; then
        local queue_count=$(docker exec menu_rabbitmq rabbitmqctl list_queues | awk '{sum+=$2} END {print sum}')
        
        if [ "$queue_count" -gt 100 ]; then
            log_warning "Cola RabbitMQ: ${queue_count} mensajes pendientes"
            send_alert "ALERTA: Cola larga" "Hay ${queue_count} mensajes en la cola de RabbitMQ"
            status=1
        else
            log_success "Cola RabbitMQ: ${queue_count} mensajes"
        fi
    fi
    
    return $status
}

check_database_connections() {
    local status=0
    
    if docker ps | grep -q postgres; then
        local connections=$(docker exec menu_postgres psql -U menu_user -d menu_db -t -c "SELECT count(*) FROM pg_stat_activity;" | tr -d ' ')
        
        if [ "$connections" -gt 100 ]; then
            log_warning "Conexiones DB: ${connections}"
            status=1
        else
            log_success "Conexiones DB: ${connections}"
        fi
    fi
    
    return $status
}

# ======================================================
# SALIDA JSON
# ======================================================

output_json() {
    local containers=$(docker ps --format "json" | jq -s '.')
    local health=$(curl -s http://localhost:3005/health 2>/dev/null || echo '{"status":"down"}')
    
    cat << EOF
{
    "timestamp": "$(date -Iseconds)",
    "hostname": "$(hostname)",
    "containers": $containers,
    "health": $health,
    "resources": {
        "cpu": $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1),
        "memory": $(free | grep Mem | awk '{print ($3/$2) * 100.0}'),
        "disk": $(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    }
}
EOF
}

# ======================================================
# MODO WATCH
# ======================================================

watch_mode() {
    while true; do
        clear
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}📊 MONITOREO MENU QR PLUS - $(date '+%Y-%m-%d %H:%M:%S')${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        
        check_containers
        echo ""
        check_health
        echo ""
        check_resources
        echo ""
        check_queue_length
        echo ""
        check_database_connections
        
        echo ""
        echo -e "${YELLOW}Presiona Ctrl+C para salir${NC}"
        sleep 5
    done
}

# ======================================================
# EJECUCIÓN PRINCIPAL
# ======================================================

main() {
    if [ "$WATCH_MODE" = true ]; then
        watch_mode
        return
    fi
    
    if [ "$OUTPUT_JSON" = true ]; then
        output_json
        return
    fi
    
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}📊 MONITOREO MENU QR PLUS - $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Ejecutar verificaciones
    check_containers
    echo ""
    check_health
    echo ""
    check_resources
    echo ""
    check_queue_length
    echo ""
    check_database_connections
    
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# ======================================================
# PARSER DE ARGUMENTOS
# ======================================================

while [[ $# -gt 0 ]]; do
    case $1 in
        -a|--alerts)
            SEND_ALERTS=true
            shift
            ;;
        -w|--watch)
            WATCH_MODE=true
            shift
            ;;
        -j|--json)
            OUTPUT_JSON=true
            shift
            ;;
        -h|--help)
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

main