-- ============================================================
-- FightMatch - Datos de ejemplo (seed)
-- ============================================================

-- Artes marciales
INSERT INTO artes_marciales (nombre, slug, descripcion, impacto_fisico) VALUES
('Boxeo',           'boxeo',            'Arte marcial de golpeo con puños.',                     'Alto impacto en hombros, muñecas y núcleo. Cardio intenso.'),
('Judo',            'judo',             'Arte marcial japonesa basada en proyecciones.',          'Alto impacto en rodillas, caderas y columna lumbar.'),
('Yoga Marcial',    'yoga-marcial',     'Fusión de yoga y técnicas marciales de baja intensidad.','Bajo impacto. Trabaja flexibilidad y equilibrio.'),
('Tai Chi',         'tai-chi',          'Arte marcial china de movimientos lentos y fluidos.',    'Mínimo impacto. Ideal para rehabilitación y mayores.'),
('BJJ',             'bjj',              'Brazilian Jiu-Jitsu, lucha en suelo.',                  'Moderado-alto. Exige rodillas, caderas y hombros.'),
('Muay Thai',       'muay-thai',        'Arte marcial tailandesa de ocho puntos de contacto.',   'Alto impacto. Rodillas, tobillos y caderas con alta carga.'),
('Karate',          'karate',           'Arte marcial japonesa de golpeo con manos y pies.',     'Moderado. Equilibrio entre impacto y técnica.'),
('Taekwondo',       'taekwondo',        'Arte marcial coreana enfocada en patadas.',              'Alto impacto en rodillas y tobillos por las patadas.');

-- Lesiones
INSERT INTO lesiones (nombre, slug, zona_corporal, severidad, descripcion) VALUES
('Rotura de ligamento cruzado anterior', 'rotura-lca',            'rodilla',  'grave',    'Lesión del LCA, común en deportes de pivote y salto.'),
('Tendinitis rotuliana',                 'tendinitis-rotuliana',  'rodilla',  'moderada', 'Inflamación del tendón rotuliano.'),
('Lesión de manguito rotador',           'manguito-rotador',      'hombro',   'moderada', 'Daño en los tendones que rodean el hombro.'),
('Hernia discal lumbar',                 'hernia-discal-lumbar',  'columna',  'moderada', 'Protrusión del disco intervertebral en zona lumbar.'),
('Esguince de tobillo',                  'esguince-tobillo',      'tobillo',  'leve',     'Distensión o rotura parcial de ligamentos del tobillo.'),
('Epicondilitis lateral (codo de tenis)','epicondilitis-lateral', 'codo',     'leve',     'Inflamación de los tendones del codo por uso repetitivo.'),
('Fractura de muñeca (recuperada)',      'fractura-muneca',       'muñeca',   'moderada', 'Fractura consolidada pero con posible limitación de movilidad.'),
('Dolor crónico de rodilla',             'dolor-cronico-rodilla', 'rodilla',  'leve',     'Dolor persistente sin lesión estructural grave.');

-- Compatibilidades
INSERT INTO compatibilidades (arte_marcial_id, lesion_id, compatible, nivel_recomendado, notas) VALUES
-- Boxeo
(1, 3, FALSE, NULL,            'El trabajo de golpeo agrava el manguito rotador. Contraindicado.'),
(1, 6, FALSE, NULL,            'Los golpes repetitivos empeoran la epicondilitis.'),
(1, 7, FALSE, NULL,            'Contraindicado hasta recuperación total de muñeca.'),
-- Tai Chi (bajo impacto, muy compatible)
(4, 1, TRUE,  'principiante',  'Movimientos lentos y sin impacto. Ideal en rehabilitación post-LCA.'),
(4, 2, TRUE,  'principiante',  'Sin cargas articulares bruscas. Recomendado con precaución.'),
(4, 3, TRUE,  'intermedio',    'Los movimientos suaves de hombro favorecen la recuperación.'),
(4, 4, TRUE,  'principiante',  'Postura erguida y movimientos lentos. Adecuado para hernia lumbar leve.'),
-- Yoga Marcial
(3, 1, TRUE,  'principiante',  'Bajo impacto. Ayuda a recuperar movilidad tras LCA.'),
(3, 4, TRUE,  'intermedio',    'Fortalece el core reduciendo presión lumbar. Evitar flexiones extremas.'),
-- BJJ
(5, 1, FALSE, NULL,            'Pivotes y caídas comprometen el LCA. Contraindicado.'),
(5, 4, FALSE, NULL,            'Las posiciones en suelo pueden sobrecargar la lumbar.'),
-- Muay Thai
(6, 1, FALSE, NULL,            'Rodillazo y patadas implican alto riesgo para el LCA.'),
(6, 5, FALSE, NULL,            'Alto impacto en tobillo. Contraindicado con esguince reciente.'),
-- Karate
(7, 5, TRUE,  'intermedio',    'Con tobillo recuperado y vendaje, se puede practicar kata con precaución.'),
(7, 2, FALSE, NULL,            'Las patadas y golpes sobrecargan el tendón rotuliano.'),
-- Taekwondo
(8, 1, FALSE, NULL,            'Las patadas altas son de alto riesgo para el LCA.'),
(8, 2, FALSE, NULL,            'Gran carga sobre el tendón rotuliano. Contraindicado.');
