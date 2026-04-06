export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import CompatibilidadTabla from '@/components/CompatibilidadTabla';
import type { ArteMarcial } from '@/types';
import type { Metadata } from 'next';

async function getArte(slug: string) {
  return api.get<ArteMarcial>(`/artes-marciales/${slug}`).catch(() => null);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const a = await getArte(params.slug);
  if (!a) return { title: 'Arte marcial no encontrada' };
  return { title: a.nombre, description: a.descripcion };
}

export default async function ArteDetalleP({ params }: { params: { slug: string } }) {
  const arte = await getArte(params.slug);
  if (!arte) notFound();

  const compatibles   = arte.compatibilidades?.filter((c) => c.compatible).length ?? 0;
  const incompatibles = arte.compatibilidades?.filter((c) => !c.compatible).length ?? 0;

  return (
    <div className="py-12">
      <div className="page-container max-w-4xl">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/artes-marciales" className="hover:text-white transition">Artes Marciales</Link>
          <span>/</span>
          <span className="text-gray-300">{arte.nombre}</span>
        </nav>

        {/* Hero */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 items-center">
          <div className="aspect-video overflow-hidden rounded-2xl bg-gray-800">
            {arte.imagen_url ? (
              <img src={arte.imagen_url} alt={arte.nombre} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-7xl text-gray-600">🥋</div>
            )}
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold text-white">{arte.nombre}</h1>
            {arte.descripcion && (
              <p className="text-gray-400 leading-relaxed">{arte.descripcion}</p>
            )}
            {arte.impacto_fisico && (
              <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Impacto físico
                </p>
                <p className="text-sm text-gray-300">{arte.impacto_fisico}</p>
              </div>
            )}

            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="text-2xl font-bold">{compatibles}</span>
                <span className="text-gray-400">lesiones compatibles</span>
              </div>
              <div className="flex items-center gap-2 text-red-400">
                <span className="text-2xl font-bold">{incompatibles}</span>
                <span className="text-gray-400">contraindicadas</span>
              </div>
            </div>

            <Link
              href={`/gimnasios?arte=${arte.slug}`}
              className="btn-primary inline-flex"
            >
              Buscar gimnasios de {arte.nombre}
            </Link>
          </div>
        </div>

        {/* Tabla de compatibilidades */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-6">Compatibilidad con lesiones</h2>
          <CompatibilidadTabla
            items={arte.compatibilidades ?? []}
            modo="por-arte"
          />
        </div>
      </div>
    </div>
  );
}
