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
    <div className="py-12">
      <div className="page-container max-w-4xl">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/lesiones" className="hover:text-white transition">Lesiones</Link>
          <span>/</span>
          <span className="text-gray-300">{lesion.nombre}</span>
        </nav>

        {/* Hero */}
        <div className="card mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <h1 className="text-3xl font-extrabold text-white">{lesion.nombre}</h1>
            <span className={`${severidadColor[lesion.severidad]} text-sm px-3 py-1`}>{lesion.severidad}</span>
          </div>

          {lesion.zona_corporal && (
            <p className="text-sm text-gray-400 mb-3">
              Zona afectada: <span className="text-white font-medium capitalize">{lesion.zona_corporal}</span>
            </p>
          )}

          {lesion.descripcion && (
            <p className="text-gray-300 leading-relaxed mb-4">{lesion.descripcion}</p>
          )}

          <div className="rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3 text-sm text-gray-300">
            {severidadDesc[lesion.severidad]}
          </div>

          <div className="flex gap-6 mt-5 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">{compatibles}</p>
              <p className="text-gray-500">compatibles</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{incompatibles}</p>
              <p className="text-gray-500">contraindicadas</p>
            </div>
          </div>
        </div>

        {/* Tabla compatibilidades */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Artes marciales y compatibilidad</h2>
          <CompatibilidadTabla
            items={lesion.artes_marciales ?? []}
            modo="por-lesion"
          />
        </div>

        {/* CTA buscar gimnasios */}
        {compatibles > 0 && (
          <div className="card border-brand-800 bg-brand-950/30 text-center">
            <p className="text-white font-semibold mb-2">
              ¿Quieres practicar un arte marcial compatible?
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Te mostramos gimnasios cerca de ti con actividades aptas para tu lesión.
            </p>
            <Link
              href={`/gimnasios?lesion=${lesion.id}`}
              className="btn-primary inline-flex"
            >
              Buscar gimnasios compatibles
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
