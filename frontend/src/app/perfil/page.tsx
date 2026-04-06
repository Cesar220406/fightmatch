'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Usuario, Lesion } from '@/types';

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<Usuario | null>(null);
  const [lesionesAll, setLesionesAll] = useState<Lesion[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<number[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }

    Promise.all([
      api.get<Usuario>('/usuarios/me', token),
      api.get<Lesion[]>('/lesiones'),
    ]).then(([userData, lesionesData]) => {
      setUser(userData);
      setLesionesAll(lesionesData);
      setSeleccionadas(userData.lesiones?.map((l) => l.id) ?? []);
    }).catch(() => {
      localStorage.removeItem('token');
      router.push('/auth/login');
    });
  }, [router]);

  function toggleLesion(id: number) {
    setSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  }

  async function guardarLesiones() {
    const token = localStorage.getItem('token') ?? '';
    setGuardando(true);
    setMensaje('');
    try {
      await api.put('/usuarios/me/lesiones', { lesion_ids: seleccionadas }, token);
      setMensaje('Lesiones actualizadas correctamente.');
    } catch {
      setMensaje('Error al guardar. Inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-4xl text-[#2a2a2a] uppercase mb-2">Cargando</p>
          <p className="text-xs text-[#888888] uppercase tracking-widest">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  const porZona = lesionesAll.reduce<Record<string, Lesion[]>>((acc, l) => {
    const zona = l.zona_corporal ?? 'Otra';
    if (!acc[zona]) acc[zona] = [];
    acc[zona].push(l);
    return acc;
  }, {});

  const rolLabel: Record<string, string> = {
    admin: 'Administrador', gimnasio: 'Gimnasio', cliente: 'Cliente', editor: 'Editor',
  };

  return (
    <div className="py-14">
      <div className="page-container max-w-3xl">

        <div className="mb-10">
          <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-2">Cuenta</p>
          <h1 className="font-display text-5xl text-white uppercase tracking-wide">Mi Perfil</h1>
        </div>

        {/* Info usuario */}
        <div className="card mb-8">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 bg-[#c41e1e] flex items-center justify-center text-2xl font-bold text-white shrink-0">
              {user.nombre[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-2xl text-white uppercase tracking-wide">
                {user.nombre} {user.apellidos}
              </p>
              <p className="text-sm text-[#888888] mt-0.5">{user.email}</p>
              <span className="badge-gold mt-2 inline-block">{rolLabel[user.rol] ?? user.rol}</span>
            </div>
            <button onClick={cerrarSesion} className="btn-secondary text-xs py-2 px-4 shrink-0">
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Lesiones */}
        <div className="card">
          <h2 className="font-display text-2xl text-white uppercase tracking-wide mb-2">Mis lesiones</h2>
          <p className="text-sm text-[#888888] mb-8 leading-relaxed">
            Selecciona las lesiones que tienes actualmente para recibir recomendaciones personalizadas.
          </p>

          <div className="space-y-6">
            {Object.entries(porZona).map(([zona, items]) => (
              <div key={zona}>
                <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-3">{zona}</p>
                <div className="flex flex-wrap gap-2">
                  {items.map((l) => {
                    const activa = seleccionadas.includes(l.id);
                    return (
                      <button
                        key={l.id}
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

          {mensaje && (
            <p className={`mt-5 text-sm font-medium ${mensaje.includes('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
              {mensaje}
            </p>
          )}

          <div className="flex items-center gap-4 mt-8 pt-5 border-t border-[#2a2a2a]">
            <button onClick={guardarLesiones} disabled={guardando} className="btn-primary">
              {guardando ? 'Guardando...' : 'Guardar lesiones'}
            </button>
            {seleccionadas.length > 0 && (
              <a href={`/gimnasios?lesion=${seleccionadas.join(',')}`} className="btn-secondary">
                Buscar gimnasios compatibles
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
