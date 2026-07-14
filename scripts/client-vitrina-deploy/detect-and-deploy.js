#!/usr/bin/env node
/**
 * ======================================================
 * ARCHIVO: detect-and-deploy.js
 * UBICACIÓN: scripts/client-vitrina-deploy/
 * VERSIÓN: 2.1 — DEPLOY + CI + URL EN ACTIONS
 * ÚLTIMA ACTUALIZACIÓN: 2026-06-28 22:00
 *
 * 🎯 PROPÓSITO:
 * Script portable para publicar SOLO la vitrina (frontend estático) en
 * GitHub Pages, sin subir backend, admin ni lógica privada al remoto.
 * Detecta la carpeta del sitio, genera el workflow de Actions y permite
 * probar la copia local antes del push.
 *
 * ======================================================
 * 📋 CÓMO USAR EN CADA PROYECTO NUEVO (copiar y pegar)
 * ------------------------------------------------------
 *
 * 1) COPIAR esta carpeta al repo del cliente:
 *      scripts/client-vitrina-deploy/
 *    Incluye: detect-and-deploy.js, package.json (type: module)
 *
 * 2) EDITAR solo el bloque PROJECT_CONFIG (más abajo en este archivo):
 *      - vitrinaCandidates → orden de carpetas donde está index.html
 *      - excludeDirs / excludeFiles → qué NO va a Pages ni a prepare-local
 *      - deployVerifyFiles / ciSmokeFiles → checks en workflows (opcional)
 *
 * 3) DESDE LA RAÍZ del proyecto cliente, ejecutar en orden:
 *
 *      node scripts/client-vitrina-deploy/detect-and-deploy.js --detect
 *      node scripts/client-vitrina-deploy/detect-and-deploy.js --prepare-local
 *      node scripts/client-vitrina-deploy/detect-and-deploy.js --init-workflow --force
 *      node scripts/client-vitrina-deploy/detect-and-deploy.js --init-ci --force
 *
 * 4) GIT — asegurar que la vitrina SÍ está en el repo y el backend NO:
 *      - Subir: carpeta vitrina, scripts/client-vitrina-deploy/, .github/workflows/
 *      - Ignorar: backend/, admin/, .env, node_modules/ (ver docs/DEPLOY-VITRINA.md)
 *
 * 5) GITHUB (una vez por repo):
 *      Settings → Pages → Build and deployment → Source: GitHub Actions
 *
 * 6) PUSH a main → Actions ejecuta "Deploy vitrina (Pages)"
 *    La URL raíz debe mostrar index.html de la vitrina, NO el README del repo.
 *
 * 7) DOS WORKFLOWS (no confundir en Actions):
 *      - Deploy vitrina (Pages) → publica; muestra URL y "View deployment"
 *      - CI vitrina → solo verifica archivos; NO publica
 *
 * ======================================================
 * 📋 COMANDOS
 * ------------------------------------------------------
 *
 *   --detect           Muestra stack detectado y carpeta a publicar
 *   --prepare-local    Copia vitrina filtrada a ./deploy-vitrina (prueba local)
 *   --init-workflow    Crea .github/workflows/deploy-vitrina.yml
 *   --init-ci          Crea .github/workflows/ci.yml (smoke test, no publica)
 *   --force            Sobrescribe workflow existente
 *   --root=RUTA        Raíz del proyecto (default: directorio actual)
 *   --out=CARPETA      Salida de --prepare-local (default: deploy-vitrina)
 *
 * ======================================================
 * 📋 REQUISITOS
 * ------------------------------------------------------
 * - Node.js 18+ (ES modules)
 * - Repo con index.html dentro de la carpeta vitrina detectada
 * - GitHub Pages configurado con Source: GitHub Actions
 *
 * ======================================================
 * 📋 REGLAS PARA PRODUCCIÓN:
 * ------------------------------------------------------
 * - Console.log marcados con // @strip se eliminan al generar build para cliente
 * - Esta cabecera se elimina al generar versión para cliente (documentación interna)
 *
 * ======================================================
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * [2.1] - 2026-06-28 22:00
 *    ✅ Workflow deploy alineado con verificación extendida + URL en logs/Summary
 *    ✅ --init-ci genera smoke test (no publica; explica Deploy vs CI)
 *    ✅ Deploy en cada push a main (sin filtro paths)
 *    ✅ PROJECT_CONFIG: deployVerifyFiles, ciSmokeFiles, ciDirs
 *
 * [2.0] - 2026-06-28 20:00
 *    ✅ Cabecera portable + PROJECT_CONFIG editable por proyecto
 *    ✅ Workflow publica vitrina en RAÍZ de Pages (path directo, sin README)
 *    ✅ Verificación de index.html en workflow generado
 *
 * [1.0] - 2026-06-28 18:00
 *    ✅ Detección multi-stack + prepare-local + init-workflow
 * ======================================================
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ======================================================
// ⚙️ PROJECT_CONFIG — EDITAR AL COPIAR A OTRO PROYECTO
// ======================================================
const PROJECT_CONFIG = {
  /** Nombre del workflow en .github/workflows/ */
  workflowName: 'deploy-vitrina.yml',

  /** Carpetas candidatas (en orden) donde buscar index.html de la vitrina */
  vitrinaCandidates: [
    'frontend-public',
    'frontend/public',
    'frontend/dist',
    'public',
    'dist',
    'www',
    'static'
  ],

  /** Carpetas que NUNCA se copian en prepare-local ni deben ir a Pages */
  excludeDirs: [
    'backend',
    'frontend-admin',
    'server',
    'api',
    'node_modules',
    '.git',
    '.github',
    '.env',
    'venv',
    '.venv',
    '__pycache__',
    'android',
    'ios',
    'associates',
    'docs',
    'tests',
    'test',
    '__tests__',
    'coverage',
    '.cursor',
    'scripts',
    'deploy-vitrina'
  ],

  /** Archivos que nunca se copian en prepare-local */
  excludeFiles: [
    '.env',
    '.env.local',
    '.env.production',
    'docker-compose.yml',
    'Dockerfile',
    'package-lock.json',
    'server-frontend.js'
  ],

  /** Rama(s) que disparan el deploy en GitHub Actions */
  deployBranches: ['main', 'master'],

  /** Nombre del workflow CI en .github/workflows/ */
  ciWorkflowName: 'ci.yml',

  /** Archivos obligatorios en deploy (relativos a la carpeta vitrina) */
  deployVerifyFiles: ['js/main.js'],

  /** Archivos opcionales en deploy (solo aviso si faltan) */
  deployVerifyOptional: ['.nojekyll'],

  /** Archivos para CI smoke test (relativos a vitrina). Vacío = solo index.html */
  ciSmokeFiles: [
    'config.js',
    'js/loader.js',
    'js/main.js',
    'js/social-links.js',
    'data/productos-preview.json',
    'data/social-links.json'
  ],

  /** Carpetas que deben existir en CI (relativas a vitrina) */
  ciDirs: ['partials'],

  /** Verificar que este script sigue en el repo (CI) */
  ciCheckDeployScript: true,

  /** Carpeta local de prueba (--prepare-local) */
  defaultOutDir: 'deploy-vitrina'
}

