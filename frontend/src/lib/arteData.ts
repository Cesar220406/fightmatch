/**
 * Contenido estático editorial para las páginas de artes marciales.
 * Separado de los datos de la BD (nombre, descripcion, compatibilidades)
 * para poder servirse como ISR sin petición a la API.
 */

export type ArteSlug =
  | 'boxeo' | 'muay-thai' | 'bjj' | 'judo' | 'wrestling'
  | 'mma' | 'karate' | 'kickboxing' | 'taekwondo' | 'kung-fu';

export const ARTES_SLUGS: ArteSlug[] = [
  'boxeo', 'muay-thai', 'bjj', 'judo', 'wrestling',
  'mma', 'karate', 'kickboxing', 'taekwondo', 'kung-fu',
];

// Nombres para mostrar
export const ARTE_NOMBRES: Record<ArteSlug, string> = {
  boxeo:      'Boxeo',
  'muay-thai': 'Muay Thai',
  bjj:        'BJJ',
  judo:       'Judo',
  wrestling:  'Wrestling',
  mma:        'MMA',
  karate:     'Karate',
  kickboxing: 'Kickboxing',
  taekwondo:  'Taekwondo',
  'kung-fu':  'Kung Fu',
};

// Categoría
export const ARTE_CATEGORIA: Record<ArteSlug, string> = {
  boxeo:      'Arte de contacto',
  'muay-thai': 'Arte de contacto',
  bjj:        'Arte de suelo',
  judo:       'Arte de proyección',
  wrestling:  'Arte de agarre',
  mma:        'Híbrido',
  karate:     'Arte de pie',
  kickboxing: 'Arte de contacto',
  taekwondo:  'Arte de pie',
  'kung-fu':  'Arte tradicional',
};

// Subtítulos con voz
export const ARTE_SUBTITULO: Record<ArteSlug, string> = {
  boxeo:      'El arte más honesto del mundo. Tú, tus manos y lo que tienes dentro.',
  'muay-thai': 'Ocho armas, cero excusas.',
  bjj:        'El ajedrez con el que ahogas a tu rival antes de que se dé cuenta.',
  judo:       'Ceder para vencer. Fuerza de palanca, no de músculo.',
  wrestling:  'El deporte que define si de verdad quieres ganar.',
  mma:        'No hay reglas de qué puedes aprender. Solo de cuánto.',
  karate:     'Un golpe. Un punto. Sin segunda oportunidad.',
  kickboxing: 'Boxeo que recuerda que tienes piernas.',
  taekwondo:  'Las piernas más rápidas del mundo olímpico.',
  'kung-fu':  'Siglos de sabiduría condensados en cada movimiento.',
};

// IDs de YouTube (vídeo highlight)
export const ARTE_VIDEO_ID: Record<ArteSlug, string> = {
  boxeo:      'HiHbPMUCFzk',
  'muay-thai': 'pZtHpJLFPnY',
  bjj:        'Ux4VCuPWKpg',
  judo:       'IY9CRD5TkPA',
  wrestling:  'zEpHvAWqRqA',
  mma:        'wcm5zE46rJQ',
  karate:     '6Sz2rUbBiM4',
  kickboxing: 'FKH02EQ4oXM',
  taekwondo:  'cSoq2ZIQSIU',
  'kung-fu':  'FHtMcHoWd8I',
};

// Pills del hero
export const ARTE_ORIGEN: Record<ArteSlug, string> = {
  boxeo:      'Reino Unido / EE.UU.',
  'muay-thai': 'Tailandia',
  bjj:        'Brasil / Japón',
  judo:       'Japón',
  wrestling:  'Global / EE.UU.',
  mma:        'Global',
  karate:     'Japón / Okinawa',
  kickboxing: 'Japón / EE.UU.',
  taekwondo:  'Corea del Sur',
  'kung-fu':  'China',
};

export const ARTE_TIEMPO_COMPETICION: Record<ArteSlug, string> = {
  boxeo:      '12–18 meses',
  'muay-thai': '6–12 meses',
  bjj:        '18–24 meses',
  judo:       '12–18 meses',
  wrestling:  '12–18 meses',
  mma:        '18–24 meses',
  karate:     '6–12 meses',
  kickboxing: '6–12 meses',
  taekwondo:  '6–12 meses',
  'kung-fu':  '24+ meses',
};

