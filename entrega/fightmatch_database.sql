
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TIPOS PERSONALIZADOS (ENUMS)
-- ============================================================

DROP TYPE IF EXISTS rol_usuario CASCADE;
DROP TYPE IF EXISTS severidad_lesion CASCADE;
DROP TYPE IF EXISTS nivel_experiencia CASCADE;
DROP TYPE IF EXISTS estado_publicacion CASCADE;

CREATE TYPE rol_usuario      AS ENUM ('admin', 'gimnasio', 'cliente', 'editor');
CREATE TYPE severidad_lesion AS ENUM ('leve', 'moderada', 'grave');
CREATE TYPE nivel_experiencia AS ENUM ('principiante', 'intermedio', 'avanzado');
CREATE TYPE estado_publicacion AS ENUM ('borrador', 'publicado', 'archivado');

-- ============================================================
-- DROP TABLES (orden inverso a las dependencias FK)
-- ============================================================

DROP TABLE IF EXISTS notificaciones           CASCADE;
DROP TABLE IF EXISTS pagos                    CASCADE;
DROP TABLE IF EXISTS suscripciones            CASCADE;
DROP TABLE IF EXISTS clases                   CASCADE;
DROP TABLE IF EXISTS planes                   CASCADE;
DROP TABLE IF EXISTS events                   CASCADE;
DROP TABLE IF EXISTS reviews                  CASCADE;
DROP TABLE IF EXISTS contactos                CASCADE;
DROP TABLE IF EXISTS favoritos                CASCADE;
DROP TABLE IF EXISTS post_etiquetas           CASCADE;
DROP TABLE IF EXISTS post_artes_marciales     CASCADE;
DROP TABLE IF EXISTS posts                    CASCADE;
DROP TABLE IF EXISTS usuario_artes_marciales  CASCADE;
DROP TABLE IF EXISTS usuario_lesiones         CASCADE;
DROP TABLE IF EXISTS gimnasio_trabajadores    CASCADE;
DROP TABLE IF EXISTS gimnasio_artes_marciales CASCADE;
DROP TABLE IF EXISTS compatibilidades         CASCADE;
DROP TABLE IF EXISTS noticias                 CASCADE;
DROP TABLE IF EXISTS lesiones                 CASCADE;
DROP TABLE IF EXISTS artes_marciales          CASCADE;
DROP TABLE IF EXISTS gimnasios                CASCADE;
DROP TABLE IF EXISTS usuarios                 CASCADE;

-- ============================================================
-- TABLAS
-- ============================================================

