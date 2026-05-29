const router = require('express').Router();
const pool   = require('../db/pool');
const { auth, requireRol } = require('../middleware/auth');

// rutas publicas de noticias (no necesitan login)
router.get('/', async (req, res) => {
  const { categoria, destacada, limit = 20, offset = 0 } = req.query;
  const conditions = ['publicado = TRUE'];
  const params = [];

  if (categoria) {
    params.push(categoria);
    conditions.push(`categoria = $${params.length}`);
  }
  if (destacada !== undefined) {
    params.push(destacada === 'true');
    conditions.push(`destacada = $${params.length}`);
  }

  params.push(Number(limit), Number(offset));

  try {
    const { rows } = await pool.query(
      `SELECT id, slug, titulo, subtitulo, resumen, imagen_url, imagen_alt,
              categoria, autor, destacada, fecha_publicacion, views,
              CEIL(LENGTH(contenido)::numeric / 800)::int AS tiempo_lectura
       FROM noticias
       WHERE ${conditions.join(' AND ')}
       ORDER BY fecha_publicacion DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error('[noticias GET]', err.message);
    res.status(500).json({ error: 'Error interno' });
  }
});

// GET /api/noticias/mas-leidas — top 5 por vistas (sidebar widget)
router.get('/mas-leidas', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT slug, titulo, categoria, views, imagen_url
       FROM noticias
       WHERE publicado = TRUE
       ORDER BY views DESC
       LIMIT 5`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

// GET /api/noticias/categorias — conteo por categoría (sidebar widget)
router.get('/categorias', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT categoria, COUNT(*) AS total
       FROM noticias
       WHERE publicado = TRUE
       GROUP BY categoria
       ORDER BY total DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

// GET /api/noticias/admin/todas — listado completo para admin (requiere auth)
router.get('/admin/todas', auth, requireRol('admin', 'editor'), async (req, res) => {
  const { limit = 50, offset = 0 } = req.query;
  try {
    const { rows } = await pool.query(
      `SELECT id, slug, titulo, categoria, publicado, destacada, views,
              fecha_publicacion, autor,
              CEIL(LENGTH(contenido)::numeric / 800)::int AS tiempo_lectura
       FROM noticias
       ORDER BY fecha_publicacion DESC
       LIMIT $1 OFFSET $2`,
      [Number(limit), Number(offset)]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

// GET /api/noticias/:slug — artículo completo (incrementa views)
router.get('/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM noticias WHERE slug = $1 AND publicado = TRUE`,
      [req.params.slug]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Noticia no encontrada' });

    // sumo una vista sin bloquear la respuesta
    pool.query(
      'UPDATE noticias SET views = views + 1 WHERE slug = $1',
      [req.params.slug]
    ).catch(() => {});

    res.json(rows[0]);
  } catch (err) {
    console.error('[noticias/:slug GET]', err.message);
    res.status(500).json({ error: 'Error interno' });
  }
});

/* Escritura (admin / editor) */

// POST /api/noticias — crear noticia
router.post('/', auth, requireRol('admin', 'editor'), async (req, res) => {
  const {
    slug, titulo, subtitulo, contenido, resumen,
    imagen_url, imagen_alt, categoria, autor,
    publicado, destacada, fecha_publicacion,
  } = req.body;

  if (!slug || !titulo || !contenido || !categoria) {
    return res.status(400).json({
      error: 'slug, titulo, contenido y categoria son obligatorios',
    });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO noticias
         (slug, titulo, subtitulo, contenido, resumen, imagen_url, imagen_alt,
          categoria, autor, publicado, destacada, fecha_publicacion)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,COALESCE($12::timestamptz, NOW()))
       RETURNING *`,
      [
        slug, titulo, subtitulo || null, contenido, resumen || null,
        imagen_url || null, imagen_alt || null, categoria,
        autor || 'Redacción FightMatch',
        publicado ?? false, destacada ?? false,
        fecha_publicacion || null,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[noticias POST]', err.message);
    if (err.code === '23505') return res.status(409).json({ error: 'Slug ya en uso' });
    res.status(500).json({ error: 'Error interno' });
  }
});

// PUT /api/noticias/:slug — actualizar noticia
router.put('/:slug', auth, requireRol('admin', 'editor'), async (req, res) => {
  const {
    titulo, subtitulo, contenido, resumen,
    imagen_url, imagen_alt, categoria, autor,
    publicado, destacada,
  } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE noticias
       SET titulo=$1, subtitulo=$2, contenido=$3, resumen=$4,
           imagen_url=$5, imagen_alt=$6, categoria=$7, autor=$8,
           publicado=$9, destacada=$10
       WHERE slug=$11
       RETURNING *`,
      [
        titulo, subtitulo || null, contenido, resumen || null,
        imagen_url || null, imagen_alt || null, categoria,
        autor || 'Redacción FightMatch',
        publicado ?? false, destacada ?? false,
        req.params.slug,
      ]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Noticia no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[noticias PUT]', err.message);
    res.status(500).json({ error: 'Error interno' });
  }
});

// PATCH /api/noticias/:slug/publicar — toggle publicado
router.patch('/:slug/publicar', auth, requireRol('admin', 'editor'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE noticias SET publicado = NOT publicado WHERE slug=$1 RETURNING slug, publicado`,
      [req.params.slug]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Noticia no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

// DELETE /api/noticias/:slug — borrar (solo admin)
router.delete('/:slug', auth, requireRol('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM noticias WHERE slug=$1', [req.params.slug]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
