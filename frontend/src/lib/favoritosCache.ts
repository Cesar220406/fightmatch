/**
 * Caché en memoria de los IDs de favoritos del usuario.
 * Evita N peticiones paralelas cuando hay múltiples GimnasioCard en pantalla.
 */
import { api } from './api';

let cache: Set<string> | null = null;
let promise: Promise<Set<string>> | null = null;

export async function getFavoritosIds(token: string): Promise<Set<string>> {
  if (cache !== null) return cache;
  if (promise !== null) return promise;

  promise = api.get<string[]>('/favoritos/ids', token).then((ids) => {
    cache = new Set(ids);
    promise = null;
    return cache;
  }).catch(() => {
    promise = null;
    cache = new Set();
    return cache;
  });

  return promise;
}

export function addFavorito(id: string) {
  cache?.add(id);
}

export function removeFavorito(id: string) {
  cache?.delete(id);
}

export function invalidateCache() {
  cache = null;
  promise = null;
}
