export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import CompatibilidadTabla from '@/components/CompatibilidadTabla';
import type { Lesion } from '@/types';
import type { Metadata } from 'next';

async function getLesion(slug: string) {
  return api.get<Lesion>(`/lesiones/${slug}`).catch(() => null);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const l = await getLesion(params.slug);
  if (!l) return { title: 'Lesión no encontrada' };
  return { title: l.nombre, description: l.descripcion };
}

const severidadColor: Record<string, string> = {
  leve: 'badge-green', moderada: 'badge-yellow', grave: 'badge-red',
};
const severidadDesc: Record<string, string> = {
  leve:     'Lesión de baja gravedad. Con precaución puede seguir activo.',
  moderada: 'Lesión moderada. Requiere adaptación del entrenamiento.',
  grave:    'Lesión grave. Consulta con un especialista antes de entrenar.',
};

export default async function LesionDetallePage({ params }: { params: { slug: string } }) {
  const lesion = await getLesion(params.slug);
  if (!lesion) notFound();

  const compatibles   = lesion.artes_marciales?.filter(a => a.compatible).length ?? 0;
  const incompatibles = lesion.artes_marciales?.filter(a => !a.compatible).length ?? 0;

  return (
    <div className="py-14">
      <div className="page-container max-w-4xl">

        {/* Breadcrumb */}
        <nav className="text-xs text-[#888888] mb-8 flex items-center gap-2 uppercase tracking-widest font-semibold">
          <Link href="/lesiones" className="hover:text-[#d4a017] transition-colors">Lesiones</Link>
          <span className="text-[#2a2a2a]">/</span>
          <span className="text-[#f0f0f0]">{lesion.nombre}</span>
        </nav>

        {/* Hero card */}
        <div className="card mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-2">Lesión</p>
              <h1 className="font-display text-4xl lg:text-5xl text-white uppercase tracking-wide leading-none">
                {lesion.nombre}
              </h1>
            </div>
            <span className={`${severidadColor[lesion.severidad]} text-sm px-3 py-1`}>{lesion.severidad}</span>
          </div>

          {lesion.zona_corporal && (
            <p className="text-sm text-[#888888] mb-4">
              Zona afectada:{' '}
              <span className="text-[#d4a017] font-semibold capitalize">{lesion.zona_corporal}</span>
            </p>
          )}

          {lesion.descripcion && (
            <p className="text-[#888888] leading-relaxed mb-5">{lesion.descripcion}</p>
          )}

          <div
            className="border border-[#2a2a2a] bg-[#111111] px-4 py-3 text-sm text-[#888888]"
            style={{ borderLeft: '3px solid #d4a017' }}
          >
            {severidadDesc[lesion.severidad]}
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-6 pt-5 border-t border-[#2a2a2a]">
            <div>
              <p className="stat-number text-emerald-400">{compatibles}</p>
              <p className="text-xs text-[#888888] uppercase tracking-wider mt-1">Compatibles</p>
            </div>
            <div>
              <p className="stat-number text-[#c41e1e]">{incompatibles}</p>
              <p className="text-xs text-[#888888] uppercase tracking-wider mt-1">Contraindicadas</p>
            </div>
          </div>
        </div>

        {/* Tabla compatibilidades */}
        <div className="card mb-8">
          <h2 className="font-display text-2xl text-white uppercase tracking-wide mb-6">
            Artes marciales y compatibilidad
          </h2>
          <CompatibilidadTabla items={lesion.artes_marciales ?? []} modo="por-lesion" />
        </div>

        {/* CTA */}
        {compatibles > 0 && (
          <div className="card-gold text-center">
            <p className="text-white font-semibold mb-2 text-lg">
              ¿Quieres practicar un arte marcial compatible?
            </p>
            <p className="text-sm text-[#888888] mb-5">
              Te mostramos gimnasios cerca de ti con actividades aptas para tu lesión.
            </p>
            <Link href={`/gimnasios?lesion=${lesion.id}`} className="btn-primary inline-flex">
              Buscar gimnasios compatibles
            </Link>
          </div>
        )}

        {/* Volver */}
        <div className="mt-8 pt-6 border-t border-[#2a2a2a]">
          <Link href="/lesiones" className="btn-secondary">
            ← Volver a lesiones
          </Link>
        </div>
      </div>
    </div>
  );
}
