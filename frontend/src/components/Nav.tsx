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
    // Escuchar cambios de storage (login/logout en otra pestaña)
    const handler = () => setUser(getUser());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [pathname]); // re-evalúa al cambiar de página

  function cerrarSesion() {
    logout();
    setUser(null);
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/90 backdrop-blur">
      <div className="page-container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-white text-xl">
          <span className="text-brand-500">Fight</span>Match
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition ${
                pathname.startsWith(href) ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
          {(user?.rol === 'admin' || user?.rol === 'editor') && (
            <Link
              href="/admin"
              className={`text-sm font-medium transition ${
                pathname.startsWith('/admin') ? 'text-brand-400' : 'text-gray-500 hover:text-brand-400'
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
              <Link href="/perfil" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition">
                <div className="h-7 w-7 rounded-full bg-brand-800 flex items-center justify-center text-xs font-bold text-white">
                  {user.nombre[0].toUpperCase()}
                </div>
                <span>{user.nombre}</span>
              </Link>
              <button onClick={cerrarSesion} className="btn-secondary py-1.5 px-3 text-xs">
                Salir
              </button>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="btn-secondary py-2 px-4 text-xs">Entrar</Link>
              <Link href="/auth/registro" className="btn-primary py-2 px-4 text-xs">Registrarse</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setOpen(!open)} aria-label="Menú">
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
        <div className="md:hidden border-t border-gray-800 bg-gray-950 px-4 py-4 space-y-3">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="block text-sm font-medium text-gray-300 hover:text-white">
              {label}
            </Link>
          ))}
          {(user?.rol === 'admin' || user?.rol === 'editor') && (
            <Link href="/admin" onClick={() => setOpen(false)} className="block text-sm text-brand-400">Admin</Link>
          )}
          <div className="flex gap-3 pt-2">
            {user ? (
              <>
                <Link href="/perfil" className="btn-secondary py-2 px-4 text-xs flex-1 text-center" onClick={() => setOpen(false)}>
                  Mi perfil
                </Link>
                <button onClick={() => { cerrarSesion(); setOpen(false); }} className="btn-secondary py-2 px-4 text-xs flex-1">
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn-secondary py-2 px-4 text-xs flex-1 text-center" onClick={() => setOpen(false)}>Entrar</Link>
                <Link href="/auth/registro" className="btn-primary py-2 px-4 text-xs flex-1 text-center" onClick={() => setOpen(false)}>Registrarse</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
