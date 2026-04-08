const router = require('express').Router();
const pool = require('../db/pool');
const { auth } = require('../middleware/auth');

// GET /api/usuarios/me
router.get('/me', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.email, u.nombre, u.apellidos, u.rol, u.avatar_url, u.telefono,
              json_agg(DISTINCT jsonb_build_object('id', l.id, 'nombre', l.nombre, 'slug', l.slug))
                FILTER (WHERE l.id IS NOT NULL) AS lesiones,
              json_agg(DISTINCT jsonb_build_object('id', am.id, 'nombre', am.nombre, 'slug', am.slug))
                FILTER (WHERE am.id IS NOT NULL) AS artes
       FROM usuarios u
       LEFT JOIN usuario_lesiones ul ON ul.usuario_id = u.id AND ul.activa = TRUE
       LEFT JOIN lesiones l ON l.id = ul.lesion_id
       LEFT JOIN usuario_artes_marciales uam ON uam.usuario_id = u.id
       LEFT JOIN artes_marciales am ON am.id = uam.arte_marcial_id AND am.activo = TRUE
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// PUT /api/usuarios/me/lesiones
router.put('/me/lesiones', auth, async (req, res) => {
  const { lesion_ids } = req.body;
  if (!Array.isArray(lesion_ids)) return res.status(400).json({ error: 'lesion_ids debe ser un array' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM usuario_lesiones WHERE usuario_id=$1', [req.user.id]);
    for (const id of lesion_ids) {
      await client.query(
        'INSERT INTO usuario_lesiones (usuario_id, lesion_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [req.user.id, id]
      );
    }
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Error interno' });
  } finally {
    client.release();
  }
});

// PUT /api/usuarios/me/artes — actualiza artes marciales que practica el usuario
router.put('/me/artes', auth, async (req, res) => {
  const { arte_ids } = req.body;
  if (!Array.isArray(arte_ids)) return res.status(400).json({ error: 'arte_ids debe ser un array' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM usuario_artes_marciales WHERE usuario_id=$1', [req.user.id]);
    for (const id of arte_ids) {
      await client.query(
        'INSERT INTO usuario_artes_marciales (usuario_id, arte_marcial_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [req.user.id, id]
      );
    }
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Error interno' });
  } finally {
    client.release();
  }
});

// GET /api/usuarios/me/recomendaciones — artes compatibles con lesiones que aún no practica
router.get('/me/recomendaciones', auth, async (req, res) => {
  try {
    // Get user's lesion IDs
    const { rows: lesRows } = await pool.query(
      'SELECT lesion_id FROM usuario_lesiones WHERE usuario_id=$1 AND activa=TRUE',
      [req.user.id]
    );
    const lesionIds = lesRows.map(r => r.lesion_id);

    if (!lesionIds.length) return res.json([]);

    // Get arts already practiced by user
    const { rows: artRows } = await pool.query(
      'SELECT arte_marcial_id FROM usuario_artes_marciales WHERE usuario_id=$1',
      [req.user.id]
    );
    const practicaIds = artRows.map(r => r.arte_marcial_id);

    // Compatible arts with ALL user's lesions, excluding ones already practiced
    const { rows } = await pool.query(
      `SELECT am.id, am.nombre, am.slug, am.descripcion, am.imagen_url,
              COUNT(c.id) AS lesiones_compatibles
       FROM artes_marciales am
       JOIN compatibilidades c ON c.arte_marcial_id = am.id
       WHERE c.lesion_id = ANY($1) AND c.compatible = TRUE AND am.activo = TRUE
         ${practicaIds.length ? 'AND am.id != ALL($3)' : ''}
       GROUP BY am.id
       HAVING COUNT(c.id) = $2
       ORDER BY am.nombre`,
      practicaIds.length
        ? [lesionIds, lesionIds.length, practicaIds]
        : [lesionIds, lesionIds.length]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