export const ARTE_CALLE: Record<ArteSlug, 'Sí' | 'Parcial' | 'No'> = {
  boxeo:      'Sí',
  'muay-thai': 'Sí',
  bjj:        'Parcial',
  judo:       'Parcial',
  wrestling:  'Parcial',
  mma:        'Sí',
  karate:     'Parcial',
  kickboxing: 'Parcial',
  taekwondo:  'No',
  'kung-fu':  'Parcial',
};

// Nivel de contacto 1-5
export const ARTE_CONTACTO_NIVEL: Record<ArteSlug, number> = {
  boxeo:      5,
  'muay-thai': 5,
  bjj:        3,
  judo:       3,
  wrestling:  4,
  mma:        5,
  karate:     3,
  kickboxing: 4,
  taekwondo:  3,
  'kung-fu':  2,
};

// Stats comparativa
export interface ArteStats {
  contacto:          number; // 1-5
  tecnica:           number;
  acondicionamiento: number;
  curvaAprendizaje:  number;
  calleUtilidad:     number;
}

export const ARTE_STATS: Record<ArteSlug, ArteStats> = {
  boxeo:      { contacto: 5, tecnica: 4, acondicionamiento: 5, curvaAprendizaje: 3, calleUtilidad: 4 },
  'muay-thai': { contacto: 5, tecnica: 4, acondicionamiento: 5, curvaAprendizaje: 4, calleUtilidad: 5 },
  bjj:        { contacto: 3, tecnica: 5, acondicionamiento: 4, curvaAprendizaje: 5, calleUtilidad: 4 },
  judo:       { contacto: 3, tecnica: 5, acondicionamiento: 4, curvaAprendizaje: 4, calleUtilidad: 4 },
  wrestling:  { contacto: 4, tecnica: 4, acondicionamiento: 5, curvaAprendizaje: 4, calleUtilidad: 3 },
  mma:        { contacto: 5, tecnica: 5, acondicionamiento: 5, curvaAprendizaje: 5, calleUtilidad: 5 },
  karate:     { contacto: 3, tecnica: 5, acondicionamiento: 3, curvaAprendizaje: 3, calleUtilidad: 3 },
  kickboxing: { contacto: 4, tecnica: 3, acondicionamiento: 4, curvaAprendizaje: 3, calleUtilidad: 3 },
  taekwondo:  { contacto: 3, tecnica: 4, acondicionamiento: 4, curvaAprendizaje: 3, calleUtilidad: 2 },
  'kung-fu':  { contacto: 2, tecnica: 5, acondicionamiento: 3, curvaAprendizaje: 4, calleUtilidad: 2 },
};

export const STATS_LABELS: Record<keyof ArteStats, string> = {
  contacto:          'Nivel de contacto',
  tecnica:           'Profundidad técnica',
  acondicionamiento: 'Acondicionamiento',
  curvaAprendizaje:  'Curva de aprendizaje',
  calleUtilidad:     'Utilidad real',
};

// Textos editoriales
export interface ArteTextos {
  p1: string;
  p2: string;
  p3: string;
}

