const router = require('express').Router();
const pool = require('../db/pool');
const { auth, requireRol } = require('../middleware/auth');

// GET /api/posts  (admin puede pasar ?admin=true para ver todos los estados)
router.get('/', async (req, res) => {
  const { page = 1, limit = 10, etiqueta, admin } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  const conditions = admin === 'true' ? [] : ["p.estado = 'publicado'"];

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

// PUT /api/posts/:id
router.put('/:id', auth, requireRol('admin', 'editor'), async (req, res) => {
  const { titulo, slug, resumen, contenido, imagen_portada, estado, etiquetas = [] } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE posts SET titulo=$1, slug=$2, resumen=$3, contenido=$4,
              imagen_portada=$5, estado=$6,
              publicado_en = CASE WHEN $6='publicado' AND publicado_en IS NULL THEN NOW() ELSE publicado_en END
       WHERE id=$7 RETURNING *`,
      [titulo, slug, resumen, contenido, imagen_portada, estado, req.params.id]
    );
    if (!rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'No encontrado' }); }
    await client.query('DELETE FROM post_etiquetas WHERE post_id=$1', [req.params.id]);
    for (const tag of etiquetas) {
      await client.query('INSERT INTO post_etiquetas (post_id, etiqueta) VALUES ($1,$2) ON CONFLICT DO NOTHING', [req.params.id, tag]);
    }
    await client.query('COMMIT');
    res.json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Error interno' });
  } finally {
    client.release();
  }
});

// DELETE /api/posts/:id
router.delete('/:id', auth, requireRol('admin', 'editor'), async (req, res) => {
  try {
    await pool.query('DELETE FROM post_etiquetas WHERE post_id=$1', [req.params.id]);
    await pool.query('DELETE FROM posts WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
