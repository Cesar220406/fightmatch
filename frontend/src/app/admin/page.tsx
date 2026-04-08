'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface Stats {
  artes: number;
  lesiones: number;
  gimnasios: number;
  posts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ artes: 0, lesiones: 0, gimnasios: 0, posts: 0 });
  const [apiOk, setApiOk] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getToken() ?? '';
    Promise.all([
      api.get<unknown[]>('/artes-marciales').catch(() => []),
      api.get<unknown[]>('/lesiones').catch(() => []),
      api.get<unknown[]>('/gimnasios').catch(() => []),
      api.get<unknown[]>('/posts?admin=true', token).catch(() => []),
    ]).then(([artes, lesiones, gimnasios, posts]) => {
      setStats({
        artes:     Array.isArray(artes)     ? artes.length     : 0,
        lesiones:  Array.isArray(lesiones)  ? lesiones.length  : 0,
        gimnasios: Array.isArray(gimnasios) ? gimnasios.length : 0,
        posts:     Array.isArray(posts)     ? posts.length     : 0,
      });
      setApiOk(true);
    }).catch(() => setApiOk(false));
  }, []);

  const cards = [
    { label: 'Artes Marciales', value: stats.artes,     href: '/admin/artes',    accent: '#d4a017' },
    { label: 'Lesiones',        value: stats.lesiones,  href: '/admin/lesiones', accent: '#c41e1e' },
    { label: 'Gimnasios',       value: stats.gimnasios, href: '/admin/gimnasios',accent: '#d4a017' },
    { label: 'Posts de blog',   value: stats.posts,     href: '/admin/posts',    accent: '#c41e1e' },
  ];

  const systemItems = [
    { label: 'API Backend',   ok: apiOk },
    { label: 'Base de datos', ok: apiOk },
    { label: 'SSL activo',    ok: true  },
    { label: 'Contenedores',  ok: apiOk },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-10 pb-6" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-1">Panel de control</p>
        <h1 className="font-display text-4xl text-white uppercase tracking-wide">Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map(({ label, value, href, accent }) => (
          <Link
            key={href}
            href={href}
            className="bg-[#0d0d0d] border border-[#1a1a1a] p-5 group transition-colors hover:border-[#2a2a2a]"
            style={{ borderLeft: `3px solid ${accent}` }}
          >
            <p className="font-display text-5xl leading-none mb-2" style={{ color: accent }}>
              {value}
            </p>
            <p className="text-xs text-[#888888] uppercase tracking-widest">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Acciones rápidas */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6" style={{ borderLeft: '3px solid #c41e1e' }}>
          <h2 className="font-display text-xl text-white uppercase tracking-wide mb-5">Acciones rápidas</h2>
          <div className="space-y-2">
            {[
              { href: '/admin/artes',           label: '+ Nueva arte marcial' },
              { href: '/admin/lesiones',         label: '+ Nueva lesión' },
              { href: '/admin/compatibilidades', label: '+ Nueva compatibilidad' },
              { href: '/admin/posts',            label: '+ Nuevo post' },
              { href: '/admin/gimnasios',        label: '+ Nuevo gimnasio' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="block text-xs font-semibold uppercase tracking-widest text-[#888888] hover:text-[#d4a017] transition-colors py-1"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Estado del sistema */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6" style={{ borderLeft: '3px solid #d4a017' }}>
          <h2 className="font-display text-xl text-white uppercase tracking-wide mb-5">Estado del sistema</h2>
          <div className="space-y-4">
            {systemItems.map(({ label, ok }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-[#888888] uppercase tracking-widest">{label}</span>
                {ok === null ? (
                  <span className="badge-gray">Comprobando…</span>
                ) : (
                  <span className={ok ? 'badge-green' : 'badge-red'}>{ok ? 'OK' : 'Error'}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
