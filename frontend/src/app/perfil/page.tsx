'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { Usuario, Lesion, ArteMarcial, Gimnasio, Suscripcion, Pago } from '@/types';

type Tab = 'gimnasios' | 'suscripciones' | 'deportes' | 'lesiones' | 'recomendaciones';

const ESTADO_COLORS: Record<string,string> = {
  activa:'#52b788', pausada:'#d4a017', cancelada:'#c41e1e', vencida:'#555555',
};

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser]     = useState<Usuario | null>(null);
  const [tab, setTab]       = useState<Tab>('gimnasios');

  const [lesionesAll, setLesionesAll] = useState<Lesion[]>([]);
  const [artesAll, setArtesAll]       = useState<ArteMarcial[]>([]);
  const [favoritos, setFavoritos]     = useState<Gimnasio[]>([]);
  const [recomendaciones, setRecomendaciones] = useState<ArteMarcial[]>([]);
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([]);
  const [pagos, setPagos]   = useState<Pago[]>([]);
  const [lesionSel, setLesionSel] = useState<number[]>([]);
  const [arteSel, setArteSel]     = useState<number[]>([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    Promise.all([
      api.get<Usuario>('/usuarios/me', token),
      api.get<Lesion[]>('/lesiones'),
      api.get<ArteMarcial[]>('/artes-marciales'),
      api.get<Gimnasio[]>('/favoritos', token).catch(() => []),
    ]).then(([userData, lesData, artData, favData]) => {
      setUser(userData);
      setLesionesAll(lesData);
      setArtesAll(artData);
      setFavoritos(favData);
      setLesionSel(userData.lesiones?.map(l => l.id) ?? []);
      setArteSel((userData as unknown as { artes?: {id:number}[] }).artes?.map(a => a.id) ?? []);
    }).catch(() => { localStorage.removeItem('token'); router.push('/auth/login'); });
  }, [router]);

  useEffect(() => {
    if (tab !== 'recomendaciones') return;
    const token = localStorage.getItem('token') ?? '';
    api.get<ArteMarcial[]>('/usuarios/me/recomendaciones', token)
      .then(setRecomendaciones).catch(() => setRecomendaciones([]));
  }, [tab]);

  useEffect(() => {
    if (tab !== 'suscripciones') return;
    const token = localStorage.getItem('token') ?? '';
    if (suscripciones.length === 0) {
      api.get<Suscripcion[]>('/suscripciones/mias', token)
        .then(setSuscripciones).catch(() => {});
    }
    if (pagos.length === 0) {
      api.get<Pago[]>('/pagos', token)
        .then(setPagos).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function guardarLesiones() {
    setGuardando(true);
    try {
      await api.put('/usuarios/me/lesiones', { lesion_ids: lesionSel }, localStorage.getItem('token') ?? '');
      toast.success('Lesiones guardadas');
    } catch { toast.error('Error al guardar'); }
    finally { setGuardando(false); }
  }

  async function guardarArtes() {
    setGuardando(true);
    try {
      await api.put('/usuarios/me/artes', { arte_ids: arteSel }, localStorage.getItem('token') ?? '');
      toast.success('Deportes guardados');
    } catch { toast.error('Error al guardar'); }
    finally { setGuardando(false); }
  }

  async function quitarFavorito(gimnasioId: string) {
    try {
      await api.delete(`/favoritos/${gimnasioId}`, localStorage.getItem('token') ?? '');
      setFavoritos(prev => prev.filter(g => g.id !== gimnasioId));
      const { removeFavorito } = await import('@/lib/favoritosCache');
      removeFavorito(gimnasioId);
      toast.success('Gimnasio eliminado');
    } catch { toast.error('Error al eliminar'); }
  }

  async function cancelarSuscripcion(id: string) {
    if (!confirm('¿Cancelar esta suscripción?')) return;
    const token = localStorage.getItem('token') ?? '';
    try {
      await api.put(`/suscripciones/${id}`, { estado: 'cancelada' }, token);
      setSuscripciones(prev => prev.map(s => s.id === id ? { ...s, estado: 'cancelada' } : s));
      toast.success('Suscripción cancelada');
    } catch { toast.error('Error al cancelar'); }
  }

  async function pausarSuscripcion(id: string) {
    const token = localStorage.getItem('token') ?? '';
    try {
      await api.put(`/suscripciones/${id}`, { estado: 'pausada' }, token);
      setSuscripciones(prev => prev.map(s => s.id === id ? { ...s, estado: 'pausada' } : s));
      toast.success('Suscripción pausada');
    } catch { toast.error('Error'); }
  }

  function cerrarSesion() {
    localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/');
  }

  if (!user) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-xs text-[#888888] uppercase tracking-widest">Cargando...</p>
    </div>
  );

  if (user.rol === 'gimnasio') {
    router.replace('/perfil/gimnasio');
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-xs text-[#888888] uppercase tracking-widest">Redirigiendo...</p>
      </div>
    );
  }

  const porZonaLesiones = lesionesAll.reduce<Record<string, Lesion[]>>((acc, l) => {
    const z = l.zona_corporal ?? 'Otra';
    if (!acc[z]) acc[z] = [];
    acc[z].push(l); return acc;
  }, {});

  const susActivas = suscripciones.filter(s => s.estado === 'activa').length;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'gimnasios',       label: 'Mis gimnasios',    count: favoritos.length },
    { id: 'suscripciones',   label: 'Suscripciones',   count: susActivas || undefined },
    { id: 'deportes',        label: 'Mis deportes',     count: arteSel.length },
    { id: 'lesiones',        label: 'Mis lesiones',     count: lesionSel.length },
    { id: 'recomendaciones', label: 'Recomendaciones' },
  ];

  return (
    <div className="py-14">
      <div className="page-container max-w-4xl">

        <div className="flex items-center gap-5 mb-10 pb-8" style={{ borderBottom: '1px solid #2a2a2a' }}>
          <div className="h-16 w-16 bg-[#c41e1e] flex items-center justify-center font-display text-2xl text-white shrink-0">
            {user.nombre[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-3xl text-white uppercase tracking-wide">{user.nombre} {user.apellidos}</p>
            <p className="text-sm text-[#888888] mt-0.5">{user.email}</p>
            <span className="badge-red mt-2 inline-block">Deportista</span>
          </div>
          <div className="flex gap-2 shrink-0">
            {lesionSel.length > 0 && (
              <Link href={`/buscar?lesion=${lesionSel.join(',')}`} className="btn-primary text-xs py-2 px-4">Buscar para mí →</Link>
            )}
            <button onClick={cerrarSesion} className="btn-secondary text-xs py-2 px-4">Salir</button>
          </div>
        </div>

        <div className="flex gap-0 mb-8 overflow-x-auto" style={{ borderBottom: '1px solid #2a2a2a' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-xs font-semibold uppercase tracking-widest whitespace-nowrap transition-colors border-b-2 -mb-px flex items-center gap-2 ${
                tab === t.id ? 'border-[#c41e1e] text-white' : 'border-transparent text-[#555555] hover:text-[#888888]'
              }`}>
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className="text-[10px] bg-[#c41e1e] text-white px-1.5 py-0.5 font-bold leading-none">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Mis Gimnasios ── */}
        {tab === 'gimnasios' && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl text-white uppercase tracking-wide">Mis gimnasios</h2>
              <Link href="/gimnasios" className="text-xs text-[#d4a017] hover:text-[#e8b520] uppercase tracking-widest transition-colors">Explorar más →</Link>
            </div>
            {favoritos.length === 0 ? (
              <div className="py-16 text-center border border-[#2a2a2a]">
                <p className="text-sm text-[#666666] uppercase tracking-widest mb-1">Tu lista está vacía. Todavía no has encontrado el tuyo.</p>
                <p className="text-xs text-[#444444] mb-6">Guarda los que te interesen y los tendrás aquí de un vistazo.</p>
                <Link href="/gimnasios" className="btn-secondary text-xs">Explorar gimnasios</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {favoritos.map(g => (
                  <div key={g.id} className="flex items-center gap-4 p-4 border border-[#2a2a2a] bg-[#0d0d0d] transition-all">
                    {g.imagen_url ? (
                      <img src={g.imagen_url} alt={g.nombre} className="w-16 h-16 object-cover shrink-0" />
                    ) : (
                      <div className="w-16 h-16 bg-[#1a1a1a] shrink-0 flex items-center justify-center">
                        <svg viewBox="0 0 40 40" fill="none" stroke="#333" strokeWidth="1.5" className="w-8 h-8">
                          <rect x="6" y="14" width="28" height="20"/><path d="M4 14l16-10 16 10"/>
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#f0f0f0] truncate">{g.nombre}</p>
                      <p className="text-xs text-[#888888] mt-0.5">{g.ciudad}{g.provincia ? `, ${g.provincia}` : ''}</p>
                      {g.artes && g.artes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {g.artes.slice(0,3).map(a => <span key={a} className="badge-gold text-[10px] px-2 py-0.5">{a}</span>)}
                          {g.artes.length > 3 && <span className="text-[10px] text-[#555555]">+{g.artes.length - 3}</span>}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Link href={`/suscripcion/nueva/${g.slug}`} className="text-xs text-[#d4a017] uppercase tracking-widest hover:text-[#e8b520] transition-colors">
                        Suscribirse
                      </Link>
                      <Link href={`/gimnasios/${g.slug}`} className="text-xs text-[#888888] hover:text-[#d4a017] uppercase tracking-widest transition-colors">Ver</Link>
                      <button onClick={() => quitarFavorito(g.id)} className="text-xs text-[#555555] hover:text-red-400 transition-colors uppercase tracking-widest">Quitar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Suscripciones ── */}
        {tab === 'suscripciones' && (
          <section className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl text-white uppercase tracking-wide">Mis suscripciones</h2>
                <Link href="/suscripcion/planes" className="text-xs text-[#d4a017] uppercase tracking-widest hover:text-[#e8b520] transition-colors">Ver planes →</Link>
              </div>
              {suscripciones.length === 0 ? (
                <div className="py-12 text-center border border-[#2a2a2a]">
                  <p className="text-sm text-[#666666] uppercase tracking-widest mb-1">Sin suscripciones activas.</p>
                  <p className="text-xs text-[#444444] mb-6">Suscríbete a un gimnasio para ver el historial aquí.</p>
                  <Link href="/gimnasios" className="btn-secondary text-xs">Buscar gimnasios</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {suscripciones.map(s => (
                    <div key={s.id} className="p-5 border border-[#2a2a2a] bg-[#0d0d0d]"
                      style={{ borderLeft: `3px solid ${ESTADO_COLORS[s.estado] ?? '#555555'}` }}>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap mb-1">
                            <p className="font-display text-xl text-white uppercase tracking-wide">{s.gimnasio_nombre}</p>
                            <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5"
                              style={{ color: ESTADO_COLORS[s.estado], border: `1px solid ${ESTADO_COLORS[s.estado]}33` }}>
                              {s.estado}
                            </span>
                          </div>
                          <p className="text-xs text-[#d4a017] font-semibold uppercase tracking-widest mb-1">{s.plan_nombre}</p>
                          <p className="text-xs text-[#555555]">
                            {new Date(s.fecha_inicio).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' })}
                            {' → '}
                            {new Date(s.fecha_fin).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' })}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-display text-3xl text-[#d4a017]">{Number(s.precio_pagado).toFixed(2)}€</p>
                          <p className="text-xs text-[#555555]">al mes</p>
                          {s.estado === 'activa' && (
                            <div className="flex gap-2 mt-3 justify-end">
                              <button onClick={() => pausarSuscripcion(s.id)}
                                className="text-xs text-[#888888] hover:text-[#d4a017] uppercase tracking-widest transition-colors">
                                Pausar
                              </button>
                              <button onClick={() => cancelarSuscripcion(s.id)}
                                className="text-xs text-[#555555] hover:text-[#c41e1e] uppercase tracking-widest transition-colors">
                                Cancelar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {pagos.length > 0 && (
              <div>
                <h3 className="font-display text-xl text-white uppercase tracking-wide mb-4" style={{ borderBottom:'1px solid #2a2a2a', paddingBottom:'0.75rem' }}>
                  Historial de pagos
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom:'1px solid #2a2a2a' }}>
                        {['Gimnasio','Plan','Importe','Estado','Fecha'].map(h => (
                          <th key={h} className="text-left text-xs font-semibold uppercase tracking-widest text-[#555555] pb-3 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pagos.map(p => (
                        <tr key={p.id} style={{ borderBottom:'1px solid #1a1a1a' }}>
                          <td className="py-3 pr-4 text-[#f0f0f0]">{p.gimnasio_nombre}</td>
                          <td className="py-3 pr-4 text-[#888888]">{p.plan_nombre}</td>
                          <td className="py-3 pr-4 text-[#d4a017] font-semibold">{p.importe}€</td>
                          <td className="py-3 pr-4">
                            <span className="text-xs font-bold" style={{ color: p.estado === 'pagado' ? '#52b788' : p.estado === 'fallido' ? '#c41e1e' : '#d4a017' }}>
                              {p.estado}
                            </span>
                          </td>
                          <td className="py-3 text-[#555555] text-xs">
                            {new Date(p.fecha_pago).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Mis Deportes ── */}
        {tab === 'deportes' && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl text-white uppercase tracking-wide">Mis deportes</h2>
                <p className="text-xs text-[#888888] mt-1">Las artes marciales que practicas actualmente.</p>
              </div>
            </div>
            <div className="card space-y-6">
              <div className="flex flex-wrap gap-2">
                {artesAll.map(a => {
                  const activa = arteSel.includes(a.id);
                  return (
                    <button key={a.id}
                      onClick={() => setArteSel(prev => activa ? prev.filter(x => x !== a.id) : [...prev, a.id])}
                      className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all border ${
                        activa ? 'bg-[#d4a017] border-[#d4a017] text-black' : 'bg-transparent border-[#2a2a2a] text-[#666666] hover:border-[#d4a017] hover:text-[#d4a017]'
                      }`} style={{ borderRadius:0 }}>
                      {a.nombre}
                    </button>
                  );
                })}
              </div>
              <div className="pt-4 border-t border-[#2a2a2a]">
                <button onClick={guardarArtes} disabled={guardando} className="btn-primary">
                  {guardando ? 'Guardando...' : 'Guardar deportes'}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── Mis Lesiones ── */}
        {tab === 'lesiones' && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl text-white uppercase tracking-wide">Mis lesiones</h2>
                <p className="text-xs text-[#888888] mt-1">Selecciona las lesiones que tienes actualmente.</p>
              </div>
            </div>
            <div className="card space-y-6">
              {Object.entries(porZonaLesiones).map(([zona, items]) => (
                <div key={zona}>
                  <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-3">{zona}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.map(l => {
                      const activa = lesionSel.includes(l.id);
                      return (
                        <button key={l.id}
                          onClick={() => setLesionSel(prev => activa ? prev.filter(x => x !== l.id) : [...prev, l.id])}
                          className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all border ${
                            activa ? 'bg-[#c41e1e] border-[#c41e1e] text-white' : 'bg-transparent border-[#2a2a2a] text-[#888888] hover:border-[#d4a017] hover:text-[#d4a017]'
                          }`} style={{ borderRadius:0 }}>
                          {l.nombre}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-[#2a2a2a] flex items-center gap-4">
                <button onClick={guardarLesiones} disabled={guardando} className="btn-primary">
                  {guardando ? 'Guardando...' : 'Guardar lesiones'}
                </button>
                {lesionSel.length > 0 && (
                  <Link href={`/buscar?lesion=${lesionSel.join(',')}`} className="btn-secondary text-xs">
                    Ver opciones compatibles →
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Recomendaciones ── */}
        {tab === 'recomendaciones' && (
          <section>
            <div className="mb-6">
              <p className="text-xs text-[#c41e1e] uppercase tracking-widest font-semibold mb-1">Basado en tus lesiones</p>
              <h2 className="font-display text-2xl text-white uppercase tracking-wide">Recomendaciones para ti</h2>
            </div>
            {lesionSel.length === 0 ? (
              <div className="py-16 text-center border border-[#2a2a2a]">
                <p className="text-sm text-[#666666] uppercase tracking-widest mb-4">
                  Sin datos, sin filtro. Dinos qué te duele y te decimos qué aguanta.
                </p>
                <button onClick={() => setTab('lesiones')} className="btn-secondary text-xs">Añadir lesiones</button>
              </div>
            ) : recomendaciones.length === 0 ? (
              <div className="py-16 text-center border border-[#2a2a2a]">
                <p className="text-sm text-[#666666] uppercase tracking-widest mb-1">Lo practicas todo, o tu cuerpo aguanta más de lo que creías.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recomendaciones.map(a => (
                  <Link key={a.id} href={`/artes-marciales/${a.slug}`}
                    className="group p-5 border border-[#2a2a2a] bg-[#0d0d0d] hover:border-[#c41e1e]/50 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <p className="font-display text-lg text-white uppercase tracking-wide group-hover:text-[#d4a017] transition-colors">{a.nombre}</p>
                      <span className="badge-green text-[10px] shrink-0 ml-2">Compatible</span>
                    </div>
                    {a.descripcion && <p className="text-xs text-[#666666] leading-relaxed line-clamp-2">{a.descripcion}</p>}
                    <p className="mt-3 text-xs text-[#c41e1e] uppercase tracking-widest font-semibold">Ver más →</p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
