import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import GimnasioCard from '@/components/GimnasioCard';
import { api } from '@/lib/api';
import type { Gimnasio } from '@/types';
import {
  CIUDADES, ARTES_VALIDAS, CIUDAD_NOMBRES, ARTE_NOMBRES_SEO, getTexto,
  type Ciudad, type ArteValido,
} from '@/lib/ciudadArteTextos';

// 35 páginas estáticas preGeneradas (5 ciudades × 7 artes)
export async function generateStaticParams() {
  return CIUDADES.flatMap(ciudad =>
    ARTES_VALIDAS.map(arte => ({ ciudad, arte }))
  );
}

// ISR diario — gimnasios pueden actualizarse, pero no necesitamos SSR en cada visita
export const revalidate = 86400;

interface Props { params: { ciudad: string; arte: string } }

function capitalizar(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ciudad, arte } = params;
  if (!CIUDADES.includes(ciudad as Ciudad) || !ARTES_VALIDAS.includes(arte as ArteValido)) {
    return { title: 'Página no encontrada' };
  }
  const ciudadNombre = CIUDAD_NOMBRES[ciudad as Ciudad];
  const arteNombre   = ARTE_NOMBRES_SEO[arte as ArteValido];
  return {
    title:       `Clases de ${arteNombre} en ${ciudadNombre}`,
    description: `Encuentra los mejores gimnasios de ${arteNombre} en ${ciudadNombre}. Compara artes marciales compatibles con tus lesiones y encuentra el que encaje contigo.`,
    openGraph: {
      title:       `Clases de ${arteNombre} en ${ciudadNombre} | FightMatch`,
      description: `Gimnasios de ${arteNombre} en ${ciudadNombre} — filtra por lesiones y distancia.`,
      type:        'website',
    },
  };
}

export default async function CiudadArtePage({ params }: Props) {
  const { ciudad, arte } = params;

  // Validación estricta — cualquier ruta que no esté en las listas válidas → 404
  if (!CIUDADES.includes(ciudad as Ciudad) || !ARTES_VALIDAS.includes(arte as ArteValido)) {
    notFound();
  }

  const c = ciudad as Ciudad;
  const a = arte as ArteValido;

  const gimnasios = await api
    .get<Gimnasio[]>(`/gimnasios?ciudad=${encodeURIComponent(CIUDAD_NOMBRES[c])}&arte=${a}&limit=12`)
    .catch(() => [] as Gimnasio[]);

  const texto = getTexto(c, a);

  // JSON-LD: ItemList con los gimnasios encontrados
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type':    'ItemList',
    name:       `Gimnasios de ${ARTE_NOMBRES_SEO[a]} en ${CIUDAD_NOMBRES[c]}`,
    itemListElement: gimnasios.map((g, i) => ({
      '@type':    'ListItem',
      position:   i + 1,
      item: {
        '@type':   'SportsClub',
        name:      g.nombre,
        address:   { '@type': 'PostalAddress', addressLocality: CIUDAD_NOMBRES[c], addressCountry: 'ES' },
        url:       `https://fightmatch.duckdns.org/gimnasios/${g.slug}`,
        ...(g.precio_desde ? { priceRange: `Desde ${g.precio_desde}€/mes` } : {}),
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="py-14">
        <div className="page-container">

          {/* Breadcrumb */}
          <nav className="text-xs text-[#888888] mb-8 flex items-center gap-2 uppercase tracking-widest font-semibold">
            <Link href="/gimnasios" className="hover:text-[#d4a017] transition-colors">Gimnasios</Link>
            <span className="text-[#2a2a2a]">/</span>
            <Link href={`/gimnasios?ciudad=${CIUDAD_NOMBRES[c]}`} className="hover:text-[#d4a017] transition-colors">
              {CIUDAD_NOMBRES[c]}
            </Link>
            <span className="text-[#2a2a2a]">/</span>
            <span className="text-[#f0f0f0]">{ARTE_NOMBRES_SEO[a]}</span>
          </nav>

          {/* H1 */}
          <div className="mb-10">
            <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-2">
              Guía local
            </p>
            <h1 className="font-display text-5xl lg:text-7xl text-white uppercase tracking-wide leading-none mb-4">
              {ARTE_NOMBRES_SEO[a]}<br />
              <span className="text-[#c41e1e]">en {CIUDAD_NOMBRES[c]}</span>
            </h1>
          </div>

          {/* Texto editorial con voz humana */}
          <div className="mb-12 max-w-2xl">
            <p className="text-[#888888] leading-relaxed text-base">{texto}</p>
          </div>

          {/* Grid de gimnasios */}
          {gimnasios.length === 0 ? (
            <div className="py-20 text-center border border-[#2a2a2a]">
              <p className="text-sm text-[#666666] uppercase tracking-widest mb-2">
                Aún no tenemos gimnasios de {ARTE_NOMBRES_SEO[a]} en {CIUDAD_NOMBRES[c]}.
              </p>
              <p className="text-xs text-[#444444] mb-6">
                Si conoces uno que debería aparecer aquí, díselo a su dueño.
              </p>
              <Link href={`/gimnasios?ciudad=${CIUDAD_NOMBRES[c]}`} className="btn-secondary text-xs">
                Ver todos los gimnasios en {CIUDAD_NOMBRES[c]}
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs text-[#888888] uppercase tracking-widest">
                  {gimnasios.length} gimnasio{gimnasios.length !== 1 ? 's' : ''} encontrado{gimnasios.length !== 1 ? 's' : ''}
                </p>
                <Link
                  href={`/buscar?ciudad=${CIUDAD_NOMBRES[c]}&arte=${a}`}
                  className="text-xs text-[#d4a017] hover:text-[#e8b520] uppercase tracking-widest transition-colors"
                >
                  Filtrar por lesiones →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {gimnasios.map(g => <GimnasioCard key={g.id} g={g} />)}
              </div>
            </>
          )}

          {/* CTA buscar con filtro de lesiones */}
          <div className="border border-[#2a2a2a] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            style={{ borderLeft: '3px solid #c41e1e' }}>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white mb-1">¿Tienes alguna lesión?</p>
              <p className="text-xs text-[#888888]">
                Usa el buscador para filtrar gimnasios compatibles con tu situación física.
              </p>
            </div>
            <Link href={`/buscar?ciudad=${CIUDAD_NOMBRES[c]}`} className="btn-primary shrink-0 text-xs">
              Buscar compatible →
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