// ======================================================
// Constantes derivadas (no editar salvo ruta del script)
// ======================================================
const SCRIPT_REL = 'scripts/client-vitrina-deploy/detect-and-deploy.js'
const WORKFLOW_REL = `.github/workflows/${PROJECT_CONFIG.workflowName}`
const CI_WORKFLOW_REL = `.github/workflows/${PROJECT_CONFIG.ciWorkflowName}`
const EXCLUDE_DIR_NAMES = new Set(PROJECT_CONFIG.excludeDirs)
const EXCLUDE_FILE_NAMES = new Set(PROJECT_CONFIG.excludeFiles)

function parseArgs(argv) {
  return {
    detect: argv.includes('--detect'),
    initWorkflow: argv.includes('--init-workflow'),
    initCi: argv.includes('--init-ci'),
    prepareLocal: argv.includes('--prepare-local'),
    force: argv.includes('--force'),
    root: path.resolve(
      argv.find((a) => a.startsWith('--root='))?.split('=').slice(1).join('=') ||
        process.cwd()
    ),
    outDir: path.resolve(
      argv.find((a) => a.startsWith('--out='))?.split('=').slice(1).join('=') ||
        PROJECT_CONFIG.defaultOutDir
    )
  }
}

function exists(p) {
  try {
    fs.accessSync(p)
    return true
  } catch {
    return false
  }
}

