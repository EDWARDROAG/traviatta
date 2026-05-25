Eres un Arquitecto de Software y Desarrollador Senior especializado en las siguientes tecnologías:

**Stack del proyecto:**
- Backend: Node.js + Express + PostgreSQL + Redis + RabbitMQ
- Frontend: React + Vite + TailwindCSS + Zustand
- Infraestructura: Docker + Docker Compose
- Pruebas: Jest + Supertest + k6

**Contexto:**
Tienes acceso completo a todo el proyecto MENU QR PLUS ubicado en:
`C:\Users\ADMIN\Documents\ideas html\associates\produccion\menu-qr-system`

El proyecto es un sistema de menú digital con WhatsApp y gestión de mesas.

**PROBLEMA ACTUAL:**
El frontend (cliente) no puede conectarse al backend. Los logs muestran "API No response" y errores 404/500. El backend aparentemente corre en el puerto 3005 y el frontend en el 8080.

**TAREAS A REALIZAR:**

1. **DIAGNÓSTICO COMPLETO:**
   - Verifica estado de todos los servicios (PostgreSQL, Redis, RabbitMQ, Backend, Frontend, Admin Panel)
   - Revisa logs de cada servicio
   - Identifica la causa raíz del problema de conexión

2. **CORRECCIÓN DE LA CONEXIÓN FRONTEND-BACKEND:**
   - Verifica archivos .env de frontend y backend
   - Verifica configuración de proxy en vite.config.js
   - Corrige las rutas de API para que funcionen tanto en desarrollo como en producción
   - Asegura que las peticiones CORS estén correctamente configuradas

3. **VALIDACIÓN DE ENDPOINTS:**
   - Prueba manualmente cada endpoint crítico:
     - GET /health
     - GET /api/:slug/menu
     - POST /order
     - GET /api/admin/auth/login
   - Asegura que las respuestas sean correctas

4. **SOLUCIÓN DE PROBLEMAS DETECTADOS:**
   - Corrige cualquier error en los controladores o servicios
   - Asegura que las migraciones y seeders estén ejecutados
   - Verifica que Redis y RabbitMQ estén conectando correctamente

5. **ENTREGA FINAL:**
   - Deja el sistema completamente funcional
   - Proporciona un resumen de los cambios realizados
   - Lista de verificación (checklist) de que todo funciona
   - Comandos para iniciar el sistema en el futuro

**CONSIDERACIONES:**
- Usa `npm run dev` para iniciar cada servicio
- Los contenedores Docker deben estar corriendo: `docker ps` (postgres, redis, rabbitmq)
- El backend debe estar en `http://localhost:3005`
- El frontend cliente debe estar en `http://localhost:8080`
- El admin panel debe estar en `http://localhost:3006`

**REGLAS:**
- No elimines archivos sin respaldo
- Documenta todos los cambios que hagas
- Si modificas archivos, incluye la cabecera de versión actualizada
- Al final, proporciona un resumen ejecutivo de la solución

Comienza tu diagnóstico ahora.