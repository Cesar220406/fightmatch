-- Seed de posts para FightMatch
-- Ejecutar con: psql -U fightmatch -f seed-posts.sql

DO $$
DECLARE
  admin_id UUID;
  editor_id UUID;
BEGIN
  SELECT id INTO admin_id  FROM usuarios WHERE email = 'admin@fightmatch.com'  LIMIT 1;
  SELECT id INTO editor_id FROM usuarios WHERE email = 'editor@fightmatch.com' LIMIT 1;

  INSERT INTO posts (autor_id, titulo, slug, resumen, contenido, imagen_url, etiquetas, estado, publicado_en)
  VALUES
  (
    admin_id,
    'Cómo empezar en las artes marciales con una lesión de rodilla',
    'empezar-artes-marciales-lesion-rodilla',
    'Tener una lesión de rodilla no tiene por qué ser el fin de tu práctica marcial. Descubre qué disciplinas son más seguras y cómo adaptarlas a tu condición.',
    E'## Cómo empezar con una lesión de rodilla\n\nMuchas personas creen que tener una lesión de rodilla les impide practicar artes marciales. Nada más lejos de la realidad.\n\n### Qué disciplinas son más seguras\n\n**Tai Chi**: Los movimientos lentos y controlados apenas impactan la articulación. Es la opción más recomendada para personas con problemas articulares.\n\n**Yoga Marcial**: Combina la flexibilidad del yoga con fundamentos marciales. El trabajo isométrico fortalece los músculos que rodean la rodilla sin sobrecargarla.\n\n**BJJ de suelo**: La lucha en el suelo elimina el impacto y los saltos. Muchos practicantes con lesiones de rodilla siguen compitiendo a nivel profesional.\n\n### Consejos generales\n\n- Consulta siempre con tu fisioterapeuta antes de comenzar\n- Comunica tu lesión al instructor desde el primer día\n- Evita posturas que hiperextiendan la rodilla\n- El calentamiento es más importante para ti que para cualquier otro alumno\n\nLas artes marciales son, en muchos casos, una herramienta de rehabilitación. Lo importante es elegir la disciplina adecuada.',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    ARRAY['lesiones','rodilla','principiantes'],
    'publicado',
    NOW() - INTERVAL '5 days'
  ),
  (
    admin_id,
    'Boxeo vs Muay Thai: ¿Cuál es mejor para perder peso?',
    'boxeo-vs-muay-thai-perder-peso',
    'Comparamos dos de las artes marciales más populares desde el punto de vista del fitness. Spoiler: los dos funcionan, pero no del mismo modo.',
    E'## Boxeo vs Muay Thai para el fitness\n\nAmbas disciplinas son de alta intensidad y queman calorías a un ritmo considerable. Pero hay diferencias importantes.\n\n### Boxeo\n\nEl boxeo trabaja exclusivamente el tren superior. Un entrenamiento de una hora puede quemar entre 500 y 800 calorías. La coordinación ojo-mano mejora notablemente.\n\n### Muay Thai\n\nEl Muay Thai usa los 8 puntos de contacto (puños, codos, rodillas y espinillas), lo que implica un trabajo muscular más completo. Entre 600 y 900 calorías por hora.\n\n### ¿Cuál elegir?\n\nSi tienes lesiones en las piernas, el boxeo puede ser más seguro. Si buscas un trabajo corporal completo, el Muay Thai es imbatible para la pérdida de peso.\n\nMuchos gimnasios ofrecen clases combinadas de ambas disciplinas.',
    'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800',
    ARRAY['fitness','boxeo','muay-thai'],
    'publicado',
    NOW() - INTERVAL '12 days'
  ),
  (
    editor_id,
    'BJJ para mujeres: Rompiendo el mito del deporte masculino',
    'bjj-para-mujeres',
    'El Brazilian Jiu-Jitsu es una de las artes marciales más igualitarias. La técnica supera siempre a la fuerza bruta.',
    E'## BJJ para mujeres\n\nCuando la gente piensa en BJJ, suele imaginar hombres grandes sudando en un tatami. Pero la realidad del BJJ moderno es muy diferente.\n\n### Por qué el BJJ nivela el campo de juego\n\nA diferencia del boxeo, el BJJ se practica mayoritariamente en el suelo, donde la fuerza bruta importa mucho menos que la técnica y el posicionamiento.\n\nUna persona de 60 kg con buena técnica puede controlar a un oponente de 90 kg. Eso es lo que hace al BJJ tan especial.\n\n### Beneficios específicos para mujeres\n\n1. **Autodefensa real**: Las situaciones de peligro suelen terminar en el suelo.\n2. **Comunidad**: La comunidad de BJJ femenino es increíblemente acogedora.\n3. **Confianza**: Aprender a dominar situaciones físicamente intensas genera confianza en todos los ámbitos de la vida.\n\n### Cómo empezar\n\nBusca una academia con clases específicas para mujeres o con un buen ratio de alumnas.',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
    ARRAY['bjj','mujeres','comunidad'],
    'publicado',
    NOW() - INTERVAL '20 days'
  ),
  (
    admin_id,
    'Guía completa de lesiones más comunes en artes marciales',
    'guia-lesiones-artes-marciales',
    'Esguinces, contusiones, lesiones de hombro... Repasamos las lesiones más frecuentes y cómo prevenirlas.',
    E'## Lesiones comunes en artes marciales\n\nLas artes marciales, como cualquier deporte de contacto, conllevan riesgos. Con el equipo adecuado y buena técnica, la mayoría son evitables.\n\n### Esguince de tobillo\n\nLa lesión más común en deportes de combate. Los giros rápidos en tatami mojado pueden torcer el tobillo.\n\n**Prevención**: Vendaje preventivo, calzado específico, tatami de calidad.\n\n### Lesiones de hombro\n\nLos lanzamientos en judo y las palancas en BJJ pueden forzar el hombro más allá de su rango.\n\n**Prevención**: Aprender a "tapear" a tiempo. No resistir cuando el oponente aplica una palanca correctamente.\n\n### Contusiones y hematomas\n\nPropiamente del contacto. Se minimizan con buenas protecciones: vendas, guantes, casco en sparring.\n\n### El papel de la recuperación\n\nEl descanso es tan importante como el entrenamiento. Un deportista que no duerme bien o entrena lesionado compromete su salud a largo plazo.',
    'https://images.unsplash.com/photo-1517438322307-e67111335449?w=800',
    ARRAY['lesiones','prevencion','salud'],
    'publicado',
    NOW() - INTERVAL '30 days'
  ),
  (
    editor_id,
    'Cómo elegir tu primer gimnasio de artes marciales',
    'como-elegir-primer-gimnasio-artes-marciales',
    'No todos los gimnasios son iguales. Te damos las claves para elegir el mejor espacio para comenzar tu aventura marcial.',
    E'## Cómo elegir tu primer gimnasio\n\nLa elección del gimnasio puede marcar la diferencia entre abandonar al mes o convertirte en un practicante de por vida.\n\n### Instalaciones\n\nUn buen tatami es fundamental. Debe ser lo suficientemente grueso y estar limpio. La higiene en las artes marciales de contacto no es opcional.\n\n### El instructor\n\nLa calificación del instructor importa, pero más importante es su capacidad pedagógica. Busca instructores que:\n\n- Expliquen el por qué de cada técnica\n- Adapten el entrenamiento a los diferentes niveles\n- Tengan experiencia con alumnos que tienen lesiones\n\n### La comunidad\n\nVisita el gimnasio antes de apuntarte. ¿Los más avanzados ayudan a los principiantes? Una buena comunidad hace el camino mucho más agradable.\n\n### Nuestra recomendación\n\nUsa FightMatch para filtrar gimnasios por tu ciudad, las artes que te interesan y, si tienes lesiones, por compatibilidad.',
    'https://images.unsplash.com/photo-1591261730799-ee4e6c2d16d7?w=800',
    ARRAY['guia','principiantes','gimnasios'],
    'publicado',
    NOW() - INTERVAL '40 days'
  )
  ON CONFLICT (slug) DO NOTHING;

END $$;
