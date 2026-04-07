const router = require('express').Router();
const pool = require('../db/pool');
const { auth, requireRol } = require('../middleware/auth');

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM artes_marciales WHERE activo=TRUE ORDER BY nombre'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT am.*,
              json_agg(json_build_object(
                'lesion', l.nombre,
                'zona', l.zona_corporal,
                'compatible', c.compatible,
                'nivel', c.nivel_recomendado,
                'notas', c.notas
              )) FILTER (WHERE l.id IS NOT NULL) AS compatibilidades
       FROM artes_marciales am
       LEFT JOIN compatibilidades c ON c.arte_marcial_id = am.id
       LEFT JOIN lesiones l ON l.id = c.lesion_id
       WHERE am.slug = $1
       GROUP BY am.id`,
      [req.params.slug]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Arte marcial no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

router.post('/', auth, requireRol('admin', 'editor'), async (req, res) => {
  const { nombre, slug, descripcion, imagen_url, impacto_fisico } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO artes_marciales (nombre, slug, descripcion, imagen_url, impacto_fisico)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [nombre, slug, descripcion, imagen_url, impacto_fisico]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Nombre o slug duplicado' });
    res.status(500).json({ error: 'Error interno' });
  }
});

router.put('/:id', auth, requireRol('admin', 'editor'), async (req, res) => {
  const { nombre, slug, descripcion, imagen_url, impacto_fisico } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE artes_marciales
       SET nombre=$1, slug=$2, descripcion=$3, imagen_url=$4, impacto_fisico=$5
       WHERE id=$6 RETURNING *`,
      [nombre, slug, descripcion, imagen_url, impacto_fisico, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'No encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

router.delete('/:id', auth, requireRol('admin'), async (req, res) => {
  try {
    await pool.query('UPDATE artes_marciales SET activo=FALSE WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
