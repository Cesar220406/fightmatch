'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Lesion, ArteMarcial } from '@/types';

type Step = 1 | 2 | 3;

const STEPS = [
  { n: 1 as Step, label: 'Lesiones' },
  { n: 2 as Step, label: 'Deportes' },
  { n: 3 as Step, label: 'Listo' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep]               = useState<Step>(1);
  const [lesionesAll, setLesionesAll] = useState<Lesion[]>([]);
  const [artesAll, setArtesAll]       = useState<ArteMarcial[]>([]);
  const [lesionSel, setLesionSel]     = useState<number[]>([]);
  const [arteSel, setArteSel]         = useState<number[]>([]);
  const [saving, setSaving]           = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.replace('/auth/login'); return; }
    Promise.all([
      api.get<Lesion[]>('/lesiones').catch(() => [] as Lesion[]),
      api.get<ArteMarcial[]>('/artes-marciales').catch(() => [] as ArteMarcial[]),
    ]).then(([l, a]) => { setLesionesAll(l); setArtesAll(a); });
  }, [router]);

  const token = () => localStorage.getItem('token') ?? '';

  async function guardarLesiones() {
    setSaving(true);
    try {
      await api.put('/usuarios/me/lesiones', { lesion_ids: lesionSel }, token());
    } catch { /* silencio — no crítico */ }
    finally { setSaving(false); }
    setStep(2);
  }

  async function guardarArtes() {
    setSaving(true);
    try {
      await api.put('/usuarios/me/artes', { arte_ids: arteSel }, token());
    } catch { /* silencio */ }
    finally { setSaving(false); }
    setStep(3);
  }

  const porZona = lesionesAll.reduce<Record<string, Lesion[]>>((acc, l) => {
    const z = l.zona_corporal ?? 'Otra';
    if (!acc[z]) acc[z] = [];
    acc[z].push(l);
    return acc;
  }, {});

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-16 px-4">
      {/* Background accent */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(196,30,30,0.07) 0%, transparent 60%)' }} />

      <div className="w-full max-w-2xl relative z-10">

        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 flex items-center justify-center text-xs font-bold transition-all ${
                    step > s.n
                      ? 'bg-[#d4a017] text-black'
                      : step === s.n
                        ? 'bg-[#c41e1e] text-white'
                        : 'bg-[#1a1a1a] border border-[#2a2a2a] text-[#444444]'
                  }`}>
                    {step > s.n ? '✓' : s.n}
                  </div>
                  <p className={`text-[10px] uppercase tracking-widest mt-1.5 font-semibold ${
                    step === s.n ? 'text-[#d4a017]' : 'text-[#444444]'
                  }`}>{s.label}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-px mx-3 mt-[-14px]"
                    style={{ background: step > s.n ? '#d4a017' : '#2a2a2a' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* PASO 1 — Lesiones */}
        {step === 1 && (
          <div className="card-gold p-8 space-y-6">
            <div>
              <p className="text-xs text-[#c41e1e] uppercase tracking-widest font-semibold mb-1">Paso 1 de 3</p>
              <h1 className="font-display text-4xl text-white uppercase tracking-wide">¿Qué tienes fastidiado?</h1>
              <p className="text-sm text-[#888888] mt-2 leading-relaxed">
                Marca las zonas que tengas tocadas. Lo usamos para filtrar artes marciales y gimnasios compatibles.
                Si estás como un toro, pasa directamente.
              </p>
            </div>

            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {Object.entries(porZona).map(([zona, items]) => (
                <div key={zona}>
                  <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-2">{zona}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.map(l => {
                      const activa = lesionSel.includes(l.id);
                      return (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => setLesionSel(prev =>
                            activa ? prev.filter(x => x !== l.id) : [...prev, l.id]
                          )}
                          className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all border ${
                            activa
                              ? 'bg-[#c41e1e] border-[#c41e1e] text-white'
                              : 'bg-transparent border-[#2a2a2a] text-[#888888] hover:border-[#d4a017] hover:text-[#d4a017]'
                          }`}
                          style={{ borderRadius: 0 }}
                        >
                          {l.nombre}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {lesionSel.length > 0 && (
              <p className="text-xs text-[#d4a017] font-medium">
                ✓ {lesionSel.length} zona{lesionSel.length !== 1 ? 's' : ''} marcada{lesionSel.length !== 1 ? 's' : ''}
              </p>
            )}

            <div className="flex items-center gap-4 pt-2">
              <button onClick={guardarLesiones} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Guardando...' : lesionSel.length > 0 ? 'Guardar y continuar' : 'Continuar sin lesiones'}
              </button>
              <Link href="/perfil" className="text-xs text-[#444444] hover:text-[#888888] uppercase tracking-widest transition-colors">
                Ahora no
              </Link>
            </div>
          </div>
        )}

        {/* PASO 2 — Artes marciales */}
        {step === 2 && (
          <div className="card p-8 space-y-6">
            <div>
              <p className="text-xs text-[#c41e1e] uppercase tracking-widest font-semibold mb-1">Paso 2 de 3</p>
              <h1 className="font-display text-4xl text-white uppercase tracking-wide">¿Qué practicas ya?</h1>
              <p className="text-sm text-[#888888] mt-2 leading-relaxed">
                Marca lo que haces actualmente. Las recomendaciones te sugerirán cosas nuevas
                que aún no conoces y que tu cuerpo puede aguantar.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {artesAll.map(a => {
                const activa = arteSel.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setArteSel(prev =>
                      activa ? prev.filter(x => x !== a.id) : [...prev, a.id]
                    )}
                    className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all border ${
                      activa
                        ? 'bg-[#d4a017] border-[#d4a017] text-black'
                        : 'bg-transparent border-[#2a2a2a] text-[#666666] hover:border-[#d4a017] hover:text-[#d4a017]'
                    }`}
                    style={{ borderRadius: 0 }}
                  >
                    {a.nombre}
                  </button>
                );
              })}
            </div>

            {arteSel.length > 0 && (
              <p className="text-xs text-[#d4a017] font-medium">
                ✓ {arteSel.length} deporte{arteSel.length !== 1 ? 's' : ''} seleccionado{arteSel.length !== 1 ? 's' : ''}
              </p>
            )}

            <div className="flex items-center gap-4 pt-2">
              <button onClick={guardarArtes} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Guardando...' : arteSel.length > 0 ? 'Guardar y continuar' : 'Continuar sin seleccionar'}
              </button>
              <button onClick={() => setStep(1)}
                className="text-xs text-[#444444] hover:text-[#888888] uppercase tracking-widest transition-colors">
                ← Atrás
              </button>
            </div>
          </div>
        )}

        {/* PASO 3 — Listo */}
        {step === 3 && (
          <div className="card-gold p-8 text-center space-y-6">
            <div>
              <div className="w-16 h-16 bg-[#d4a017]/10 border border-[#d4a017]/30 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" stroke="#d4a017" strokeWidth="1.5">
                  <path d="M8 20 L16 28 L32 12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className="font-display text-5xl text-white uppercase tracking-wide">¡Listo!</h1>
              <p className="text-sm text-[#888888] mt-3 leading-relaxed max-w-sm mx-auto">
                Tu perfil está configurado. Ahora puedes buscar gimnasios y artes marciales
                que se adapten exactamente a ti.
              </p>
            </div>

            <div className="space-y-3">
              {lesionSel.length > 0 ? (
                <Link
                  href={`/buscar?lesion=${lesionSel.join(',')}`}
                  className="btn-primary w-full py-3"
                >
                  Buscar compatible con mis lesiones →
                </Link>
              ) : (
                <Link href="/buscar" className="btn-primary w-full py-3">
                  Buscar gimnasios →
                </Link>
              )}
              <Link href="/perfil" className="btn-secondary w-full py-3">
                Ver mi perfil
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
