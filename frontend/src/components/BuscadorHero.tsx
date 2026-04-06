'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Lesion } from '@/types';

export default function BuscadorHero({ lesiones }: { lesiones: Lesion[] }) {
  const router = useRouter();
  const [ciudad, setCiudad] = useState('');
  const [seleccionadas, setSeleccionadas] = useState<number[]>([]);

  function toggleLesion(id: number) {
    setSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  }

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (ciudad.trim()) params.set('ciudad', ciudad.trim());
    if (seleccionadas.length) params.set('lesion', seleccionadas.join(','));
    router.push(`/gimnasios?${params.toString()}`);
  }

  // Agrupar lesiones por zona corporal
  const porZona = lesiones.reduce<Record<string, Lesion[]>>((acc, l) => {
    const zona = l.zona_corporal ?? 'Otra';
    if (!acc[zona]) acc[zona] = [];
    acc[zona].push(l);
    return acc;
  }, {});

  return (
    <form onSubmit={buscar} className="space-y-6">
      {/* Ciudad */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          ¿En qué ciudad estás?
        </label>
        <input
          type="text"
          placeholder="Madrid, Barcelona, Valencia..."
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          className="input"
        />
      </div>

      {/* Lesiones */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          ¿Tienes alguna lesión? <span className="text-gray-500 font-normal">(opcional — selecciona todas las que apliquen)</span>
        </label>

        <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
          {Object.entries(porZona).map(([zona, items]) => (
            <div key={zona}>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{zona}</p>
              <div className="flex flex-wrap gap-2">
                {items.map((l) => {
                  const activa = seleccionadas.includes(l.id);
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => toggleLesion(l.id)}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition border ${
                        activa
                          ? 'bg-brand-600 border-brand-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      {l.nombre}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {seleccionadas.length > 0 && (
        <p className="text-xs text-brand-400">
          {seleccionadas.length} lesión{seleccionadas.length > 1 ? 'es' : ''} seleccionada{seleccionadas.length > 1 ? 's' : ''} — te mostraremos gimnasios con artes compatibles.
        </p>
      )}

      <button type="submit" className="btn-primary w-full py-3 text-base">
        Buscar gimnasios
      </button>
    </form>
  );
}