function detectVanillaSource(root) {
  for (const rel of PROJECT_CONFIG.vitrinaCandidates) {
    const dir = path.join(root, rel)
    if (exists(path.join(dir, 'index.html'))) {
      return { sourceDir: rel, buildCmd: null, needsNpm: false }
    }
  }
  if (exists(path.join(root, 'index.html'))) {
    return { sourceDir: '.', buildCmd: null, needsNpm: false }
  }
  return null
}

function detectStack(root) {
  const notes = []
  const vanilla = detectVanillaSource(root)

  if (!vanilla) {
    const fallback = PROJECT_CONFIG.vitrinaCandidates[0] || 'frontend-public'
    return {
      id: 'unknown',
      label: 'No detectado',
      publishDir: fallback,
      notes: [
        `No se encontró index.html. Creá ${fallback}/index.html o ajustá vitrinaCandidates en PROJECT_CONFIG.`
      ]
    }
  }

  if (exists(path.join(root, 'backend'))) {
    notes.push('backend/ no se publica en Pages (mantener en .gitignore).')
  }
  if (exists(path.join(root, 'frontend-admin'))) {
    notes.push('frontend-admin/ no se publica en Pages (mantener en .gitignore).')
  }
  notes.push(`GitHub Pages servirá ${vanilla.sourceDir}/index.html en la URL raíz del sitio.`)

  const hasBackend = exists(path.join(root, 'backend')) || exists(path.join(root, 'server'))
  return {
    id: hasBackend ? 'monorepo-vanilla' : 'vanilla',
    label: hasBackend ? 'Monorepo HTML + backend local' : 'HTML/CSS/JS vanilla',
    publishDir: vanilla.sourceDir,
    notes
  }
}

function shouldSkipEntry(name, isDir) {
  if (EXCLUDE_FILE_NAMES.has(name)) return true
  if (isDir && EXCLUDE_DIR_NAMES.has(name)) return true
  if (name.startsWith('.') && name !== '.well-known' && name !== '.nojekyll') return true
  return false
}

function copyDirFiltered(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    if (shouldSkipEntry(ent.name, ent.isDirectory())) continue
    const from = path.join(src, ent.name)
    const to = path.join(dest, ent.name)
    if (ent.isDirectory()) copyDirFiltered(from, to)
    else fs.copyFileSync(from, to)
  }
}

function prepareLocal(root, profile, outDir) {
  const src = path.join(root, profile.publishDir)
  if (!exists(src)) {
    console.error(`❌ No existe carpeta fuente: ${profile.publishDir}`)
    process.exit(1)
  }
  if (!exists(path.join(src, 'index.html'))) {
    console.error(`❌ Falta ${profile.publishDir}/index.html`)
    process.exit(1)
  }
  if (exists(outDir)) fs.rmSync(outDir, { recursive: true, force: true })
  copyDirFiltered(src, outDir)
  console.log(`✅ Vitrina preparada en: ${outDir}`)
  console.log(`   Origen: ${profile.publishDir}`)
  console.log(`   Abrí: file://${path.join(outDir, 'index.html')} (o npx serve ${outDir})`)
}

function buildDeployVerifyRun(publishDir) {
  const lines = [
    `test -f ${publishDir}/index.html || (echo "❌ Falta ${publishDir}/index.html" && exit 1)`
  ]
  for (const rel of PROJECT_CONFIG.deployVerifyFiles || []) {
    lines.push(
      `test -f ${publishDir}/${rel} || (echo "❌ Falta ${publishDir}/${rel}" && exit 1)`
    )
  }
  for (const rel of PROJECT_CONFIG.deployVerifyOptional || []) {
    lines.push(
      `test -f ${publishDir}/${rel} || echo "⚠️ Recomendado: ${publishDir}/${rel}"`
    )
  }
  lines.push(
    `echo "✅ Vitrina OK — se publicará en la raíz de Pages (no README del repo)"`,
    `ls -la ${publishDir}/ | head -20`
  )
  return lines.join('\n          ')
}

