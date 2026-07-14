/**
 * ======================================================
 * ARCHIVO: useScrollAnimation.js
 * UBICACIÓN: menu-qr-system/frontend/src/hooks/useScrollAnimation.js
 * FASE: UI/UX Premium
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2026-05-24
 * ======================================================
 * 🎯 PROPÓSITO:
 * Hook personalizado para detectar elementos al hacer scroll
 * y aplicar animaciones cuando entran en el viewport.
 *
 * 🎨 USO:
 * const ref = useScrollAnimation();
 * <div ref={ref} className="animate-fade-in-up">...</div>
 * ======================================================
 */

import { useEffect, useRef, useState } from 'react';

const useScrollAnimation = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    once = true,
  } = options;

  const elementRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              observer.unobserve(element);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, once]);

  return { ref: elementRef, isVisible, hasAnimated: hasAnimated || isVisible };
};

export default useScrollAnimation;