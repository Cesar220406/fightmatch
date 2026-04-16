'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { Usuario, Lesion, ArteMarcial, Gimnasio } from '@/types';

type Tab = 'gimnasios' | 'deportes' | 'lesiones' | 'recomendaciones';

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser]           = useState<Usuario | null>(null);
  const [tab, setTab]             = useState<Tab>('gimnasios');

  // Data
  const [lesionesAll, setLesionesAll]   = useState<Lesion[]>([]);
  const [artesAll, setArtesAll]         = useState<ArteMarcial[]>([]);
  const [favoritos, setFavoritos]       = useState<Gimnasio[]>([]);
  const [recomendaciones, setRecomendaciones] = useState<ArteMarcial[]>([]);

  // Editable selections
  const [lesionSel, setLesionSel]   = useState<number[]>([]);
  const [arteSel, setArteSel]       = useState<number[]>([]);

  const [guardando, setGuardando]   = useState(false);

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

  // Load recommendations when tab changes to recomendaciones
  useEffect(() => {
    if (tab !== 'recomendaciones') return;
    const token = localStorage.getItem('token') ?? '';
    api.get<ArteMarcial[]>('/usuarios/me/recomendaciones', token)
      .then(setRecomendaciones).catch(() => setRecomendaciones([]));
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
      // Sync cache so FavoritoBtn reflects the change instantly
      const { removeFavorito } = await import('@/lib/favoritosCache');
      removeFavorito(gimnasioId);
      toast.success('Gimnasio eliminado de favoritos');
    } catch { toast.error('Error al eliminar'); }
  }

  function cerrarSesion() {
    localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/');
  }

  if (!user) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-xs text-[#888888] uppercase tracking-widest">Cargando...</p>
    </div>
  );

  // Redirect gym owners to their panel
  if (user.rol === 'gimnasio') {
    return (
      <div className="py-14">
        <div className="page-container max-w-2xl text-center">
          <p className="font-display text-5xl text-white uppercase mb-4">Tu panel</p>
          <p className="text-sm text-[#888888] mb-8">Como propietario de gimnasio tienes un panel dedicado.</p>
          <Link href="/perfil/gimnasio" className="btn-primary">Ir a mi gimnasio →</Link>
        </div>
      </div>
    );
  }

  const porZonaLesiones = lesionesAll.reduce<Record<string, Lesion[]>>((acc, l) => {
    const z = l.zona_corporal ?? 'Otra';
    if (!acc[z]) acc[z] = [];
    acc[z].push(l);
    return acc;
  }, {});

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'gimnasios',       label: 'Mis gimnasios',    count: favoritos.length },
    { id: 'deportes',        label: 'Mis deportes',     count: arteSel.length },
    { id: 'lesiones',        label: 'Mis lesiones',     count: lesionSel.length },
    { id: 'recomendaciones', label: 'Recomendaciones' },
  ];

  return (
    <div className="py-14">
      <div className="page-container max-w-4xl">

        {/* Header usuario */}
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
              <Link href={`/buscar?lesion=${lesionSel.join(',')}`} className="btn-primary text-xs py-2 px-4">
                Buscar para mí →
              </Link>
            )}
            <button onClick={cerrarSesion} className="btn-secondary text-xs py-2 px-4">Salir</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-8 overflow-x-auto" style={{ borderBottom: '1px solid #2a2a2a' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-xs font-semibold uppercase tracking-widest whitespace-nowrap transition-colors border-b-2 -mb-px flex items-center gap-2 ${
                tab === t.id ? 'border-[#c41e1e] text-white' : 'border-transparent text-[#555555] hover:text-[#888888]'
              }`}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className="text-[10px] bg-[#c41e1e] text-white px-1.5 py-0.5 font-bold leading-none">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── MIS GIMNASIOS ─────────────────────────────── */}
        {tab === 'gimnasios' && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl text-white uppercase tracking-wide">Mis gimnasios</h2>
              <Link href="/gimnasios" className="text-xs text-[#d4a017] hover:text-[#e8b520] uppercase tracking-widest transition-colors">
                Explorar más →
              </Link>
            </div>
            {favoritos.length === 0 ? (
              <div className="py-16 text-center border border-[#2a2a2a]">
                <p className="text-sm text-[#666666] uppercase tracking-widest mb-4">No tienes gimnasios guardados.</p>
                <Link href="/gimnasios" className="btn-secondary text-xs">Explorar gimnasios</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {favoritos.map(g => (
                  <div key={g.id} className="flex items-center gap-4 p-4 border border-[#2a2a2a] bg-[#0d0d0d] hover:border-[#2a2a2a]/80 transition-all">
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
                      {g.verificado && <span className="badge-green">V</span>}
                      {g.precio_desde && <span className="text-xs text-[#d4a017] font-semibold">{g.precio_desde}€</span>}
                      <Link href={`/gimnasios/${g.slug}`} className="text-xs text-[#888888] hover:text-[#d4a017] uppercase tracking-widest transition-colors">Ver</Link>
                      <button
                        onClick={() => quitarFavorito(g.id)}
                        className="text-xs text-[#555555] hover:text-red-400 transition-colors uppercase tracking-widest"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── MIS DEPORTES ──────────────────────────────── */}
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
                    <button
                      key={a.id}
                      onClick={() => setArteSel(prev => activa ? prev.filter(x => x !== a.id) : [...prev, a.id])}
                      className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all border ${
                        activa
                          ? 'bg-[#d4a017] border-[#d4a017] text-black'
                          : 'bg-transparent border-[#2a2a2a] text-[#666666] hover:border-[#d4a017] hover:text-[#d4a017]'
                      }`}
                      style={{ borderRadius: 0 }}
                    >
                      {a.nombre}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-[#555555] uppercase tracking-widest">
                {arteSel.length} deporte{arteSel.length !== 1 ? 's' : ''} seleccionado{arteSel.length !== 1 ? 's' : ''}
              </p>
              <div className="pt-4 border-t border-[#2a2a2a]">
                <button onClick={guardarArtes} disabled={guardando} className="btn-primary">
                  {guardando ? 'Guardando...' : 'Guardar deportes'}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── MIS LESIONES ──────────────────────────────── */}
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
                        <button
                          key={l.id}
                          onClick={() => setLesionSel(prev => activa ? prev.filter(x => x !== l.id) : [...prev, l.id])}
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

        {/* ── RECOMENDACIONES ───────────────────────────── */}
        {tab === 'recomendaciones' && (
          <section>
            <div className="mb-6">
              <p className="text-xs text-[#c41e1e] uppercase tracking-widest font-semibold mb-1">Basado en tus lesiones</p>
              <h2 className="font-display text-2xl text-white uppercase tracking-wide">Recomendaciones para ti</h2>
              <p className="text-xs text-[#888888] mt-1">Artes marciales compatibles con tus lesiones que aún no practicas.</p>
            </div>

            {lesionSel.length === 0 ? (
              <div className="py-16 text-center border border-[#2a2a2a]">
                <p className="text-sm text-[#666666] uppercase tracking-widest mb-4">
                  Primero añade tus lesiones en la pestaña "Mis lesiones".
                </p>
                <button onClick={() => setTab('lesiones')} className="btn-secondary text-xs">
                  Ir a mis lesiones
                </button>
              </div>
            ) : recomendaciones.length === 0 ? (
              <div className="py-16 text-center border border-[#2a2a2a]">
                <p className="text-sm text-[#666666] uppercase tracking-widest">
                  No hay artes marciales nuevas compatibles con todas tus lesiones,<br />o ya practicas todas las compatibles.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recomendaciones.map(a => (
                  <Link
                    key={a.id}
                    href={`/artes-marciales/${a.slug}`}
                    className="group p-5 border border-[#2a2a2a] bg-[#0d0d0d] hover:border-[#c41e1e]/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <p className="font-display text-lg text-white uppercase tracking-wide group-hover:text-[#d4a017] transition-colors">{a.nombre}</p>
                      <span className="badge-green text-[10px] shrink-0 ml-2">Compatible</span>
                    </div>
                    {a.descripcion && (
                      <p className="text-xs text-[#666666] leading-relaxed line-clamp-2">{a.descripcion}</p>
                    )}
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
