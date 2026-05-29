export const CIUDADES = ['madrid', 'barcelona', 'valencia', 'sevilla', 'bilbao'] as const;
export const ARTES_VALIDAS = ['boxeo', 'muay-thai', 'bjj', 'judo', 'karate', 'mma', 'taekwondo'] as const;

export type Ciudad = typeof CIUDADES[number];
export type ArteValido = typeof ARTES_VALIDAS[number];

export const CIUDAD_NOMBRES: Record<Ciudad, string> = {
  madrid:    'Madrid',
  barcelona: 'Barcelona',
  valencia:  'Valencia',
  sevilla:   'Sevilla',
  bilbao:    'Bilbao',
};

export const ARTE_NOMBRES_SEO: Record<ArteValido, string> = {
  boxeo:      'Boxeo',
  'muay-thai':'Muay Thai',
  bjj:        'BJJ (Jiu-Jitsu Brasileño)',
  judo:       'Judo',
  karate:     'Karate',
  mma:        'MMA',
  taekwondo:  'Taekwondo',
};

// Textos editoriales con voz humana — 35 combinaciones ciudad×arte
const TEXTOS: Partial<Record<Ciudad, Partial<Record<ArteValido, string>>>> = {
  madrid: {
    boxeo: 'Madrid tiene una escena de boxeo más seria de lo que parece. Desde los gimnasios del centro hasta los polideportivos del sur, hay opciones para principiantes y para quienes llevan años pegando sacos. Si buscas sparring real y no solo cardio, aquí lo encuentras.',
    'muay-thai': 'El Muay Thai llegó a Madrid antes que a la mayoría de ciudades españolas. Hoy hay academias con instructores tailandeses y combatientes que compiten a nivel europeo. La competencia entre gimnasios es alta, lo que se traduce en calidad de enseñanza.',
    bjj: 'El BJJ en Madrid creció rápido en la última década. Hay academias pequeñas con mucho nivel técnico y otras más grandes con varios grupos por nivel. Si tienes lesiones de rodilla u hombro, el BJJ bien enseñado puede ser más seguro de lo que crees.',
    judo: 'Madrid tiene una cultura de judo arraigada, con clubes federados y buena cantera. Muchos empiezan aquí siendo niños y nunca lo dejan. Si buscas disciplina real con competición o simplemente una base sólida de lucha, hay opciones para todo.',
    karate: 'El karate en Madrid tiene de todo: desde dojos tradicionales Shotokan hasta academias más enfocadas al karate deportivo olímpico. Si buscas algo más que fitness, hay clubes con filosofía clara y senseis que llevan décadas enseñando.',
    mma: 'Madrid tiene varios centros de MMA con nivel para entrenar BJJ, boxeo y lucha en el mismo sitio. No todos los gimnasios de fitness que dicen hacer MMA lo hacen de verdad — los que sí, son buenos.',
    taekwondo: 'El taekwondo en Madrid es uno de los deportes más practicados a nivel federado. Si tienes rodillas sanas y buen rango de movimiento en cadera, puedes llegar lejos. Hay academias con participación en torneos nacionales.',
  },
  barcelona: {
    boxeo: 'Barcelona tiene una larga tradición boxística, con el Gimnasio Arnau como referencia histórica. Hoy convive esa tradición con los nuevos espacios de fitness-boxing. Si quieres técnica de verdad, busca los gimnasios del Eixample o el Poblenou.',
    'muay-thai': 'En Barcelona el Muay Thai tiene un nivel altísimo, con varios campeones europeos formados aquí. Hay academias en casi todos los barrios y los precios son más competitivos que en Madrid. El ambiente suele ser más abierto e internacional.',
    bjj: 'El BJJ en Barcelona tiene mucho empuje. Hay academias con afiliación directa a equipos brasileños y un circuito local activo de competición. Si te gusta el grappling técnico, vas a encontrar gente con quien evolucionar.',
    judo: 'Barcelona tiene excelente infraestructura de judo, con varios clubes federados y conexión directa con el circuito catalán de competición. Para quien busca judo de verdad, no aeróbic con kimono, aquí hay nivel.',
    karate: 'La escena del karate en Barcelona mezcla estilos: Shotokan, Goju-ryu, Kyokushin. Hay dojos en todos los barrios y varios clubs históricos que llevan décadas. La oferta es amplia y los precios razonables.',
    mma: 'Barcelona tiene una escena MMA sólida, con gimnasios que cuidan mucho la formación base antes de mezclar disciplinas. No es el volumen de Madrid, pero la calidad técnica es reconocida a nivel nacional.',
    taekwondo: 'El taekwondo está muy integrado en los polideportivos municipales de Barcelona, lo que lo hace accesible y asequible. Si buscas competición hay opciones federadas; si buscas deporte y técnica sin más, también.',
  },
  valencia: {
    boxeo: 'Valencia tiene una comunidad de boxeo activa, especialmente en los barrios periféricos. El nivel no es tan alto como en Madrid o Barcelona, pero hay gimnasios serios con entrenadores con carrera propia.',
    'muay-thai': 'El Muay Thai en Valencia ha crecido mucho en los últimos cinco años. Hay academias con buen nivel de sparring y precios más bajos que en las capitales. Buena opción si buscas calidad a precio razonable.',
    bjj: 'El BJJ en Valencia tiene una comunidad pequeña pero unida. Hay pocos gimnasios, pero los que existen tienen muy buen ambiente y nivel técnico decente. No vas a encontrar grupos masivos, pero sí compañeros de entrenamiento serios.',
    judo: 'El judo en Valencia tiene base histórica sólida, con clubs que llevan décadas y participación regular en competiciones nacionales. La oferta es estable y el precio suele ser competitivo.',
    karate: 'Valencia tiene una escena karateca activa, especialmente Shotokan y Wado-ryu. Hay varios clubs con katas de alto nivel y buena proyección competitiva a nivel autonómico.',
    mma: 'La escena MMA en Valencia es más pequeña que en las capitales pero está creciendo. Hay un par de gimnasios donde puedes entrenarlo todo bajo el mismo techo sin comprometer la calidad de ninguna disciplina.',
    taekwondo: 'El taekwondo es uno de los deportes de combate más populares en Valencia, con participación fuerte en los juegos escolares. Para adultos también hay opciones federadas con competición real.',
  },
  sevilla: {
    boxeo: 'El boxeo en Sevilla tiene raíces históricas en el deporte amateur y hay varios clubs con trayectoria. El nivel técnico es heterogéneo — hay que buscar bien, pero los buenos gimnasios son buenos de verdad.',
    'muay-thai': 'El Muay Thai en Sevilla ha ganado presencia en los últimos años. No es la ciudad con más oferta, pero hay academias serias con instructores formados fuera de España que ofrecen un nivel técnico real.',
    bjj: 'El BJJ en Sevilla es todavía una comunidad en crecimiento. Hay pocos centros, pero los que existen tienen muy buen ambiente. Si buscas un deporte donde el físico importa menos que la técnica, merece la pena explorarlo aquí.',
    judo: 'El judo lleva décadas en Sevilla y tiene una base sólida en los clubs deportivos clásicos. Si buscas algo federado y con competición real, hay opciones con muy buena reputación local.',
    karate: 'Sevilla tiene una cultura karateca respetable, con varios dojos que llevan mucho tiempo enseñando y buenos resultados en campeonatos regionales. La oferta es más orientada al karate tradicional que al deportivo.',
    mma: 'La escena MMA en Sevilla está creciendo, aunque sigue siendo pequeña. Hay gimnasios que combinan kickboxing, lucha y BJJ de manera seria. El ambiente suele ser muy comprometido.',
    taekwondo: 'El taekwondo en Sevilla tiene clubes federados con proyección a nivel nacional. Es un deporte donde la ciudad ha tenido buenos resultados en competición y la enseñanza es sería.',
  },
  bilbao: {
    boxeo: 'Bilbao tiene una tradición boxística fuerte, especialmente en el boxeo amateur. El País Vasco ha dado varios campeones nacionales y la cultura del esfuerzo se nota en los gimnasios. Buen sitio para aprender a boxear de verdad.',
    'muay-thai': 'El Muay Thai en Bilbao ha crecido con fuerza. Hay academias con buen nivel de sparring y contacto con el circuito nacional. Si vienes de otro deporte de contacto, la adaptación suele ser rápida.',
    bjj: 'El BJJ en Bilbao tiene una comunidad pequeña pero muy técnica. El nivel en los entrenamientos abiertos es alto y hay conexión con equipos de fuera que traen seminarios regularmente. Buena opción si te gusta el grappling técnico.',
    judo: 'Bilbao y el País Vasco en general tienen una cultura de judo muy sólida, con clubs históricos y buenos resultados en competición nacional. Si buscas un club serio con buen ambiente, aquí hay donde elegir.',
    karate: 'El karate en Bilbao tiene presencia estable, aunque la comunidad es más pequeña que en otras ciudades grandes. Hay dojos con técnica Shotokan sólida y buena orientación hacia la competición kata.',
    mma: 'Bilbao tiene algún centro de MMA con nivel serio, aunque la oferta es más limitada que en las grandes capitales. Los que existen compensan con mucha implicación del equipo técnico y grupo comprometido.',
    taekwondo: 'El taekwondo en Bilbao tiene representación federada activa. Hay clubs con trayectoria en competición autonómica y nacional, y la oferta cubre desde iniciación infantil hasta nivel avanzado.',
  },
};

export function getTexto(ciudad: Ciudad, arte: ArteValido): string {
  return TEXTOS[ciudad]?.[arte]
    ?? `Los gimnasios de ${ARTE_NOMBRES_SEO[arte]} en ${CIUDAD_NOMBRES[ciudad]} ofrecen clases para todos los niveles. Usa el filtro de compatibilidad de lesiones para encontrar el que mejor se adapta a ti.`;
}
