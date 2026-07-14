# client-vitrina-deploy

Script **portable** para publicar solo la vitrina en GitHub Pages. Copiá esta carpeta a cualquier proyecto cliente.

---

## Copiar a un proyecto nuevo

```
tu-proyecto/
└── scripts/
    └── client-vitrina-deploy/    ← copiar carpeta completa
        ├── detect-and-deploy.js
        ├── package.json
        └── README.md
```

---

## Pasos (desde la raíz del proyecto)

```bash
# 1. Editar PROJECT_CONFIG en detect-and-deploy.js (carpeta vitrina, exclusiones)

# 2. Detectar
node scripts/client-vitrina-deploy/detect-and-deploy.js --detect

# 3. Probar copia local
node scripts/client-vitrina-deploy/detect-and-deploy.js --prepare-local
npx serve deploy-vitrina -p 8080

# 4. Generar workflows GitHub Actions
node scripts/client-vitrina-deploy/detect-and-deploy.js --init-workflow --force
node scripts/client-vitrina-deploy/detect-and-deploy.js --init-ci --force

# 5. GitHub → Settings → Pages → Source: GitHub Actions

# 6. Commit + push → verificar URL raíz (debe ser index.html, NO README)
```

---

## Qué editar en cada proyecto

Solo el bloque **`PROJECT_CONFIG`** al inicio de `detect-and-deploy.js`:

| Campo | Ejemplo Pañalera Grace | Otro proyecto |
|-------|------------------------|---------------|
| `vitrinaCandidates` | `['frontend-public', ...]` | `['public', 'dist']` |
| `excludeDirs` | `backend`, `frontend-admin` | `api`, `server` |
| `deployBranches` | `['main']` | `['main', 'master']` |
| `deployVerifyFiles` | `['js/main.js']` | archivos clave de tu vitrina |
| `ciSmokeFiles` | `config.js`, `js/...` | vacío = solo `index.html` |
| `ciDirs` | `['partials']` | carpetas obligatorias |

La **cabecera del script** incluye la guía completa (formato especificación del proyecto).

---

## Pañalera Grace (este repo)

- Vitrina: `frontend-public/`
- URL Pages: https://edwardroag.github.io/PA-ALERA_GRACE/
- Doc detallada: [docs/DEPLOY-VITRINA.md](../../docs/DEPLOY-VITRINA.md)

---

## Dos workflows en Actions (no confundir)

| Workflow | Qué hace | ¿Muestra URL / View deployment? |
|----------|----------|----------------------------------|
| **Deploy vitrina (Pages)** | Publica el sitio en GitHub Pages | ✅ Sí — en logs, Summary y botón **View deployment** |
| **CI vitrina** | Solo verifica que existan archivos clave | ❌ No publica (muestra URL esperada en Summary) |

Si corrés **CI vitrina** manualmente, es normal que no aparezca el enlace de deployment. Usá **Deploy vitrina (Pages)**.

---

## Requisitos

- Node.js 18+
- `package.json` local con `"type": "module"` (incluido en esta carpeta)
- No requiere `npm install`
