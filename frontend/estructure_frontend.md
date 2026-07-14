# Frontend Structure

This document describes the current `frontend` folder structure, including files, folders, and their purpose.

## Root

- `.env`
- `.env.example`
- `agente.md`
- `Dockerfile`
- `index.html`
- `nginx.conf`
- `node_modules/`
- `package-lock.json`
- `package.json`
- `postcss.config.js`
- `public/`
- `src/`
- `tailwind.config.js`
- `vite.config.js`

## `public/`

- (empty folder currently)

## `src/`

- `App.jsx`
- `main.jsx`
- `assets/`
- `components/`
- `data/`
- `hooks/`
- `pages/`
- `services/`
- `styles/`

### `src/components/`

- `CartFloating.jsx` - floating cart widget.
- `CartSidebar.jsx` - sidebar cart details and actions.
- `CategoryTabs.jsx` - tabbed menu category navigation.
- `Container.jsx` - layout wrapper component.
- `Header.jsx` - top site header.
- `layouts/` - layout-specific components.
- `OrderForm.jsx` - order checkout form.
- `ProductCard.jsx` - product display card for menu items.
- `ui/` - UI components and shared interface elements.

### `src/data/`

- `staticMenus.js` - static fallback menu data.

### `src/hooks/`

- `useCart.js` - cart state and actions hook.
- `useMenu.js` - menu fetching and caching hook.
- `useOrder.js` - order submission hook.
- `useScrollAnimation.js` - scroll animation hook.

### `src/pages/`

- `CartPage.jsx` - cart view page.
- `CheckoutPage.jsx` - checkout page.
- `HomePage.jsx` - landing / home page.
- `MenuPage.jsx` - menu page for branch menu display.
- `TableMenuPage.jsx` - table-specific menu page.

### `src/services/`

- `api.js` - HTTP API client helper.
- `whatsapp.js` - WhatsApp messaging helper.

### `src/styles/`

- (styles and global CSS assets)
