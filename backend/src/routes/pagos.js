const router = require('express').Router();
const pool = require('../db/pool');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT pa.id, pa.importe, pa.estado, pa.fecha_pago, pa.concepto,
             p.nombre as plan_nombre, g.nombre as gimnasio_nombre
      FROM pagos pa
      JOIN suscripciones s ON s.id = pa.suscripcion_id
      JOIN planes p ON p.id = s.plan_id
      JOIN gimnasios g ON g.id = s.gimnasio_id
      WHERE s.usuario_id = $1
      ORDER BY pa.fecha_pago DESC LIMIT 50
    `, [req.user.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
