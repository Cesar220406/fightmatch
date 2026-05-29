export const dynamic = 'force-dynamic';

import BuscadorHero from '@/components/BuscadorHero';
import ArteCard from '@/components/ArteCard';
import GimnasioCard from '@/components/GimnasioCard';
import DragonDecoration from '@/components/DragonDecoration';
import SectionDivider from '@/components/SectionDivider';
import { api } from '@/lib/api';
import type { Lesion, ArteMarcial, Gimnasio, Noticia } from '@/types';
import Link from 'next/link';

interface Stats { gimnasios: number; artes: number; usuarios: number; posts: number; }

const CAT_COLORS: Record<string, string> = {
  boxeo: '#c41e1e', mma: '#d85a30', judo: '#4a90e2',
  taekwondo: '#8b0000', olimpico: '#d4a017', wrestling: '#52b788', kickboxing: '#7c5cbf',
};
const CAT_LABELS: Record<string, string> = {
  boxeo: 'Boxeo', mma: 'MMA', judo: 'Judo', taekwondo: 'Taekwondo',
  olimpico: 'Olímpico', wrestling: 'Wrestling', kickboxing: 'Kickboxing',
};

async function getData() {
  const [lesiones, artes, gimnasios, stats, noticias] = await Promise.all([
    api.get<Lesion[]>('/lesiones').catch(() => [] as Lesion[]),
    api.get<ArteMarcial[]>('/artes-marciales').catch(() => [] as ArteMarcial[]),
    api.get<Gimnasio[]>('/gimnasios?limit=3').catch(() => [] as Gimnasio[]),
    api.get<Stats>('/stats').catch(() => ({ gimnasios: 0, artes: 0, usuarios: 0, posts: 0 })),
    api.get<Noticia[]>('/noticias?limit=3').catch(() => [] as Noticia[]),
  ]);
  return { lesiones, artes, gimnasios, stats, noticias };
}

