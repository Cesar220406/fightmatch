const router = require('express').Router();
const pool = require('../db/pool');
const { auth, requireRol } = require('../middleware/auth');

// GET /api/posts
router.get('/', async (req, res) => {
  const { page = 1, limit = 10, etiqueta } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  const conditions = ["p.estado = 'publicado'"];

  if (etiqueta) {
    params.push(etiqueta);
    conditions.push(`EXISTS (
      SELECT 1 FROM post_etiquetas pe WHERE pe.post_id = p.id AND pe.etiqueta = $${params.length}
    )`);
  }

  params.push(Number(limit), Number(offset));
  const where = conditions.join(' AND ');

  try {
    const { rows } = await pool.query(
      `SELECT p.id, p.titulo, p.slug, p.resumen, p.imagen_portada, p.publicado_en,
              u.nombre AS autor_nombre,
              array_agg(DISTINCT pe.etiqueta) FILTER (WHERE pe.etiqueta IS NOT NULL) AS etiquetas
       FROM posts p
       JOIN usuarios u ON u.id = p.autor_id
       LEFT JOIN post_etiquetas pe ON pe.post_id = p.id
       WHERE ${where}
       GROUP BY p.id, u.nombre
       ORDER BY p.publicado_en DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// GET /api/posts/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, u.nombre AS autor_nombre, u.avatar_url AS autor_avatar,
              array_agg(DISTINCT pe.etiqueta) FILTER (WHERE pe.etiqueta IS NOT NULL) AS etiquetas
       FROM posts p
       JOIN usuarios u ON u.id = p.autor_id
       LEFT JOIN post_etiquetas pe ON pe.post_id = p.id
       WHERE p.slug = $1 AND p.estado = 'publicado'
       GROUP BY p.id, u.nombre, u.avatar_url`,
      [req.params.slug]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Post no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

// POST /api/posts
router.post('/', auth, requireRol('admin', 'editor'), async (req, res) => {
  const { titulo, slug, resumen, contenido, imagen_portada, estado = 'borrador', etiquetas = [] } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO posts (autor_id, titulo, slug, resumen, contenido, imagen_portada, estado, publicado_en)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.user.id, titulo, slug, resumen, contenido, imagen_portada, estado,
       estado === 'publicado' ? new Date() : null]
    );
    const post = rows[0];
    for (const tag of etiquetas) {
      await client.query(
        'INSERT INTO post_etiquetas (post_id, etiqueta) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [post.id, tag]
      );
    }
    await client.query('COMMIT');
    res.status(201).json(post);
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') return res.status(409).json({ error: 'Slug ya en uso' });
    res.status(500).json({ error: 'Error interno' });
  } finally {
    client.release();
  }
});

module.exports = router;
