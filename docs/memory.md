# Memoria de proyecto — Menú QR (Traviatta)

**Última actualización:** 2026-07-13 (HU-009/010/011/008 · sede Villa del Río)  
**Alcance:** `ideas html/associates/produccion/menu-qr-system/`

### Reglas de trabajo (sesión)

| Regla | Detalle |
|-------|---------|
| Alcance | Solo esta carpeta |
| Historias | Todo pedido → HU en `docs/historias-usuario.md` |
| Git | Commit/push solo si Eduar lo pide |
| Sede MVP | **Villa del Río** — HU-012 (Mandalay) aplazada |

---

## Estado actual

| Área | Estado |
|------|--------|
| Carta digital / Menú QR | ✅ Productos + carrito + WA (HU-014) |
| Dev front | **http://localhost:8081** (`VITE_DEV_PORT`) |
| Imágenes Inicio | ✅ Por nombre Villa (HU-010) |
| Lightbox cartas | ✅ Sin pestaña nueva (HU-011) |
| GHA Pages | ✅ Workflow listo (HU-008) · falta push CEO |
| Multisede | ⏸️ HU-012 aplazada |

**URL Pages esperada:** `https://lamakinetfood-png.github.io/lamakinetfood/`

---

## Hecho 2026-07-13 (noche)

| HU | Qué |
|----|-----|
| **HU-009** | `useMenu` → fallback; ruta `/:slug/menu`; `DEFAULT_MENU_SLUG=traviatta` |
| **HU-010** | Sync + cable Villa del Río; hero marca sede |
| **HU-011** | Lightbox full + Cerrar + flechas + Escape |
| **HU-008** | Confirmado `deploy-pages.yml` + checklist UAT |
| **HU-012** | Aplazada |

## Siguiente paso

1. **Reiniciar Vite** si hace falta → **http://localhost:8081**
2. Menú → **Abrir / Pedir menú QR** → agregar productos → Ir a pagar → **Enviar pedido por WhatsApp**.
3. Commit/push Pages cuando digas.
