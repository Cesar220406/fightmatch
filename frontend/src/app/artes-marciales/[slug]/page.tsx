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
          <div className="aspect-video overflow-hidden bg-[#111111] relative">
            {arte.imagen_url ? (
              <img src={arte.imagen_url} alt={arte.nombre} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 opacity-20">
                  {/* Gi uniform silhouette */}
                  <circle cx="60" cy="22" r="14" stroke="#d4a017" strokeWidth="2"/>
                  <path d="M 60 36 C 60 36 48 42 42 56 L 42 90 L 78 90 L 78 56 C 72 42 60 36 60 36 Z" stroke="#d4a017" strokeWidth="2" fill="none"/>
                  <path d="M 60 36 L 50 50 L 56 58 Z" fill="#d4a017" opacity="0.5"/>
                  <path d="M 60 36 L 70 50 L 64 58 Z" fill="#c41e1e" opacity="0.6"/>
                  <line x1="42" y1="64" x2="78" y2="64" stroke="#d4a017" strokeWidth="2" opacity="0.6"/>
                  <rect x="53" y="61" width="14" height="6" fill="#c41e1e" opacity="0.5"/>
                  <path d="M 42 56 L 28 62 L 30 80 L 42 76" stroke="#d4a017" strokeWidth="2" fill="none"/>
                  <path d="M 78 56 L 92 62 L 90 80 L 78 76" stroke="#d4a017" strokeWidth="2" fill="none"/>
                </svg>
              </div>
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
