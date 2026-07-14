# Historias de usuario — Menú QR (Traviatta Pizza Gourmet)

Documento de referencia para desarrollo por iteraciones. Cada historia es independiente y verificable.

**Cliente:** Traviatta Pizza Gourmet — https://traviatta.com/  
**Alcance fijo:** `ideas html/associates/produccion/menu-qr-system/`

---

## Flujo de trabajo

1. **Cada pedido tuyo** → se registra como **HU-XX** aquí **antes** de implementar.
2. Estado: implementado → ✅ · solo documentado → ⏳ · en curso → 🔄
3. **Se implementa cuando digas «ejecuta»** (una HU o la cola que indiques).
4. Al cerrar una HU: actualizar **Estado** aquí + bitácora en [memory.md](memory.md).
5. **Sin HU no hay cambio de código.**

### Cola actual

| Orden | HU | Título | Estado |
|-------|-----|--------|--------|
| 0 | **HU-001** | Docs trazabilidad estilo Pañalera | ✅ Hecho (2026-07-13) |
| 1 | **HU-002** | Nav alineada a WP: Inicio / Menú / Nuestra historia / Contacto | ✅ Implementado (2026-07-13) |
| 2 | **HU-007** | Sync imágenes `referencias cliente` → `frontend/src/assets` | ✅ Implementado (2026-07-13) |
| 3 | **HU-003** | Inicio: textos e imágenes como traviatta.com | ✅ Implementado (2026-07-13) |
| 4 | **HU-004** | Menú: presencia tipo cliente (foto + ver menú) | ✅ Implementado (2026-07-13) |
| 5 | **HU-005** | Nuestra historia: textos reales de WP | ✅ Implementado (2026-07-13) |
| 6 | **HU-006** | Contacto + WhatsApp (mismo número / CTA) | ✅ Implementado (2026-07-13) |
| 7 | **HU-008** | GitHub Actions Pages (link preview cliente) | ✅ Listo · falta push/UAT CEO |
| 8 | **HU-009** | Carta digital: cargar menú QR (fallback + slug) | ✅ Implementado (2026-07-13) |
| 9 | **HU-010** | Inicio: imágenes por nombre (Villa del Río) | ✅ Implementado (2026-07-13) · sede única |
| 10 | **HU-011** | Menú: lightbox de páginas de carta (sin pestaña nueva) | ✅ Implementado (2026-07-13) |
| 11 | **HU-012** | Multisede: selector Villa del Río / Mandalay (estilo Pañalera) | ⏸️ Aplazada |
| 12 | **HU-013** | Dev: puerto libre + carta sin proxy ECONNREFUSED | ✅ Implementado (2026-07-13) |
| 13 | **HU-014** | Menú QR: pedido + mensaje WhatsApp sin depender del API | ✅ Implementado (2026-07-13) |
| 14 | **HU-015** | Responsive PC + celular | ✅ Implementado (2026-07-13) |

**Docs:** [ENTORNOS.md](ENTORNOS.md) · [DEPLOY-PAGES.md](DEPLOY-PAGES.md) · [memory.md](memory.md)

---

## HU-001 — Docs: trazabilidad estilo Pañalera Rouse

**Como** arquitecto / CEO  
**Quiero** `docs/` con memory, HUs, entornos y deploy  
**Para** llevar el proyecto equal que Pañalera y poder delegar después  

**Pedido (2026-07-13):** crear carpeta docs / replicar trazabilidad de Pañalera; HUs; ejecutar cuando diga.

**Criterios de aceptación**

- [x] `docs/README.md` índice
- [x] `docs/memory.md` bitácora
- [x] `docs/historias-usuario.md` backlog
- [x] `docs/ENTORNOS.md` y `docs/DEPLOY-PAGES.md`
- [x] No borra docs técnicos previos (API, arquitectura)

**Estado:** ✅ Implementado (2026-07-13)

---

