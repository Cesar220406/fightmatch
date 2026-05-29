'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Link from 'next/link'

interface AnalyticsSummary {
  by_type:    { tipo: string; total: string }[]
  by_day:     { dia: string; total: string }[]
  top_artes:  { arte: string; total: string }[]
  top_cities: { ciudad: string; total: string }[]
}

/* Componentes de gráfica */

function BarRow({ label, value, max, color = '#d4a017' }: { label: string; value: number; max: number; color?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#888888] w-32 truncate shrink-0">{label}</span>
      <div className="flex-1 bg-[#111111] h-4 relative overflow-hidden">
        <div
          className="h-full"
          style={{ width: `${pct}%`, background: color, transition: 'width 0.7s ease' }}
        />
      </div>
      <span className="text-xs text-[#f0f0f0] w-8 text-right shrink-0">{value}</span>
    </div>
  )
}

function BarChart({ items, color }: { items: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <div className="space-y-2.5">
      {items.map((i) => (
        <BarRow key={i.label} label={i.label} value={i.value} max={max} color={color} />
      ))}
    </div>
  )
}

function LineChart({ days }: { days: { dia: string; total: number }[] }) {
  if (days.length < 2) {
    return (
      <p className="text-[#555555] text-sm py-4">
        Sin datos suficientes. Los eventos aparecerán aquí cuando los usuarios interactúen con la app.
      </p>
    )
  }
  const W = 500, H = 100, PAD = 12
  const max = Math.max(...days.map((d) => d.total), 1)
  const points = days.map((d, i) => {
    const x = PAD + (i / (days.length - 1)) * (W - PAD * 2)
    const y = H - PAD - (d.total / max) * (H - PAD * 2)
    return { x, y, ...d }
  })
  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 120 }}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={PAD} y1={H - PAD - f * (H - PAD * 2)}
            x2={W - PAD} y2={H - PAD - f * (H - PAD * 2)}
            stroke="#1a1a1a" strokeWidth="1"
          />
        ))}
        {/* Área bajo la curva */}
        <polyline
          points={`${points[0].x},${H - PAD} ${polyline} ${points[points.length - 1].x},${H - PAD}`}
          fill="#d4a01722" stroke="none"
        />
        {/* Línea */}
        <polyline points={polyline} fill="none" stroke="#d4a017" strokeWidth="2" strokeLinejoin="round" />
        {/* Puntos */}
        {points.map((p) => (
          <circle key={p.dia} cx={p.x} cy={p.y} r="3" fill="#d4a017" />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-[#555555] mt-1 px-3">
        <span>{days[0]?.dia?.slice(5)}</span>
        <span>{days[days.length - 1]?.dia?.slice(5)}</span>
      </div>
    </div>
  )
}

/* Página */

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get<AnalyticsSummary>('/events/summary')
      .then(setData)
      .catch(() => setError('No se pudieron cargar las estadísticas'))
      .finally(() => setLoading(false))
  }, [])

  const totalEvents = data?.by_type.reduce((s, t) => s + Number(t.total), 0) ?? 0
  const totalDays   = data?.by_day.length ?? 0

  return (
    <div className="py-14">
      <div className="page-container max-w-5xl">

        {/* Breadcrumb */}
        <nav className="text-xs text-[#888888] mb-6 flex items-center gap-2 uppercase tracking-widest font-semibold">
          <Link href="/" className="hover:text-[#d4a017] transition-colors">Inicio</Link>
          <span className="text-[#2a2a2a]">/</span>
          <span className="text-[#f0f0f0]">Analytics</span>
        </nav>

        <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-1">Admin</p>
        <h1 className="font-display text-4xl lg:text-5xl text-white uppercase tracking-wide mb-2">
          Analytics
        </h1>
        <p className="text-[#555555] text-sm mb-10">
          Últimos 30 días · {totalDays} días con actividad
        </p>

        {/* Estado de carga */}
        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse h-24 bg-[#111111] border border-[#2a2a2a]" />
            ))}
          </div>
        )}

        {error && (
          <div className="border border-[#c41e1e] bg-[#1a0000] p-4 text-[#c41e1e] text-sm mb-8">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {[
                { label: 'Eventos totales',   value: totalEvents },
                { label: 'Tipos distintos',   value: data.by_type.length },
                { label: 'Artes registradas', value: data.top_artes.length },
                { label: 'Ciudades buscadas', value: data.top_cities.length },
              ].map((kpi) => (
                <div key={kpi.label} className="card-gold p-5">
                  <p className="text-xs text-[#888888] uppercase tracking-widest mb-1">
                    {kpi.label}
                  </p>
                  <p className="font-display text-4xl text-[#d4a017]">
                    {kpi.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Gráfico de línea — eventos por día */}
            <div className="card-gold p-6 mb-6">
              <h2 className="font-display text-lg text-white uppercase tracking-wide mb-4">
                Eventos por día
              </h2>
              <LineChart
                days={data.by_day.map((d) => ({ dia: d.dia, total: Number(d.total) }))}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Top artes */}
              <div className="card-gold p-6">
                <h2 className="font-display text-lg text-white uppercase tracking-wide mb-4">
                  Artes más vistas
                </h2>
                {data.top_artes.length === 0 ? (
                  <p className="text-[#555555] text-sm">
                    Sin datos todavía. Se registran al visitar{' '}
                    <code className="text-xs bg-[#111] px-1">/artes-marciales/:slug</code>.
                  </p>
                ) : (
                  <BarChart
                    items={data.top_artes.map((a) => ({
                      label: a.arte,
                      value: Number(a.total),
                    }))}
                    color="#D85A30"
                  />
                )}
              </div>

              {/* Top ciudades */}
              <div className="card-gold p-6">
                <h2 className="font-display text-lg text-white uppercase tracking-wide mb-4">
                  Ciudades más buscadas
                </h2>
                {data.top_cities.length === 0 ? (
                  <p className="text-[#555555] text-sm">
                    Sin datos todavía. Se registran al buscar gimnasios con filtro de ciudad.
                  </p>
                ) : (
                  <BarChart
                    items={data.top_cities.map((c) => ({
                      label: c.ciudad,
                      value: Number(c.total),
                    }))}
                    color="#52B788"
                  />
                )}
              </div>
            </div>

            {/* Todos los tipos de evento */}
            <div className="card-gold p-6">
              <h2 className="font-display text-lg text-white uppercase tracking-wide mb-4">
                Todos los tipos de evento
              </h2>
              {data.by_type.length === 0 ? (
                <p className="text-[#555555] text-sm">Sin eventos registrados.</p>
              ) : (
                <BarChart
                  items={data.by_type.map((t) => ({
                    label: t.tipo,
                    value: Number(t.total),
                  }))}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
