# ======================================================
# ARCHIVO: Dockerfile
# UBICACIÓN: menu-qr-system/backend/Dockerfile
# FASE: F0
# VERSIÓN: 1.0
# ÚLTIMA ACTUALIZACIÓN: 2024-01-16 08:30
#
# 🎯 PROPÓSITO:
# Construir la imagen Docker del backend para entornos
# de desarrollo y producción. Multi-stage build para
# optimizar el tamaño final de la imagen.
#
# 📦 DEPENDENCIAS:
# - node:18-alpine: Imagen base oficial de Node.js
# - package.json: Dependencias del proyecto
#
# 🔗 RELACIONES:
# - Es utilizado por: docker-compose.yml
# - Depende de: backend/package.json
#
# 📋 HISTORIAL DE CAMBIOS:
# ------------------------------------------------------
# 1.0 - 2024-01-16 08:30
#    ✅ Creación inicial del Dockerfile
#    ✅ Multi-stage build (builder + production)
#    ✅ Configuración de usuario no-root
#    ✅ Healthcheck configurado
#    ✅ Exposición del puerto 3005
# ======================================================

# ======================================================
# ETAPA 1: BUILDER
# ======================================================
FROM node:18-alpine AS builder

# Instalar herramientas necesarias para módulos nativos
RUN apk add --no-cache python3 make g++

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY package-lock.json* ./

# Instalar todas las dependencias (incluyendo devDependencies)
RUN npm ci --include=dev

# Copiar código fuente
COPY . .

# Ejecutar build (si hay steps de compilación)
RUN npm run build || true

# ======================================================
# ETAPA 2: PRODUCCIÓN
# ======================================================
FROM node:18-alpine

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar dependencias de producción desde builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Copiar código fuente
COPY --chown=nodejs:nodejs . .

# Crear directorio para logs y uploads
RUN mkdir -p logs uploads && \
    chown -R nodejs:nodejs logs uploads

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto de la aplicación
EXPOSE 3005

# Healthcheck para Kubernetes/Docker
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3005/health || exit 1

# Comando de inicio
CMD ["npm", "start"]