## HU-002 — Navegación: Inicio / Menú / Nuestra historia / Contacto

**Como** visitante  
**Quiero** las mismas pestañas que en traviatta.com  
**Para** reconocer el sitio y no perder rutas mentales  

**Pedido:** estructura Inicio, Menú, Nuestra historia y Contacto.

**Criterios de aceptación**

- [x] Navbar (desktop + móvil): **Inicio**, **Menú**, **Nuestra historia**, **Contacto**
- [x] Quitar o relegar **Reservas** del nav principal (no está en WP)
- [x] Rutas React: `/`, `/menu`, `/nuestra-historia`, `/contacto` (+ `/traviatta/menu` carta)
- [x] Footer con los mismos enlaces

**Archivos:** `Navbar.jsx`, `Footer.jsx`, `App.jsx`, `data/site.js`

**Estado:** ✅ Implementado (2026-07-13)

---

## HU-003 — Inicio: textos y bloques como WordPress

**Como** dueño del restaurante  
**Quiero** que el inicio diga lo mismo que traviatta.com  
**Para** que el MVP se sienta familiar al cliente  

**Textos fuente (WP home):**

- Claim: *Cada Plato Tiene Su Magia*
- Bloques: +40 sabores de pizzas · Lasañas artesanales · Pastas al estilo Traviatta · Hamburguesas 100% artesanales · Perros calientes · Salchipapas (copy literal del sitio)
- Testimonio Luis Meneses
- Bloque historia corta (+11 años / nació hace 12)
- CTA: *¿Tienes alguna pregunta? Escríbenos al WhatsApp*

**Criterios de aceptación**

- [x] Reemplazar copy genérico actual de `HomePage.jsx`
- [x] Usar imágenes de `referencias cliente/` (vía HU-007)
- [x] Mantener calidad visual ≥ estado actual (no peores cards/hero)
- [x] CTA WhatsApp funcional (número HU-006)

**Estado:** ✅ Implementado (2026-07-13)

---

## HU-004 — Menú: presencia alineada al cliente

**Como** cliente  
**Quiero** ver el menú como en la pestaña Menú de WP  
**Para** consultar carta sin fricción  

**Fuente WP:** `/about/` — imagen grande + enlace “ver menú” (PDF Drive).

**Criterios de aceptación**

- [x] Página Menú con imagen hero (`PHOTO-2024-03-20…` → `assets/menu-hero/`)
- [x] CTA “Ver menú” → carta digital `/traviatta/menu` + galería páginas `assets/menu/`
- [x] No rompe carrito / pedido WhatsApp existente

**Estado:** ✅ Implementado (2026-07-13)

---

## HU-005 — Nuestra historia: textos reales

**Como** visitante  
**Quiero** leer la historia del local como en el sitio actual  
**Para** confiar en la marca  

**Fuente WP:** `/services/` — *una década de pasión y sabor* · Desde el primer día · Una década (+ texto home de +11 años).

**Criterios de aceptación**

- [x] Ruta `/nuestra-historia` con los tres bloques de texto (ortografía revisada)
- [x] Imagen de apoyo desde referencias
- [x] Enlace desde nav y footer

**Estado:** ✅ Implementado (2026-07-13)

---

## HU-006 — Contacto y WhatsApp alineados

**Como** cliente  
**Quiero** escribir por WhatsApp con un clic  
**Para** pedir o preguntar como en el sitio actual  

**Datos sistema:** `whatsapp_number: 3193856893` (`staticMenus.js`, `.env.example`).

**Criterios de aceptación**

- [x] Página Contacto con CTA *Escríbenos* → `https://wa.me/573193856893`
- [x] Quitar placeholders `573 001 112 233` de nav/footer/contacto
- [x] CTA WhatsApp visible en Inicio
- [x] Pedidos checkout siguen vía `whatsapp.js` + número branch `3193856893`

**Estado:** ✅ Implementado (2026-07-13)

