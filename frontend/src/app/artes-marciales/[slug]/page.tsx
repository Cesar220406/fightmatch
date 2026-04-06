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
    <div className="py-14">
      <div className="page-container max-w-5xl">

        {/* Breadcrumb */}
        <nav className="text-xs text-[#888888] mb-8 flex items-center gap-2 uppercase tracking-widest font-semibold">
          <Link href="/artes-marciales" className="hover:text-[#d4a017] transition-colors">Artes Marciales</Link>
          <span className="text-[#2a2a2a]">/</span>
          <span className="text-[#f0f0f0]">{arte.nombre}</span>
        </nav>

        {/* Hero */}
        <div className="grid md:grid-cols-2 gap-10 mb-12 items-start">
          <div className="aspect-video overflow-hidden bg-[#111111]">
            {arte.imagen_url ? (
              <img src={arte.imagen_url} alt={arte.nombre} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-7xl text-[#333333]">🥋</div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-2">Arte Marcial</p>
              <h1 className="font-display text-5xl lg:text-6xl text-white uppercase tracking-wide leading-none">
                {arte.nombre}
              </h1>
            </div>

            {arte.descripcion && (
              <p className="text-[#888888] leading-relaxed">{arte.descripcion}</p>
            )}

            {arte.impacto_fisico && (
              <div className="border border-[#2a2a2a] bg-[#111111] px-4 py-3" style={{ borderLeft: '3px solid #d4a017' }}>
                <p className="text-xs font-semibold text-[#d4a017] uppercase tracking-widest mb-1">
                  Impacto físico
                </p>
                <p className="text-sm text-[#888888]">{arte.impacto_fisico}</p>
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-8">
              <div>
                <p className="stat-number text-emerald-400">{compatibles}</p>
                <p className="text-xs text-[#888888] uppercase tracking-wider mt-1">Compatibles</p>
              </div>
              <div>
                <p className="stat-number text-[#c41e1e]">{incompatibles}</p>
                <p className="text-xs text-[#888888] uppercase tracking-wider mt-1">Contraindicadas</p>
              </div>
            </div>

            <Link href={`/gimnasios?arte=${arte.slug}`} className="btn-primary inline-flex">
              Buscar gimnasios de {arte.nombre}
            </Link>
          </div>
        </div>

        {/* Tabla de compatibilidades */}
        <div className="card">
          <h2 className="font-display text-2xl text-white uppercase tracking-wide mb-6">
            Compatibilidad con lesiones
          </h2>
          <CompatibilidadTabla items={arte.compatibilidades ?? []} modo="por-arte" />
        </div>
      </div>
    </div>
  );
}
