'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

export default function FavoritoBtn({ gimnasioId }: { gimnasioId: string }) {
  const [favorito, setFavorito] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api.get<string[]>('/favoritos/ids', token)
      .then((ids) => setFavorito(ids.includes(gimnasioId)))
      .catch(() => {});
  }, [gimnasioId]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const token = getToken();
    if (!token) {
      window.location.href = '/auth/login';
      return;
    }
    setLoading(true);
    try {
      if (favorito) {
        await api.delete(`/favoritos/${gimnasioId}`, token);
        setFavorito(false);
        toast.success('Eliminado de favoritos');
      } else {
        await api.post('/favoritos', { gimnasio_id: gimnasioId }, token);
        setFavorito(true);
        toast.success('Guardado en favoritos');
      }
    } catch {
      toast.error('Error al actualizar favorito');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={favorito ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      className={`shrink-0 transition-all duration-200 hover:scale-110 active:scale-95 ${loading ? 'opacity-50' : ''}`}
      aria-label={favorito ? 'Quitar favorito' : 'Añadir favorito'}
    >
      <svg
        width="20" height="20" viewBox="0 0 24 24" fill={favorito ? '#d4a017' : 'none'}
        stroke={favorito ? '#d4a017' : '#444444'}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
}
