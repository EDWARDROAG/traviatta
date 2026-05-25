# CONTEXTO
Eres un desarrollador frontend especializado en React, Tailwind CSS y diseño UI/UX.
Debes transformar el frontend del menú digital de un restaurante boutique llamado
"MENU QR PLUS" para que refleje una experiencia cálida, artesanal, premium y relajada.

# PROYECTO
- Nombre: MENU QR PLUS (Frontend Cliente)
- Ubicación: menu-qr-system/frontend/
- Framework: React + Vite + Tailwind CSS
- Estado actual: Funcional pero con diseño plano (default de Tailwind)

# IMÁGENES DISPONIBLES
En la carpeta `frontend/src/assets/` tienes:
- `/img/` - Fotografías del restaurante, productos, ambiente
- `/videos/` - Videos de fondo (opcional)

EXPLORA estas carpetas y USA las imágenes como referencia visual para:
1. Extraer colores predominantes (tonos cálidos, terracota, madera, beige)
2. Aplicar texturas y ambiente en el diseño

# REQUISITOS OBLIGATORIOS

## 1. PALETA DE COLORES (Usar estos códigos exactos)
```css
--cream-warm: #F5F1EA;      /* Fondo principal */
--sand-beige: #D8CBB8;      /* Acentos suaves */
--wood-walnut: #9B6B43;     /* Bordes, detalles */
--terracotta: #B56E4A;      /* Botones, hover */
--charcoal: #1F1F1F;        /* Textos, footer */
--stone-gray: #D9D6D2;      /* Bordes suaves */
PROHIBIDO:

Azules fríos

Gradientes tecnológicos

Colores saturados o neón

Sombras exageradas

2. TIPOGRAFÍA
css
/* Headings (títulos) */
font-family: 'Playfair Display', serif;

/* Body (textos generales) */
font-family: 'Inter', sans-serif;
Importar desde Google Fonts en index.html:

html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
3. ESTILO DE COMPONENTES
Botones
css
border-radius: 999px;        /* Completamente redondeados */
padding: 12px 28px;
background: var(--terracotta);
color: white;
transition: all 0.3s ease;
hover: {
  transform: translateY(-2px);
  opacity: 0.9;
}
Cards (productos)
css
background: white;
border-radius: 24px;
box-shadow: 0 8px 30px rgba(0,0,0,0.06);
padding: 20px;
transition: all 0.3s ease;
hover: {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.1);
}
Inputs (formulario checkout)
css
border: 1px solid var(--stone-gray);
border-radius: 16px;
padding: 14px 18px;
background: white;
focus: {
  border-color: var(--terracotta);
  outline: none;
  ring: 2px solid rgba(181,110,74,0.2);
}
Carrrito flotante
css
background: white;
border-radius: 32px 32px 0 0;
box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
padding: 20px;
4. ESTRUCTURA DEL HOMEPAGE (MenuPage)
Header
Logo del restaurante (centrado o izquierda)

Fondo: var(--cream-warm)

Sombra suave inferior

Espaciado amplio (padding: 24px)

Hero (opcional - si hay imagen de portada)
Imagen del local con overlay suave

Título elegante: "Una experiencia cálida y auténtica"

Botones: "Ver menú" (si está en otra sección)

Categorías
Tabs con bordes redondeados

Active: fondo var(--terracotta), texto blanco

Inactive: texto var(--charcoal), sin fondo

Separación entre categorías

Productos (Cards)
Grid responsive: 1 columna en móvil, 2 en tablet, 3 en desktop

Imagen del producto (redondeada, 16px)

Nombre: fuente serif, peso 600

Descripción: fuente sans, color gris suave, línea limitada a 2

Precio: fuente sans, peso 600, color var(--terracotta)

Botón "Agregar": estilo redondeado, pequeño, outline o sólido

Footer
Fondo: var(--charcoal)

Color texto: var(--cream-warm)

Espaciado: 48px

Enlaces: horarios, dirección, contacto

5. ANIMACIONES (MUY SUAVES)
css
transition: all 0.3s ease;
/* NO usar: animaciones agresivas, parallax exagerado, efectos neon */
6. ESPACIADO
Secciones: padding 48px en desktop, 24px en móvil

Mucho whitespace entre elementos

Layout aireado y respirable

7. ARCHIVOS A MODIFICAR (SOLO ESTOS)
frontend/src/index.css o frontend/src/styles/globals.css

Definir variables de color

Importar fuentes

Estilos base

frontend/src/App.jsx

Layout general

Fondo general

frontend/src/pages/MenuPage.jsx

Header

Categorías

Grid de productos

Footer

frontend/src/components/ProductCard.jsx

Tarjeta de producto con estilo premium

frontend/src/components/CartFloating.jsx

Carrito flotante rediseñado

frontend/src/components/CategoryTabs.jsx

Pestañas de categorías

frontend/index.html

Importar Google Fonts

8. IMÁGENES
Explora frontend/src/assets/img/ y:

Usa las imágenes del restaurante como fondo de secciones si es apropiado

Aplica border-radius suave a todas las imágenes

Si hay video, úsalo como hero background (opcional, con overlay)

9. LO QUE NO DEBES HACER
NO modificar la lógica de negocio (carrito, pedidos, API)

NO cambiar la estructura de rutas

NO eliminar funcionalidades existentes

NO agregar dependencias nuevas

NO usar colores fuera de la paleta definida

NO usar gradientes tecnológicos

NO usar sombras excesivas

10. ENTREGA ESPERADA
Envía UNO por UNO los siguientes archivos con el código completo:

frontend/src/index.css (o globals.css)

frontend/index.html

frontend/src/App.jsx

frontend/src/pages/MenuPage.jsx

frontend/src/components/ProductCard.jsx

frontend/src/components/CategoryTabs.jsx

frontend/src/components/CartFloating.jsx

Por cada archivo, incluye:

Cabecera con propósito y cambios realizados

Explicación breve de los estilos aplicados

11. REFERENCIA VISUAL
El estilo debe evocar:

Restaurante boutique italiano

Café gourmet premium

Diseño editorial cálido

Organic luxury

Keywords: Warm Minimalism, Mediterranean Modern, Earthy Editorial UI