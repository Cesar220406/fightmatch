const router = require('express').Router({ mergeParams: true });
const pool   = require('../db/pool');
const { auth } = require('../middleware/auth');

/**
 * GET /api/gimnasios/:id/reviews
 * Devuelve las últimas 50 reseñas del gimnasio.
 */
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.id, r.puntuacion, r.comentario, r.created_at,
              u.nombre, u.avatar_url
       FROM reviews r
       JOIN usuarios u ON u.id = r.usuario_id
       WHERE r.gimnasio_id = $1
       ORDER BY r.created_at DESC
       LIMIT 50`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('[reviews GET]', err.message);
    res.status(500).json({ error: 'Error interno' });
  }
});

/**
 * POST /api/gimnasios/:id/reviews
 * Crea o actualiza la reseña del usuario autenticado para este gimnasio.
 * Body: { puntuacion: 1-5, comentario?: string }
 * Un usuario solo puede tener una reseña por gimnasio (UPSERT).
 */
router.post('/', auth, async (req, res) => {
  const { puntuacion, comentario } = req.body;
  const p = parseInt(puntuacion);
  if (!p || p < 1 || p > 5) {
    return res.status(400).json({ error: 'Puntuación entre 1 y 5 requerida' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO reviews (gimnasio_id, usuario_id, puntuacion, comentario)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (gimnasio_id, usuario_id) DO UPDATE
         SET puntuacion  = EXCLUDED.puntuacion,
             comentario  = EXCLUDED.comentario,
             created_at  = NOW()
       RETURNING id, puntuacion, comentario, created_at`,
      [req.params.id, req.user.id, p, comentario?.trim() || null]
    );

    // devolver también el nombre del usuario para mostrarlo al instante
    const full = await pool.query(
      `SELECT r.id, r.puntuacion, r.comentario, r.created_at, u.nombre
       FROM reviews r JOIN usuarios u ON u.id = r.usuario_id
       WHERE r.id = $1`,
      [rows[0].id]
    );
    res.status(201).json(full.rows[0]);
  } catch (err) {
    console.error('[reviews POST]', err.message);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
