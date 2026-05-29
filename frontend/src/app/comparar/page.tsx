'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import {
  ARTES_SLUGS, ARTE_NOMBRES, ARTE_STATS, STATS_LABELS, ARTE_SUBTITULO,
  type ArteSlug,
} from '@/lib/arteData';
import { getMuscleSet } from '@/lib/muscleData';
import MuscleMapSkeleton from '@/components/skeletons/MuscleMapSkeleton';

const MuscleMap = dynamic(() => import('@/components/MuscleMap'), {
  ssr:     false,
  loading: () => <MuscleMapSkeleton size="sm" />,
});

// Colores de identificación (selectores y headers)
const COLOR_A      = '#4A90E2';
const COLOR_B      = '#52B788';
const COLOR_SHARED = '#6b6b6b';

// Stat bar doble
function StatBar({ label, valueA, valueB, nameA, nameB }: {
  label: string; valueA: number; valueB: number; nameA: string; nameB: string;
}) {
  const pctA = (valueA / 5) * 100;
  const pctB = (valueB / 5) * 100;
  const diff = valueA - valueB;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#888888] uppercase tracking-widest">{label}</span>
        <span className={`text-xs font-semibold ${
          diff > 0 ? '' : diff < 0 ? '' : 'text-[#555555]'
        }`} style={{ color: diff > 0 ? COLOR_A : diff < 0 ? COLOR_B : COLOR_SHARED }}>
          {diff > 0 ? `+${diff} ${nameA}` : diff < 0 ? `+${Math.abs(diff)} ${nameB}` : 'Igual'}
        </span>
      </div>
      {/* Barra A */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] w-4 shrink-0" style={{ color: COLOR_A }}>A</span>
        <div className="flex-1 h-2 bg-[#1a1a1a]">
          <div className="h-full transition-all duration-700"
            style={{ width: `${pctA}%`, background: COLOR_A, opacity: 0.85 }} />
        </div>
        <span className="text-[10px] text-[#555555] w-4 text-right">{valueA}</span>
      </div>
      {/* Barra B */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] w-4 shrink-0" style={{ color: COLOR_B }}>B</span>
        <div className="flex-1 h-2 bg-[#1a1a1a]">
          <div className="h-full transition-all duration-700"
            style={{ width: `${pctB}%`, background: COLOR_B, opacity: 0.85 }} />
        </div>
        <span className="text-[10px] text-[#555555] w-4 text-right">{valueB}</span>
      </div>
    </div>
  );
}

