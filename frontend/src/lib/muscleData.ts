/**
 * Datos musculares para react-body-highlighter v2.0.5.
 *
 * Slugs válidos confirmados (enum MuscleType):
 *   anterior: abs, obliques, biceps, chest, triceps, forearm, quadriceps,
 *             abductors, calves, head, neck, front-deltoids, left-soleus, right-soleus
 *   posterior: trapezius, upper-back, lower-back, gluteal, hamstring,
 *              back-deltoids, calves, forearm, head, neck, knees
 *
 * El array permite colores por capa — índice 0 → highlightedColors[0], etc.
 */

export interface MuscleLayer {
  label:   string;
  muscles: string[];
  color:   string;
}

export const MUSCLE_DATA: Record<string, MuscleLayer[]> = {
  boxeo: [
    { label: 'Primario',   muscles: ['front-deltoids', 'chest', 'triceps'], color: '#D85A30' },
    { label: 'Secundario', muscles: ['abs', 'obliques', 'trapezius', 'biceps', 'forearm', 'upper-back'], color: '#FAC775' },
  ],
  'muay-thai': [
    { label: 'Primario',   muscles: ['quadriceps', 'hamstring', 'calves', 'gluteal'], color: '#D85A30' },
    { label: 'Secundario', muscles: ['abs', 'obliques', 'front-deltoids', 'lower-back', 'abductors'], color: '#FAC775' },
  ],
  bjj: [
    { label: 'Primario',   muscles: ['abs', 'obliques', 'forearm', 'upper-back'], color: '#D85A30' },
    { label: 'Secundario', muscles: ['biceps', 'hamstring', 'gluteal', 'lower-back', 'quadriceps', 'neck'], color: '#FAC775' },
  ],
  judo: [
    { label: 'Primario',   muscles: ['trapezius', 'upper-back', 'forearm', 'gluteal'], color: '#D85A30' },
    { label: 'Secundario', muscles: ['abs', 'hamstring', 'biceps', 'lower-back', 'quadriceps', 'abductors'], color: '#FAC775' },
  ],
  wrestling: [
    { label: 'Primario',   muscles: ['trapezius', 'upper-back', 'gluteal', 'quadriceps'], color: '#D85A30' },
    { label: 'Secundario', muscles: ['front-deltoids', 'abs', 'hamstring', 'biceps', 'lower-back', 'neck'], color: '#FAC775' },
  ],
  mma: [
    { label: 'Primario',   muscles: ['abs', 'front-deltoids', 'quadriceps', 'upper-back', 'obliques'], color: '#D85A30' },
    { label: 'Secundario', muscles: ['chest', 'hamstring', 'gluteal', 'forearm', 'trapezius', 'calves'], color: '#FAC775' },
  ],
  karate: [
    { label: 'Primario',   muscles: ['quadriceps', 'front-deltoids', 'calves', 'abs'], color: '#D85A30' },
    { label: 'Secundario', muscles: ['gluteal', 'hamstring', 'chest', 'triceps', 'lower-back'], color: '#FAC775' },
  ],
  kickboxing: [
    { label: 'Primario',   muscles: ['quadriceps', 'front-deltoids', 'chest', 'calves', 'abs'], color: '#D85A30' },
    { label: 'Secundario', muscles: ['hamstring', 'gluteal', 'triceps', 'obliques', 'forearm'], color: '#FAC775' },
  ],
  taekwondo: [
    { label: 'Primario',   muscles: ['quadriceps', 'hamstring', 'calves', 'gluteal'], color: '#D85A30' },
    { label: 'Secundario', muscles: ['abs', 'obliques', 'lower-back', 'abductors', 'front-deltoids'], color: '#FAC775' },
  ],
  'kung-fu': [
    { label: 'Primario',   muscles: ['quadriceps', 'front-deltoids', 'calves', 'forearm'], color: '#D85A30' },
    { label: 'Secundario', muscles: ['abs', 'hamstring', 'chest', 'lower-back', 'gluteal'], color: '#FAC775' },
  ],
};

export function getMuscleData(slug: string): MuscleLayer[] {
  return MUSCLE_DATA[slug] ?? [];
}

export function hasMuscleData(slug: string): boolean {
  const layers = MUSCLE_DATA[slug];
  return !!layers && layers.some(l => l.muscles.length > 0);
}

/** Todos los slugs de músculos de una arte, aplanados en un Set. */
export function getMuscleSet(slug: string): Set<string> {
  return new Set(getMuscleData(slug).flatMap(l => l.muscles));
}
