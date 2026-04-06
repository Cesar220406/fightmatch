const router = require('express').Router();
const pool = require('../db/pool');
const { auth } = require('../middleware/auth');

// GET /api/usuarios/me
router.get('/me', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.email, u.nombre, u.apellidos, u.rol, u.avatar_url, u.telefono,
              json_agg(json_build_object('id', l.id, 'nombre', l.nombre, 'slug', l.slug))
                FILTER (WHERE l.id IS NOT NULL) AS lesiones
       FROM usuarios u
       LEFT JOIN usuario_lesiones ul ON ul.usuario_id = u.id AND ul.activa = TRUE
       LEFT JOIN lesiones l ON l.id = ul.lesion_id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

// PUT /api/usuarios/me/lesiones — actualiza el perfil de lesiones del usuario
router.put('/me/lesiones', auth, async (req, res) => {
  const { lesion_ids } = req.body; // array de IDs
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

module.exports = router;
