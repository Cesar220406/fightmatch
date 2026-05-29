// force-dynamic para que no cachee nada; si el backend falla en build se queda vacío
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import type { Metadata } from 'next';
import type { Noticia } from '@/types';
import { api } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Fight News — El diario de las artes marciales en España | FightMatch',
  description:
    'Noticias, análisis y actualidad de boxeo, MMA, judo, taekwondo, wrestling y kickboxing. El diario especializado en artes marciales en español.',
  openGraph: {
    title: 'Fight News by FightMatch',
    description: 'El diario de las artes marciales en España',
    type: 'website',
  },
};

// un color por categoria para los badges
export const CAT_COLORS: Record<string, string> = {
  boxeo:      '#c41e1e',
  mma:        '#d85a30',
  judo:       '#4a90e2',
  taekwondo:  '#8b0000',
  olimpico:   '#d4a017',
  wrestling:  '#52b788',
  kickboxing: '#7c5cbf',
};

const CAT_LABELS: Record<string, string> = {
  boxeo:      'Boxeo',
  mma:        'MMA',
  judo:       'Judo',
  taekwondo:  'Taekwondo',
  olimpico:   'Olímpico',
  wrestling:  'Wrestling',
  kickboxing: 'Kickboxing',
};


function CategoryBadge({ categoria, size = 'sm' }: { categoria: string; size?: 'xs' | 'sm' }) {
  const color = CAT_COLORS[categoria] ?? '#888888';
  const label = CAT_LABELS[categoria] ?? categoria;
  const cls =
    size === 'xs'
      ? 'text-[10px] px-2 py-0.5 font-bold uppercase tracking-widest'
      : 'text-xs px-2.5 py-1 font-bold uppercase tracking-widest';
  return (
    <span className={`inline-block ${cls}`} style={{ background: color, color: '#fff' }}>
      {label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// noticia principal, imagen en eager porque está en el fold
function HeroNoticia({ noticia }: { noticia: Noticia }) {
  return (
    <Link
      href={`/noticias/${noticia.slug}`}
      className="group block relative overflow-hidden"
      style={{ minHeight: 420 }}
    >
      {noticia.imagen_url ? (
        <img
          src={noticia.imagen_url}
          alt={noticia.imagen_alt ?? noticia.titulo}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, #0a0a0a 0%, ${CAT_COLORS[noticia.categoria] ?? '#1a1a1a'}33 100%)`,
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
      <div className="relative z-10 flex flex-col justify-end h-full p-6 lg:p-10" style={{ minHeight: 420 }}>
        <CategoryBadge categoria={noticia.categoria} />
        <h2
          className="font-display text-3xl lg:text-5xl text-white uppercase tracking-wide mt-3 mb-3 leading-tight group-hover:text-[#d4a017] transition-colors"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
        >
          {noticia.titulo}
        </h2>
        {noticia.subtitulo && (
          <p className="text-[#cccccc] text-sm lg:text-base max-w-2xl leading-relaxed mb-4">
            {noticia.subtitulo}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-[#888888]">
          <span>{noticia.autor}</span>
          <span>·</span>
          <span>{formatDate(noticia.fecha_publicacion)}</span>
          {noticia.tiempo_lectura && (
            <>
              <span>·</span>
              <span>{noticia.tiempo_lectura} min de lectura</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

// cards secundarias con lazy loading
function SecondaryCard({ noticia }: { noticia: Noticia }) {
  return (
    <Link
      href={`/noticias/${noticia.slug}`}
      className="group block border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors overflow-hidden"
    >
      <div className="aspect-video relative overflow-hidden bg-[#111111]">
        {noticia.imagen_url ? (
          <img
            src={noticia.imagen_url}
            alt={noticia.imagen_alt ?? ''}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, #111 0%, ${CAT_COLORS[noticia.categoria] ?? '#1a1a1a'}22 100%)`,
            }}
          />
        )}
        <div className="absolute top-3 left-3">
          <CategoryBadge categoria={noticia.categoria} size="xs" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg text-white uppercase tracking-wide leading-tight mb-2 group-hover:text-[#d4a017] transition-colors line-clamp-2">
          {noticia.titulo}
        </h3>
        {noticia.resumen && (
          <p className="text-xs text-[#888888] leading-relaxed line-clamp-2 mb-3">
            {noticia.resumen}
          </p>
        )}
        <div className="flex items-center gap-2 text-[10px] text-[#555555] uppercase tracking-widest">
          <span>{formatDate(noticia.fecha_publicacion)}</span>
          {noticia.tiempo_lectura && (
            <>
              <span>·</span>
              <span>{noticia.tiempo_lectura} min</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

// card mas pequeña para el listado inferior
function CompactCard({ noticia }: { noticia: Noticia }) {
  return (
    <Link
      href={`/noticias/${noticia.slug}`}
      className="group flex gap-4 py-4 border-b border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors last:border-0"
    >
      <div className="w-20 h-16 flex-shrink-0 bg-[#111111] overflow-hidden relative">
        {noticia.imagen_url ? (
          <img
            src={noticia.imagen_url}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, #111 0%, ${CAT_COLORS[noticia.categoria] ?? '#1a1a1a'}33 100%)`,
            }}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <CategoryBadge categoria={noticia.categoria} size="xs" />
        </div>
        <h3 className="text-sm text-[#f0f0f0] leading-snug group-hover:text-[#d4a017] transition-colors line-clamp-2 font-medium">
          {noticia.titulo}
        </h3>
        <p className="text-[10px] text-[#555555] mt-1 uppercase tracking-widest">
          {formatDate(noticia.fecha_publicacion)}
        </p>
      </div>
    </Link>
  );
}


async function getData() {
  const [all, masLeidas, categorias] = await Promise.all([
    api.get<Noticia[]>('/noticias?limit=20').catch(() => [] as Noticia[]),
    api.get<Noticia[]>('/noticias/mas-leidas').catch(() => [] as Noticia[]),
    api
      .get<{ categoria: string; total: string }[]>('/noticias/categorias')
      .catch(() => []),
  ]);
  return { all, masLeidas, categorias };
}


export default async function NoticiasPage() {
  const { all, masLeidas, categorias } = await getData();

  const hero       = all.find((n) => n.destacada) ?? all[0];
  const secundarias = all.filter((n) => n.id !== hero?.id && n.destacada).slice(0, 3);
  const resto      = all.filter(
    (n) => n.id !== hero?.id && !secundarias.find((s) => s.id === n.id)
  );

  const CATEGORIAS = ['boxeo', 'mma', 'judo', 'taekwondo', 'olimpico', 'wrestling', 'kickboxing'];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* cabecera */}
      <div className="border-b-2 border-[#c41e1e] py-8" style={{ borderBottom: '3px solid #c41e1e' }}>
        <div className="page-container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-6xl lg:text-8xl text-white uppercase tracking-wider leading-none">
                Fight <span className="text-[#c41e1e]">News</span>
              </h1>
              <p className="text-xs text-[#888888] uppercase tracking-widest mt-2">
                El diario de las artes marciales en España
              </p>
            </div>
            {/* links de categoria */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS.map((c) => (
                <Link
                  key={c}
                  href={`/noticias/categoria/${c}`}
                  className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 border transition-colors hover:text-white"
                  style={{
                    borderColor: CAT_COLORS[c] ?? '#2a2a2a',
                    color: CAT_COLORS[c] ?? '#888888',
                  }}
                >
                  {CAT_LABELS[c]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-10">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* columna principal */}
          <div className="lg:col-span-3">

            {hero && <HeroNoticia noticia={hero} />}

            {secundarias.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {secundarias.map((n) => (
                  <SecondaryCard key={n.id} noticia={n} />
                ))}
              </div>
            )}

            {resto.length > 0 && (
              <>
                <div
                  className="flex items-center gap-4 my-8"
                  style={{ borderTop: '1px solid #1a1a1a', paddingTop: '1.5rem' }}
                >
                  <h2 className="font-display text-xl text-white uppercase tracking-widest shrink-0">
                    Todas las noticias
                  </h2>
                  <div className="flex-1 h-px bg-[#1a1a1a]" />
                </div>
                <div className="grid sm:grid-cols-2 gap-x-8">
                  {resto.map((n) => (
                    <CompactCard key={n.id} noticia={n} />
                  ))}
                </div>
              </>
            )}

            {all.length === 0 && (
              <div className="text-center py-20">
                <p className="text-[#555555] text-lg">No hay noticias publicadas todavía.</p>
              </div>
            )}
          </div>

          {/* sidebar */}
          <aside className="space-y-8">
            {masLeidas.length > 0 && (
              <div>
                <h3
                  className="font-display text-base text-white uppercase tracking-widest mb-4 pb-3"
                  style={{ borderBottom: '2px solid #c41e1e' }}
                >
                  Lo más leído
                </h3>
                <ol className="space-y-4">
                  {masLeidas.map((n, i) => (
                    <li key={n.slug} className="flex gap-3">
                      <span
                        className="font-display text-2xl leading-none shrink-0 w-7"
                        style={{ color: i === 0 ? '#d4a017' : '#2a2a2a' }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <Link
                          href={`/noticias/${n.slug}`}
                          className="text-xs text-[#f0f0f0] hover:text-[#d4a017] transition-colors leading-snug font-medium"
                        >
                          {n.titulo}
                        </Link>
                        <div className="flex items-center gap-1 mt-1">
                          <CategoryBadge categoria={n.categoria} size="xs" />
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {categorias.length > 0 && (
              <div>
                <h3
                  className="font-display text-base text-white uppercase tracking-widest mb-4 pb-3"
                  style={{ borderBottom: '2px solid #1a1a1a' }}
                >
                  Categorías
                </h3>
                <div className="space-y-2">
                  {categorias.map((c) => (
                    <Link
                      key={c.categoria}
                      href={`/noticias/categoria/${c.categoria}`}
                      className="flex items-center justify-between py-2 border-b border-[#111111] hover:border-[#2a2a2a] transition-colors group"
                    >
                      <span className="text-xs text-[#888888] group-hover:text-[#f0f0f0] uppercase tracking-widest font-semibold transition-colors">
                        {CAT_LABELS[c.categoria] ?? c.categoria}
                      </span>
                      <span
                        className="text-xs font-bold"
                        style={{ color: CAT_COLORS[c.categoria] ?? '#888888' }}
                      >
                        {c.total}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="card-gold p-5">
              <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">¿Quieres entrenar?</p>
              <p className="text-sm text-[#f0f0f0] mb-4 leading-relaxed">
                Encuentra gimnasios de artes marciales cerca de ti.
              </p>
              <Link href="/buscar" className="btn-primary block text-center text-xs py-2">
                Buscar gimnasios →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