// Texto de diferencias
function DiffText({ aSlug, bSlug }: { aSlug: ArteSlug; bSlug: ArteSlug }) {
  const sa = ARTE_STATS[aSlug];
  const sb = ARTE_STATS[bSlug];
  const na = ARTE_NOMBRES[aSlug];
  const nb = ARTE_NOMBRES[bSlug];

  const lines = [
    sa.contacto !== sb.contacto &&
      `En contacto físico, ${sa.contacto > sb.contacto ? na : nb} es más intenso.`,
    sa.tecnica !== sb.tecnica &&
      `${sa.tecnica > sb.tecnica ? na : nb} tiene más profundidad técnica a largo plazo.`,
    sa.acondicionamiento !== sb.acondicionamiento &&
      `Para acondicionamiento físico general, ${sa.acondicionamiento > sb.acondicionamiento ? na : nb} es más exigente.`,
    sa.curvaAprendizaje !== sb.curvaAprendizaje &&
      `${sa.curvaAprendizaje > sb.curvaAprendizaje ? na : nb} tiene una curva de aprendizaje más larga — tarda más en sentirte competente.`,
    sa.calleUtilidad !== sb.calleUtilidad &&
      `En aplicación práctica real, ${sa.calleUtilidad > sb.calleUtilidad ? na : nb} da más herramientas directas.`,
  ].filter(Boolean) as string[];

  if (!lines.length) {
    return (
      <div className="card p-5">
        <p className="text-[11px] text-[#d4a017] uppercase tracking-widest font-semibold mb-2">Veredicto</p>
        <p className="text-sm text-[#888888]">
          {na} y {nb} tienen un perfil muy similar. La mejor elección depende de si prefieres pie o suelo, y del gimnasio que tengas cerca.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-5 space-y-3">
      <p className="text-[11px] text-[#d4a017] uppercase tracking-widest font-semibold">
        Si tuvieras que elegir uno
      </p>
      {lines.map((l, i) => (
        <p key={i} className="text-sm text-[#888888] leading-relaxed flex gap-2">
          <span className="text-[#333333] mt-1">→</span>
          {l}
        </p>
      ))}
    </div>
  );
}

// Tabla de diff muscular
function MuscleDiffTable({ aSlug, bSlug, nameA, nameB }: {
  aSlug: ArteSlug; bSlug: ArteSlug; nameA: string; nameB: string;
}) {
  const aSet    = getMuscleSet(aSlug);
  const bSet    = getMuscleSet(bSlug);
  const aOnly   = [...aSet].filter(m => !bSet.has(m));
  const bOnly   = [...bSet].filter(m => !aSet.has(m));
  const shared  = [...aSet].filter(m =>  bSet.has(m));

  function Pill({ m, color }: { m: string; color: string }) {
    return (
      <span
        className="inline-block text-[10px] px-2 py-0.5 border font-medium capitalize mr-1 mb-1"
        style={{ borderColor: `${color}40`, color, background: `${color}10` }}
      >
        {m.replace(/-/g, ' ')}
      </span>
    );
  }

  return (
    <div className="grid grid-cols-3 divide-x divide-[#2a2a2a] border border-[#2a2a2a] bg-[#111111]">
      {/* Solo A */}
      <div className="p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-3"
          style={{ color: COLOR_A }}>Solo {nameA}</p>
        <div>
          {aOnly.length > 0
            ? aOnly.map(m => <Pill key={m} m={m} color={COLOR_A} />)
            : <span className="text-[10px] text-[#333333]">—</span>
          }
        </div>
      </div>
      {/* Compartidos */}
      <div className="p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-3"
          style={{ color: COLOR_SHARED }}>Compartidos</p>
        <div>
          {shared.length > 0
            ? shared.map(m => <Pill key={m} m={m} color={COLOR_SHARED} />)
            : <span className="text-[10px] text-[#333333]">Ninguno</span>
          }
        </div>
      </div>
      {/* Solo B */}
      <div className="p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-3"
          style={{ color: COLOR_B }}>Solo {nameB}</p>
        <div>
          {bOnly.length > 0
            ? bOnly.map(m => <Pill key={m} m={m} color={COLOR_B} />)
            : <span className="text-[10px] text-[#333333]">—</span>
          }
        </div>
      </div>
    </div>
  );
}

// Selector
function ArteSelector({ value, onChange, exclude, accentColor, label }: {
  value: ArteSlug; onChange: (v: ArteSlug) => void;
  exclude: ArteSlug; accentColor: string; label: string;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-widest mb-2" style={{ color: COLOR_SHARED }}>
        {label}
      </p>
      <div className="border-l-4 pl-3" style={{ borderColor: accentColor }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value as ArteSlug)}
          className="input text-sm font-semibold uppercase tracking-widest bg-[#111111] border-[#2a2a2a] focus:border-[#d4a017] w-full"
          style={{ color: accentColor }}
        >
          {ARTES_SLUGS.filter(s => s !== exclude).map(s => (
            <option key={s} value={s} className="normal-case text-[#f0f0f0] bg-[#111111]">
              {ARTE_NOMBRES[s]}
            </option>
          ))}
        </select>
      </div>
      {ARTE_SUBTITULO[value] && (
        <p className="text-xs text-[#444444] mt-1.5 leading-relaxed italic">
          {ARTE_SUBTITULO[value]}
        </p>
      )}
    </div>
  );
}

