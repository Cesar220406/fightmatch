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

      {/* Search button with claw/flame decorations */}
      <button type="submit" className="btn-primary w-full py-3 text-sm relative overflow-hidden group/btn">
        {/* Left claw */}
        <svg width="18" height="20" viewBox="0 0 18 20" fill="none" className="shrink-0 opacity-70 group-hover/btn:opacity-100 transition-opacity" aria-hidden="true">
          <path d="M 9 18 C 4 16 1 12 2 8 C 1 10 0 8 1 6 C 2 4 4 4 5 6 C 4 4 4 2 6 1 C 7 3 6 5 7 7 C 8 4 9 3 11 3 C 10 5 9 7 10 9 C 11 6 13 6 14 8 C 12 9 11 11 11 13 C 13 11 15 11 16 14 C 13 14 12 16 13 18 Z" fill="#d4a017"/>
          <path d="M 5 6 C 3 8 3 11 5 13" stroke="#c41e1e" strokeWidth="0.8" fill="none" opacity="0.8"/>
          <path d="M 8 4 C 7 7 8 10 10 12" stroke="#c41e1e" strokeWidth="0.8" fill="none" opacity="0.8"/>
        </svg>

        <span className="uppercase tracking-widest font-semibold">Buscar gimnasios</span>

        {/* Right claw (flipped) */}
        <svg width="18" height="20" viewBox="0 0 18 20" fill="none" className="shrink-0 opacity-70 group-hover/btn:opacity-100 transition-opacity scale-x-[-1]" aria-hidden="true">
          <path d="M 9 18 C 4 16 1 12 2 8 C 1 10 0 8 1 6 C 2 4 4 4 5 6 C 4 4 4 2 6 1 C 7 3 6 5 7 7 C 8 4 9 3 11 3 C 10 5 9 7 10 9 C 11 6 13 6 14 8 C 12 9 11 11 11 13 C 13 11 15 11 16 14 C 13 14 12 16 13 18 Z" fill="#d4a017"/>
          <path d="M 5 6 C 3 8 3 11 5 13" stroke="#c41e1e" strokeWidth="0.8" fill="none" opacity="0.8"/>
          <path d="M 8 4 C 7 7 8 10 10 12" stroke="#c41e1e" strokeWidth="0.8" fill="none" opacity="0.8"/>
        </svg>
      </button>
    </form>
  );
}
