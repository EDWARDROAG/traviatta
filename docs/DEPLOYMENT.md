<!--
  ======================================================
  ARCHIVO: DEPLOYMENT.md
  UBICACIÓN: menu-qr-system/docs/DEPLOYMENT.md
  FASE: DOC
  VERSIÓN: 1.0
  ÚLTIMA ACTUALIZACIÓN: 2024-01-17 03:15
  ======================================================
  🎯 PROPÓSITO:
  Guía completa para el despliegue del sistema MENU QR PLUS
  en diferentes entornos: desarrollo, staging y producción.

  📋 HISTORIAL DE CAMBIOS:
  ------------------------------------------------------
  1.0 - 2024-01-17 03:15
      ✅ Creación inicial del documento
      ✅ Requisitos previos
      ✅ Despliegue local con Docker
      ✅ Despliegue en producción
      ✅ Backup y recuperación
      ✅ Troubleshooting
  ======================================================
-->

# Guía de Despliegue - MENU QR PLUS

## Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Entornos](#entornos)
3. [Despliegue Local (Desarrollo)](#despliegue-local-desarrollo)
4. [Despliegue en Producción](#despliegue-en-producción)
5. [Variables de Entorno](#variables-de-entorno)
6. [Migraciones de Base de Datos](#migraciones-de-base-de-datos)
7. [Backup y Recuperación](#backup-y-recuperación)
8. [Monitoreo](#monitoreo)
9. [Troubleshooting](#troubleshooting)

---

## Requisitos Previos

### Software Requerido

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| Docker | 20.10+ | Contenedores |
| Docker Compose | 2.0+ | Orquestación local |
| Node.js | 18+ | Desarrollo local |
| PostgreSQL | 15+ | Base de datos local |
| Git | 2.x | Control de versiones |

### Hardware Recomendado (Producción)

| Entorno | CPU | RAM | Disco |
|---------|-----|-----|-------|
| Mínimo | 2 cores | 4 GB | 20 GB |
| Recomendado | 4 cores | 8 GB | 50 GB |
| Alto rendimiento | 8+ cores | 16+ GB | 100+ GB SSD |

---

## Entornos

| Entorno | URL | Propósito |
|---------|-----|-----------|
| Desarrollo | `http://localhost` | Desarrollo local |
| Staging | `https://staging.menu.dominio.com` | Pruebas pre-producción |
| Producción | `https://menu.dominio.com` | Entorno en vivo |

---

## Despliegue Local (Desarrollo)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tuusuario/menu-qr-system.git
cd menu-qr-system
2. Configurar variables de entorno
bash
cp .env.example .env
# Editar .env con tus valores locales
3. Levantar servicios con Docker
bash
docker-compose up -d
4. Verificar que todo funciona
bash
# Verificar contenedores
docker-compose ps

# Ver logs
docker-compose logs -f

# Health check
curl http://localhost:3005/health
5. Acceder a las aplicaciones
Servicio	URL
Frontend (Cliente)	http://localhost:8080
Admin Panel	http://localhost:3006
Backend API	http://localhost:3005
PostgreSQL	localhost:5432
Redis	localhost:6380
RabbitMQ Management	http://localhost:15673
6. Detener servicios
bash
docker-compose down
7. Detener y eliminar volúmenes (reset completo)
bash
docker-compose down -v
Despliegue en Producción
Opción 1: VPS (DigitalOcean, Linode, AWS EC2)
1. Conectar al servidor
bash
ssh usuario@tu-servidor.com
2. Instalar Docker
bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
3. Instalar Docker Compose
bash
sudo apt-get install docker-compose-plugin
4. Clonar repositorio
bash
git clone https://github.com/tuusuario/menu-qr-system.git
cd menu-qr-system
5. Configurar variables de entorno
bash
cp .env.example .env
nano .env  # Editar con valores de producción
6. Construir imágenes
bash
docker compose -f docker-compose.prod.yml build
7. Levantar servicios
bash
docker compose -f docker-compose.prod.yml up -d
8. Ejecutar migraciones
bash
docker compose -f docker-compose.prod.yml exec backend npm run migrate
9. Verificar despliegue
bash
docker compose -f docker-compose.prod.yml ps
curl https://tu-dominio.com/health
Opción 2: Kubernetes (EKS, AKS, GKE)
1. Configurar kubectl
bash
# AWS EKS
aws eks update-kubeconfig --region us-east-1 --name menu-cluster

# GKE
gcloud container clusters get-credentials menu-cluster --zone us-central1

# AKS
az aks get-credentials --resource-group menu-rg --name menu-cluster
2. Aplicar manifests
bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployments.yaml
kubectl apply -f k8s/services.yaml
kubectl apply -f k8s/ingress.yaml
3. Verificar despliegue
bash
kubectl get pods -n menu-prod
kubectl get services -n menu-prod
kubectl get ingress -n menu-prod
Opción 3: Servicios Administrados (Railway / Render)
Railway
bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar proyecto
railway init

# Desplegar
railway up
Render
Conectar repositorio de GitHub

Configurar servicios:

Backend: node src/server.js

Frontend: npm run build + servir estáticos

Agregar variables de entorno

Desplegar

Variables de Entorno
Backend (.env)
bash
# Node
NODE_ENV=production
PORT=3005
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://user:pass@postgres:5432/menu_db
DATABASE_URL_REPLICA_1=postgresql://user:pass@postgres_replica:5432/menu_db
DB_MAX_CONNECTIONS=20

# Redis
REDIS_URL=redis://:password@redis:6379

# RabbitMQ
RABBITMQ_URL=amqp://user:pass@rabbitmq:5672

# JWT
JWT_SECRET=tu_secreto_aqui_cambiame_en_produccion

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Frontend URL
FRONTEND_URL=https://menu.dominio.com

# CORS
CORS_ORIGINS=https://menu.dominio.com,https://admin.dominio.com
Frontend (.env)
bash
VITE_API_URL=/api
VITE_APP_TITLE=Menú Digital QR
VITE_ENV=production
Admin Panel (.env)
bash
VITE_API_URL=/api
VITE_APP_TITLE=Menu QR Plus - Admin
VITE_ENV=production
VITE_DEFAULT_PAGE_SIZE=20
Migraciones de Base de Datos
Ejecutar migraciones
bash
# Desarrollo
docker compose exec backend npm run migrate

# Producción
docker compose -f docker-compose.prod.yml exec backend npm run migrate
Revertir migración
bash
docker compose exec backend npm run migrate:undo
Crear nueva migración
bash
# Desde el backend
npm run migrate:create -- name=nueva_migracion
Sembrar datos de prueba
bash
docker compose exec backend npm run seed
Backup y Recuperación
Backup de Base de Datos
bash
#!/bin/bash
# scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
FILENAME="menu_db_${DATE}.sql.gz"

mkdir -p $BACKUP_DIR

docker compose exec -T postgres pg_dump -U menu_user menu_db | gzip > ${BACKUP_DIR}/${FILENAME}

# Subir a S3 (opcional)
aws s3 cp ${BACKUP_DIR}/${FILENAME} s3://menu-backups/${FILENAME}

# Eliminar backups de más de 30 días
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
Restaurar Backup
bash
# Detener servicios
docker compose stop backend

# Restaurar
gunzip -c /backups/menu_db_20240101.sql.gz | docker compose exec -T postgres psql -U menu_user menu_db

# Reiniciar servicios
docker compose start backend
Backup Automático (Cron)
bash
# Añadir a crontab
0 3 * * * /home/ubuntu/menu-qr-system/scripts/backup.sh
Monitoreo
Health Checks
bash
# Verificar estado general
curl https://menu.dominio.com/health

# Verificar readiness
curl https://menu.dominio.com/ready
Métricas con Prometheus
yaml
# prometheus.yml
scrape_configs:
  - job_name: 'menu-backend'
    static_configs:
      - targets: ['backend:3005']
Dashboard Grafana
Importar dashboard ID: xxxxx para métricas pre-configuradas.

Logs
bash
# Ver logs en tiempo real
docker compose logs -f backend

# Ver logs de errores
docker compose logs backend | grep ERROR

# Exportar logs
docker compose logs backend > logs.txt
Troubleshooting
Problemas Comunes
1. Puerto ocupado
Error: port is already allocated

Solución: Cambiar puertos en .env o detener servicio conflictivo

bash
# Ver puertos en uso
sudo lsof -i :3005
# Detener proceso
kill -9 <PID>
2. Conexión a base de datos fallida
Error: ECONNREFUSED 5432

Solución: Verificar que PostgreSQL esté corriendo

bash
docker compose ps postgres
docker compose logs postgres
3. Redis no responde
Error: Redis connection failed

Solución: Verificar Redis

bash
docker compose exec redis redis-cli ping
# Debe responder: PONG
4. RabbitMQ no disponible
Error: Connection to RabbitMQ failed

Solución: Verificar RabbitMQ

bash
docker compose ps rabbitmq
docker compose logs rabbitmq
5. Token JWT inválido
Error: Invalid token

Solución: Regenerar JWT_SECRET

bash
# Generar nuevo secreto
openssl rand -base64 32
# Actualizar en .env
Comandos Útiles de Diagnóstico
bash
# Ver logs de todos los servicios
docker compose logs -f --tail=100

# Ver uso de recursos
docker stats

# Ejecutar comandos dentro de contenedor
docker compose exec backend node --version

# Reiniciar servicio específico
docker compose restart backend

# Escalar réplicas (Swarm)
docker service scale menu-backend=5
Checklist de Despliegue
Variables de entorno configuradas

Base de datos migrada

SSL/TLS configurado (HTTPS)

Backups automáticos configurados

Monitoreo y alertas activos

Rate limiting configurado

CORS configurado correctamente

Logs rotados automáticamente

Health checks funcionando

Documentación actualizada

Soporte
Para issues técnicos:

Email: soporte@menuqrplus.com

Slack: #menu-qr-plus-soporte

GitHub Issues: https://github.com/tuusuario/menu-qr-system/issues