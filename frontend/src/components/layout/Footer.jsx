/**
 * Contrato: pie de página con enlaces WP y WhatsApp real.
 * Consumidores: App MainLayout.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { NAV_LINKS, SITE, WA_CHAT_URL } from '../../data/site';
import logo from '../../assets/sedes/villa-del-rio/logo.webp';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-white/80 pt-16 pb-8 mt-16">
      <div className="container-premium">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img src={logo} alt="" className="h-12 w-12 rounded-full object-cover" />
              <h3 className="font-heading text-xl font-bold text-white">{SITE.brand}</h3>
            </div>
            <p className="text-sm text-white/60 mb-4">
              Más de una década entregando experiencias gourmet. {SITE.tagline}.
            </p>
          </div>

          <div>
            <h4 className="font-heading text-white font-semibold mb-3">Contacto</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <a
                  href={WA_CHAT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-terracotta transition-smooth"
                >
                  WhatsApp: {SITE.phoneDisplay}
                </a>
              </li>
              <li>📍 {SITE.city}</li>
              <li>✉️ {SITE.email}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-white font-semibold mb-3">Enlaces</h4>
            <ul className="space-y-2 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-white/60 hover:text-terracotta transition-smooth"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 text-center text-xs text-white/40">
          <p>© {currentYear} {SITE.fullName}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
