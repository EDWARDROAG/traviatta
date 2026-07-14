# Menú QR / Traviatta Pizza Gourmet — documentación

Proyecto **Menú QR** adaptado al cliente **Traviatta Pizza Gourmet** ([traviatta.com](https://traviatta.com/)).  
**Memoria viva:** [memory.md](memory.md)

---

## Referencia rápida

| Doc | Contenido |
|-----|-----------|
| [memory.md](memory.md) | Bitácora de sesión y pendientes |
| [historias-usuario.md](historias-usuario.md) | Backlog HU (flujo: documentar → «ejecuta» → implementar) |
| [ENTORNOS.md](ENTORNOS.md) | Local, Docker, GitHub Pages |
| [DEPLOY-PAGES.md](DEPLOY-PAGES.md) | Preview pública vía GitHub Actions |
| [STATUS_PROYECT.md](STATUS_PROYECT.md) | Fases técnicas previas (API, admin, menú) |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Arquitectura del sistema |
| [API_REFERENCE.md](API_REFERENCE.md) / [endpoints.md](endpoints.md) | Contratos API |

---

## Cliente y referencia

| Recurso | Ubicación |
|---------|-----------|
| Sitio WordPress actual | https://traviatta.com/ |
| Assets / fotos cliente | `referencias cliente/` |
| Menú PDF / imágenes menú | `frontend/src/assets/menu/` |
| WhatsApp (datos sistema) | `3193856893` / `wa.me/573193856893` |

### Estructura de presencia (paridad con WordPress)

| Pestaña | URL cliente (WP) | Ruta objetivo Menú QR |
|---------|------------------|------------------------|
| Inicio | `/` | `/` |
| Menú | `/about/` | `/menu` (o `/traviatta/menu`) |
| Nuestra historia | `/services/` | `/nuestra-historia` |
| Contacto | `/contact/` (+ CTA WhatsApp) | `/contacto` |

---

## Alcance de sesión

- **Carpeta raíz fija:** `ideas html/associates/produccion/menu-qr-system/`
- Commit/push solo si Eduar lo pide.
- Sin HU documentada no se cierra cambio de código.
