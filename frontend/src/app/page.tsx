export const dynamic = 'force-dynamic';

import BuscadorHero from '@/components/BuscadorHero';
import ArteCard from '@/components/ArteCard';
import GimnasioCard from '@/components/GimnasioCard';
import DragonDecoration from '@/components/DragonDecoration';
import SectionDivider from '@/components/SectionDivider';
import { api } from '@/lib/api';
import type { Lesion, ArteMarcial, Gimnasio } from '@/types';

async function getData() {
  const [lesiones, artes, gimnasios] = await Promise.all([
    api.get<Lesion[]>('/lesiones').catch(() => [] as Lesion[]),
    api.get<ArteMarcial[]>('/artes-marciales').catch(() => [] as ArteMarcial[]),
    api.get<Gimnasio[]>('/gimnasios?limit=3').catch(() => [] as Gimnasio[]),
  ]);
  return { lesiones, artes, gimnasios };
}

export default async function Home() {
  const { lesiones, artes, gimnasios } = await getData();

  return (
    <>
      {/* ── Hero ────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden bg-[#0a0a0a]"
        style={{ borderBottom: '1px solid #2a2a2a' }}
      >
        {/* Red atmospheric glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 75% 40%, rgba(196,30,30,0.10) 0%, transparent 55%)',
          }}
        />

        {/* Dragon decoration – behind search form */}
        <DragonDecoration />

        <div className="page-container relative py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            {/* Left: Copy */}
            <div className="space-y-8">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#d4a017]"
                style={{ border: '1px solid rgba(212,160,23,0.35)' }}
              >
                {/* Small flame ornament */}
                <svg width="10" height="12" viewBox="0 0 10 12" fill="none" aria-hidden="true">
                  <path d="M5 11 C2 9 1 6 2 3 C1 5 0 4 1 2 C2 0 4 0 5 2 C5 0 6 0 7 2 C8 0 9 1 9 3 C8 5 7 6 7 8 C8 6 9 6 9 8 C8 10 7 11 5 11 Z" fill="#c41e1e"/>
                </svg>
                Plataforma para deportistas con lesiones
              </div>

              <h1 className="font-display text-7xl lg:text-9xl text-[#d4a017] leading-none uppercase tracking-wide">
                Entrena<br />
                <span className="text-white">Sin</span>{' '}
                <span className="text-[#c41e1e]">Riesgo</span>
              </h1>

              <p className="text-base text-[#888888] max-w-md leading-relaxed">
                Encuentra el arte marcial y el gimnasio perfectos para ti,
                teniendo en cuenta tus{' '}
                <span className="text-[#f0f0f0] font-medium">lesiones</span> y tu{' '}
                <span className="text-[#f0f0f0] font-medium">ubicación</span>.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-10 pt-2">
                <div>
                  <p className="stat-number">{artes.length}</p>
                  <p className="text-xs text-[#888888] uppercase tracking-widest mt-1">Artes marciales</p>
                </div>
                <div>
                  <p className="stat-number">{lesiones.length}</p>
                  <p className="text-xs text-[#888888] uppercase tracking-widest mt-1">Lesiones catalogadas</p>
                </div>
              </div>
            </div>

            {/* Right: Buscador */}
            <div className="card-gold shadow-2xl shadow-black/70 relative z-10">
              <h2 className="font-display text-2xl text-white uppercase tracking-widest mb-6">
                Encuentra tu gimnasio
              </h2>
              <BuscadorHero lesiones={lesiones} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Section Divider ──────────────────────────────── */}
      <div className="page-container">
        <SectionDivider label="Disciplinas" />
      </div>

      {/* ── Artes Marciales destacadas ──────────────────── */}
      <section className="pb-16">
        <div className="page-container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-4xl lg:text-5xl text-white uppercase tracking-wide">
                Artes Marciales
              </h2>
            </div>
            <a
              href="/artes-marciales"
              className="text-xs font-semibold uppercase tracking-widest text-[#888888] hover:text-[#d4a017] transition-colors"
            >
              Ver todas →
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {artes.slice(0, 4).map((arte) => (
              <ArteCard key={arte.id} arte={arte} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Section Divider ──────────────────────────────── */}
      <div className="page-container">
        <SectionDivider />
      </div>

      {/* ── Cómo funciona ───────────────────────────────── */}
      <section className="py-20">
        <div className="page-container">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl lg:text-6xl text-white uppercase tracking-wide">
              ¿Cómo funciona?
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-10">
            {[
              {
                step: '01',
                title: 'Indica tus lesiones',
                desc: 'Selecciona las zonas afectadas o lesiones concretas que tienes en este momento.',
              },
              {
                step: '02',
                title: 'Filtramos por compatibilidad',
                desc: 'Nuestro motor cruza tu perfil con las compatibilidades validadas por profesionales.',
              },
              {
                step: '03',
                title: 'Encuentra tu gimnasio',
                desc: 'Elige entre los gimnasios cercanos que ofrecen las artes marciales aptas para ti.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative pl-6" style={{ borderLeft: '3px solid #c41e1e' }}>
                <p className="font-display text-6xl text-[#d4a017] leading-none mb-3">{step}</p>
                <h3 className="font-semibold text-white text-lg mb-2">{title}</h3>
                <p className="text-sm text-[#888888] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section Divider ──────────────────────────────── */}
      {gimnasios.length > 0 && (
        <>
          <div className="page-container">
            <SectionDivider label="Gimnasios destacados" />
          </div>

          {/* ── Gimnasios destacados ───────────────────────── */}
          <section className="pb-16">
            <div className="page-container">
              <div className="flex items-end justify-between mb-10">
                <h2 className="font-display text-4xl lg:text-5xl text-white uppercase tracking-wide">
                  Gimnasios
                </h2>
                <a
                  href="/gimnasios"
                  className="text-xs font-semibold uppercase tracking-widest text-[#888888] hover:text-[#d4a017] transition-colors"
                >
                  Ver todos →
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gimnasios.map((g) => (
                  <GimnasioCard key={g.id} g={g} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── Final divider ────────────────────────────────── */}
      <div className="page-container pb-8">
        <SectionDivider label="FightMatch" />
      </div>
    </>
  );
}
