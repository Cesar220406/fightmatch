'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SuscripcionExitoPage() {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-14">
      <div className={`page-container max-w-lg text-center transition-all duration-700 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center"
          style={{ background: '#52b78820', border: '2px solid #52b788' }}>
          <svg className="h-8 w-8 text-[#52b788]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-xs text-[#52b788] uppercase tracking-widest font-semibold mb-3">¡Todo listo!</p>
        <h1 className="font-display text-5xl text-white uppercase tracking-wide leading-none mb-4">
          Suscripción <span className="text-[#d4a017]">activada</span>
        </h1>
        <p className="text-sm text-[#888888] leading-relaxed mb-8">
          Tu plan está activo desde ahora. Recibirás una notificación con los detalles.
          Ya puedes entrenar.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/perfil" className="btn-primary">Ver mis suscripciones →</Link>
          <Link href="/gimnasios" className="btn-secondary">Explorar más gimnasios</Link>
        </div>
      </div>
    </div>
  );
}
