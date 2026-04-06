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
    <div className="py-12">
      <div className="page-container max-w-5xl">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/gimnasios" className="hover:text-white transition">Gimnasios</Link>
          <span>/</span>
          <span className="text-gray-300">{g.nombre}</span>
        </nav>

        {/* Hero imagen */}
        <div className="aspect-[3/1] w-full overflow-hidden rounded-2xl bg-gray-800 mb-8">
          {g.imagen_url ? (
            <img src={g.imagen_url} alt={g.nombre} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-7xl text-gray-600">🏋️</div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Info principal */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-start gap-3 flex-wrap">
                <h1 className="text-3xl font-extrabold text-white">{g.nombre}</h1>
                {g.verificado && <span className="badge-green mt-1">Verificado</span>}
              </div>
              {g.ciudad && (
                <p className="mt-2 text-gray-400 flex items-center gap-1.5">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <h2 className="text-lg font-semibold text-white mb-2">Sobre el gimnasio</h2>
                <p className="text-gray-400 leading-relaxed">{g.descripcion}</p>
              </div>
            )}

            {/* Artes marciales */}
            {g.artes && g.artes.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-3">Artes Marciales</h2>
                <div className="flex flex-wrap gap-2">
                  {g.artes.map((a) => (
                    <span key={a} className="badge-gray text-sm px-3 py-1">{a}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Horarios */}
            {g.horario && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-3">Horarios</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {diasSemana.map((dia) => {
                    const horario = (g.horario as Record<string, string>)?.[dia];
                    return (
                      <div key={dia} className="rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-2">
                        <p className="text-xs text-gray-500 font-medium">{diasLabel[dia]}</p>
                        <p className="text-sm text-white">{horario ?? 'Cerrado'}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card sticky top-20">
              {g.precio_desde && (
                <div className="mb-4 pb-4 border-b border-gray-800">
                  <p className="text-xs text-gray-500">Precio desde</p>
                  <p className="text-2xl font-bold text-white">{g.precio_desde}€<span className="text-sm text-gray-400 font-normal">/mes</span></p>
                </div>
              )}

              <div className="space-y-3 text-sm">
                {g.telefono && (
                  <a href={`tel:${g.telefono}`} className="flex items-center gap-2 text-gray-300 hover:text-white transition">
                    <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {g.telefono}
                  </a>
                )}
                {g.email_contacto && (
                  <a href={`mailto:${g.email_contacto}`} className="flex items-center gap-2 text-gray-300 hover:text-white transition">
                    <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {g.email_contacto}
                  </a>
                )}
                {g.sitio_web && (
                  <a href={g.sitio_web} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition">
                    <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Sitio web
                  </a>
                )}
              </div>

              <button className="btn-primary w-full mt-5">Contactar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
