'use client';

import { Suspense } from 'react';
import MuscleMapSkeleton from './skeletons/MuscleMapSkeleton';
import { getMuscleData } from '@/lib/muscleData';

// react-body-highlighter exporta el componente como default (ESM)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Model = require('react-body-highlighter').default ?? require('react-body-highlighter');

interface Props {
  artSlug: string;
  view?:   'anterior' | 'posterior' | 'both';
  size?:   'sm' | 'md' | 'lg';
  /** Override de datos — útil para el comparador */
  overrideLayers?: Array<{ name: string; muscles: string[]; color: string }>;
}

const SCALE: Record<string, number> = { sm: 0.7, md: 1.1, lg: 1.6 };

function MuscleMapInner({ artSlug, view = 'both', size = 'md', overrideLayers }: Props) {
  const layers = overrideLayers
    ? overrideLayers.map(l => ({ label: l.name, muscles: l.muscles, color: l.color }))
    : getMuscleData(artSlug);

  // Fallback suave: si no hay datos, muestra cuerpo sin highlights con aviso
  if (!layers || layers.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <MuscleMapSkeleton size={size} />
        <p className="text-xs text-[#444444] uppercase tracking-widest">Sin datos musculares</p>
      </div>
    );
  }

  // Convertir MuscleLayer[] al formato que espera react-body-highlighter:
  //   data = [{ name, muscles }]  +  highlightedColors = [color, ...]
  const data              = layers.map(l => ({ name: l.label, muscles: l.muscles }));
  const highlightedColors = layers.map(l => l.color);
  const scale             = SCALE[size];

  const modelProps = { data, highlightedColors, scale };

  return (
    <div className="space-y-3">
      {/* Leyenda */}
      {!overrideLayers && (
        <div className="flex items-center gap-5 text-xs flex-wrap">
          {layers.map(l => (
            <span key={l.label} className="flex items-center gap-1.5">
              <span className="w-3 h-3 shrink-0 inline-block" style={{ background: l.color }} />
              <span className="text-[#888888] uppercase tracking-widest">{l.label}</span>
            </span>
          ))}
        </div>
      )}

      {/* Modelos SVG */}
      <div className={`flex justify-center flex-wrap ${view === 'both' ? 'gap-6' : ''}`}>
        {(view === 'anterior' || view === 'both') && (
          <div>
            <p className="text-[10px] text-[#444444] uppercase tracking-widest text-center mb-1">Anterior</p>
            <Model type="anterior" {...modelProps} />
          </div>
        )}
        {(view === 'posterior' || view === 'both') && (
          <div>
            <p className="text-[10px] text-[#444444] uppercase tracking-widest text-center mb-1">Posterior</p>
            <Model type="posterior" {...modelProps} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function MuscleMap(props: Props) {
  return (
    <Suspense fallback={<MuscleMapSkeleton size={props.size} />}>
      <MuscleMapInner {...props} />
    </Suspense>
  );
}
