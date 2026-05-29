'use client';

import { useCallback } from 'react';
import { api } from '@/lib/api';

/**
 * Hook fire-and-forget para registrar interacciones en la tabla `events`.
 * No bloquea, no lanza errores al caller, no provoca re-renders.
 *
 * Uso:
 *   const track = useTrackInteraction()
 *   track('arte_view', { slug: 'bjj' })
 *   track('buscar_submit', { ciudad: 'Madrid', lesiones: [1, 3] })
 */
export function useTrackInteraction() {
  return useCallback((tipo: string, payload?: Record<string, unknown>) => {
    api.post('/events', { tipo, payload: payload ?? {} }).catch(() => {
      // Silencio — el tracking nunca debe afectar la UX
    });
  }, []);
}
