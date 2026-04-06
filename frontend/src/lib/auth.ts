import type { Usuario } from '@/types';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getUser(): Usuario | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function isAdmin(): boolean {
  return getUser()?.rol === 'admin';
}

export function isEditor(): boolean {
  const rol = getUser()?.rol;
  return rol === 'admin' || rol === 'editor';
}

export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
