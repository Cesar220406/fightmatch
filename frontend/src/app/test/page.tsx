'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import {
  PREGUNTAS, ARTES_INICIALES, ARTE_NOMBRES,
  type ArteSlug, type Opcion,
} from '@/lib/testQuestions';
import MuscleMapSkeleton from '@/components/skeletons/MuscleMapSkeleton';

// MuscleMap usa react-body-highlighter (ESM client-only)
const MuscleMap = dynamic(() => import('@/components/MuscleMap'), {
  ssr: false,
  loading: () => <MuscleMapSkeleton size="lg" />,
});

type Estado = 'test' | 'resultado';

function barra(actual: number, total: number) {
  return Math.round((actual / total) * 100);
}

export default function TestPage() {
  const [estado, setEstado]   = useState<Estado>('test');
  const [step, setStep]       = useState(0);
  const [scores, setScores]   = useState<Record<ArteSlug, number>>({ ...ARTES_INICIALES });
  const [resultado, setResult] = useState<ArteSlug | null>(null);
  const [alternativos, setAlt] = useState<ArteSlug[]>([]);

  function seleccionar(opcion: Opcion) {
    const nuevos = { ...scores };
    for (const [arte, peso] of Object.entries(opcion.pesos) as [ArteSlug, number][]) {
      nuevos[arte] = (nuevos[arte] ?? 0) + peso;
    }
    setScores(nuevos);

    if (step < PREGUNTAS.length - 1) {
      setStep(step + 1);
    } else {
      // Calcular resultado
      const ranking = (Object.entries(nuevos) as [ArteSlug, number][])
        .sort((a, b) => b[1] - a[1]);
      const ganador = ranking[0][0];
      const alt     = ranking.slice(1, 3).map(([s]) => s);
      setResult(ganador);
      setAlt(alt);
      // Guardar en localStorage para mostrarlo en el perfil
      if (typeof window !== 'undefined') {
        localStorage.setItem('fm_test_result', JSON.stringify({
          slug: ganador, ts: Date.now(), scores: nuevos,
        }));
      }
      setEstado('resultado');
    }
  }

  function reiniciar() {
    setEstado('test');
    setStep(0);
    setScores({ ...ARTES_INICIALES });
    setResult(null);
    setAlt([]);
  }

  const pregunta = PREGUNTAS[step];
  const porcentaje = barra(step, PREGUNTAS.length);

  if (estado === 'resultado' && resultado) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center py-16 px-4">
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(212,160,23,0.07) 0%, transparent 60%)' }}
        />
        <div className="w-full max-w-2xl relative z-10 space-y-6">

          <div className="card-gold p-8 text-center">
            <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-2">Tu arte marcial</p>
            <h1 className="font-display text-6xl text-white uppercase tracking-wide mb-2">
              {ARTE_NOMBRES[resultado]}
            </h1>
            <p className="text-sm text-[#888888] leading-relaxed max-w-sm mx-auto mb-6">
              Basado en tus respuestas, esta es la disciplina que mejor encaja con tu forma de ser y tu cuerpo.
            </p>

            {/* Mapa muscular del arte ganador */}
            <div className="bg-[#111111] border border-[#2a2a2a] p-5 mb-6">
              <p className="text-xs text-[#888888] uppercase tracking-widest mb-4">Músculos que trabajarás</p>
              <MuscleMap artSlug={resultado} view="both" size="lg" />
            </div>

            <div className="space-y-3">
              <Link href={`/buscar?arte=${resultado}`} className="btn-primary w-full py-3 block text-center">
                Quiero entrenar {ARTE_NOMBRES[resultado]} →
              </Link>
              <Link href={`/artes-marciales/${resultado}`} className="btn-secondary w-full py-3 block text-center">
                Saber más sobre {ARTE_NOMBRES[resultado]}
              </Link>
            </div>
          </div>

          {/* Alternativos */}
          {alternativos.length > 0 && (
            <div>
              <p className="text-xs text-[#888888] uppercase tracking-widest mb-3 text-center">También te podrían ir bien</p>
              <div className="grid grid-cols-2 gap-3">
                {alternativos.map(slug => (
                  <Link
                    key={slug}
                    href={`/artes-marciales/${slug}`}
                    className="card p-4 text-center group hover:border-[#d4a017]/40"
                  >
                    <p className="font-display text-xl text-white uppercase tracking-wide group-hover:text-[#d4a017] transition-colors">
                      {ARTE_NOMBRES[slug]}
                    </p>
                    <p className="text-xs text-[#555555] mt-1">Ver detalle →</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={reiniciar}
              className="text-xs text-[#444444] hover:text-[#888888] uppercase tracking-widest transition-colors"
            >
              ← Repetir el test
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-16 px-4">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(196,30,30,0.07) 0%, transparent 60%)' }}
      />
      <div className="w-full max-w-xl relative z-10">

        {/* Barra de progreso */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-[10px] text-[#444444] uppercase tracking-widest mb-2">
            <span>Pregunta {step + 1} de {PREGUNTAS.length}</span>
            <span>{porcentaje}%</span>
          </div>
          <div className="h-1 bg-[#1a1a1a] w-full">
            <div
              className="h-full bg-[#c41e1e] transition-all duration-500"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>

        {/* Pregunta — key para reiniciar animación en cada cambio */}
        <div key={step} className="card-gold p-8 animate-fade-in">
          <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-2">
            ¿Cuál es tu arte marcial ideal?
          </p>
          <h2 className="font-display text-3xl text-white uppercase tracking-wide mb-6">
            {pregunta.texto}
          </h2>

          <div className="space-y-3">
            {pregunta.opciones.map((opcion, i) => (
              <button
                key={i}
                onClick={() => seleccionar(opcion)}
                className="w-full text-left px-5 py-4 border border-[#2a2a2a] text-sm text-[#888888]
                  hover:border-[#d4a017] hover:text-white hover:bg-[#d4a017]/5
                  transition-all duration-150 group"
                style={{ borderRadius: 0 }}
              >
                <span className="text-[#444444] font-semibold mr-3 group-hover:text-[#d4a017]">
                  {String.fromCharCode(65 + i)}.
                </span>
                {opcion.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-[#333333] hover:text-[#555555] uppercase tracking-widest transition-colors">
            Salir del test
          </Link>
        </div>
      </div>
    </div>
  );
}