function buildCiVerifyRun(publishDir) {
  const lines = [`test -f ${publishDir}/index.html`]
  for (const rel of PROJECT_CONFIG.ciSmokeFiles || []) {
    lines.push(`test -f ${publishDir}/${rel}`)
  }
  for (const rel of PROJECT_CONFIG.ciDirs || []) {
    lines.push(`test -d ${publishDir}/${rel}`)
  }
  if (PROJECT_CONFIG.ciCheckDeployScript) {
    lines.push(`test -f ${SCRIPT_REL}`)
  }
  lines.push('echo "OK: vitrina lista para Pages"')
  return lines.join('\n          ')
}

function buildWorkflowYaml(profile) {
  const publishDir = profile.publishDir
  const branches = PROJECT_CONFIG.deployBranches.join(', ')
  const verifyRun = buildDeployVerifyRun(publishDir)

  return `# Generado por ${SCRIPT_REL} — regenerar con --init-workflow --force
# Publica ${publishDir}/ en la RAÍZ de GitHub Pages (index.html en /).
# Requisito: Settings → Pages → Source: GitHub Actions
# URL y "View deployment" aparecen en este workflow (NO en CI vitrina).

name: Deploy vitrina (Pages)

on:
  push:
    branches: [${branches}]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages-vitrina
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Verificar vitrina (index.html en raíz del artefacto)
        run: |
          ${verifyRun}

      - name: Configurar GitHub Pages
        uses: actions/configure-pages@v5

      - name: Subir artefacto (contenido de ${publishDir} → raíz del sitio)
        uses: actions/upload-pages-artifact@v3
        with:
          path: ${publishDir}

      - name: Publicar en GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

      - name: URL del sitio publicado
        run: |
          URL="\${{ steps.deployment.outputs.page_url }}"
          echo "=============================================="
          echo "URL publicada: $URL"
          echo "=============================================="
          echo "## ✅ Sitio publicado en GitHub Pages" >> "$GITHUB_STEP_SUMMARY"
          echo "" >> "$GITHUB_STEP_SUMMARY"
          echo "### [$URL]($URL)" >> "$GITHUB_STEP_SUMMARY"
          echo "" >> "$GITHUB_STEP_SUMMARY"
          echo "Debe cargar la **vitrina** (menú, catálogo), no el README del repositorio." >> "$GITHUB_STEP_SUMMARY"
          echo "" >> "$GITHUB_STEP_SUMMARY"
          echo "En la lista de Actions, este run muestra **View deployment** junto al job." >> "$GITHUB_STEP_SUMMARY"
`
}

function buildCiWorkflowYaml(profile) {
  const publishDir = profile.publishDir
  const branches = PROJECT_CONFIG.deployBranches.join(', ')
  const verifyRun = buildCiVerifyRun(publishDir)

  return `# Generado por ${SCRIPT_REL} — regenerar con --init-ci --force
# ⚠️ Este workflow NO publica en Pages — no muestra "View deployment".
# Para publicar y ver la URL: ejecutar "Deploy vitrina (Pages)".

name: CI vitrina

on:
  push:
    branches: [${branches}]
  pull_request:
    branches: [${branches}]
  workflow_dispatch:

jobs:
  frontend-public-smoke:
    name: Frontend público — archivos clave
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Verificar estructura mínima
        run: |
          ${verifyRun}

      - name: Resumen (solo verificación — no despliega)
        run: |
          SITE="https://\${{ github.repository_owner }}.github.io/\${{ github.event.repository.name }}/"
          echo "=============================================="
          echo "CI OK — este workflow NO publica en Pages"
          echo "URL del sitio (cuando Deploy vitrina termina bien): $SITE"
          echo "Ejecutá: Actions → Deploy vitrina (Pages) → Run workflow"
          echo "=============================================="
          echo "## CI vitrina — verificación OK" >> "$GITHUB_STEP_SUMMARY"
          echo "" >> "$GITHUB_STEP_SUMMARY"
          echo "Este workflow **no publica** en GitHub Pages. Solo comprueba que existan los archivos." >> "$GITHUB_STEP_SUMMARY"
          echo "" >> "$GITHUB_STEP_SUMMARY"
          echo "**URL esperada del sitio:** [$SITE]($SITE)" >> "$GITHUB_STEP_SUMMARY"
          echo "" >> "$GITHUB_STEP_SUMMARY"
          echo "Para publicar y ver el enlace **View deployment**, ejecutá el workflow **Deploy vitrina (Pages)**." >> "$GITHUB_STEP_SUMMARY"
`
}

