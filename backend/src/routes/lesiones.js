const router = require('express').Router();
const pool = require('../db/pool');
const { auth, requireRol } = require('../middleware/auth');

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM lesiones WHERE activo=TRUE ORDER BY zona_corporal, nombre'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT l.*,
              json_agg(json_build_object(
                'arte', am.nombre,
                'arte_slug', am.slug,
                'compatible', c.compatible,
                'nivel', c.nivel_recomendado,
                'notas', c.notas
              )) FILTER (WHERE am.id IS NOT NULL) AS artes_marciales
       FROM lesiones l
       LEFT JOIN compatibilidades c ON c.lesion_id = l.id
       LEFT JOIN artes_marciales am ON am.id = c.arte_marcial_id
       WHERE l.slug = $1
       GROUP BY l.id`,
      [req.params.slug]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Lesión no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

router.post('/', auth, requireRol('admin', 'editor'), async (req, res) => {
  const { nombre, slug, descripcion, zona_corporal, severidad } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO lesiones (nombre, slug, descripcion, zona_corporal, severidad)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [nombre, slug, descripcion, zona_corporal, severidad]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Nombre o slug duplicado' });
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