export const ARTE_TEXTOS: Record<ArteSlug, ArteTextos> = {
  boxeo: {
    p1: 'En los primeros tres meses tu hombro derecho va a cambiar. No el bíceps que ves en el espejo, sino los estabilizadores profundos que nadie nombra. El jab te va a enseñar que pegar fuerte no es lo mismo que pegar bien, y eso va a cambiar cómo entiendes la fuerza para siempre.',
    p2: 'El músculo que más te va a sorprender es el oblicuo. No los abdominales que ves en las revistas — la cadena lateral que conecta tu cadera con tu hombro. Cuando un buen entrenador te corrija la rotación de cadera en el cross, ese músculo va a arder de una forma que no vas a olvidar.',
    p3: 'Si vienes del gym y levantabas peso, boxear te va a dar una lección de humildad en la primera semana. Un adolescente de 60 kg que lleva dos años boxeando te va a cansar más que cualquier rutina de cardio que hayas hecho. La diferencia es que aquí el cansancio tiene sentido.',
  },
  'muay-thai': {
    p1: 'El Muay Thai va a hacer que redescubras tus piernas. No como herramientas para correr o sentadillas — como armas. En tres meses vas a desarrollar una potencia de cadera que ningún ejercicio de gym replica, porque aprender a patear bien implica coordinar una cadena muscular completa que la mayoría de deportes ignora.',
    p2: 'Las espinillas. Nadie te avisa de las espinillas. El hueso duele, sí, pero lo que realmente cambia es el músculo tibial y los peroneos — los músculos laterales de la pantorrilla que absorben el impacto. En seis meses tus piernas van a parecer las de otra persona.',
    p3: 'Si buscas el deporte de contacto con mejor ratio esfuerzo/resultado para la forma física general, el Muay Thai probablemente gana. Combina cardio, fuerza funcional, coordinación y flexibilidad de cadera en cada sesión. El kickboxing se le parece, pero le faltan los codos y las rodillas — y esas dos armas cambian completamente el juego táctico.',
  },
  bjj: {
    p1: 'El BJJ es el único deporte donde durante los primeros seis meses vas a perder todas las peleas contra personas que pesan 20 kg menos que tú, y eso va a ser lo mejor que te pase. Tu cuerpo va a aprender a moverse en el suelo como nunca lo hizo, y tu mente va a desarrollar una paciencia táctica que se va a filtrar en todo lo demás.',
    p2: 'Los antebrazos. Todo el mundo subestima los antebrazos. Después de tu primera semana de agarres, vas a tener las manos tan cargadas que abrir un bote de mermelada va a ser un reto. Y eso es solo el principio — en BJJ los antebrazos nunca descansan.',
    p3: 'Comparado con el gym, el BJJ te da algo que los pesos no pueden: contexto. No entrenas fuerza en abstracto, la entrenas para algo concreto. Cada kilo de músculo funcional que ganas tiene una aplicación inmediata en el tapiz.',
  },
  judo: {
    p1: 'El judo te va a hacer más fuerte de una forma que no vas a ver venir: la fuerza de agarre y de tracción. En tres meses vas a poder tirar a alguien que pesa más que tú usando su propio impulso, y ese momento — la primera vez que funciona de verdad — es adictivo.',
    p2: 'El trapecio y los músculos del cuello. El judo tiene más contacto en el cuello y los hombros que cualquier otro deporte de agarre. Tu postura va a mejorar involuntariamente porque tu cuerpo va a aprender que una buena postura es literalmente imposible de derribar.',
    p3: 'Frente al BJJ, el judo es más explosivo y más exigente cardiovascularmente en poco tiempo. El BJJ es más táctico y técnico en el suelo. Si te gusta la idea del agarre pero quieres competir en Olimpiadas, judo. Si quieres dominar el suelo y aplicar lo que aprendes a defensa personal real, BJJ.',
  },
  wrestling: {
    p1: 'El wrestling es probablemente el deporte más físicamente exigente de este listado, y eso es una promesa, no una amenaza. En tres meses tu espalda alta, tus glúteos y tus cuádriceps van a cambiar de una forma que ningún programa de gym replica, porque en wrestling usas esa fuerza contra alguien que está activamente intentando resistirte.',
    p2: 'El cuello. En wrestling el cuello trabaja constantemente como estabilizador. Nadie en el gym entrena el cuello en serio. En wrestling no tienes opción. Y cuando tu cuello se fortalece de verdad, tu postura general cambia para siempre.',
    p3: 'Si el BJJ es el ajedrez del suelo, el wrestling es el boxeo del suelo: más agresivo, más explosivo, menos paciente. Muchos luchadores de MMA de élite tienen base de wrestling precisamente por eso — el control de posición que da es brutal.',
  },
  mma: {
    p1: 'El MMA no te especializa en nada — te hace funcional en todo. En tres meses vas a tocar boxeo, clinch, derribo y suelo. No vas a ser bueno en ninguno todavía, y eso está bien. Lo que sí vas a desarrollar es una capacidad de adaptación física y mental que ningún arte marcial individual da.',
    p2: 'El núcleo. En MMA el core trabaja en todas las posiciones — de pie, en el clinch, en el suelo, levantándote. No los abdominales estéticos: la musculatura profunda de estabilización que convierte tu cuerpo en una unidad en lugar de partes separadas.',
    p3: 'La honestidad del MMA es que si tienes tres horas semanales, es mejor que las dediques a un solo arte y lo domines. El MMA tiene sentido cuando ya tienes una base sólida en algo, o cuando entrenas cuatro o más días por semana. Si empiezas de cero, considera empezar por boxeo, BJJ o wrestling y añadir el resto después.',
  },
  karate: {
    p1: 'El karate tradicional te va a dar algo que los deportes de contacto continuo no dan: precisión. Cada técnica se trabaja cientos de veces hasta que el movimiento es automático. En tres meses tu coordinación general va a mejorar de forma visible, y tu conciencia espacial — saber exactamente dónde están tus extremidades — va a cambiar.',
    p2: 'Los extensores de cadera y los cuádriceps. El kizami-zuki — el golpe de jab de karate — genera potencia desde la rotación de cadera, no desde el brazo. Cuando lo aprendes bien, los cuádriceps y los glúteos del lado de ataque arden como en pocas técnicas de otros deportes.',
    p3: 'El debate karate vs boxeo es eterno y la respuesta honesta es: depende de para qué. Para competición de combate real, el boxeo gana por experiencia en contacto continuo. Para disciplina, kata y desarrollo técnico preciso, el karate tiene una profundidad que el boxeo no replica. Para defensa personal, ambos dan herramientas — pero el BJJ y el Muay Thai probablemente más.',
  },
  kickboxing: {
    p1: 'El kickboxing es el punto de entrada ideal si quieres contacto real sin la curva de aprendizaje inicial del Muay Thai. En tres meses vas a desarrollar coordinación de manos y piernas simultánea, y esa coordinación — una vez que la tienes — se queda para siempre.',
    p2: 'Los gemelos y el tibial anterior. Las patadas de kickboxing, especialmente el roundhouse, generan una tensión específica en la parte frontal de la espinilla que casi ningún otro ejercicio activa. Si vienes de correr, la primera semana lo vas a notar mucho.',
    p3: 'Kickboxing vs Muay Thai: el kickboxing es más limpio y más fácil de aprender al principio porque elimina los codos, rodillas y clinch. Eso es una ventaja para principiantes y una limitación para avanzados. Si el objetivo es la forma física y el deporte recreativo, kickboxing. Si el objetivo es el combate completo de pie, Muay Thai.',
  },
  taekwondo: {
    p1: 'El taekwondo te va a dar las piernas más rápidas de tu vida. En tres meses, si entrenas con seriedad, vas a desarrollar una velocidad de patada que sorprende incluso a practicantes de otros artes marciales. La flexibilidad de cadera que requiere el taekwondo mejora todo lo demás — correr, nadar, cualquier deporte.',
    p2: 'Los abductores de cadera — los músculos de la cara externa del muslo. Las patadas laterales y circulares del taekwondo los activan de una forma que ningún ejercicio convencional replica bien. Si nunca has sentido esos músculos trabajar, primera semana de taekwondo y lo sabrás.',
    p3: 'El taekwondo olímpico es un deporte completamente diferente al taekwondo tradicional. El olímpico es velocidad y puntos; el tradicional incluye técnicas de mano y defensa personal más completas. Antes de apuntarte, pregunta al gimnasio qué enfoque tiene — la diferencia en el entrenamiento diario es enorme.',
  },
  'kung-fu': {
    p1: 'El kung fu es el arte marcial con mayor diversidad interna — hay más de 400 estilos documentados. En tres meses lo que vas a desarrollar depende enormemente del estilo que practiques, pero todos comparten algo: una conciencia corporal y una fluidez de movimiento que los artes de competición moderna no priorizan igual.',
    p2: 'Los extensores de muñeca y los músculos del antebrazo trabajan de una forma peculiar en el kung fu, especialmente en estilos como el Wing Chun. Las técnicas de mano circular y los bloqueos de cadena activan musculatura de la parte inferior del brazo que normalmente dormita.',
    p3: 'La pregunta honesta con el kung fu es: ¿para qué lo quieres? Si buscas combate real y efectivo rápido, el BJJ, el wrestling o el Muay Thai van a darte resultados más inmediatos. Si buscas un arte completo que incluya filosofía, historia, formas y una práctica para toda la vida, el kung fu tiene una profundidad que pocos artes alcanzan.',
  },
};

