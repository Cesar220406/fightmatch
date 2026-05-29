export type ArteSlug = 'bjj' | 'boxeo' | 'muay-thai' | 'wrestling' | 'judo' | 'karate' | 'mma';

export const ARTE_NOMBRES: Record<ArteSlug, string> = {
  bjj:        'BJJ',
  boxeo:      'Boxeo',
  'muay-thai':'Muay Thai',
  wrestling:  'Wrestling',
  judo:       'Judo',
  karate:     'Karate',
  mma:        'MMA',
};

export interface Opcion {
  label: string;
  pesos: Partial<Record<ArteSlug, number>>;
}

export interface Pregunta {
  id:      number;
  texto:   string;
  opciones: Opcion[];
}

export const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Cuál es tu objetivo principal?',
    opciones: [
      { label: 'Defenderme si alguna vez lo necesito',
        pesos: { bjj: 2, karate: 1, mma: 1 } },
      { label: 'Competir y ganar',
        pesos: { mma: 2, boxeo: 2, bjj: 1, wrestling: 1 } },
      { label: 'Estar en forma y desconectar',
        pesos: { 'muay-thai': 2, karate: 1, boxeo: 1 } },
      { label: 'Disciplina mental y técnica pura',
        pesos: { judo: 2, karate: 2, bjj: 1 } },
    ],
  },
  {
    id: 2,
    texto: '¿Cómo describirías tu físico?',
    opciones: [
      { label: 'Explosivo — arranco fuerte, me agoto pronto',
        pesos: { boxeo: 2, 'muay-thai': 2, mma: 1 } },
      { label: 'Resistente — aguanto mucho rato',
        pesos: { bjj: 2, wrestling: 2, judo: 1 } },
      { label: 'Ágil y técnico',
        pesos: { karate: 2, mma: 1, judo: 1 } },
      { label: 'Fuerte y con masa',
        pesos: { wrestling: 3, judo: 2, bjj: 1 } },
    ],
  },
  {
    id: 3,
    texto: '¿Te incomoda el contacto muy cercano (cuerpo a cuerpo)?',
    opciones: [
      { label: 'Sí, prefiero distancia',
        pesos: { boxeo: 2, karate: 2 } },
      { label: 'Un poco, depende del contexto',
        pesos: { mma: 1, 'muay-thai': 1, karate: 1 } },
      { label: 'No me importa',
        pesos: { bjj: 2, wrestling: 2, judo: 2 } },
      { label: 'Me encanta — me motiva el cuerpo a cuerpo',
        pesos: { bjj: 3, wrestling: 3, judo: 1 } },
    ],
  },
  {
    id: 4,
    texto: '¿Tienes alguna lesión previa que condicione tu entrenamiento?',
    opciones: [
      { label: 'Rodillas — no puedo impactar mucho',
        pesos: { boxeo: 1, bjj: -1, wrestling: -1 } },
      { label: 'Hombros — no puedo forzar en palanca',
        pesos: { bjj: 1, karate: 1, 'muay-thai': -1 } },
      { label: 'Espalda — nada de carga ni torque fuerte',
        pesos: { boxeo: 1, karate: 1, wrestling: -1 } },
      { label: 'Sin lesiones — puedo entrenar al 100%',
        pesos: { bjj: 1, mma: 1, wrestling: 1, 'muay-thai': 1 } },
    ],
  },
  {
    id: 5,
    texto: '¿Cuánto tiempo tienes para entrenar a la semana?',
    opciones: [
      { label: '1-2 horas',
        pesos: { karate: 1, judo: 1 } },
      { label: '3-4 horas',
        pesos: { boxeo: 1, 'muay-thai': 1, karate: 1 } },
      { label: '5 horas o más',
        pesos: { bjj: 2, wrestling: 2, mma: 2 } },
      { label: 'Cuando puedo — sin horario fijo',
        pesos: { karate: 1, boxeo: 1 } },
    ],
  },
  {
    id: 6,
    texto: '¿Qué te motiva más de un arte marcial?',
    opciones: [
      { label: 'La técnica pura — cada detalle importa',
        pesos: { bjj: 2, judo: 2, karate: 1 } },
      { label: 'Los golpes — la potencia y la velocidad',
        pesos: { boxeo: 3, 'muay-thai': 3 } },
      { label: 'Combinarlo todo — golpes y suelo',
        pesos: { mma: 3, 'muay-thai': 1, bjj: 1 } },
      { label: 'El ground game — la lucha en el suelo',
        pesos: { bjj: 3, wrestling: 2, judo: 1 } },
    ],
  },
];

export const ARTES_INICIALES: Record<ArteSlug, number> = {
  bjj: 0, boxeo: 0, 'muay-thai': 0, wrestling: 0, judo: 0, karate: 0, mma: 0,
};
