export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Gimnasio } from '@/types';
import type { Metadata } from 'next';

async function getGimnasio(slug: string) {
  return api.get<Gimnasio>(`/gimnasios/${slug}`).catch(() => null);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const g = await getGimnasio(params.slug);
  if (!g) return { title: 'Gimnasio no encontrado' };
  return { title: g.nombre, description: g.descripcion };
}

const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
const diasLabel: Record<string, string> = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo',
};

export default async function GimnasioDetallePage({ params }: { params: { slug: string } }) {
  const g = await getGimnasio(params.slug);
  if (!g) notFound();

  return (
    <div className="py-14">
      <div className="page-container max-w-5xl">

        {/* Breadcrumb */}
        <nav className="text-xs text-[#888888] mb-8 flex items-center gap-2 uppercase tracking-widest font-semibold">
          <Link href="/gimnasios" className="hover:text-[#d4a017] transition-colors">Gimnasios</Link>
          <span className="text-[#2a2a2a]">/</span>
          <span className="text-[#f0f0f0] truncate max-w-xs">{g.nombre}</span>
        </nav>

        {/* Hero imagen */}
        <div className="aspect-[3/1] w-full overflow-hidden bg-[#111111] mb-10" style={{ borderLeft: '4px solid #c41e1e' }}>
          {g.imagen_url ? (
            <img src={g.imagen_url} alt={g.nombre} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-7xl text-[#333333]">🏋️</div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Info principal */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-start gap-3 flex-wrap mb-2">
                <h1 className="font-display text-4xl lg:text-5xl text-white uppercase tracking-wide leading-none">
                  {g.nombre}
                </h1>
                {g.verificado && <span className="badge-green mt-2">Verificado</span>}
              </div>
              {g.ciudad && (
                <p className="text-sm text-[#888888] flex items-center gap-1.5 mt-2">
                  <svg className="h-4 w-4 text-[#d4a017]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {g.direccion && `${g.direccion}, `}{g.ciudad}{g.provincia ? `, ${g.provincia}` : ''}
                </p>
              )}
            </div>

            {g.descripcion && (
              <div>
                <h2 className="font-display text-xl text-white uppercase tracking-wide mb-3">Sobre el gimnasio</h2>
                <p className="text-[#888888] leading-relaxed">{g.descripcion}</p>
              </div>
            )}

            {/* Artes marciales */}
            {g.artes && g.artes.length > 0 && (
              <div>
                <h2 className="font-display text-xl text-white uppercase tracking-wide mb-4">Artes Marciales</h2>
                <div className="flex flex-wrap gap-2">
                  {g.artes.map((a) => (
                    <span key={a} className="badge-gold text-sm px-4 py-1.5">{a}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Horarios */}
            {g.horario && (
              <div>
                <h2 className="font-display text-xl text-white uppercase tracking-wide mb-4">Horarios</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {diasSemana.map((dia) => {
                    const horario = (g.horario as Record<string, string>)?.[dia];
                    return (
                      <div key={dia} className="border border-[#2a2a2a] bg-[#111111] px-3 py-2.5">
                        <p className="text-xs text-[#d4a017] font-semibold uppercase tracking-wider">{diasLabel[dia]}</p>
                        <p className="text-sm text-[#f0f0f0] mt-0.5">{horario ?? 'Cerrado'}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="card-gold sticky top-20">
              {g.precio_desde && (
                <div className="mb-5 pb-5 border-b border-[#2a2a2a]">
                  <p className="text-xs text-[#888888] uppercase tracking-widest mb-1">Precio desde</p>
                  <p className="font-display text-4xl text-[#d4a017]">
                    {g.precio_desde}€
                    <span className="text-base text-[#888888] font-sans font-normal">/mes</span>
                  </p>
                </div>
              )}

              <div className="space-y-3 text-sm mb-5">
                {g.telefono && (
                  <a href={`tel:${g.telefono}`} className="flex items-center gap-2 text-[#888888] hover:text-[#f0f0f0] transition-colors">
                    <svg className="h-4 w-4 text-[#d4a017]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {g.telefono}
                  </a>
                )}
                {g.email_contacto && (
                  <a href={`mailto:${g.email_contacto}`} className="flex items-center gap-2 text-[#888888] hover:text-[#f0f0f0] transition-colors">
                    <svg className="h-4 w-4 text-[#d4a017]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {g.email_contacto}
                  </a>
                )}
                {g.sitio_web && (
                  <a href={g.sitio_web} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#888888] hover:text-[#f0f0f0] transition-colors">
                    <svg className="h-4 w-4 text-[#d4a017]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Sitio web
                  </a>
                )}
              </div>

              <button className="btn-primary w-full">Contactar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
