'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { getUser, logout } from '@/lib/auth';
import NotificationBell from '@/components/NotificationBell';
import type { Usuario } from '@/types';

const PRIMARY_LINKS = [
  { href: '/gimnasios',       label: 'Gimnasios' },
  { href: '/artes-marciales', label: 'Artes Marciales' },
  { href: '/noticias',        label: 'Noticias' },
  { href: '/test',            label: 'Test' },
];

const MORE_LINKS = [
  { href: '/lesiones',  label: 'Lesiones' },
  { href: '/comparar',  label: 'Comparar' },
  { href: '/blog',      label: 'Blog' },
];

export default function Nav() {
  const pathname  = usePathname();
  const router    = useRouter();
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
  const [user, setUser] = useState<Usuario | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getUser());
    const handler = () => setUser(getUser());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [pathname]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setMore(false);
    }
    if (more) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [more]);

  function cerrarSesion() { logout(); setUser(null); router.push('/'); }

  const moreActive = MORE_LINKS.some(({ href }) => pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#d4a017]/20">
      <div className="page-container flex h-16 items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display text-2xl tracking-widest text-white uppercase">
          <img src="/images/dragon.png" alt="" aria-hidden="true" className="shrink-0 h-6 w-auto" />
          <span className="text-[#c41e1e]">Fight</span>Match
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {PRIMARY_LINKS.map(({ href, label }) => (
            <Link key={href} href={href}
              className={`text-xs font-semibold uppercase tracking-widest transition-colors ${
                pathname.startsWith(href) ? 'text-[#d4a017]' : 'text-[#888888] hover:text-[#d4a017]'
              }`}>{label}</Link>
          ))}

          <div className="relative" ref={dropRef}>
            <button onClick={() => setMore(v => !v)}
              className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
                moreActive || more ? 'text-[#d4a017]' : 'text-[#888888] hover:text-[#d4a017]'
              }`}>
              Más
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                className={`transition-transform duration-200 ${more ? 'rotate-180' : ''}`}>
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {more && (
              <div className="absolute top-full right-0 mt-2 w-44 bg-[#0f0f0f] border border-[#2a2a2a] shadow-2xl shadow-black/80 py-1"
                style={{ borderTop: '2px solid #c41e1e' }}>
                {MORE_LINKS.map(({ href, label }) => (
                  <Link key={href} href={href} onClick={() => setMore(false)}
                    className={`block px-4 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
                      pathname.startsWith(href) ? 'text-[#d4a017] bg-[#1a1a1a]' : 'text-[#888888] hover:text-[#d4a017] hover:bg-[#1a1a1a]'
                    }`}>{label}</Link>
                ))}
              </div>
            )}
          </div>

          {(user?.rol === 'admin' || user?.rol === 'editor') && (
            <Link href="/admin"
              className={`text-xs font-semibold uppercase tracking-widest transition-colors ${
                pathname.startsWith('/admin') ? 'text-[#d4a017]' : 'text-[#888888] hover:text-[#d4a017]'
              }`}>Admin</Link>
          )}
        </nav>

        {/* Auth — desktop */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <NotificationBell />
              <Link href={user.rol === 'gimnasio' ? '/perfil/gimnasio' : '/perfil'}
                className="flex items-center gap-2 text-sm text-[#888888] hover:text-[#d4a017] transition-colors">
                <div className="h-7 w-7 bg-[#c41e1e] flex items-center justify-center text-xs font-bold text-white">
                  {user.nombre[0].toUpperCase()}
                </div>
                <span className="text-xs font-medium uppercase tracking-wider">{user.nombre}</span>
              </Link>
              <button onClick={cerrarSesion} className="btn-secondary py-1.5 px-3 text-xs">Salir</button>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="btn-ghost text-xs uppercase tracking-widest">Entrar</Link>
              <Link href="/auth/registro" className="btn-primary py-2 px-4 text-xs">Registrarse</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-[#888888] hover:text-[#d4a017] transition-colors"
          onClick={() => setOpen(!open)} aria-label="Menú">
          {open ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="nav-mobile-menu md:hidden border-t border-[#2a2a2a] bg-[#0a0a0a]/95 backdrop-blur-md px-4 py-5 space-y-4">
          {PRIMARY_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`block text-xs font-semibold uppercase tracking-widest transition-colors ${
                pathname.startsWith(href) ? 'text-[#d4a017]' : 'text-[#888888] hover:text-[#d4a017]'
              }`}>{label}</Link>
          ))}
          <div className="pt-1 border-t border-[#1a1a1a]">
            <p className="text-[10px] text-[#444444] uppercase tracking-widest mb-3 font-semibold">Más secciones</p>
            {MORE_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={`block text-xs font-semibold uppercase tracking-widest transition-colors mb-3 ${
                  pathname.startsWith(href) ? 'text-[#d4a017]' : 'text-[#888888] hover:text-[#d4a017]'
                }`}>{label}</Link>
            ))}
          </div>
          {(user?.rol === 'admin' || user?.rol === 'editor') && (
            <Link href="/admin" onClick={() => setOpen(false)}
              className="block text-xs font-semibold uppercase tracking-widest text-[#d4a017]">Admin</Link>
          )}
          <div className="flex gap-3 pt-3 border-t border-[#2a2a2a]">
            {user ? (
              <>
                <Link href={user?.rol === 'gimnasio' ? '/perfil/gimnasio' : '/perfil'}
                  className="btn-secondary py-2 px-4 text-xs flex-1 text-center" onClick={() => setOpen(false)}>
                  Mi perfil
                </Link>
                <button onClick={() => { cerrarSesion(); setOpen(false); }}
                  className="btn-secondary py-2 px-4 text-xs flex-1">Salir</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost py-2 px-4 text-xs flex-1 text-center"
                  onClick={() => setOpen(false)}>Entrar</Link>
                <Link href="/auth/registro" className="btn-primary py-2 px-4 text-xs flex-1 text-center"
                  onClick={() => setOpen(false)}>Registrarse</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
