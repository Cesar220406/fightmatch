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
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500">
        Cargando perfil...
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
    <div className="py-12">
      <div className="page-container max-w-3xl">
        <h1 className="text-3xl font-extrabold text-white mb-8">Mi Perfil</h1>

        {/* Info usuario */}
        <div className="card mb-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-brand-800 flex items-center justify-center text-2xl font-bold text-white">
              {user.nombre[0].toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{user.nombre} {user.apellidos}</p>
              <p className="text-sm text-gray-400">{user.email}</p>
              <span className="badge-gray mt-1">{rolLabel[user.rol] ?? user.rol}</span>
            </div>
            <button onClick={cerrarSesion} className="ml-auto btn-secondary text-xs py-2 px-3">
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Lesiones */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-2">Mis lesiones</h2>
          <p className="text-sm text-gray-400 mb-6">
            Selecciona las lesiones que tienes actualmente para recibir recomendaciones personalizadas.
          </p>

          <div className="space-y-5">
            {Object.entries(porZona).map(([zona, items]) => (
              <div key={zona}>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{zona}</p>
                <div className="flex flex-wrap gap-2">
                  {items.map((l) => {
                    const activa = seleccionadas.includes(l.id);
                    return (
                      <button
                        key={l.id}
                        onClick={() => toggleLesion(l.id)}
                        className={`rounded-full px-3 py-1.5 text-sm font-medium transition border ${
                          activa
                            ? 'bg-brand-600 border-brand-500 text-white'
                            : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                        }`}
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
            <p className={`mt-4 text-sm ${mensaje.includes('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
              {mensaje}
            </p>
          )}

          <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-800">
            <button onClick={guardarLesiones} disabled={guardando} className="btn-primary">
              {guardando ? 'Guardando...' : 'Guardar lesiones'}
            </button>
            {seleccionadas.length > 0 && (
              <a
                href={`/gimnasios?lesion=${seleccionadas.join(',')}`}
                className="btn-secondary"
              >
                Buscar gimnasios compatibles
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
