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
        <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">
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
        <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-3">
          ¿Tienes alguna lesión?{' '}
          <span className="text-[#444444] font-normal normal-case tracking-normal">(opcional)</span>
        </label>

        <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
          {Object.entries(porZona).map(([zona, items]) => (
            <div key={zona}>
              <p className="text-xs text-[#d4a017] uppercase tracking-widest mb-2 font-semibold">{zona}</p>
              <div className="flex flex-wrap gap-2">
                {items.map((l) => {
                  const activa = seleccionadas.includes(l.id);
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => toggleLesion(l.id)}
                      className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all border ${
                        activa
                          ? 'bg-[#c41e1e] border-[#c41e1e] text-white'
                          : 'bg-transparent border-[#2a2a2a] text-[#888888] hover:border-[#d4a017] hover:text-[#d4a017]'
                      }`}
                      style={{ borderRadius: 0 }}
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
        <p className="text-xs text-[#d4a017] font-medium">
          ✓ {seleccionadas.length} lesión{seleccionadas.length > 1 ? 'es' : ''} seleccionada{seleccionadas.length > 1 ? 's' : ''}
        </p>
      )}

      <button type="submit" className="btn-primary w-full py-3 text-sm">
        Buscar gimnasios
      </button>
    </form>
  );
}