---

## HU-007 — Sincronizar imágenes referencias → frontend

**Como** desarrollador  
**Quiero** los assets del cliente en el árbol del front  
**Para** que Vite los bundlee y no queden solo en carpeta de referencia  

**Pedido:** imágenes de `referencias cliente/`; mantener sincronía con las que ya hay en `frontend/src/assets/img/`.

**Criterios de aceptación**

- [x] Copiar/organizar logo, platos, menú PHOTO, historia a `frontend/src/assets/`
- [x] Imports en páginas
- [x] Solo media del cliente (sin secretos)

**Estado:** ✅ Implementado (2026-07-13)

---

## HU-008 — GitHub Actions → link GitHub Pages

**Como** CEO  
**Quiero** un enlace público tras push  
**Para** enviárselo al cliente sin montar servidor  

**Pedido:** duplicar configuración de Pañalera Rouse (Actions + Pages), adaptada a Vite.

**Criterios de aceptación**

- [x] Workflow `.github/workflows/deploy-pages.yml` (build `frontend` + deploy Pages)
- [x] `vite.config` con `base` vía `VITE_BASE_PATH` + basename en `main.jsx`
- [x] SPA fallback `404.html` en CI
- [x] Doc DEPLOY-PAGES + YAML vacíos eliminados
- [ ] UAT: push + Actions verde + URL Pages (pendiente commit/push CEO)

**Estado:** ✅ Implementado (2026-07-13) · pendiente push/UAT Pages del CEO

**UAT Pages (tú):**
1. Commit + push a `main`
2. Repo → Settings → Pages → Source: GitHub Actions
3. Actions → workflow **Deploy frontend (Pages)** verde
4. Abrir `https://lamakinetfood-png.github.io/lamakinetfood/`
5. Probar carta digital, lightbox y nav

---

## HU-009 — Carta digital: cargar menú QR (Oops / Intentar nuevamente)

**Como** cliente  
**Quiero** ver y pedir en la carta digital al pulsar “Pedir en la carta digital”  
**Para** usar el menú QR (propósito del proyecto)  

**Pedido (2026-07-13):** En Menú → botón carta digital muestra “Oops… Intentar nuevamente”. Verificar por qué no carga.

### Diagnóstico (verificado)

| Causa | Detalle |
|-------|---------|
| 1. Slug vacío | Ruta fija `/traviatta/menu` **sin** `:slug` → `useParams().slug` es `undefined` → API `/undefined/menu` |
| 2. Redirect malicioso | `/:slug/menu` redirige a `/traviatta/menu` y pierde el param |
| 3. Sin fallback | Existe `getFallbackMenu()` en `staticMenus.js` pero **`useMenu` no lo usa** → sin backend (dev Pages / API caída) siempre error |

### Criterios de aceptación

- [x] `/traviatta/menu` muestra categorías/productos Traviatta
- [x] Si API falla → `getFallbackMenu('traviatta')`
- [x] Slug por defecto `traviatta` (`DEFAULT_MENU_SLUG`)
- [x] No mostrar Oops si hay fallback
- [x] Carrito / WhatsApp con datos del menú fallback

**Archivos:** `useMenu.js`, `MenuPage.jsx`, `App.jsx` (`/:slug/menu`), `site.js`

**Estado:** ✅ Implementado (2026-07-13)

---

## HU-010 — Inicio: imágenes hamburguesa / perro / salchipapa

**Como** visitante  
**Quiero** que cada bloque del Inicio muestre la foto real del plato  
**Para** que coincida con el texto (hamburguesa, perro caliente, salchipapa)  

**Pedido (2026-07-13):** Las imágenes de perro, salchipapa y hamburguesa no corresponden. El CEO las renombra y las coloca en la misma carpeta; el agente redimensiona acorde al texto/layout.

### Criterios de aceptación

