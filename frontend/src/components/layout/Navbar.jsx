/**
 * Contrato: navegación principal Traviatta — usable en PC y celular.
 * Consumidores: App MainLayout.
 */
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS, SITE } from '../../data/site';
import logo from '../../assets/sedes/villa-del-rio/logo.webp';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const solidBar = isScrolled || isMobileMenuOpen || location.pathname !== '/';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 safe-pt ${
        solidBar
          ? 'bg-white/95 backdrop-blur-md shadow-warm py-3'
          : 'bg-transparent py-4 md:py-5'
      }`}
    >
      <div className="container-premium">
        <div className="flex items-center justify-between gap-3 min-h-[44px]">
          <Link to="/" className="flex items-center gap-2 group min-w-0">
            <img
              src={logo}
              alt={SITE.fullName}
              className="h-9 w-9 md:h-10 md:w-10 rounded-full object-cover ring-1 ring-charcoal/10 shrink-0"
            />
            <span className="font-heading text-lg md:text-2xl font-bold text-terracotta truncate">
              {SITE.brand}
            </span>
            <span className="hidden sm:inline text-sm text-stone group-hover:text-terracotta transition-colors shrink-0">
              {SITE.tagline}
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative font-medium text-sm lg:text-base transition-colors duration-200 whitespace-nowrap ${
                  isActive(link.path)
                    ? 'text-terracotta'
                    : 'text-charcoal hover:text-terracotta'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-terracotta rounded-full" />
                )}
              </Link>
            ))}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2.5 rounded-lg hover:bg-stone/20 transition-smooth min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMobileMenuOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 pb-2 space-y-1 animate-fade-in-up border-t border-stone/20 pt-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block py-3.5 px-2 rounded-lg font-medium transition-colors min-h-[44px] ${
                  isActive(link.path)
                    ? 'text-terracotta bg-terracotta/5'
                    : 'text-charcoal hover:bg-stone/10'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
