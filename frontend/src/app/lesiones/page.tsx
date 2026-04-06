export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { api } from '@/lib/api';
import type { Lesion } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Lesiones' };

const severidadColor: Record<string, string> = {
  leve: 'badge-green', moderada: 'badge-yellow', grave: 'badge-red',
};

export default async function LesionesPage() {
  const lesiones = await api.get<Lesion[]>('/lesiones').catch(() => [] as Lesion[]);

  const porZona = lesiones.reduce<Record<string, Lesion[]>>((acc, l) => {
    const z = l.zona_corporal ?? 'Otra';
    if (!acc[z]) acc[z] = [];
    acc[z].push(l);
    return acc;
  }, {});

  return (
    <div className="py-12">
      <div className="page-container">
        <div className="mb-10 max-w-2xl">
          <h1 className="text-4xl font-extrabold text-white mb-3">Lesiones</h1>
          <p className="text-gray-400">
            Consulta qué artes marciales son compatibles con tu lesión y cuáles están contraindicadas.
          </p>
        </div>

        <div className="space-y-10">
          {Object.entries(porZona).map(([zona, items]) => (
            <div key={zona}>
              <h2 className="text-lg font-semibold text-white capitalize mb-4 flex items-center gap-2">
                <span className="h-px flex-1 bg-gray-800" />
                {zona}
                <span className="h-px flex-1 bg-gray-800" />
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((l) => (
                  <Link
                    key={l.id}
                    href={`/lesiones/${l.slug}`}
                    className="card group flex flex-col gap-2 hover:border-gray-700"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-white leading-snug group-hover:text-brand-400 transition">
                        {l.nombre}
                      </h3>
                      <span className={`${severidadColor[l.severidad]} shrink-0`}>{l.severidad}</span>
                    </div>
                    {l.descripcion && (
                      <p className="text-xs text-gray-400 line-clamp-2">{l.descripcion}</p>
                    )}
                    <p className="text-xs text-brand-500 mt-auto">Ver artes marciales compatibles →</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
