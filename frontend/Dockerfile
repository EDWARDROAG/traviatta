# ======================================================
# ARCHIVO: Dockerfile
# UBICACIÓN: menu-qr-system/frontend/Dockerfile
# FASE: F0
# VERSIÓN: 1.0
# ÚLTIMA ACTUALIZACIÓN: 2024-01-16 17:30
#
# 🎯 PROPÓSITO:
# Instrucciones para construir la imagen Docker del
# frontend (menú digital para clientes).
# Utiliza multi-stage build para optimizar el tamaño.
#
# 📦 DEPENDENCIAS:
# - node:18-alpine: Build y dependencias
# - nginx:alpine: Servidor web
#
# 🔗 RELACIONES:
# - Utilizado por: docker-compose.yml
#
# 📋 HISTORIAL DE CAMBIOS:
# ------------------------------------------------------
# 1.0 - 2024-01-16 17:30
#    ✅ Creación inicial del archivo
#    ✅ Multi-stage build
#    ✅ Configuración de Nginx
#    ✅ Optimización de caché de dependencias
# ======================================================

# ======================================================
# ETAPA 1: BUILD
# ======================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# ======================================================
# ETAPA 2: SERVIDOR NGINX
# ======================================================
FROM nginx:alpine

# Instalar herramientas útiles (opcional)
RUN apk add --no-cache curl

# Copiar archivos construidos desde la etapa builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]