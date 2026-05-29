'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import type { Notificacion } from '@/types';

export default function NotificationBell() {
  const [count, setCount]   = useState(0);
  const [open, setOpen]     = useState(false);
  const [notifs, setNotifs] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const fetch = () =>
      api.get<{ count: number }>('/notificaciones/count', token)
        .then(r => setCount(r.count)).catch(() => {});
    fetch();
    const t = setInterval(fetch, 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  async function handleOpen() {
    if (open) { setOpen(false); return; }
    setOpen(true);
    setLoading(true);
    const token = localStorage.getItem('token') ?? '';
    try {
      const data = await api.get<Notificacion[]>('/notificaciones', token);
      setNotifs(data);
      if (data.some(n => !n.leida)) {
        await api.put('/notificaciones/leer-todas', {}, token).catch(() => {});
        setCount(0);
      }
    } catch { /**/ }
    finally { setLoading(false); }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative text-[#888888] hover:text-[#d4a017] transition-colors p-1"
        aria-label="Notificaciones"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-[#c41e1e] text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-2 w-80 bg-[#0f0f0f] border border-[#2a2a2a] shadow-2xl shadow-black/80 z-50"
          style={{ borderTop: '2px solid #c41e1e' }}
        >
          <div className="px-4 py-2.5 border-b border-[#1a1a1a] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-white">Notificaciones</span>
            {notifs.length > 0 && (
              <span className="text-[10px] text-[#555555]">{notifs.length} total</span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="text-xs text-[#555555] uppercase tracking-widest text-center py-6">Cargando...</p>
            ) : notifs.length === 0 ? (
              <p className="text-xs text-[#555555] uppercase tracking-widest text-center py-8">Sin notificaciones</p>
            ) : notifs.map(n => (
              <div
                key={n.id}
                className="px-4 py-3 border-b border-[#1a1a1a] last:border-0"
                style={{ backgroundColor: n.leida ? 'transparent' : '#111111' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#f0f0f0] mb-0.5">{n.titulo}</p>
                    <p className="text-[11px] text-[#888888] leading-relaxed">{n.mensaje}</p>
                    <p className="text-[10px] text-[#444444] mt-1 uppercase tracking-widest">
                      {new Date(n.creado_en).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  {!n.leida && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c41e1e] shrink-0 mt-1" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
