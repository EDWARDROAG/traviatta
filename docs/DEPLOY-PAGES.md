# Deploy preview — GitHub Pages (Menú QR / Traviatta)

Objetivo: generar un **link público** para enviárselo al cliente (como Pañalera Grace → `https://edwardroag.github.io/PA-ALERA_GRACE/`).

Repo actual: [EDWARDROAG/traviatta](https://github.com/EDWARDROAG/traviatta).

---

## Requisito en GitHub (una vez)

1. Repo → **Settings → Pages**
2. **Build and deployment → Source:** *GitHub Actions*
3. (Opcional) Environment `github-pages`

---

## Workflow objetivo (HU-008)

Archivo: `.github/workflows/deploy-pages.yml`

| Paso | Qué hace |
|------|----------|
| Trigger | `push` a `main` (paths `frontend/**`) + `workflow_dispatch` |
| Setup | Node 20 |
| Build | `cd frontend && npm ci && npm run build` |
| Base path | `VITE_BASE_PATH=/&lt;nombre-repo&gt;/` si Pages es project site |
| SPA | Copiar `dist/index.html` → `dist/404.html` |
| Publish | `actions/upload-pages-artifact` + `actions/deploy-pages` |

Referencias a copiar/adaptar:

- Pañalera: `.github/workflows/deploy-frontend-public.yml` (commit `25121cc`, subía carpeta estática)
- Aura Violet: `deploy-vitrina.yml` (build Vite + Pages artifact) — **más cercano** a este front React

Los YAML actuales `build.yml` / `deploy.yml` / `test.yml` están **vacíos**; HU-008 los reemplaza o deja de usarlos.

---

## URL esperada

Tras push a `main` y el primer run exitoso:

```text
https://edwardroag.github.io/traviatta/
```

Confirmá en Settings → Pages. Base de build: `VITE_BASE_PATH=/traviatta/`.

## Estado workflow

Archivos listos:

| Archivo | Rol |
|---------|-----|
| `.github/workflows/deploy-pages.yml` | Build Vite + publicar Pages |
| `.github/workflows/ci.yml` | Build de verificación en push/PR |
| `frontend/package-lock.json` | **Debe ir en el commit** (`npm ci`) |
| `VITE_BASE_PATH=/traviatta/` | Base del project site |
| `VITE_USE_STATIC_MENU=true` | Carta QR sin API en el preview |

**Importante:** el `.gitignore` ya no ignora `package-lock.json` (antes hacía fallar Actions).

### Checklist CEO (una vez)

1. Commit + push a `main` (incluye `frontend/package-lock.json` y workflows)
2. Repo → **Settings → Pages → Source: GitHub Actions**
3. Actions → workflow **Deploy frontend (Pages)** en verde
4. Abrir: https://edwardroag.github.io/traviatta/

---

## Limitaciones del preview

| Capacidad | En Pages |
|-----------|----------|
| Inicio / Menú / Historia / Contacto (estático) | ✅ |
| Menú desde `staticMenus` / assets locales | ✅ |
| Pedidos con backend PostgreSQL | ❌ (usar local/Docker o API pública después) |
| WhatsApp `wa.me` | ✅ (solo abre chat) |

---

## Checklist post-deploy

- [ ] Actions → workflow verde
- [ ] Abrir URL Pages en móvil
- [ ] Nav: 4 pestañas
- [ ] Logo Traviatta visible
- [ ] Botón WhatsApp abre el número correcto
- [ ] Rutas SPA no dan 404 al refrescar (`/menu`, `/nuestra-historia`, `/contacto`)