- [ ] Assets nombrados de forma inequívoca en `referencias cliente/` o `frontend/src/assets/home/` (ej. `hamburguesa.*`, `perro-caliente.*`, `salchipapa.*`)
- [ ] Redimensionar / recortar para el bloque Inicio (misma proporción que el resto de highlights, tipicamente ~4:3 cover)
- [ ] `HomePage.jsx` apunta cada bloque al archivo correcto
- [ ] Pizzas / lasañas / pastas no se rompen

**Estado:** ✅ Implementado (2026-07-13) — sede activa **Villa del Río** (HU-012 aplazada)

**Mapeo público actual (sede Villa del Río):**  
`frontend/src/assets/sedes/villa-del-rio/` ← sync desde `referencias cliente/villa del rio/`

| Bloque UI | Archivo |
|-----------|---------|
| Hero / pizzas / menú hero | `header_1.jpg` |
| Lasañas | `lasagna.jpg` |
| Pastas | `pasta_camaron.jpeg` |
| Hamburguesas | `hamburguesa.jpg` |
| Perros calientes | `perro_caliente.jpg` |
| Salchipapas | `salchipapa.jpeg` |
| Historia | `mas_de_10_anos.jpg` / `nuestros_inicios.jpeg` |
| Contacto | `entrada.jpeg` |
| Logo | `logo.webp` |

**Mandalay:** assets en `referencias cliente/mandalay/` reservados para HU-012.

---

## HU-011 — Menú: lightbox de páginas de carta (sin pestaña nueva)

**Como** cliente  
**Quiero** ampliar cada página de la carta Traviatta a pantalla casi completa  
**Para** leer el menú sin abrir otra pestaña y poder cambiar de página con facilidad  

**Pedido (2026-07-13):** Al clic en imágenes de «Carta Traviatta» no abrir pestaña nueva; agrandar al máximo posible; botón cerrar para volver y cambiar entre tablas/páginas.

**Criterios de aceptación**

- [x] Clic en una página de carta → overlay a pantalla casi completa
- [x] No abre pestaña nueva
- [x] Botón **Cerrar** + Escape
- [x] Prev/next (flechas UI + teclado)
- [x] Móvil y desktop (CSS max-h/max-w)

**Archivos:** `MenuPresencePage.jsx`

**Estado:** ✅ Implementado (2026-07-13)

---

## HU-012 — Multisede: selector Villa del Río / Mandalay (patrón Pañalera)

**Como** visitante  
**Quiero** elegir entre **Sede Villa del Río** y **Sede Mandalay**  
**Para** ver fotos, teléfono, WhatsApp y dirección de esa sede  

**Pedido (2026-07-13):** Dos sedes. El CEO crea dos carpetas en `referencias cliente/` para clasificar assets. En Inicio, botón tipo Pañalera Grace (barra **Niño / Niña** → aquí **Villa del Río / Mandalay**). Cambia: fotos del local, teléfono, WhatsApp, dirección; la experiencia (carta/flujo) continúa, pero el Inicio de Mandalay debe verse distinto.

### Referencia Pañalera Rouse

| Pieza | Dónde |
|-------|--------|
| UI barra 2 botones | `frontend-public/index.html` → `.theme-toggle.theme-toggle--bar` (`btn-mod-nino` / `btn-mod-nina`) |
| Estilos | `css/components.css` → `.theme-toggle`, `.theme-btn` |
| Lógica | `js/main.js` → `initGenderFilters()`: `localStorage` + `data-theme` + evento `pañalera-theme-changed` |

Misma UX: strip bajo header, 2 botones exclusivos (`aria-pressed`), persistencia, re-render del contenido según sede.

### Qué cambia por sede

| Dato | Villa del Río | Mandalay |
|------|---------------|----------|
| Fotos local / Inicio | carpeta sede 1 | carpeta sede 2 |
| Teléfono | por definir en carpeta / config | por definir |
| WhatsApp | por definir | por definir |
| Dirección | por definir | por definir |
| Carta / pedido QR | misma experiencia (ajustar WA al sede activo) | |