// FAQ
export interface FAQItem { q: string; a: string; }

export const ARTE_FAQ: Record<ArteSlug, FAQItem[]> = {
  boxeo: [
    {
      q: '¿Tengo que sparrear desde el principio?',
      a: 'No. La mayoría de gimnasios serios no te meten en el ring hasta los 3-6 meses. El sparreo es siempre consensuado — nadie te obliga a recibir golpes antes de que estés listo. El trabajo en saco y paos no tiene ese riesgo.',
    },
    {
      q: '¿El boxeo daña el cerebro aunque no compita?',
      a: 'El riesgo está en el sparreo de contacto duro repetido. El trabajo en paos y saco no tiene ese riesgo. Pregunta al gimnasio cómo gestiona el sparreo — un buen gym tiene protocolos claros y no fuerza el contacto duro.',
    },
    {
      q: '¿Sirve si solo quiero la forma física?',
      a: 'Es uno de los mejores deportes para cardio y coordinación sin necesidad de llegar a pelear. Muchos gimnasios tienen clases específicas de boxeo fitness donde nunca hay sparreo y el enfoque es puramente el acondicionamiento.',
    },
  ],
  'muay-thai': [
    {
      q: '¿Hay que ponerse protecciones siempre?',
      a: 'En las clases técnicas de pad work y saco no siempre es obligatorio. En el sparreo sí, siempre: casco, guantes, espinilleras y bucal. Un buen gimnasio nunca hace sparreo sin protecciones completas, independientemente del nivel.',
    },
    {
      q: '¿Daña las rodillas patear tanto?',
      a: 'La técnica correcta de patada en Muay Thai no impacta la rodilla — el impacto va a la cadera y la espinilla. Una mala técnica sí puede forzar la rodilla. Por eso aprender correctamente desde el principio es crucial. Si tienes una lesión previa, coméntaselo al instructor.',
    },
    {
      q: '¿Es lo mismo Muay Thai que kickboxing?',
      a: 'No. El Muay Thai usa 8 armas (puños, codos, rodillas y piernas) y el clinch. El kickboxing usa 4 (puños y piernas) sin clinch. Son deportes distintos con reglas distintas, aunque compartan origen y muchas técnicas de pierna.',
    },
  ],
  bjj: [
    {
      q: '¿Tengo que ser fuerte para empezar?',
      a: 'No. El BJJ tiene la reputación de ser el arte más técnico precisamente porque un practicante técnico puede someter a alguien mucho más fuerte. La fuerza ayuda, pero la técnica supera a la fuerza — eso no es marketing, es su filosofía fundacional.',
    },
    {
      q: '¿Qué pasa si me incomoda el contacto tan cercano?',
      a: 'Es normal al principio. En dos meses de entrenamiento regular vas a estar completamente cómodo. El BJJ trabaja la distancia de trabajo con tanta naturalidad que la incomodidad desaparece — es una cuestión de acostumbrarse, no de personalidad.',
    },
    {
      q: '¿Cuánto tardo en sacar el cinturón azul?',
      a: 'Lo normal son 1-2 años entrenando 3 días por semana, dependiendo del gimnasio. Los cinturones en BJJ significan mucho más que en otros artes — no se dan fácilmente. Un azul en BJJ equivale a un negro en muchos otros sistemas.',
    },
  ],
  judo: [
    {
      q: '¿El judo es bueno para niños?',
      a: 'Es uno de los mejores artes marciales para niños. Enseña caídas seguras (ukemi), respeto y disciplina antes que el combate. La mayoría de judocas competitivos empiezan antes de los 10 años, y el aprendizaje de ukemi tiene beneficios para toda la vida.',
    },
    {
      q: '¿Se trabaja el suelo en judo?',
      a: 'Sí, el ne-waza (trabajo de suelo) es parte del judo aunque menos enfatizado que en BJJ. Incluye inmovilizaciones, estrangulaciones y luxaciones de codo. En competición el tiempo en el suelo es limitado, pero en entrenamiento se trabaja con profundidad.',
    },
    {
      q: '¿El judo sirve si soy más pequeño que mi rival?',
      a: 'Sí, y es su propuesta filosófica central — "ceder para vencer". Las técnicas de proyección usan el peso y el impulso del rival. Un judoca técnico puede proyectar a alguien que pesa 30 kg más. Hay categorías por peso en competición, pero en el dojo se mezclan.',
    },
  ],
  wrestling: [
    {
      q: '¿El wrestling es lo mismo que la lucha libre?',
      a: 'No exactamente. Existen varios estilos: freestyle (más completo), grecorromana (sin agarre de piernas) y folkstyle (estilo universitario americano). La lucha libre tiene sus propias reglas. El wrestling de MMA es típicamente freestyle o folkstyle.',
    },
    {
      q: '¿Necesito ser muy fuerte para wrestling?',
      a: 'La fuerza ayuda mucho, pero un doble pierna ejecutado con timing correcto puede llevarlo a cabo alguien sin gran fuerza. Dicho esto, el wrestling es el arte marcial que más fuerza funcional desarrolla — en 6 meses tu cuerpo va a cambiar notablemente.',
    },
    {
      q: '¿Se puede practicar wrestling solo para fitness sin competir?',
      a: 'Se puede, pero el wrestling tiene una cultura de competición muy arraigada. La mayoría de gimnasios tienen programa competitivo. Si buscas solo fitness y habilidad de grappling, el BJJ suele tener más opciones recreativas. Aunque si encuentras un buen club de wrestling, el acondicionamiento que da no tiene rival.',
    },
  ],
  mma: [
    {
      q: '¿Puedo empezar MMA sin base en ningún arte?',
      a: 'Técnicamente sí, pero es menos eficiente. La mayoría de coaches recomiendan pasar 6-12 meses en un arte base (boxeo, BJJ o wrestling) antes de integrarse en clases de MMA. Con base, aprenderás el doble de rápido.',
    },
    {
      q: '¿El MMA tiene demasiado contacto para entrenar sin querer pelear?',
      a: 'En las clases de entrenamiento general, el contacto es siempre controlado y consensuado. El MMA tiene fama de duro, pero el entrenamiento diario es técnico en la mayoría de gimnasios serios. El sparreo duro es para quien quiere competir, no para quien entrena por fitness.',
    },
    {
      q: '¿Cuánto tiempo hasta estar preparado para una pelea amateur?',
      a: 'Mínimo 18-24 meses de entrenamiento consistente, con trabajo específico en las 3 dimensiones (golpes, derribo, suelo). Muchos nunca compiten y eso está perfectamente bien — el MMA es un sistema de entrenamiento completo independientemente de la competición.',
    },
  ],
  karate: [
    {
      q: '¿Qué diferencia hay entre los estilos de karate?',
      a: 'Los principales son Shotokan, Kyokushin, Shito-ryu y Goju-ryu. Shotokan es el más extendido y tradicional. Kyokushin es el más duro en contacto (golpeo real al cuerpo). La diferencia en el entrenamiento diario es notable — investiga el estilo antes de elegir gimnasio.',
    },
    {
      q: '¿El karate sirve para defensa personal real?',
      a: 'Depende del estilo y el nivel. Un karateka de Kyokushin con años de sparreo tiene herramientas reales. El karate tradicional de contacto ligero tiene menos aplicación directa que el Muay Thai o el BJJ, pero más de lo que la gente cree. El kata no es combat, pero la técnica repetida se vuelve automática.',
    },
    {
      q: '¿Los cinturones de karate tienen el mismo valor en todos los gimnasios?',
      a: 'No. La graduación varía enormemente según el estilo y la federación. Un cinturón negro en un dojo serio de Shotokan con examen riguroso vale mucho más que en un gimnasio sin afiliación. Pregunta siempre la federación y el criterio de examen antes de apuntarte.',
    },
  ],
  kickboxing: [
    {
      q: '¿El kickboxing es adecuado para alguien sin experiencia?',
      a: 'Es uno de los mejores puntos de entrada en artes marciales de contacto. La curva inicial es más suave que el Muay Thai (sin codos ni rodillas) y más completa que solo boxeo. Muchos gimnasios tienen clases específicas para principiantes con cero contacto las primeras semanas.',
    },
    {
      q: '¿El kickboxing fitness es lo mismo que el kickboxing deportivo?',
      a: 'No. El kickboxing fitness (cardio kickboxing) no tiene sparreo y está enfocado en el ejercicio aeróbico. El kickboxing deportivo incluye técnica real, sparreo y competición. Son experiencias completamente distintas — pregunta al gimnasio qué modalidad ofrecen.',
    },
    {
      q: '¿Se puede hacer kickboxing con problemas en las rodillas?',
      a: 'Con adaptaciones, sí. Las patadas de kickboxing requieren extensión de rodilla controlada. Con supervisión de un buen coach y sin impacto duro, muchos practicantes con rodillas delicadas entrenan sin problemas. Siempre comunica tu lesión al instructor.',
    },
  ],
  taekwondo: [
    {
      q: '¿Qué diferencia hay entre el taekwondo WTF e ITF?',
      a: 'World Taekwondo (antes WTF) es la federación olímpica — más orientada a la competición de patadas a la cabeza. ITF incluye más técnicas de mano y tiene un enfoque algo más marcial. Al apuntarte a un gym, pregunta qué federación siguen — el entrenamiento diario es diferente.',
    },
    {
      q: '¿Por qué se dice que el taekwondo no sirve en pelea real?',
      a: 'El taekwondo olímpico prioriza puntos con patadas a la cabeza, lo que puede parecer poco práctico. Pero un taekwondista avanzado con buena distancia y timing tiene patadas que pocas artes pueden igualar en velocidad. El problema es cuando se entrena solo para puntos, sin practicar distancia real.',
    },
    {
      q: '¿La flexibilidad es un requisito para empezar?',
      a: 'No, es un resultado. No necesitas ser flexible para empezar — el entrenamiento te desarrolla esa flexibilidad con el tiempo. Muchos adultos que empiezan sin flexibilidad notable la consiguen en 6-12 meses. El calentamiento y los estiramientos son parte integral de cada clase.',
    },
  ],
  'kung-fu': [
    {
      q: '¿El kung fu es práctico para combate o solo filosofía?',
      a: 'Depende totalmente del estilo y el enfoque del gimnasio. El Wing Chun tiene aplicaciones de combate cercano muy directas. El wushu de competición es más artístico. Muchos estilos tradicionales son efectivos si se entrenan con sparreo real. Visita el gimnasio y mira una clase antes de apuntarte.',
    },
    {
      q: '¿Cuántos estilos existen y cuál elegir?',
      a: 'Más de 400 estilos documentados. Para principiantes: Wing Chun (corta distancia, eficiente), Hung Gar (fuerza y estabilidad) o Tai Chi (suave, mente-cuerpo) son puntos de entrada comunes. La mejor forma de elegir es visitar gimnasios — el instructor importa más que el estilo.',
    },
    {
      q: '¿El kung fu es para todas las edades?',
      a: 'Sí, especialmente estilos como el Tai Chi que se practican hasta edades muy avanzadas. Los estilos más exigentes físicamente tienen adaptaciones para adultos mayores. La filosofía del kung fu es precisamente la práctica para toda la vida — no es un deporte de jóvenes solamente.',
    },
  ],
};

