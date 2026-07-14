/**
 * Contrato: datos de marca/contacto Traviatta para UI pública.
 * Consumidores: Navbar, Footer, HomePage, ContactPage, HistoriaPage, MenuPresencePage, Checkout, useMenu.
 *
 * MVP actual: solo sede Villa del Río (HU-012 Mandalay aplazada).
 */
export const SITE = {
  brand: 'Traviatta',
  tagline: 'Pizza Gourmet',
  fullName: 'Traviatta Pizza Gourmet',
  sedeId: 'villa-del-rio',
  sedeName: 'Villa del Río',
  whatsapp: '3193856893',
  whatsappE164: '573193856893',
  phoneDisplay: '319 3856893',
  email: 'info@traviatta.com',
  city: 'Bogotá, Colombia',
};

/** Slug de carta digital / API / fallback staticMenus */
export const DEFAULT_MENU_SLUG = 'traviatta';

export const WA_CHAT_URL = `https://wa.me/${SITE.whatsappE164}`;

export const waUrl = (text) => {
  if (!text) return WA_CHAT_URL;
  return `${WA_CHAT_URL}?text=${encodeURIComponent(text)}`;
};

export const NAV_LINKS = [
  { name: 'Inicio', path: '/' },
  { name: 'Menú', path: '/menu' },
  { name: 'Nuestra historia', path: '/nuestra-historia' },
  { name: 'Contacto', path: '/contacto' },
];

export const CARTA_PATH = `/${DEFAULT_MENU_SLUG}/menu`;

/** true = carta desde staticMenus (sin llamar API). Ideal sin backend local. */
export const USE_STATIC_MENU =
  import.meta.env.VITE_USE_STATIC_MENU === 'true' ||
  import.meta.env.VITE_USE_STATIC_MENU === '1' ||
  import.meta.env.VITE_USE_STATIC_MENU === undefined;
