# Entornos — Menú QR (Traviatta)

Tres usos típicos. **No mezclar** `DATABASE_URL`, JWT ni `.env` con otros proyectos Lamakinet.

| | **Local** | **Docker** | **GitHub Pages (preview)** |
|--|-----------|------------|----------------------------|
| **Uso** | Desarrollo | Stack tipo prod en PC | Enlace para mostrar al cliente |
| **Arranque** | Vite + API | `docker-compose` | push `main` / `workflow_dispatch` |
| **Frontend** | http://localhost:8080 | según compose | `https://&lt;org&gt;.github.io/&lt;repo&gt;/` |
| **API** | http://localhost:3005 | interno | sin API (MVP estático o fallback `staticMenus`) |
| **Env** | `backend/.env`, `frontend/.env` | compose + env | build-time `VITE_*` |

Detalle Pages: [DEPLOY-PAGES.md](DEPLOY-PAGES.md).

---

## 1. Local (desarrollo)

```powershell
cd backend
copy .env.example .env   # si no existe
npm install
npm run dev              # :3005
```

Otra terminal:

```powershell
cd frontend
npm install
npm run dev              # :8080
```

| URL | Uso |
|-----|-----|
| http://localhost:8080 | Frontend público |
| http://localhost:3005 | API |

Proxy `/api` → `:3005` ya está en `frontend/vite.config.js`.

---

## 2. Docker

Ver `docker-compose.yml` / `docker-compose.prod.yml` en la raíz del repo.  
No borrar volúmenes ni `-v` sin confirmación explícita.

---

## 3. GitHub Pages (preview cliente)

- Workflow objetivo: `.github/workflows/deploy-pages.yml` (**HU-008**).
- Patrón de referencia: Pañalera (`deploy-frontend-public.yml` en historial) + Aura (`deploy-vitrina.yml` con build Vite).
- En este repo el front es **React+Vite** → hace falta **build** + publicar `frontend/dist` (no subir fuente cruda).
- Una sola vez en GitHub: **Settings → Pages → Source: GitHub Actions**.

---

## WhatsApp

| Fuente | Valor |
|--------|-------|
| Fallback menú | `3193856893` → E164 `573193856893` (`site.js` / `staticMenus.js`) |
| Plantilla env | `WHATSAPP_NUMBER=3193856893` |
| UI placeholder viejo | `573 001 112 233` en `App.jsx` / `Footer.jsx` — **corregir en HU-006** |
