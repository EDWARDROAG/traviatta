<!--
  ======================================================
  ARCHIVO: ARCHITECTURE.md
  UBICACIÓN: menu-qr-system/docs/ARCHITECTURE.md
  FASE: DOC
  VERSIÓN: 1.0
  ÚLTIMA ACTUALIZACIÓN: 2024-01-17 03:00
  ======================================================
  🎯 PROPÓSITO:
  Documentación detallada de la arquitectura del sistema
  MENU QR PLUS. Incluye decisiones de diseño, patrones
  utilizados, escalabilidad y consideraciones de seguridad.

  📋 HISTORIAL DE CAMBIOS:
  ------------------------------------------------------
  1.0 - 2024-01-17 03:00
      ✅ Creación inicial del documento
      ✅ Visión general de la arquitectura
      ✅ Decisiones tecnológicas
      ✅ Patrones de diseño
      ✅ Consideraciones de seguridad
  ======================================================
-->

# Arquitectura - MENU QR PLUS

## Índice

1. [Visión General](#visión-general)
2. [Principios de Diseño](#principios-de-diseño)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Arquitectura Hexagonal](#arquitectura-hexagonal)
5. [Patrones de Diseño](#patrones-de-diseño)
6. [Seguridad](#seguridad)
7. [Escalabilidad](#escalabilidad)
8. [Monitoreo y Observabilidad](#monitoreo-y-observabilidad)

---

## Visión General

MENU QR PLUS es una plataforma SaaS multi-tenant que permite a restaurantes digitalizar su menú y canal de pedidos. La arquitectura está basada en **microservicios contenidos en Docker**, con una API RESTful en el backend y aplicaciones React en el frontend.

### Diagrama de Arquitectura de Alto Nivel
┌─────────────────────────────────────────────────────────────────────────────┐
│ CLIENTES │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Móvil │ │ Tablet │ │ Desktop │ │ QR Code │ │
│ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ │
│ │ │ │ │ │
│ └────────────────┴────────────────┴────────────────┘ │
│ │ │
│ ▼ │
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │ CDN (CloudFront) │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
│ │ │
│ ▼ │
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │ LOAD BALANCER (Nginx) │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
│ │ │
│ ┌────────────────────────────┼────────────────────────────┐ │
│ │ │ │ │
│ ▼ ▼ ▼ │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ API Node 1 │ │ API Node 2 │ │ API Node N │ │
│ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ │
│ │ │ │ │
│ └────────────────────────────┼────────────────────────────┘ │
│ │ │
│ ┌────────────────────────────┼────────────────────────────┐ │
│ │ │ │ │
│ ▼ ▼ ▼ │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ PostgreSQL │ │ Redis │ │ RabbitMQ │ │
│ │ Master │ │ Cluster │ │ Cluster │ │
│ └──────┬──────┘ └─────────────┘ └─────────────┘ │
│ │ │
│ ▼ │
│ ┌─────────────┐ │
│ │ PostgreSQL │ │
│ │ Replica 1 │ │
│ └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘

text

---

## Principios de Diseño

| Principio | Aplicación |
|-----------|------------|
| **Multi-tenancy** | Cada restaurante es un tenant aislado por `tenant_id` en todas las tablas |
| **Stateless API** | Las sesiones se almacenan en Redis, no en memoria del servidor |
| **Procesamiento Asíncrono** | Pedidos encolados en RabbitMQ para no bloquear la respuesta al cliente |
| **Caché Distribuido** | Redis para reducir carga en PostgreSQL y mejorar tiempos de respuesta |
| **Read Replicas** | Separación de lecturas y escrituras para escalar horizontalmente |
| **Graceful Degradation** | Fallback a enlaces WhatsApp cuando la API de WhatsApp no está disponible |

---

## Stack Tecnológico

### Backend

| Componente | Tecnología | Versión | Propósito |
|------------|------------|---------|-----------|
| Runtime | Node.js | 20.x | Entorno de ejecución |
| Framework | Express | 4.x | API REST |
| ORM/Query | pg (node-postgres) | 8.x | Cliente PostgreSQL nativo |
| Auth | JWT + bcrypt | 9.x / 5.x | Autenticación |
| Validación | Joi | 17.x | Validación de datos |
| Logging | Winston | 3.x | Logging estructurado |
| Tests | Jest | 29.x | Pruebas unitarias e integración |

### Base de Datos

| Componente | Tecnología | Versión | Propósito |
|------------|------------|---------|-----------|
| Principal | PostgreSQL | 15.x | Datos persistentes |
| Caché | Redis | 7.x | Caché distribuido, sesiones |
| Colas | RabbitMQ | 3.12 | Mensajería asíncrona |

### Frontend

| Componente | Tecnología | Versión | Propósito |
|------------|------------|---------|-----------|
| Framework | React | 18.x | UI |
| Build Tool | Vite | 5.x | Bundler rápido |
| Estilos | TailwindCSS | 3.x | Utility-first CSS |
| Estado | Zustand | 4.x | Estado global (carrito) |
| Router | React Router | 6.x | Navegación SPA |
| HTTP | Axios | 1.x | Cliente HTTP |
| Gráficos | Recharts | 2.x | Dashboard (admin) |
| Canvas | React Konva | 18.x | Mapa de mesas (admin) |

### Infraestructura

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| Contenedores | Docker | Empaquetado |
| Orquestación | Docker Compose (dev) / Kubernetes (prod) | Despliegue |
| CI/CD | GitHub Actions | Automatización |
| Monitoreo | Prometheus + Grafana | Métricas y alertas |
| Logs | Loki | Agregación de logs |
| Imágenes | Cloudinary | Almacenamiento y CDN |

---

## Arquitectura Hexagonal

El backend sigue una arquitectura hexagonal (puertos y adaptadores) para mantener la lógica de negocio desacoplada de las tecnologías externas.
┌─────────────────────────────────────────────────────────────────────────────┐
│ DOMAIN (Core) │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Entities (Models) │ │
│ │ Tenant | Branch | Table | Category | Product | Order | Module │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Use Cases (Services) │ │
│ │ MenuService | OrderService | TableService | BranchService │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
│
│ Ports (Interfaces)
▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ ADAPTERS (Infrastructure) │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ PostgreSQL │ │ Redis │ │ RabbitMQ │ │ Cloudinary │ │
│ │ Adapter │ │ Adapter │ │ Adapter │ │ Adapter │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Express │ │ JWT Auth │ │ Winston │ │ WhatsApp │ │
│ │ Adapter │ │ Adapter │ │ Adapter │ │ Adapter │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘

text

---

## Patrones de Diseño

### 1. Repository Pattern

Los modelos actúan como repositorios, encapsulando toda la lógica de acceso a datos.

```javascript
// models/Product.js
const create = async (data) => { ... }
const findById = async (id) => { ... }
const update = async (id, data) => { ... }
2. Service Layer Pattern
La lógica de negocio se encapsula en servicios separados de los controladores.

javascript
// services/orderService.js
const createOrder = async (orderData) => { ... }
const processOrderQueue = async (orderData) => { ... }
3. Middleware Pattern
Express middleware para autenticación, validación, rate limiting y caché.

javascript
// middleware/auth.js
const authMiddleware = async (req, res, next) => { ... }
4. Observer Pattern (RabbitMQ)
Comunicación asíncrona entre servicios mediante colas.

text
Order Service ──publish──► RabbitMQ ──consume──► WhatsApp Service
5. Strategy Pattern (Delivery Zones)
Diferentes estrategias para validar zonas de domicilio.

javascript
// geoUtils.js
const strategies = {
  radius: isPointInCircle,
  polygon: isPointInPolygon,
  neighborhoods: isAddressInNeighborhoods
}
6. Factory Pattern (QR Generation)
Creación de QR para diferentes contextos (sede, mesa).

javascript
// qrGenerator.js
const generateMenuQR = (slug, branchId) => { ... }
const generateTableQR = (slug, tableId) => { ... }
7. Singleton Pattern (Database Pool)
Pool de conexiones compartido en toda la aplicación.

javascript
// config/database.js
const masterPool = new Pool(config)
const replicaPool = new Pool(config)
Seguridad
Autenticación y Autorización
Mecanismo	Implementación
JWT	Tokens con expiración (7 días)
Refresh Token	Almacenado en Redis, rotación automática
bcrypt	Hashing de contraseñas (salt rounds = 10)
Rate Limiting	100 req/min por IP, 500 req/min por tenant
Protección de Datos
Medida	Implementación
HTTPS	TLS 1.2+ en todos los entornos
CORS	Orígenes permitidos configurados
Helmet	Headers de seguridad HTTP
SQL Injection	Prepared statements (pg)
XSS	Sanitización de inputs y escape de outputs
Input Validation	Joi en todos los endpoints
Aislamiento Multi-tenant
sql
-- Cada consulta filtra por tenant_id
SELECT * FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.branch_id = $1
AND c.tenant_id = $2  -- Filtro de tenant
Variables de Entorno Sensibles
bash
# .env (NUNCA commiteado)
JWT_SECRET=...
DATABASE_URL=...
CLOUDINARY_API_SECRET=...
Escalabilidad
Estrategias de Escalado
Componente	Estrategia	Capacidad
API Server	Horizontal (múltiples pods)	10,000+ concurrentes
PostgreSQL	Read replicas + Master	5,000 lecturas/segundo
Redis	Cluster	100,000 ops/segundo
RabbitMQ	Cluster	50,000 msg/segundo
Auto-scaling (Kubernetes)
yaml
# Configuración de auto-scaling
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: menu-backend
spec:
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
Caché Distribuido
javascript
// Redis TTL por tipo de dato
const CACHE_TTL = {
  MENU: 300,      // 5 minutos (cambia poco)
  PRODUCT: 600,   // 10 minutos
  SESSION: 604800 // 7 días
}
Read Replicas
javascript
// Round-robin entre réplicas
const getReadConnection = () => {
  const replicas = [replica1, replica2, replica3]
  const index = counter++ % replicas.length
  return replicas[index]
}
Monitoreo y Observabilidad
Métricas Recolectadas
Métrica	Herramienta	Dashboard
CPU/Memoria	Prometheus	Grafana
Latencia API	Prometheus	Grafana
Tasa de errores	Prometheus	Grafana
Pedidos por segundo	Prometheus	Grafana
Logs estructurados	Winston + Loki	Grafana
Trazas	Jaeger (opcional)	Jaeger UI
Health Checks
javascript
// Endpoints de health check
GET /health   // Estado general
GET /ready    // Readiness para Kubernetes
GET /live     // Liveness para Kubernetes
Alertas Configuradas
Condición	Acción
CPU > 80% por 5 min	Alertar + auto-escalar
Error rate > 5%	Alertar vía Slack
Pedidos queue > 100	Alertar vía SMS
DB conexiones > 80%	Alertar + escalar réplicas
Diagramas Relacionados
Diagrama de Componentes

Diagrama Entidad-Relación

Diagrama de Secuencia

Referencias
API Reference

Deployment Guide

Owner Manual