CREATE TABLE usuarios (
  id                   UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  email                VARCHAR(255) NOT NULL UNIQUE,
  password_hash        VARCHAR(255) NOT NULL,
  nombre               VARCHAR(100) NOT NULL,
  apellidos            VARCHAR(100),
  rol                  rol_usuario  NOT NULL DEFAULT 'cliente',
  avatar_url           TEXT,
  telefono             VARCHAR(20),
  activo               BOOLEAN      NOT NULL DEFAULT TRUE,
  email_verificado     BOOLEAN      NOT NULL DEFAULT FALSE,
  token_verificacion   VARCHAR(255),
  token_reset_password VARCHAR(255),
  token_reset_expira   TIMESTAMPTZ,
  creado_en            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  actualizado_en       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE gimnasios (
  id             UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  propietario_id UUID         NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre         VARCHAR(200) NOT NULL,
  slug           VARCHAR(220) NOT NULL UNIQUE,
  descripcion    TEXT,
  direccion      VARCHAR(300),
  ciudad         VARCHAR(100),
  provincia      VARCHAR(100),
  codigo_postal  VARCHAR(10),
  pais           VARCHAR(50)  NOT NULL DEFAULT 'España',
  latitud        NUMERIC(9,6),
  longitud       NUMERIC(9,6),
  telefono       VARCHAR(20),
  email_contacto VARCHAR(255),
  sitio_web      TEXT,
  imagen_url     TEXT,
  imagenes       TEXT[],
  horario        JSONB,
  precio_desde   NUMERIC(8,2),
  verificado     BOOLEAN      NOT NULL DEFAULT FALSE,
  activo         BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE artes_marciales (
  id            SERIAL       PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL UNIQUE,
  slug          VARCHAR(110) NOT NULL UNIQUE,
  descripcion   TEXT,
  imagen_url    TEXT,
  impacto_fisico TEXT,
  activo        BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE lesiones (
  id            SERIAL       PRIMARY KEY,
  nombre        VARCHAR(200) NOT NULL UNIQUE,
  slug          VARCHAR(220) NOT NULL UNIQUE,
  descripcion   TEXT,
  zona_corporal VARCHAR(100),
  severidad     severidad_lesion NOT NULL DEFAULT 'leve',
  activo        BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- tabla puente artes <-> lesiones con datos de compatibilidad
CREATE TABLE compatibilidades (
  id               SERIAL  PRIMARY KEY,
  arte_marcial_id  INTEGER NOT NULL REFERENCES artes_marciales(id) ON DELETE CASCADE,
  lesion_id        INTEGER NOT NULL REFERENCES lesiones(id) ON DELETE CASCADE,
  compatible       BOOLEAN NOT NULL,
  nivel_recomendado nivel_experiencia,
  notas            TEXT,
  creado_por       UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  creado_en        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (arte_marcial_id, lesion_id)
);

-- qué artes imparte cada gimnasio
CREATE TABLE gimnasio_artes_marciales (
  gimnasio_id     UUID    NOT NULL REFERENCES gimnasios(id) ON DELETE CASCADE,
  arte_marcial_id INTEGER NOT NULL REFERENCES artes_marciales(id) ON DELETE CASCADE,
  PRIMARY KEY (gimnasio_id, arte_marcial_id)
);

-- trabajadores / equipo del gimnasio
CREATE TABLE gimnasio_trabajadores (
  gimnasio_id UUID         NOT NULL REFERENCES gimnasios(id) ON DELETE CASCADE,
  usuario_id  UUID         NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  rol_equipo  VARCHAR(50)  NOT NULL DEFAULT 'entrenador',
  creado_en   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  PRIMARY KEY (gimnasio_id, usuario_id)
);

CREATE TABLE posts (
  id             UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  autor_id       UUID         NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo         VARCHAR(300) NOT NULL,
  slug           VARCHAR(320) NOT NULL UNIQUE,
  resumen        VARCHAR(500),
  contenido      TEXT         NOT NULL,
  imagen_portada TEXT,
  estado         estado_publicacion NOT NULL DEFAULT 'borrador',
  publicado_en   TIMESTAMPTZ,
  creado_en      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE post_etiquetas (
  post_id  UUID         NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  etiqueta VARCHAR(100) NOT NULL,
  PRIMARY KEY (post_id, etiqueta)
);

CREATE TABLE post_artes_marciales (
  post_id         UUID    NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  arte_marcial_id INTEGER NOT NULL REFERENCES artes_marciales(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, arte_marcial_id)
);

CREATE TABLE favoritos (
  usuario_id  UUID        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  gimnasio_id UUID        NOT NULL REFERENCES gimnasios(id) ON DELETE CASCADE,
  creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (usuario_id, gimnasio_id)
);

CREATE TABLE contactos (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  gimnasio_id UUID        NOT NULL REFERENCES gimnasios(id) ON DELETE CASCADE,
  nombre      VARCHAR(100) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  mensaje     TEXT        NOT NULL,
  leido       BOOLEAN     NOT NULL DEFAULT FALSE,
  creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reviews (
  id          UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
  gimnasio_id UUID      NOT NULL REFERENCES gimnasios(id) ON DELETE CASCADE,
  usuario_id  UUID      NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  puntuacion  SMALLINT  NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
  comentario  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (gimnasio_id, usuario_id)
);

-- artes que practica cada usuario (para recomendaciones)
CREATE TABLE usuario_artes_marciales (
  usuario_id      UUID    NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  arte_marcial_id INTEGER NOT NULL REFERENCES artes_marciales(id) ON DELETE CASCADE,
  creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (usuario_id, arte_marcial_id)
);

-- lesiones que tiene cada usuario
CREATE TABLE usuario_lesiones (
  id         SERIAL  PRIMARY KEY,
  usuario_id UUID    NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  lesion_id  INTEGER NOT NULL REFERENCES lesiones(id) ON DELETE CASCADE,
  activa     BOOLEAN NOT NULL DEFAULT TRUE,
  notas      TEXT,
  creado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (usuario_id, lesion_id)
);

-- noticias del diario de artes marciales
CREATE TABLE noticias (
  id                UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug              VARCHAR(320) NOT NULL UNIQUE,
  titulo            VARCHAR(400) NOT NULL,
  subtitulo         VARCHAR(500),
  contenido         TEXT         NOT NULL,
  resumen           VARCHAR(500),
  imagen_url        VARCHAR(500),
  imagen_alt        VARCHAR(200),
  categoria         VARCHAR(50)  NOT NULL,
  autor             VARCHAR(100) DEFAULT 'Redaccion FightMatch',
  publicado         BOOLEAN      DEFAULT FALSE,
  destacada         BOOLEAN      DEFAULT FALSE,
  fecha_publicacion TIMESTAMPTZ  DEFAULT NOW(),
  created_at        TIMESTAMPTZ  DEFAULT NOW(),
  views             INTEGER      DEFAULT 0
);

-- tracking de interacciones (fire and forget, no bloquea nada)
CREATE TABLE events (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo       VARCHAR(100) NOT NULL,
  payload    JSONB        NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- planes de suscripcion de los gimnasios
CREATE TABLE planes (
  id          SERIAL       PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL UNIQUE,
  precio      NUMERIC(10,2) NOT NULL,
  descripcion TEXT,
  activo      BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- suscripciones usuario <-> gimnasio <-> plan
CREATE TABLE suscripciones (
  id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id    UUID         NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  gimnasio_id   UUID         NOT NULL REFERENCES gimnasios(id) ON DELETE CASCADE,
  plan_id       INTEGER      NOT NULL REFERENCES planes(id),
  estado        VARCHAR(20)  NOT NULL DEFAULT 'activa'
                  CHECK (estado IN ('activa','pausada','cancelada','vencida')),
  fecha_inicio  DATE         NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin     DATE         NOT NULL,
  precio_pagado NUMERIC(10,2) NOT NULL,
  creado_en     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE pagos (
  id             UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  suscripcion_id UUID         NOT NULL REFERENCES suscripciones(id) ON DELETE CASCADE,
  importe        NUMERIC(10,2) NOT NULL,
  estado         VARCHAR(20)  NOT NULL DEFAULT 'pagado'
                   CHECK (estado IN ('pagado','pendiente','fallido')),
  fecha_pago     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  concepto       VARCHAR(200)
);

-- clases del horario semanal del gimnasio
CREATE TABLE clases (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  gimnasio_id  UUID        NOT NULL REFERENCES gimnasios(id) ON DELETE CASCADE,
  nombre       VARCHAR(200) NOT NULL,
  instructor   VARCHAR(100),
  arte_marcial VARCHAR(100),
  dia_semana   INTEGER     NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=lunes, 6=domingo
  hora_inicio  TIME        NOT NULL,
  hora_fin     TIME        NOT NULL,
  aforo_max    INTEGER     DEFAULT 20,
  activa       BOOLEAN     NOT NULL DEFAULT TRUE,
  creado_en    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notificaciones (
  id         UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID         NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo       VARCHAR(50)  NOT NULL,
  titulo     VARCHAR(200) NOT NULL,
  mensaje    TEXT         NOT NULL,
  leida      BOOLEAN      NOT NULL DEFAULT FALSE,
  creado_en  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS gimnasios_ciudad_idx          ON gimnasios(ciudad);
CREATE INDEX IF NOT EXISTS gimnasios_propietario_idx     ON gimnasios(propietario_id);
CREATE INDEX IF NOT EXISTS compatibilidades_arte_idx     ON compatibilidades(arte_marcial_id);
CREATE INDEX IF NOT EXISTS compatibilidades_lesion_idx   ON compatibilidades(lesion_id);
CREATE INDEX IF NOT EXISTS favoritos_usuario_idx         ON favoritos(usuario_id);
CREATE INDEX IF NOT EXISTS favoritos_gimnasio_idx        ON favoritos(gimnasio_id);
CREATE INDEX IF NOT EXISTS posts_autor_idx               ON posts(autor_id);
CREATE INDEX IF NOT EXISTS posts_estado_idx              ON posts(estado);
CREATE INDEX IF NOT EXISTS noticias_categoria_idx        ON noticias(categoria);
CREATE INDEX IF NOT EXISTS noticias_publicado_idx        ON noticias(publicado, fecha_publicacion DESC);
CREATE INDEX IF NOT EXISTS suscripciones_usuario_idx     ON suscripciones(usuario_id);
CREATE INDEX IF NOT EXISTS suscripciones_gimnasio_idx    ON suscripciones(gimnasio_id);
CREATE INDEX IF NOT EXISTS clases_gimnasio_idx           ON clases(gimnasio_id);
CREATE INDEX IF NOT EXISTS notificaciones_usuario_idx    ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS events_tipo_idx               ON events(tipo);
CREATE INDEX IF NOT EXISTS usuario_lesiones_usuario_idx  ON usuario_lesiones(usuario_id);

-- ============================================================
-- SEED DATA - ARTES MARCIALES (8)
-- ============================================================

INSERT INTO artes_marciales (nombre, slug, descripcion, impacto_fisico) VALUES
('Boxeo',        'boxeo',        'Arte marcial de golpeo con puños. Trabaja coordinación, potencia y cardio.',
 'Alto impacto en hombros, muñecas y núcleo. Cardio intenso.'),
('Judo',         'judo',         'Arte marcial japonesa basada en proyecciones y derribos.',
 'Alto impacto en rodillas, caderas y columna lumbar.'),
('Yoga Marcial', 'yoga-marcial', 'Fusión de yoga y técnicas marciales de baja intensidad. Muy recomendado para rehabilitación.',
 'Bajo impacto. Trabaja flexibilidad y equilibrio.'),
('Tai Chi',      'tai-chi',      'Arte marcial china de movimientos lentos y fluidos. Ideal para todas las edades.',
 'Mínimo impacto. Adecuado para rehabilitación y mayores.'),
('BJJ',          'bjj',          'Brazilian Jiu-Jitsu, lucha en suelo con énfasis en sumisiones.',
 'Moderado-alto. Exige rodillas, caderas y hombros.'),
('Muay Thai',    'muay-thai',    'Arte marcial tailandesa de ocho puntos de contacto: puños, codos, rodillas y pies.',
 'Alto impacto. Rodillas, tobillos y caderas con alta carga.'),
('Karate',       'karate',       'Arte marcial japonesa de golpeo con manos y pies. Muy popular a nivel federado.',
 'Moderado. Equilibrio entre impacto y técnica.'),
('Taekwondo',    'taekwondo',    'Arte marcial coreana enfocada en patadas. Deporte olímpico desde el año 2000.',
 'Alto impacto en rodillas y tobillos por las patadas.');

-- ============================================================
-- SEED DATA - LESIONES (8)
-- ============================================================

INSERT INTO lesiones (nombre, slug, zona_corporal, severidad, descripcion) VALUES
('Rotura de ligamento cruzado anterior', 'rotura-lca',            'rodilla',  'grave',
 'Lesión del LCA, común en deportes de pivote y salto.'),
('Tendinitis rotuliana',                 'tendinitis-rotuliana',  'rodilla',  'moderada',
 'Inflamación del tendón rotuliano, típica en saltadores.'),
('Lesión de manguito rotador',           'manguito-rotador',      'hombro',   'moderada',
 'Daño en los tendones que rodean el hombro. Frecuente en deportes de lanzamiento.'),
('Hernia discal lumbar',                 'hernia-discal-lumbar',  'columna',  'moderada',
 'Protrusión del disco intervertebral en zona lumbar.'),
('Esguince de tobillo',                  'esguince-tobillo',      'tobillo',  'leve',
 'Distensión o rotura parcial de ligamentos del tobillo.'),
('Epicondilitis lateral',                'epicondilitis-lateral', 'codo',     'leve',
 'Codo de tenis. Inflamación por uso repetitivo de los extensores.'),
('Fractura de muñeca (recuperada)',      'fractura-muneca',       'muñeca',   'moderada',
 'Fractura consolidada pero con posible limitación de movilidad.'),
('Dolor crónico de rodilla',             'dolor-cronico-rodilla', 'rodilla',  'leve',
 'Dolor persistente sin lesión estructural grave. Gestión conservadora.');

-- ============================================================
-- SEED DATA - COMPATIBILIDADES
-- ============================================================

INSERT INTO compatibilidades (arte_marcial_id, lesion_id, compatible, nivel_recomendado, notas) VALUES
-- Boxeo: malo con hombro, codo y muñeca
(1, 3, FALSE, NULL,           'El trabajo de golpeo agrava el manguito rotador. Contraindicado.'),
(1, 6, FALSE, NULL,           'Los golpes repetitivos empeoran la epicondilitis.'),
(1, 7, FALSE, NULL,           'Contraindicado hasta recuperación total de muñeca.'),
-- Tai Chi: muy compatible, poco impacto
(4, 1, TRUE,  'principiante', 'Movimientos lentos sin impacto. Ideal en rehabilitación post-LCA.'),
(4, 2, TRUE,  'principiante', 'Sin cargas articulares bruscas. Recomendado con precaución.'),
(4, 3, TRUE,  'intermedio',   'Los movimientos suaves de hombro favorecen la recuperación.'),
(4, 4, TRUE,  'principiante', 'Postura erguida y movimientos lentos. Adecuado para hernia lumbar leve.'),
-- Yoga Marcial
(3, 1, TRUE,  'principiante', 'Bajo impacto. Ayuda a recuperar movilidad tras LCA.'),
(3, 4, TRUE,  'intermedio',   'Fortalece el core reduciendo presión lumbar. Evitar flexiones extremas.'),
-- BJJ: malo con LCA y lumbar
(5, 1, FALSE, NULL,           'Pivotes y caídas comprometen el LCA. Contraindicado.'),
(5, 4, FALSE, NULL,           'Las posiciones en suelo pueden sobrecargar la zona lumbar.'),
-- Muay Thai
(6, 1, FALSE, NULL,           'Rodillazo y patadas implican alto riesgo para el LCA.'),
(6, 5, FALSE, NULL,           'Alto impacto en tobillo. Contraindicado con esguince reciente.'),
-- Karate
(7, 5, TRUE,  'intermedio',   'Con tobillo recuperado y vendaje, se puede practicar kata con precaución.'),
(7, 2, FALSE, NULL,           'Las patadas y golpes sobrecargan el tendón rotuliano.'),
-- Taekwondo
(8, 1, FALSE, NULL,           'Las patadas altas son de alto riesgo para el LCA.'),
(8, 2, FALSE, NULL,           'Gran carga sobre el tendón rotuliano. Contraindicado.');

-- ============================================================
-- SEED DATA - USUARIOS (3 roles distintos)
-- Contraseñas: Admin1234! / Gimnasio1234! / Cliente1234!
-- ============================================================

INSERT INTO usuarios (id, email, password_hash, nombre, apellidos, rol, activo, email_verificado) VALUES
(
  'f405f64f-b9cf-4131-9238-583846ba3f3b',
  'admin@fightmatch.com',
  '$2a$12$WHwiYuyn92CDPFGg9wdnc.nyPncVfFMFK0wMuocI3Yo4lOgQeDzB.',
  'Admin', 'FightMatch', 'admin', TRUE, TRUE
),
(
  '4a9ed646-e6de-45f1-aeeb-128081c8fdcc',
  'gimnasio@fightmatch.com',
  '$2a$12$7L.ruvqXI0exp2B.KxLoO.TLgWRvm08D7LivQiqDST5ajRRhqAQnG',
  'Carlos', 'Martínez Ruiz', 'gimnasio', TRUE, TRUE
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'cliente@fightmatch.com',
  '$2a$12$zRRzJxBX.o1Ud952/1AgjOiCzgVhH6wn.I0/qg/G5FXRGVd6jKQkG',
  'Ana', 'García López', 'cliente', TRUE, TRUE
);

-- ============================================================
-- SEED DATA - GIMNASIOS (12, ciudades españolas)
-- ============================================================

INSERT INTO gimnasios (id, propietario_id, nombre, slug, descripcion, direccion, ciudad, provincia, telefono, email_contacto, precio_desde, verificado, latitud, longitud, horario) VALUES
(
  'f3d6e586-2443-4713-a1d4-bfc4df397f95',
  '4a9ed646-e6de-45f1-aeeb-128081c8fdcc',
  'Dragon Fight Club Madrid',
  'dragon-fight-club-madrid',
  'Gimnasio de artes marciales en el corazón de Madrid. Especialistas en boxeo y MMA desde 2010.',
  'Calle Gran Vía 42', 'Madrid', 'Madrid', '914445566',
  'info@dragonmadrid.com', 39.99, TRUE,
  40.4200, -3.7025,
  '{"lunes":"08:00-22:00","martes":"08:00-22:00","miercoles":"08:00-22:00","jueves":"08:00-22:00","viernes":"08:00-21:00","sabado":"09:00-14:00"}'
),
(
  'bebfb6c0-0449-40a9-8b35-a5639ca09c96',
  '4a9ed646-e6de-45f1-aeeb-128081c8fdcc',
  'Barcelona Martial Arts Academy',
  'barcelona-martial-arts-academy',
  'Academia de artes marciales en Gràcia. Clases de BJJ, judo y muay thai para todos los niveles.',
  'Carrer de Verdi 78', 'Barcelona', 'Barcelona', '932211445',
  'hola@bcnmartialarts.com', 45.00, TRUE,
  41.4036, 2.1588,
  '{"lunes":"09:00-21:30","martes":"09:00-21:30","miercoles":"09:00-21:30","jueves":"09:00-21:30","viernes":"09:00-20:00","sabado":"10:00-13:00"}'
),
(
  'c1d2e3f4-a5b6-7890-cdef-123456789012',
  '4a9ed646-e6de-45f1-aeeb-128081c8fdcc',
  'Valencia MMA Center',
  'valencia-mma-center',
  'Centro de MMA y deportes de contacto en Valencia. Clases para adultos y niños.',
  'Avenida del Puerto 120', 'Valencia', 'Valencia', '961234567',
  'contacto@valenciamma.es', 35.00, TRUE,
  39.4699, -0.3763,
  '{"lunes":"08:00-21:00","martes":"08:00-21:00","miercoles":"08:00-21:00","jueves":"08:00-21:00","viernes":"08:00-20:00","sabado":"09:00-13:00"}'
),
(
  'd2e3f4a5-b6c7-8901-defa-234567890123',
  '4a9ed646-e6de-45f1-aeeb-128081c8fdcc',
  'Sevilla Dojo',
  'sevilla-dojo',
  'Dojo tradicional en Sevilla con más de 20 años de historia. Karate, judo y aikido.',
  'Calle Sierpes 55', 'Sevilla', 'Sevilla', '954876543',
  'dojo@sevilladojo.com', 30.00, FALSE,
  37.3891, -5.9845,
  '{"lunes":"09:00-21:00","martes":"09:00-21:00","miercoles":"09:00-21:00","jueves":"09:00-21:00","viernes":"09:00-20:00"}'
),
(
  'e3f4a5b6-c7d8-9012-efab-345678901234',
  '4a9ed646-e6de-45f1-aeeb-128081c8fdcc',
  'Bilbao Combat Sports',
  'bilbao-combat-sports',
  'Gimnasio de combate en el Casco Viejo de Bilbao. Boxeo, kickboxing y muay thai.',
  'Calle Correo 8', 'Bilbao', 'Vizcaya', '944123456',
  'info@bilbaocombat.com', 42.00, TRUE,
  43.2627, -2.9253,
  '{"lunes":"08:00-22:00","martes":"08:00-22:00","miercoles":"08:00-22:00","jueves":"08:00-22:00","viernes":"08:00-21:00","sabado":"10:00-14:00"}'
),
(
  'f4a5b6c7-d8e9-0123-fabc-456789012345',
  '4a9ed646-e6de-45f1-aeeb-128081c8fdcc',
  'Zaragoza Lucha Club',
  'zaragoza-lucha-club',
  'Club de lucha y grappling en Zaragoza. Wrestling, BJJ y judo para todas las edades.',
  'Paseo de la Independencia 22', 'Zaragoza', 'Zaragoza', '976543210',
  'club@zaragozalucha.com', 28.00, FALSE,
  41.6488, -0.8891,
  '{"lunes":"10:00-21:00","martes":"10:00-21:00","miercoles":"10:00-21:00","jueves":"10:00-21:00","viernes":"10:00-20:00"}'
),
(
  'a5b6c7d8-e9f0-1234-abcd-567890123456',
  '4a9ed646-e6de-45f1-aeeb-128081c8fdcc',
  'Málaga Kickboxing',
  'malaga-kickboxing',
  'Escuela de kickboxing y muay thai en Málaga. Competición y fitness de combate.',
  'Calle Larios 10', 'Málaga', 'Málaga', '952345678',
  'info@malagakickboxing.com', 33.00, TRUE,
  36.7213, -4.4214,
  '{"lunes":"08:00-21:30","martes":"08:00-21:30","miercoles":"08:00-21:30","jueves":"08:00-21:30","viernes":"08:00-20:30","sabado":"09:00-13:30"}'
),
(
  'b6c7d8e9-f0a1-2345-bcde-678901234567',
  '4a9ed646-e6de-45f1-aeeb-128081c8fdcc',
  'Alicante Artes Marciales',
  'alicante-artes-marciales',
  'Centro polideportivo de artes marciales en Alicante. Taekwondo, karate y boxeo.',
  'Avenida de la Estación 12', 'Alicante', 'Alicante', '965678901',
  'info@alicanteartes.com', 29.00, FALSE,
  38.3452, -0.4810,
  '{"lunes":"09:00-21:00","martes":"09:00-21:00","miercoles":"09:00-21:00","jueves":"09:00-21:00","viernes":"09:00-20:00"}'
),
(
  'c7d8e9f0-a1b2-3456-cdef-789012345678',
  '4a9ed646-e6de-45f1-aeeb-128081c8fdcc',
  'Granada Boxeo Club',
  'granada-boxeo-club',
  'Club de boxeo con tradición en Granada. Entrenamiento técnico y competición amateur.',
  'Calle Recogidas 30', 'Granada', 'Granada', '958901234',
  'boxeo@granadaclub.com', 25.00, FALSE,
  37.1773, -3.5986,
  '{"lunes":"09:00-21:00","martes":"09:00-21:00","miercoles":"09:00-21:00","jueves":"09:00-21:00","viernes":"09:00-20:00"}'
),
(
  'd8e9f0a1-b2c3-4567-defa-890123456789',
  '4a9ed646-e6de-45f1-aeeb-128081c8fdcc',
  'Murcia BJJ Academy',
  'murcia-bjj-academy',
  'Academia de Brazilian Jiu-Jitsu en Murcia. Clases para principiantes y competidores.',
  'Gran Vía Escultor Francisco Salzillo 7', 'Murcia', 'Murcia', '968123456',
  'academy@murciabjj.com', 38.00, TRUE,
  37.9922, -1.1307,
  '{"lunes":"10:00-22:00","martes":"10:00-22:00","miercoles":"10:00-22:00","jueves":"10:00-22:00","viernes":"10:00-21:00","sabado":"10:00-13:00"}'
),
(
  'e9f0a1b2-c3d4-5678-efab-901234567890',
  '4a9ed646-e6de-45f1-aeeb-128081c8fdcc',
  'Valladolid Taekwondo',
  'valladolid-taekwondo',
  'Club de taekwondo con presencia federada en Castilla. Formación desde infantil hasta élite.',
  'Calle Santiago 12', 'Valladolid', 'Valladolid', '983234567',
  'info@valladolidtkd.com', 27.00, FALSE,
  41.6523, -4.7245,
  '{"lunes":"09:00-20:30","martes":"09:00-20:30","miercoles":"09:00-20:30","jueves":"09:00-20:30","viernes":"09:00-19:30"}'
),
(
  'f0a1b2c3-d4e5-6789-fabc-012345678901',
  '4a9ed646-e6de-45f1-aeeb-128081c8fdcc',
  'Santander Judo Club',
  'santander-judo-club',
  'Club de judo en Santander. Categorías para todas las edades y niveles desde 1998.',
  'Calle Burgos 45', 'Santander', 'Cantabria', '942345678',
  'judo@santanderclub.com', 26.00, FALSE,
  43.4623, -3.8099,
  '{"lunes":"09:00-21:00","martes":"09:00-21:00","miercoles":"09:00-21:00","jueves":"09:00-21:00","viernes":"09:00-20:00","sabado":"10:00-13:00"}'
);

-- artes marciales de cada gimnasio
INSERT INTO gimnasio_artes_marciales (gimnasio_id, arte_marcial_id) VALUES
('f3d6e586-2443-4713-a1d4-bfc4df397f95', 1), -- Dragon Madrid: Boxeo
('f3d6e586-2443-4713-a1d4-bfc4df397f95', 6), -- Dragon Madrid: Muay Thai
('bebfb6c0-0449-40a9-8b35-a5639ca09c96', 5), -- Barcelona: BJJ
('bebfb6c0-0449-40a9-8b35-a5639ca09c96', 2), -- Barcelona: Judo
('bebfb6c0-0449-40a9-8b35-a5639ca09c96', 6), -- Barcelona: Muay Thai
('c1d2e3f4-a5b6-7890-cdef-123456789012', 1), -- Valencia: Boxeo
('c1d2e3f4-a5b6-7890-cdef-123456789012', 6), -- Valencia: Muay Thai
('c1d2e3f4-a5b6-7890-cdef-123456789012', 5), -- Valencia: BJJ
('d2e3f4a5-b6c7-8901-defa-234567890123', 7), -- Sevilla: Karate
('d2e3f4a5-b6c7-8901-defa-234567890123', 2), -- Sevilla: Judo
('e3f4a5b6-c7d8-9012-efab-345678901234', 1), -- Bilbao: Boxeo
('e3f4a5b6-c7d8-9012-efab-345678901234', 6), -- Bilbao: Muay Thai
('f4a5b6c7-d8e9-0123-fabc-456789012345', 5), -- Zaragoza: BJJ
('f4a5b6c7-d8e9-0123-fabc-456789012345', 2), -- Zaragoza: Judo
('a5b6c7d8-e9f0-1234-abcd-567890123456', 6), -- Málaga: Muay Thai
('a5b6c7d8-e9f0-1234-abcd-567890123456', 1), -- Málaga: Boxeo
('d8e9f0a1-b2c3-4567-defa-890123456789', 5), -- Murcia: BJJ
('e9f0a1b2-c3d4-5678-efab-901234567890', 8), -- Valladolid: Taekwondo
('f0a1b2c3-d4e5-6789-fabc-012345678901', 2); -- Santander: Judo

-- ============================================================
-- SEED DATA - PLANES DE SUSCRIPCION
-- ============================================================

INSERT INTO planes (nombre, precio, descripcion) VALUES
('Basico',  29.99, 'Acceso a instalaciones y clases grupales'),
('Pro',     49.99, 'Todo lo basico mas clases premium y vestuarios privados'),
('Premium', 79.99, 'Acceso ilimitado, clases privadas y nutricionista')
ON CONFLICT (nombre) DO NOTHING;