// Patrones SVG para el hero (sutiles, sobre fondo negro)
// encode como string directa — se usa en style={{ backgroundImage: `url(...)` }}
export const ARTE_PATRON: Record<ArteSlug, string> = {
  boxeo: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40L40 0M-10 10L10 -10M30 50L50 30' stroke='%231e1e1e' stroke-width='1.5'/%3E%3C/svg%3E")`,
  'muay-thai': `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%231e1e1e' stroke-width='1'/%3E%3C/svg%3E")`,
  bjj: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='26' fill='none' stroke='%231e1e1e' stroke-width='1'/%3E%3Ccircle cx='30' cy='30' r='16' fill='none' stroke='%231e1e1e' stroke-width='1'/%3E%3Ccircle cx='30' cy='30' r='6' fill='none' stroke='%231e1e1e' stroke-width='1'/%3E%3C/svg%3E")`,
  judo: `url("data:image/svg+xml,%3Csvg width='50' height='50' xmlns='http://www.w3.org/2000/svg'%3E%3Cellipse cx='25' cy='25' rx='22' ry='12' fill='none' stroke='%231e1e1e' stroke-width='1'/%3E%3Cellipse cx='25' cy='25' rx='12' ry='22' fill='none' stroke='%231e1e1e' stroke-width='1'/%3E%3C/svg%3E")`,
  wrestling: `url("data:image/svg+xml,%3Csvg width='50' height='50' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='15' cy='25' r='13' fill='none' stroke='%231e1e1e' stroke-width='1'/%3E%3Ccircle cx='35' cy='25' r='13' fill='none' stroke='%231e1e1e' stroke-width='1'/%3E%3C/svg%3E")`,
  mma: `url("data:image/svg+xml,%3Csvg width='52' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M26 2L50 16V44L26 58L2 44V16Z' fill='none' stroke='%231e1e1e' stroke-width='1'/%3E%3C/svg%3E")`,
  karate: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='1' y='1' width='38' height='38' fill='none' stroke='%231e1e1e' stroke-width='1'/%3E%3Crect x='11' y='11' width='18' height='18' fill='none' stroke='%231e1e1e' stroke-width='1'/%3E%3C/svg%3E")`,
  kickboxing: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20L20 0L40 20L20 40Z' fill='none' stroke='%231e1e1e' stroke-width='1'/%3E%3C/svg%3E")`,
  taekwondo: `url("data:image/svg+xml,%3Csvg width='50' height='50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='25,3 32,18 49,18 36,29 41,46 25,36 9,46 14,29 1,18 18,18' fill='none' stroke='%231e1e1e' stroke-width='1'/%3E%3C/svg%3E")`,
  'kung-fu': `url("data:image/svg+xml,%3Csvg width='50' height='50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='25,2 46,13 46,37 25,48 4,37 4,13' fill='none' stroke='%231e1e1e' stroke-width='1'/%3E%3Cpolygon points='25,12 36,18 36,32 25,38 14,32 14,18' fill='none' stroke='%231e1e1e' stroke-width='1'/%3E%3C/svg%3E")`,
};

// CTAs finales
export const ARTE_CTA_TEXT: Record<ArteSlug, string> = {
  boxeo:      'Los guantes están esperando. El primer paso es encontrar el gimnasio correcto.',
  'muay-thai': 'Ocho semanas de Muay Thai van a cambiar lo que piensas sobre tu condición física.',
  bjj:        'Tu primer día en el tapiz va a ser frustrante. También vas a querer volver al día siguiente.',
  judo:       'Aprender a caer bien es la habilidad más práctica de todas. Empieza por ahí.',
  wrestling:  'No hay excusas en el wrestling. Solo hay trabajo. ¿Estás listo?',
  mma:        'El MMA no es para todos. Pero si lo es para ti, no lo vas a encontrar en casa.',
  karate:     'La disciplina del karate no se queda en el tatami. Se filtra en todo.',
  kickboxing: 'Manos y piernas. La combinación más natural del combate. Y la más efectiva.',
  taekwondo:  'Una patada bien ejecutada cambia cómo te mueves en todo lo demás.',
  'kung-fu':  'Cinco siglos de práctica no se inventaron — se destilaron. Empieza a aprender.',
};