export default async function Home() {
  const { lesiones, artes, gimnasios, stats, noticias } = await getData();

  return (
    <>
      {/* hero */}
      <section
        className="relative overflow-hidden bg-[#0a0a0a]"
        style={{ borderBottom: '1px solid #2a2a2a' }}
      >
        {/* glow de fondo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 75% 40%, rgba(196,30,30,0.10) 0%, transparent 55%)',
          }}
        />

        {/* dragon decorativo */}
        <DragonDecoration />

        <div className="page-container relative py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            
            <div className="space-y-8">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#d4a017]"
                style={{ border: '1px solid rgba(212,160,23,0.35)' }}
              >
                
                <svg width="10" height="12" viewBox="0 0 10 12" fill="none" aria-hidden="true">
                  <path d="M5 11 C2 9 1 6 2 3 C1 5 0 4 1 2 C2 0 4 0 5 2 C5 0 6 0 7 2 C8 0 9 1 9 3 C8 5 7 6 7 8 C8 6 9 6 9 8 C8 10 7 11 5 11 Z" fill="#c41e1e"/>
                </svg>
                Para quien entrena con lo que tiene
              </div>

              <h1 className="font-display text-7xl lg:text-9xl text-[#d4a017] leading-none uppercase tracking-wide">
                Entrena<br />
                <span className="text-white">Sin</span>{' '}
                <span className="text-[#c41e1e]">Riesgo</span>
              </h1>

              <p className="text-base text-[#888888] max-w-md leading-relaxed">
                Tienes una lesión. Entrenas de todas formas.{' '}
                Te ayudamos a encontrar el deporte que tu cuerpo aguanta
                y el gimnasio donde practicarlo,{' '}
                <span className="text-[#f0f0f0] font-medium">cerca de ti</span>.
              </p>

              {/* stats rapidas */}
              <div className="flex flex-wrap gap-10 pt-2">
                <div>
                  <p className="stat-number">{stats.gimnasios || gimnasios.length}</p>
                  <p className="text-xs text-[#888888] uppercase tracking-widest mt-1">Gimnasios</p>
                </div>
                <div>
                  <p className="stat-number">{stats.artes || artes.length}</p>
                  <p className="text-xs text-[#888888] uppercase tracking-widest mt-1">Artes marciales</p>
                </div>
                <div>
                  <p className="stat-number">{lesiones.length}</p>
                  <p className="text-xs text-[#888888] uppercase tracking-widest mt-1">Lesiones</p>
                </div>
              </div>
            </div>

            {/* buscador rapido */}
            <div className="card-gold shadow-2xl shadow-black/70 relative z-10">
              <h2 className="font-display text-2xl text-white uppercase tracking-widest mb-6">
                ¿Dónde quieres entrenar?
              </h2>
              <BuscadorHero lesiones={lesiones} />
            </div>
          </div>
        </div>
      </section>

      
      <div className="page-container">
        <SectionDivider label="Disciplinas" />
      </div>

      {/* seccion de artes marciales */}
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

      
      <div className="page-container">
        <SectionDivider />
      </div>

      {/* como funciona */}
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
                title: 'Dinos cómo estás',
                desc: 'Rodilla, hombro, columna… lo que sea. Sin dramas. Cuantas más lesiones indiques, más precisas son las recomendaciones.',
              },
              {
                step: '02',
                title: 'Filtramos sin que lo notes',
                desc: 'Cruzamos tu perfil con qué aguanta cada deporte. Solo ves opciones que tienen sentido para tu cuerpo.',
              },
              {
                step: '03',
                title: 'Elige y ve',
                desc: 'Gimnasios cercanos, con las artes marciales que te van. Contacta directamente desde aquí.',
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

      {/* cta del test */}
      <section className="py-12" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <div className="page-container text-center">
          <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">¿No sabes cuál elegir?</p>
          <p className="text-[#f0f0f0] text-lg mb-5 max-w-lg mx-auto leading-relaxed">
            Responde 6 preguntas y te decimos qué arte marcial encaja con tu cuerpo y tu forma de ser.
          </p>
          <a href="/test" className="btn-secondary">
            Hacer el test — 2 minutos →
          </a>
        </div>
      </section>

      
      {gimnasios.length > 0 && (
        <>
          <div className="page-container">
            <SectionDivider label="Gimnasios destacados" />
          </div>

          {/* gimnasios destacados */}
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

      {/* ultimas noticias */}
      {noticias.length > 0 && (
        <>
          <div className="page-container">
            <SectionDivider label="Fight News" />
          </div>
          <section className="pb-16">
            <div className="page-container">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-xs text-[#888888] uppercase tracking-widest mb-1">Diario de artes marciales</p>
                  <h2 className="font-display text-4xl lg:text-5xl text-white uppercase tracking-wide">
                    Últimas <span className="text-[#c41e1e]">Noticias</span>
                  </h2>
                </div>
                <Link
                  href="/noticias"
                  className="text-xs font-semibold uppercase tracking-widest text-[#888888] hover:text-[#d4a017] transition-colors"
                >
                  Ver todas →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {noticias.map((n) => (
                  <Link
                    key={n.slug}
                    href={`/noticias/${n.slug}`}
                    className="group block border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors overflow-hidden"
                  >
                    <div className="aspect-video bg-[#111111] relative overflow-hidden">
                      {n.imagen_url ? (
                        <img
                          src={n.imagen_url}
                          alt={n.imagen_alt ?? ''}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{
                            background: `linear-gradient(135deg, #111 0%, ${CAT_COLORS[n.categoria] ?? '#1a1a1a'}33 100%)`,
                          }}
                        />
                      )}
                      <span
                        className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5"
                        style={{ background: CAT_COLORS[n.categoria] ?? '#333', color: '#fff' }}
                      >
                        {CAT_LABELS[n.categoria] ?? n.categoria}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-base text-white uppercase tracking-wide leading-tight group-hover:text-[#d4a017] transition-colors line-clamp-2">
                        {n.titulo}
                      </h3>
                      {n.resumen && (
                        <p className="text-xs text-[#888888] mt-1.5 line-clamp-2">{n.resumen}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      
      <div className="page-container pb-8">
        <SectionDivider label="FightMatch" />
      </div>
    </>
  );
}
