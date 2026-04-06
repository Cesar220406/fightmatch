import BuscadorHero from '@/components/BuscadorHero';
import ArteCard from '@/components/ArteCard';
import { api } from '@/lib/api';
import type { Lesion, ArteMarcial } from '@/types';

async function getData() {
  const [lesiones, artes] = await Promise.all([
    api.get<Lesion[]>('/lesiones').catch(() => [] as Lesion[]),
    api.get<ArteMarcial[]>('/artes-marciales').catch(() => [] as ArteMarcial[]),
  ]);
  return { lesiones, artes };
}

export default async function Home() {
  const { lesiones, artes } = await getData();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-800 bg-gray-950">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 60% 50%, #c11313 0%, transparent 65%)',
          }}
        />
        <div className="page-container relative py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Texto */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-700 bg-brand-950/50 px-4 py-1.5 text-xs font-medium text-brand-300">
                Plataforma para deportistas con lesiones
              </div>
              <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight">
                Entrena sin{' '}
                <span className="text-brand-500">arriesgarte</span>
              </h1>
              <p className="text-lg text-gray-400 max-w-md">
                Encuentra el arte marcial y el gimnasio perfectos para ti,
                teniendo en cuenta tus <strong className="text-gray-200">lesiones</strong> y tu{' '}
                <strong className="text-gray-200">ubicación</strong>.
              </p>

              <div className="flex flex-wrap gap-6 pt-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="text-brand-500 font-bold text-lg">{artes.length}</span> artes marciales
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-brand-500 font-bold text-lg">{lesiones.length}</span> lesiones catalogadas
                </div>
              </div>
            </div>

            {/* Buscador */}
            <div className="card border-gray-700 shadow-2xl shadow-black/50">
              <h2 className="text-lg font-bold text-white mb-5">Encuentra tu gimnasio</h2>
              <BuscadorHero lesiones={lesiones} />
            </div>
          </div>
        </div>
      </section>

      {/* Artes marciales destacadas */}
      <section className="py-16">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">Artes Marciales</h2>
            <a href="/artes-marciales" className="text-sm text-brand-400 hover:text-brand-300 transition">
              Ver todas →
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {artes.slice(0, 4).map((arte) => (
              <ArteCard key={arte.id} arte={arte} />
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-16 border-t border-gray-800">
        <div className="page-container">
          <h2 className="section-title text-center mb-12">¿Cómo funciona?</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Indica tus lesiones',
                desc: 'Selecciona las zonas afectadas o lesiones concretas que tienes en este momento.',
              },
              {
                step: '02',
                title: 'Filtramos por compatibilidad',
                desc: 'Nuestro motor cruza tu perfil con las compatibilidades validadas por profesionales.',
              },
              {
                step: '03',
                title: 'Encuentra tu gimnasio',
                desc: 'Elige entre los gimnasios cercanos que ofrecen las artes marciales aptas para ti.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-900/50 text-brand-400 font-mono text-sm font-bold ring-1 ring-brand-700">
                  {step}
                </div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-sm text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
