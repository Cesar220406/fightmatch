const router = require('express').Router();
const pool = require('../db/pool');
const { auth } = require('../middleware/auth');

// GET /api/favoritos — lista los gimnasios favoritos del usuario autenticado
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT g.id, g.nombre, g.slug, g.ciudad, g.provincia,
              g.imagen_url, g.precio_desde, g.verificado,
              array_agg(DISTINCT am.nombre) FILTER (WHERE am.nombre IS NOT NULL) AS artes
       FROM favoritos f
       JOIN gimnasios g ON g.id = f.gimnasio_id
       LEFT JOIN gimnasio_artes_marciales gam ON gam.gimnasio_id = g.id
       LEFT JOIN artes_marciales am ON am.id = gam.arte_marcial_id
       WHERE f.usuario_id = $1 AND g.activo = TRUE
       GROUP BY g.id
       ORDER BY f.creado_en DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// GET /api/favoritos/ids — devuelve los IDs de los gimnasios favoritos del usuario
router.get('/ids', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT gimnasio_id FROM favoritos WHERE usuario_id = $1',
      [req.user.id]
    );
    res.json(rows.map(r => r.gimnasio_id));
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

// POST /api/favoritos — añadir favorito
router.post('/', auth, async (req, res) => {
  const { gimnasio_id } = req.body;
  if (!gimnasio_id) return res.status(400).json({ error: 'gimnasio_id requerido' });
  try {
    await pool.query(
      'INSERT INTO favoritos (usuario_id, gimnasio_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [req.user.id, gimnasio_id]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// DELETE /api/favoritos/:gimnasioId — quitar favorito
router.delete('/:gimnasioId', auth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM favoritos WHERE usuario_id=$1 AND gimnasio_id=$2',
      [req.user.id, req.params.gimnasioId]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
