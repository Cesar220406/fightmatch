'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUser, logout } from '@/lib/auth';
import type { Usuario } from '@/types';

const links = [
  { href: '/gimnasios',       label: 'Gimnasios' },
  { href: '/artes-marciales', label: 'Artes Marciales' },
  { href: '/lesiones',        label: 'Lesiones' },
  { href: '/blog',            label: 'Blog' },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    setUser(getUser());
    const handler = () => setUser(getUser());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [pathname]);

  function cerrarSesion() {
    logout();
    setUser(null);
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-[#d4a017]/20">
      <div className="page-container flex h-16 items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display text-2xl tracking-widest text-white uppercase">
          {/* Mini dragon seal */}
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true" className="shrink-0">
            {/* Body */}
            <path d="M 18 20 C 15 17 11 15 9 12 C 7 9 8 6 10 4 C 8 5 6 7 6 10 C 5 8 5 5 7 3 C 9 1 12 1 14 3 C 12 2 10 3 9 5 C 11 3 14 3 16 5 C 18 7 18 10 16 12 C 18 10 19 13 18 16 Z"
              fill="#6b7280" opacity="0.9"/>
            {/* Flame */}
            <path d="M 8 12 C 6 10 5 7 7 5 C 5 7 4 6 5 4 C 6 3 8 3 9 5 C 8 4 7 5 7 7 C 8 5 9 5 10 7 Z"
              fill="#c41e1e" opacity="0.9"/>
            {/* Eye */}
            <circle cx="14" cy="4" r="1.5" fill="#c41e1e"/>
            <circle cx="14.5" cy="3.5" r="0.5" fill="white" opacity="0.9"/>
            {/* Whisker */}
            <line x1="15" y1="5" x2="21" y2="3" stroke="#d4a017" strokeWidth="0.8" strokeLinecap="round"/>
            <line x1="15" y1="6" x2="21" y2="6" stroke="#d4a017" strokeWidth="0.8" strokeLinecap="round"/>
            {/* Claw */}
            <path d="M 10 19 C 8 20 7 21 8 22 C 7 21 6 20 7 19 C 6 20 5 21 6 22" stroke="#d4a017" strokeWidth="0.8" strokeLinecap="round"/>
          </svg>
          <span className="text-[#c41e1e]">Fight</span>Match
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-xs font-semibold uppercase tracking-widest transition-colors ${
                pathname.startsWith(href)
                  ? 'text-[#d4a017]'
                  : 'text-[#888888] hover:text-[#d4a017]'
              }`}
            >
              {label}
            </Link>
          ))}
          {(user?.rol === 'admin' || user?.rol === 'editor') && (
            <Link
              href="/admin"
              className={`text-xs font-semibold uppercase tracking-widest transition-colors ${
                pathname.startsWith('/admin')
                  ? 'text-[#d4a017]'
                  : 'text-[#888888] hover:text-[#d4a017]'
              }`}
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Auth — desktop */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/perfil" className="flex items-center gap-2 text-sm text-[#888888] hover:text-[#d4a017] transition-colors">
                <div className="h-7 w-7 bg-[#c41e1e] flex items-center justify-center text-xs font-bold text-white">
                  {user.nombre[0].toUpperCase()}
                </div>
                <span className="text-xs font-medium uppercase tracking-wider">{user.nombre}</span>
              </Link>
              <button onClick={cerrarSesion} className="btn-secondary py-1.5 px-3 text-xs">
                Salir
              </button>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="btn-ghost text-xs uppercase tracking-widest">Entrar</Link>
              <Link href="/auth/registro" className="btn-primary py-2 px-4 text-xs">Registrarse</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-[#888888] hover:text-[#d4a017] transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
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
        <div className="md:hidden border-t border-[#2a2a2a] bg-[#0a0a0a] px-4 py-5 space-y-4">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`block text-xs font-semibold uppercase tracking-widest transition-colors ${
                pathname.startsWith(href) ? 'text-[#d4a017]' : 'text-[#888888] hover:text-[#d4a017]'
              }`}
            >
              {label}
            </Link>
          ))}
          {(user?.rol === 'admin' || user?.rol === 'editor') && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="block text-xs font-semibold uppercase tracking-widest text-[#d4a017]"
            >
              Admin
            </Link>
          )}
          <div className="flex gap-3 pt-3 border-t border-[#2a2a2a]">
            {user ? (
              <>
                <Link
                  href="/perfil"
                  className="btn-secondary py-2 px-4 text-xs flex-1 text-center"
                  onClick={() => setOpen(false)}
                >
                  Mi perfil
                </Link>
                <button
                  onClick={() => { cerrarSesion(); setOpen(false); }}
                  className="btn-secondary py-2 px-4 text-xs flex-1"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="btn-ghost py-2 px-4 text-xs flex-1 text-center"
                  onClick={() => setOpen(false)}
                >
                  Entrar
                </Link>
                <Link
                  href="/auth/registro"
                  className="btn-primary py-2 px-4 text-xs flex-1 text-center"
                  onClick={() => setOpen(false)}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
