'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { Gimnasio, Plan } from '@/types';

type Step = 'plan' | 'confirm';

const PLAN_COLORS: Record<string, string> = {
  'Basico': '#4a90e2', 'Pro': '#d4a017', 'Premium': '#c41e1e',
};

export default function NuevaSuscripcionPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [gym, setGym]       = useState<Gimnasio | null>(null);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [planSel, setPlanSel] = useState<Plan | null>(null);
  const [step, setStep]     = useState<Step>('plan');
  const [loading, setLoading] = useState(false);
  const [init, setInit]     = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    Promise.all([
      api.get<Gimnasio>(`/gimnasios/${params.slug}`),
      api.get<Plan[]>('/planes'),
    ]).then(([g, p]) => { setGym(g); setPlanes(p); })
     .catch(() => router.push('/gimnasios'))
     .finally(() => setInit(false));
  }, [params.slug, router]);

  async function confirmar() {
    if (!gym || !planSel) return;
    const token = localStorage.getItem('token') ?? '';
    setLoading(true);
    try {
      await api.post('/suscripciones', { gimnasio_id: gym.id, plan_id: planSel.id }, token);
      router.push('/suscripcion/exito');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al suscribirse');
      setLoading(false);
    }
  }

  if (init) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-xs text-[#888888] uppercase tracking-widest">Cargando...</p>
    </div>
  );

  return (
    <div className="py-14">
      <div className="page-container max-w-3xl">

        {/* Breadcrumb / steps */}
        <div className="flex items-center gap-3 mb-10">
          <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-widest ${step === 'plan' ? 'text-[#d4a017]' : 'text-[#52b788]'}`}>
            <span className="w-5 h-5 flex items-center justify-center border text-[10px]"
              style={{ borderColor: step === 'plan' ? '#d4a017' : '#52b788' }}>1</span>
            Elige plan
          </div>
          <div className="flex-1 h-px bg-[#2a2a2a]" />
          <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-widest ${step === 'confirm' ? 'text-[#d4a017]' : 'text-[#555555]'}`}>
            <span className="w-5 h-5 flex items-center justify-center border text-[10px]"
              style={{ borderColor: step === 'confirm' ? '#d4a017' : '#555555' }}>2</span>
            Confirmar
          </div>
        </div>

        {/* Gym info */}
        {gym && (
          <div className="flex items-center gap-4 p-4 border border-[#2a2a2a] mb-8">
            {gym.imagen_url ? (
              <img src={gym.imagen_url} alt={gym.nombre} className="w-16 h-16 object-cover shrink-0" />
            ) : (
              <div className="w-16 h-16 bg-[#1a1a1a] shrink-0" />
            )}
            <div>
              <p className="text-xs text-[#888888] uppercase tracking-widest mb-0.5">Suscribiéndote a</p>
              <p className="font-display text-2xl text-white uppercase tracking-wide">{gym.nombre}</p>
              {gym.ciudad && <p className="text-xs text-[#888888] mt-0.5">{gym.ciudad}{gym.provincia ? `, ${gym.provincia}` : ''}</p>}
            </div>
          </div>
        )}

        {/* Step 1: Plan selection */}
        {step === 'plan' && (
          <div className="space-y-4">
            <h2 className="font-display text-3xl text-white uppercase tracking-wide mb-6">Selecciona un plan</h2>
            {planes.map(plan => {
              const color = PLAN_COLORS[plan.nombre] ?? '#888888';
              const selected = planSel?.id === plan.id;
              return (
                <button key={plan.id} onClick={() => setPlanSel(plan)}
                  className="w-full text-left p-5 border transition-all"
                  style={{
                    borderColor: selected ? color : '#2a2a2a',
                    backgroundColor: selected ? `${color}08` : '#0d0d0d',
                  }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-xl uppercase tracking-wide" style={{ color }}>
                        {plan.nombre}
                      </p>
                      {plan.descripcion && (
                        <p className="text-xs text-[#666666] mt-1 max-w-md">{plan.descripcion}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="font-display text-3xl text-white">{Number(plan.precio).toFixed(2)}€</p>
                      <p className="text-xs text-[#555555]">al mes</p>
                    </div>
                  </div>
                  {selected && (
                    <div className="mt-3 flex items-center gap-2 text-xs" style={{ color }}>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Seleccionado
                    </div>
                  )}
                </button>
              );
            })}
            <div className="pt-4 flex gap-3">
              <button
                disabled={!planSel}
                onClick={() => setStep('confirm')}
                className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed">
                Continuar →
              </button>
              <Link href={`/gimnasios/${params.slug}`} className="btn-secondary">Cancelar</Link>
            </div>
          </div>
        )}

        {/* Step 2: Confirm */}
        {step === 'confirm' && planSel && gym && (
          <div className="space-y-6">
            <h2 className="font-display text-3xl text-white uppercase tracking-wide">Confirma tu suscripción</h2>
            <div className="card space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#888888]">Gimnasio</span>
                <span className="text-sm font-semibold text-[#f0f0f0]">{gym.nombre}</span>
              </div>
              <div className="h-px bg-[#2a2a2a]" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#888888]">Plan</span>
                <span className="text-sm font-semibold" style={{ color: PLAN_COLORS[planSel.nombre] ?? '#888' }}>
                  {planSel.nombre}
                </span>
              </div>
              <div className="h-px bg-[#2a2a2a]" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#888888]">Importe mensual</span>
                <span className="font-display text-2xl text-[#d4a017]">{Number(planSel.precio).toFixed(2)}€</span>
              </div>
              <div className="h-px bg-[#2a2a2a]" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#888888]">Próxima renovación</span>
                <span className="text-sm text-[#f0f0f0]">
                  {(() => { const d = new Date(); d.setMonth(d.getMonth()+1); return d.toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' }); })()}
                </span>
              </div>
            </div>
            <p className="text-xs text-[#555555] leading-relaxed">
              Al confirmar, aceptas que se registre una suscripción mensual. Puedes cancelarla desde tu perfil en cualquier momento.
            </p>
            <div className="flex gap-3">
              <button onClick={confirmar} disabled={loading} className="btn-primary flex-1">
                {loading ? 'Procesando...' : 'Confirmar suscripción →'}
              </button>
              <button onClick={() => setStep('plan')} className="btn-secondary">Atrás</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
