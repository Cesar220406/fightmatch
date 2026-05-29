const router = require('express').Router();
const pool = require('../db/pool');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM notificaciones WHERE usuario_id=$1 ORDER BY creado_en DESC LIMIT 20',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/count', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT COUNT(*) FROM notificaciones WHERE usuario_id=$1 AND leida=FALSE',
      [req.user.id]
    );
    res.json({ count: parseInt(rows[0].count) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/leer-todas', auth, async (req, res) => {
  try {
    await pool.query('UPDATE notificaciones SET leida=TRUE WHERE usuario_id=$1', [req.user.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/leer', auth, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notificaciones SET leida=TRUE WHERE id=$1 AND usuario_id=$2',
      [req.params.id, req.user.id]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
