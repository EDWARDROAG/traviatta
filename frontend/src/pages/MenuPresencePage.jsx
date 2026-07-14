/**
 * Contrato: pestaña Menú — hero + grilla carta + lightbox a pantalla completa (HU-011).
 * Consumidores: App ruta `/menu`. Sede activa MVP: Villa del Río.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import { CARTA_PATH, SITE } from '../data/site';
import menuHero from '../assets/sedes/villa-del-rio/header_1.jpg';

const menuPages = import.meta.glob('../assets/menu/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
});

const MenuPresencePage = () => {
  const pages = useMemo(
    () =>
      Object.entries(menuPages)
        .sort(([a], [b]) => a.localeCompare(b, 'es'))
        .map(([, src]) => src),
    []
  );

  const [lightboxIndex, setLightboxIndex] = useState(null);
  const isOpen = lightboxIndex !== null && pages.length > 0;

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const showPrev = useCallback(() => {
    setLightboxIndex((i) => {
      if (i === null || pages.length === 0) return i;
      return (i - 1 + pages.length) % pages.length;
    });
  }, [pages.length]);

  const showNext = useCallback(() => {
    setLightboxIndex((i) => {
      if (i === null || pages.length === 0) return i;
      return (i + 1) % pages.length;
    });
  }, [pages.length]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, closeLightbox, showPrev, showNext]);

  return (
    <div className="min-h-screen bg-cream">
      <section className="relative min-h-[70vh] flex items-end overflow-hidden">
        <img
          src={menuHero}
          alt={`${SITE.fullName} menú — ${SITE.sedeName}`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/40 to-transparent" />
        <div className="relative container-premium py-16 text-white">
          <p className="text-sm uppercase tracking-widest text-white/70 mb-2">{SITE.sedeName}</p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3">Menú</h1>
          <p className="text-white/80 max-w-lg mb-8">
            Explora nuestra carta digital o las páginas del menú Traviatta 2026.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to={CARTA_PATH}>
              <Button variant="primary" size="lg">
                Abrir menú QR
              </Button>
            </Link>
            <a href="#paginas-menu">
              <Button
                variant="secondary"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-terracotta"
              >
                Ver páginas
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section id="paginas-menu" className="section-premium">
        <Container>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal mb-8 text-center">
            Carta Traviatta
          </h2>
          {pages.length === 0 ? (
            <div className="text-center">
              <p className="text-stone mb-6">Abre la carta digital para pedir por WhatsApp.</p>
              <Link to={CARTA_PATH}>
                <Button variant="primary">Ir a la carta</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pages.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  className="block overflow-hidden rounded-xl shadow-warm bg-white group text-left w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-terracotta"
                >
                  <img
                    src={src}
                    alt={`Página ${i + 1} del menú Traviatta`}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </button>
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Link to={CARTA_PATH}>
              <Button variant="primary" size="lg">
                Pedir en menú QR
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] bg-charcoal/95 flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Vista ampliada de la carta"
        >
          <div className="flex items-center justify-between px-4 py-3 text-white shrink-0">
            <p className="text-sm text-white/80">
              Página {lightboxIndex + 1} de {pages.length}
            </p>
            <button
              type="button"
              onClick={closeLightbox}
              className="rounded-full bg-white/10 hover:bg-white/20 px-4 py-2 text-sm font-medium transition"
              aria-label="Cerrar"
            >
              Cerrar ✕
            </button>
          </div>

          <div className="flex-1 relative flex items-center justify-center min-h-0 px-2 pb-4">
            <button
              type="button"
              onClick={showPrev}
              className="absolute left-1 sm:left-2 md:left-4 z-10 rounded-full bg-white/15 hover:bg-white/30 text-white w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center text-2xl"
              aria-label="Página anterior"
            >
              ‹
            </button>

            <img
              src={pages[lightboxIndex]}
              alt={`Carta Traviatta página ${lightboxIndex + 1}`}
              className="max-h-[calc(100dvh-5.5rem)] max-w-[min(96vw,1100px)] w-auto h-auto object-contain select-none"
            />

            <button
              type="button"
              onClick={showNext}
              className="absolute right-1 sm:right-2 md:right-4 z-10 rounded-full bg-white/15 hover:bg-white/30 text-white w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center text-2xl"
              aria-label="Página siguiente"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPresencePage;
