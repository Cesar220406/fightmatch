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
    <div className="py-14">
      <div className="page-container">

        <div className="mb-12">
          <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-2">Guía de lesiones</p>
          <h1 className="font-display text-5xl lg:text-7xl text-white uppercase tracking-wide mb-4">
            Lesiones
          </h1>
          <p className="text-[#888888] max-w-xl leading-relaxed">
            Consulta qué artes marciales son compatibles con tu lesión y cuáles están contraindicadas.
          </p>
        </div>

        <div className="space-y-12">
          {Object.entries(porZona).map(([zona, items]) => (
            <div key={zona}>
              {/* Zone header */}
              <div className="flex items-center gap-4 mb-6">
                <h2 className="font-display text-2xl text-[#d4a017] uppercase tracking-widest whitespace-nowrap">
                  {zona}
                </h2>
                <div className="flex-1 h-px bg-[#2a2a2a]" />
                <span className="text-xs text-[#888888] uppercase tracking-widest">{items.length}</span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((l) => (
                  <Link
                    key={l.id}
                    href={`/lesiones/${l.slug}`}
                    className="card group flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-[#f0f0f0] leading-snug group-hover:text-[#d4a017] transition-colors">
                        {l.nombre}
                      </h3>
                      <span className={`${severidadColor[l.severidad]} shrink-0`}>{l.severidad}</span>
                    </div>
                    {l.descripcion && (
                      <p className="text-xs text-[#888888] line-clamp-2 leading-relaxed">{l.descripcion}</p>
                    )}
                    <p className="text-xs text-[#c41e1e] mt-auto pt-1 font-semibold uppercase tracking-wider">
                      Ver compatibilidades →
                    </p>
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
