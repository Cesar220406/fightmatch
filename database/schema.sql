-- ============================================================
-- FightMatch - Esquema de base de datos
-- PostgreSQL
-- ============================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================
-- ENUM Types
-- ============================================================

CREATE TYPE rol_usuario AS ENUM ('admin', 'gimnasio', 'cliente', 'editor');
CREATE TYPE nivel_experiencia AS ENUM ('principiante', 'intermedio', 'avanzado');
CREATE TYPE severidad_lesion AS ENUM ('leve', 'moderada', 'grave');
CREATE TYPE estado_publicacion AS ENUM ('borrador', 'publicado', 'archivado');

-- ============================================================
-- USUARIOS
-- ============================================================

CREATE TABLE usuarios (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    nombre          VARCHAR(100) NOT NULL,
    apellidos       VARCHAR(150),
    rol             rol_usuario NOT NULL DEFAULT 'cliente',
    avatar_url      TEXT,
    telefono        VARCHAR(20),
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    email_verificado BOOLEAN NOT NULL DEFAULT FALSE,
    token_verificacion VARCHAR(255),
    token_reset_password VARCHAR(255),
    token_reset_expira TIMESTAMPTZ,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- ============================================================
-- ARTES MARCIALES
-- ============================================================

CREATE TABLE artes_marciales (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL UNIQUE,
    slug            VARCHAR(120) NOT NULL UNIQUE,
    descripcion     TEXT,
    imagen_url      TEXT,
    impacto_fisico  TEXT,   -- descripción del tipo de esfuerzo físico que implica
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_artes_marciales_slug ON artes_marciales(slug);

-- ============================================================
-- LESIONES
-- ============================================================

CREATE TABLE lesiones (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(150) NOT NULL UNIQUE,
    slug            VARCHAR(170) NOT NULL UNIQUE,
    descripcion     TEXT,
    zona_corporal   VARCHAR(100),   -- ej: rodilla, hombro, columna, etc.
    severidad       severidad_lesion NOT NULL DEFAULT 'leve',
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lesiones_slug ON lesiones(slug);
CREATE INDEX idx_lesiones_zona ON lesiones(zona_corporal);

-- ============================================================
-- COMPATIBILIDADES (arte marcial <-> lesión)
-- ============================================================

CREATE TABLE compatibilidades (
    id                  SERIAL PRIMARY KEY,
    arte_marcial_id     INTEGER NOT NULL REFERENCES artes_marciales(id) ON DELETE CASCADE,
    lesion_id           INTEGER NOT NULL REFERENCES lesiones(id) ON DELETE CASCADE,
    compatible          BOOLEAN NOT NULL,            -- TRUE = recomendado, FALSE = contraindicado
    nivel_recomendado   nivel_experiencia,           -- nivel máximo recomendado con esta lesión
    notas               TEXT,                        -- observaciones del profesional/editor
    creado_por          UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (arte_marcial_id, lesion_id)
);

CREATE INDEX idx_compatibilidades_arte ON compatibilidades(arte_marcial_id);
CREATE INDEX idx_compatibilidades_lesion ON compatibilidades(lesion_id);
CREATE INDEX idx_compatibilidades_compatible ON compatibilidades(compatible);

-- ============================================================
-- GIMNASIOS
-- ============================================================

CREATE TABLE gimnasios (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    propietario_id  UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    nombre          VARCHAR(200) NOT NULL,
    slug            VARCHAR(220) NOT NULL UNIQUE,
    descripcion     TEXT,
    direccion       VARCHAR(300),
    ciudad          VARCHAR(100),
    provincia       VARCHAR(100),
    codigo_postal   VARCHAR(10),
    pais            VARCHAR(100) NOT NULL DEFAULT 'España',
    latitud         DECIMAL(10, 8),
    longitud        DECIMAL(11, 8),
    telefono        VARCHAR(20),
    email_contacto  VARCHAR(255),
    sitio_web       TEXT,
    imagen_url      TEXT,
    imagenes        TEXT[],                          -- array de URLs de imágenes adicionales
    horario         JSONB,                           -- horarios por día de la semana
    precio_desde    DECIMAL(8, 2),
    verificado      BOOLEAN NOT NULL DEFAULT FALSE,
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gimnasios_slug ON gimnasios(slug);
CREATE INDEX idx_gimnasios_ciudad ON gimnasios(ciudad);
CREATE INDEX idx_gimnasios_propietario ON gimnasios(propietario_id);
CREATE INDEX idx_gimnasios_ubicacion ON gimnasios(latitud, longitud);

-- ============================================================
-- GIMNASIO <-> ARTES MARCIALES (relación M:N)
-- ============================================================

CREATE TABLE gimnasio_artes_marciales (
    gimnasio_id     UUID NOT NULL REFERENCES gimnasios(id) ON DELETE CASCADE,
    arte_marcial_id INTEGER NOT NULL REFERENCES artes_marciales(id) ON DELETE CASCADE,
    PRIMARY KEY (gimnasio_id, arte_marcial_id)
);

-- ============================================================
-- PERFIL DE LESIONES DEL CLIENTE
-- ============================================================

CREATE TABLE usuario_lesiones (
    id              SERIAL PRIMARY KEY,
    usuario_id      UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    lesion_id       INTEGER NOT NULL REFERENCES lesiones(id) ON DELETE CASCADE,
    activa          BOOLEAN NOT NULL DEFAULT TRUE,
    notas           TEXT,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (usuario_id, lesion_id)
);

CREATE INDEX idx_usuario_lesiones_usuario ON usuario_lesiones(usuario_id);

-- ============================================================
-- ARTES MARCIALES QUE PRACTICA EL USUARIO
-- ============================================================
CREATE TABLE usuario_artes_marciales (
  usuario_id      UUID    NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  arte_marcial_id INTEGER NOT NULL REFERENCES artes_marciales(id) ON DELETE CASCADE,
  creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (usuario_id, arte_marcial_id)
);
CREATE INDEX idx_uam_usuario ON usuario_artes_marciales(usuario_id);

-- ============================================================
-- POSTS DE BLOG
-- ============================================================

CREATE TABLE posts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    autor_id        UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    titulo          VARCHAR(300) NOT NULL,
    slug            VARCHAR(320) NOT NULL UNIQUE,
    resumen         VARCHAR(500),
    contenido       TEXT NOT NULL,
    imagen_portada  TEXT,
    estado          estado_publicacion NOT NULL DEFAULT 'borrador',
    publicado_en    TIMESTAMPTZ,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_autor ON posts(autor_id);
CREATE INDEX idx_posts_estado ON posts(estado);
CREATE INDEX idx_posts_publicado ON posts(publicado_en DESC);

-- ============================================================
-- POST <-> ETIQUETAS (relación M:N mediante tags inline)
-- ============================================================

CREATE TABLE post_etiquetas (
    post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    etiqueta        VARCHAR(80) NOT NULL,
    PRIMARY KEY (post_id, etiqueta)
);

-- ============================================================
-- POST <-> ARTES MARCIALES (artículos relacionados)
-- ============================================================

CREATE TABLE post_artes_marciales (
    post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    arte_marcial_id INTEGER NOT NULL REFERENCES artes_marciales(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, arte_marcial_id)
);

-- ============================================================
-- FAVORITOS (cliente guarda gimnasios)
-- ============================================================

CREATE TABLE favoritos (
    usuario_id      UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    gimnasio_id     UUID NOT NULL REFERENCES gimnasios(id) ON DELETE CASCADE,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (usuario_id, gimnasio_id)
);

-- ============================================================
-- FUNCIÓN: actualizar updated_at automáticamente
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_gimnasios_updated_at
    BEFORE UPDATE ON gimnasios
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_compatibilidades_updated_at
    BEFORE UPDATE ON compatibilidades
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- CONTACTOS (mensajes de visitantes a gimnasios)
-- ============================================================

CREATE TABLE contactos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gimnasio_id     UUID NOT NULL REFERENCES gimnasios(id) ON DELETE CASCADE,
    nombre          VARCHAR(150) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    mensaje         TEXT NOT NULL,
    leido           BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contactos_gimnasio ON contactos(gimnasio_id);
CREATE INDEX idx_contactos_leido    ON contactos(leido);

-- ============================================================
-- GIMNASIO_TRABAJADORES (equipo del gimnasio)
-- ============================================================

CREATE TABLE gimnasio_trabajadores (
    gimnasio_id UUID        NOT NULL REFERENCES gimnasios(id) ON DELETE CASCADE,
    usuario_id  UUID        NOT NULL REFERENCES usuarios(id)  ON DELETE CASCADE,
    rol_equipo  VARCHAR(50) NOT NULL DEFAULT 'entrenador',
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (gimnasio_id, usuario_id)
);

CREATE INDEX idx_gt_gimnasio ON gimnasio_trabajadores(gimnasio_id);
CREATE INDEX idx_gt_usuario  ON gimnasio_trabajadores(usuario_id);