### Criterios de aceptación

- [ ] Carpetas en `referencias cliente/` (ej. `sede-villa-del-rio/`, `sede-mandalay/`) reconocidas en docs
- [ ] Selector de 2 sedes visible en Inicio (barra estilo Pañalera)
- [ ] Persistencia (`localStorage`) de sede activa
- [ ] Contexto global React (o equivalente): WhatsApp, teléfono, dirección, imágenes Inicio/historia según sede
- [ ] Contacto / footer / CTA WA usan datos de la sede activa
- [ ] Documentar números/direcciones en `site.js` o `data/sedes.js` cuando el CEO los pase

**Estado:** ⏸️ Aplazada (2026-07-13) — MVP solo Villa del Río hasta nueva orden

---

## HU-013 — Dev: puerto libre + carta sin ECONNREFUSED del proxy

**Como** desarrollador  
**Quiero** abrir la carta digital sin errores de proxy  
**Para** UAT local aunque el backend no esté corriendo  

**Pedido (2026-07-13):** proxy error `/api/traviatta/menu` ECONNREFUSED; verificar puerto ocupado y usar uno libre.

**Hallazgos:** `:8080` ocupado (node) · `:3005` libre pero **sin proceso backend**.

**Criterios**

- [x] Vite en **8081** (`VITE_DEV_PORT`, `strictPort: false`)
- [x] `VITE_USE_STATIC_MENU=true` → carta desde `staticMenus` sin llamar `/api`
- [x] Proxy tolera API caída (log warning, no tumba el front)

**Estado:** ✅ Implementado (2026-07-13)

---

## HU-014 — Menú QR: pedido + WhatsApp concatenado (sin API)

**Como** cliente  
**Quiero** armar un pedido en la carta digital y enviarlo por WhatsApp  
**Para** que la pizzería reciba el mensaje listo (flujo Menú QR original)  

**Pedido (2026-07-13):** “Pedir carta digital” debe abrir el menú QR de pedidos; al enviar, mensaje concatenado a la pizzería.

**Causa:** `CheckoutPage` exigía `createOrder` al backend; sin API fallaba y **no abría WhatsApp**.

**Criterios**

- [x] `/traviatta/menu` muestra productos (`staticMenus`) + carrito
- [x] Checkout confirma → abre `wa.me` con pedido armado
- [x] Funciona con `VITE_USE_STATIC_MENU=true` (sin backend)
- [x] Número WA E164 `573193856893`
- [x] CTA renombrado a “Pedir / Abrir menú QR”

**Archivos:** `CheckoutPage.jsx`, `MenuPage.jsx`, `MenuPresencePage.jsx`, `staticMenus.js`

**Estado:** ✅ Implementado (2026-07-13)

---

## HU-015 — Responsive PC + celular

**Como** visitante  
**Quiero** que Inicio, Menú, carta QR, lightbox y checkout se vean bien en móvil y PC  
**Para** pedir sin problemas desde cualquier dispositivo  

**Criterios**

- [x] Tipografía fluid (`clamp`) + viewport-fit
- [x] Navbar sólida fuera de home / menú móvil con overflow lock
- [x] CategoryTabs sticky bajo el navbar + scroll táctil
- [x] Carrito flotante con safe-area y hoja max 85vh
- [x] Checkout: resumen primero en móvil, form después
- [x] Botones táctiles ≥ 44px; lightbox con `100dvh`

**Estado:** ✅ Implementado (2026-07-13)

---

## Notas MVP (fuera de estas HUs)

- Pedido en línea WooCommerce del WP (`/pedido-en-linea/`) **no** es parte de este MVP.
- Admin completo / seed BD real: ya en fases 5–6 de `STATUS_PROYECT.md`; priorizar después de presencia.