function initWorkflow(root, profile, force) {
  const workflowPath = path.join(root, WORKFLOW_REL)
  if (exists(workflowPath) && !force) {
    console.error(`❌ Ya existe ${WORKFLOW_REL}. Usa --force para sobrescribir.`)
    process.exit(1)
  }
  fs.mkdirSync(path.dirname(workflowPath), { recursive: true })
  fs.writeFileSync(workflowPath, buildWorkflowYaml(profile), 'utf8')
  console.log(`✅ Workflow escrito: ${WORKFLOW_REL}`)
  console.log(`   Publica en Pages: ${profile.publishDir}/ → raíz del sitio`)
  console.log(`   URL visible en Actions tras deploy exitoso (View deployment)`)
}

function initCiWorkflow(root, profile, force) {
  const workflowPath = path.join(root, CI_WORKFLOW_REL)
  if (exists(workflowPath) && !force) {
    console.error(`❌ Ya existe ${CI_WORKFLOW_REL}. Usa --force para sobrescribir.`)
    process.exit(1)
  }
  fs.mkdirSync(path.dirname(workflowPath), { recursive: true })
  fs.writeFileSync(workflowPath, buildCiWorkflowYaml(profile), 'utf8')
  console.log(`✅ Workflow escrito: ${CI_WORKFLOW_REL}`)
  console.log(`   Solo verifica archivos — NO publica ni muestra View deployment`)
}

function printDetect(root, profile) {
  console.log('')
  console.log('🔍 Detección de vitrina —', root)
  console.log('─'.repeat(60))
  console.log('Stack:       ', profile.label, `(${profile.id})`)
  console.log('Publicar:    ', profile.publishDir, '→ raíz de GitHub Pages')
  console.log('Workflow:    ', WORKFLOW_REL, '(publica + URL)')
  console.log('CI:          ', CI_WORKFLOW_REL, '(solo verifica)')
  if (profile.notes?.length) {
    console.log('')
    console.log('Notas:')
    profile.notes.forEach((n) => console.log('  •', n))
  }
  console.log('')
  console.log('Pages URL (tras deploy): https://<usuario>.github.io/<repo>/')
  console.log('')
  console.log('Siguiente:')
  console.log(`  node ${SCRIPT_REL} --prepare-local`)
  console.log(`  node ${SCRIPT_REL} --init-workflow --force`)
  console.log(`  node ${SCRIPT_REL} --init-ci --force`)
  console.log('')
}

function printHelp() {
  console.log(`
Uso: node ${SCRIPT_REL} [opciones]

  --detect           Muestra carpeta vitrina detectada
  --prepare-local    Copia vitrina filtrada a ./${PROJECT_CONFIG.defaultOutDir}
  --init-workflow    Genera ${WORKFLOW_REL} (publica Pages + URL)
  --init-ci          Genera ${CI_WORKFLOW_REL} (smoke test, no publica)
  --force            Sobrescribe workflow existente
  --root=RUTA        Raíz del proyecto
  --out=CARPETA      Salida local (default: ${PROJECT_CONFIG.defaultOutDir})

Guía completa en la cabecera de este archivo y en docs/DEPLOY-VITRINA.md
`)
}

function main() {
  const args = parseArgs(process.argv.slice(2))

  if (!args.detect && !args.initWorkflow && !args.prepareLocal && !args.initCi) {
    printHelp()
    process.exit(0)
  }

  const profile = detectStack(args.root)
  if (args.detect) printDetect(args.root, profile)
  if (args.prepareLocal) prepareLocal(args.root, profile, args.outDir)
  if (args.initWorkflow) initWorkflow(args.root, profile, args.force)
  if (args.initCi) initCiWorkflow(args.root, profile, args.force)
}

main()