// Página
export default function CompararPage() {
  const [arteA, setArteA] = useState<ArteSlug>('boxeo');
  const [arteB, setArteB] = useState<ArteSlug>('muay-thai');

  const nameA  = ARTE_NOMBRES[arteA];
  const nameB  = ARTE_NOMBRES[arteB];
  const statsA = ARTE_STATS[arteA];
  const statsB = ARTE_STATS[arteB];

  return (
    <div className="min-h-screen py-14">
      <div className="page-container max-w-5xl space-y-8">

        {/* Header */}
        <div>
          <p className="text-[11px] text-[#d4a017] uppercase tracking-widest font-semibold mb-2">
            Herramienta
          </p>
          <h1 className="font-display text-5xl lg:text-7xl text-white uppercase tracking-wide leading-none mb-3">
            Comparar
          </h1>
          <p className="text-[#888888] max-w-md">
            Dos artes. Un cuerpo. Descubre qué músculos trabaja cada uno y cuál encaja mejor contigo.
          </p>
        </div>

        {/* Selectores */}
        <div className="grid sm:grid-cols-2 gap-6 p-5 bg-[#111111] border border-[#2a2a2a]">
          <ArteSelector
            value={arteA} onChange={setArteA} exclude={arteB}
            accentColor={COLOR_A} label="Arte A"
          />
          <ArteSelector
            value={arteB} onChange={setArteB} exclude={arteA}
            accentColor={COLOR_B} label="Arte B"
          />
        </div>

        {/* Mapas musculares lado a lado */}
        <div>
          <div className="mb-3 flex items-center gap-3">
            <p className="text-[11px] text-[#d4a017] uppercase tracking-widest font-semibold">
              Mapa muscular
            </p>
            <span className="text-[10px] text-[#333333] uppercase tracking-widest">
              — músculos trabajados por cada arte
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Arte A */}
            <div
              className="bg-[#111111] border border-[#2a2a2a] p-5"
              style={{ borderTop: `3px solid ${COLOR_A}` }}
            >
              <p
                className="font-display text-2xl uppercase tracking-wide mb-1 leading-none"
                style={{ color: COLOR_A }}
              >
                {nameA}
              </p>
              <p className="text-[10px] text-[#444444] uppercase tracking-widest mb-4">Arte A</p>
              <MuscleMap artSlug={arteA} view="both" size="sm" />
            </div>

            {/* Arte B */}
            <div
              className="bg-[#111111] border border-[#2a2a2a] p-5"
              style={{ borderTop: `3px solid ${COLOR_B}` }}
            >
              <p
                className="font-display text-2xl uppercase tracking-wide mb-1 leading-none"
                style={{ color: COLOR_B }}
              >
                {nameB}
              </p>
              <p className="text-[10px] text-[#444444] uppercase tracking-widest mb-4">Arte B</p>
              <MuscleMap artSlug={arteB} view="both" size="sm" />
            </div>
          </div>

          {/* Diff table */}
          <div className="mt-4">
            <MuscleDiffTable
              aSlug={arteA} bSlug={arteB}
              nameA={nameA} nameB={nameB}
            />
          </div>
        </div>

        {/* Stats comparadas */}
        <div className="card p-6">
          <p className="text-[11px] text-[#d4a017] uppercase tracking-widest font-semibold mb-1">
            Perfil
          </p>
          <h2 className="font-display text-2xl text-white uppercase tracking-wide mb-2">
            Estadísticas comparadas
          </h2>

          {/* Leyenda */}
          <div className="flex items-center gap-5 text-xs mb-6">
            <span className="flex items-center gap-2">
              <span className="font-bold text-sm" style={{ color: COLOR_A }}>A</span>
              <span className="text-[#888888]">{nameA}</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="font-bold text-sm" style={{ color: COLOR_B }}>B</span>
              <span className="text-[#888888]">{nameB}</span>
            </span>
          </div>

          {statsA && statsB ? (
            <div className="space-y-6">
              {(Object.entries(STATS_LABELS) as [keyof typeof statsA, string][]).map(
                ([key, label]) => (
                  <StatBar
                    key={key}
                    label={label}
                    valueA={statsA[key]}
                    valueB={statsB[key]}
                    nameA={nameA}
                    nameB={nameB}
                  />
                )
              )}
            </div>
          ) : (
            <p className="text-sm text-[#444444]">Sin datos de estadísticas.</p>
          )}
        </div>

        {/* Texto de diferencias */}
        {statsA && statsB && <DiffText aSlug={arteA} bSlug={arteB} />}

        {/* CTAs */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div
            className="card p-5 text-center"
            style={{ borderTopColor: COLOR_A, borderTopWidth: 2 }}
          >
            <p
              className="font-display text-3xl uppercase tracking-wide mb-1 leading-none"
              style={{ color: COLOR_A }}
            >
              {nameA}
            </p>
            <p className="text-[10px] text-[#555555] uppercase tracking-widest mb-4">Arte A</p>
            <Link
              href={`/buscar?arte=${arteA}`}
              className="btn-primary w-full block text-center mb-2"
            >
              Gimnasios de {nameA} →
            </Link>
            <Link
              href={`/artes-marciales/${arteA}`}
              className="text-xs text-[#555555] hover:text-[#888888] block uppercase tracking-widest transition-colors"
            >
              Guía completa →
            </Link>
          </div>

          <div
            className="card p-5 text-center"
            style={{ borderTopColor: COLOR_B, borderTopWidth: 2 }}
          >
            <p
              className="font-display text-3xl uppercase tracking-wide mb-1 leading-none"
              style={{ color: COLOR_B }}
            >
              {nameB}
            </p>
            <p className="text-[10px] text-[#555555] uppercase tracking-widest mb-4">Arte B</p>
            <Link
              href={`/buscar?arte=${arteB}`}
              className="btn-secondary w-full block text-center mb-2"
            >
              Gimnasios de {nameB} →
            </Link>
            <Link
              href={`/artes-marciales/${arteB}`}
              className="text-xs text-[#555555] hover:text-[#888888] block uppercase tracking-widest transition-colors"
            >
              Guía completa →
            </Link>
          </div>
        </div>

        {/* Aún con dudas */}
        <div className="text-center border-t border-[#1a1a1a] pt-8">
          <p className="text-[#555555] text-sm mb-3">
            ¿Todavía no tienes claro cuál es el tuyo?
          </p>
          <Link href="/test" className="btn-secondary text-xs">
            Hacer el test de personalidad — 2 min →
          </Link>
        </div>

      </div>
    </div>
  );
}
