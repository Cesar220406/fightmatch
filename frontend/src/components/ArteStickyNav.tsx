'use client';

import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'intro',        label: 'Intro' },
  { id: 'video',        label: 'Vídeo' },
  { id: 'musculos',     label: 'Músculos' },
  { id: 'estadisticas', label: 'Stats' },
  { id: 'faq',          label: 'FAQ' },
  { id: 'gimnasios',    label: 'Gimnasios' },
];

/**
 * Barra de anclas de navegación interna, solo visible en desktop (≥1024px).
 * Se hace sticky debajo del nav principal (top: 64px).
 * Resalta la sección activa usando IntersectionObserver.
 */
export default function ArteStickyNav() {
  const [active, setActive] = useState<string>('intro');

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  return (
    // Solo visible en desktop — hidden en móvil/tablet
    <div className="hidden lg:block sticky top-[64px] z-30 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-[#1a1a1a]">
      <div className="page-container">
        <nav className="flex items-center gap-1 py-2" aria-label="Secciones de la página">
          {SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={`px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest transition-all duration-150 ${
                active === id
                  ? 'text-[#d4a017] border-b-2 border-[#d4a017]'
                  : 'text-[#555555] hover:text-[#888888]'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
