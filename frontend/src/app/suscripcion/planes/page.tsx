'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Plan } from '@/types';

const FEATURES: Record<string, string[]> = {
  'Basico':  ['Acceso a instalaciones', 'Clases grupales ilimitadas', 'Vestuarios compartidos'],
  'Pro':     ['Todo lo del plan Basico', 'Clases premium', 'Vestuarios privados', 'App de seguimiento'],
  'Premium': ['Todo lo del plan Pro', 'Clases privadas (2/mes)', 'Nutricionista incluido', 'Acceso 24h'],
};

const PLAN_COLORS: Record<string, string> = {
  'Basico': '#4a90e2', 'Pro': '#d4a017', 'Premium': '#c41e1e',
};

export default function PlanesPage() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Plan[]>('/planes').then(setPlanes).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-14">
      <div className="page-container max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-xs text-[#c41e1e] uppercase tracking-widest font-semibold mb-2">Suscripciones</p>
          <h1 className="font-display text-5xl lg:text-7xl text-white uppercase tracking-wide leading-none mb-4">
            Elige tu <span className="text-[#d4a017]">plan</span>
          </h1>
          <p className="text-sm text-[#888888] max-w-xl mx-auto leading-relaxed">
            Suscríbete al gimnasio que elijas con el plan que mejor se adapte a ti.
            Sin permanencia. Sin letras pequeñas.
          </p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse border border-[#2a2a2a] p-8 space-y-4">
                <div className="h-4 bg-[#1a1a1a] w-20" />
                <div className="h-12 bg-[#1a1a1a] w-32" />
                <div className="space-y-2">
                  {[1,2,3].map(j => <div key={j} className="h-3 bg-[#1a1a1a]" />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-6">
            {planes.map((plan, idx) => {
              const color = PLAN_COLORS[plan.nombre] ?? '#888888';
              const features = FEATURES[plan.nombre] ?? [];
              const isPro = idx === 1;
              return (
                <div key={plan.id}
                  className={`relative border p-8 flex flex-col transition-all hover:-translate-y-1 duration-300 ${
                    isPro ? 'border-[#d4a017]' : 'border-[#2a2a2a] hover:border-[#2a2a2a]/80'
                  }`}
                  style={{ backgroundColor: isPro ? '#0d0d0d' : '#080808' }}>
                  {isPro && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#d4a017] text-black text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                      Más popular
                    </div>
                  )}
                  <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color }}>
                      {plan.nombre}
                    </p>
                    <div className="flex items-end gap-1 mb-2">
                      <span className="font-display text-5xl text-white">{Number(plan.precio).toFixed(0)}</span>
                      <span className="text-[#888888] text-sm mb-1">€/mes</span>
                    </div>
                    {plan.descripcion && (
                      <p className="text-xs text-[#666666] leading-relaxed">{plan.descripcion}</p>
                    )}
                  </div>
                  <ul className="space-y-2.5 flex-1 mb-8">
                    {features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-xs text-[#888888]">
                        <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/gimnasios"
                    className="block text-center text-xs font-bold uppercase tracking-widest py-3 px-4 transition-colors"
                    style={{ background: color, color: '#000' }}>
                    Buscar gimnasio →
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-xs text-[#444444] mt-8 uppercase tracking-widest">
          Cada suscripción es por gimnasio. Puedes suscribirte a varios a la vez.
        </p>
      </div>
    </div>
  );
}
