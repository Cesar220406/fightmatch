const router = require('express').Router();
const pool = require('../db/pool');
const { auth, requireRol } = require('../middleware/auth');

// GET /suscripciones/mias
router.get('/mias', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT s.*, p.nombre as plan_nombre, p.precio as plan_precio,
             g.nombre as gimnasio_nombre, g.slug as gimnasio_slug,
             g.imagen_url as gimnasio_imagen
      FROM suscripciones s
      JOIN planes p ON p.id = s.plan_id
      JOIN gimnasios g ON g.id = s.gimnasio_id
      WHERE s.usuario_id = $1
      ORDER BY s.creado_en DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /suscripciones/miembros — gym owner
router.get('/miembros', auth, requireRol('gimnasio', 'admin'), async (req, res) => {
  try {
    const gymRes = await pool.query('SELECT id FROM gimnasios WHERE propietario_id = $1', [req.user.id]);
    if (!gymRes.rows.length) return res.status(404).json({ error: 'Sin gimnasio' });
    const { rows } = await pool.query(`
      SELECT s.id, s.estado, s.fecha_inicio, s.fecha_fin, s.precio_pagado, s.creado_en,
             p.nombre as plan_nombre,
             u.id as usuario_id, u.nombre, u.apellidos, u.email
      FROM suscripciones s
      JOIN planes p ON p.id = s.plan_id
      JOIN usuarios u ON u.id = s.usuario_id
      WHERE s.gimnasio_id = $1
      ORDER BY s.creado_en DESC
    `, [gymRes.rows[0].id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /suscripciones/stats — gym owner
router.get('/stats', auth, requireRol('gimnasio', 'admin'), async (req, res) => {
  try {
    const gymRes = await pool.query('SELECT id FROM gimnasios WHERE propietario_id = $1', [req.user.id]);
    if (!gymRes.rows.length) return res.status(404).json({ error: 'Sin gimnasio' });
    const gymId = gymRes.rows[0].id;
    const [tot, act, ing, altas] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM suscripciones WHERE gimnasio_id = $1', [gymId]),
      pool.query("SELECT COUNT(*) FROM suscripciones WHERE gimnasio_id=$1 AND estado='activa'", [gymId]),
      pool.query(`SELECT COALESCE(SUM(pa.importe),0) as total
        FROM pagos pa JOIN suscripciones s ON s.id=pa.suscripcion_id
        WHERE s.gimnasio_id=$1 AND pa.estado='pagado'
        AND date_trunc('month',pa.fecha_pago)=date_trunc('month',NOW())`, [gymId]),
      pool.query(`SELECT
        COUNT(*) FILTER (WHERE creado_en >= NOW()-INTERVAL '30 days') as altas,
        COUNT(*) FILTER (WHERE estado IN ('cancelada','vencida') AND creado_en >= NOW()-INTERVAL '30 days') as bajas
        FROM suscripciones WHERE gimnasio_id=$1`, [gymId]),
    ]);
    res.json({
      total: parseInt(tot.rows[0].count),
      activas: parseInt(act.rows[0].count),
      ingresos_mes: parseFloat(ing.rows[0].total),
      altas_30d: parseInt(altas.rows[0].altas),
      bajas_30d: parseInt(altas.rows[0].bajas),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /suscripciones
router.post('/', auth, async (req, res) => {
  const { gimnasio_id, plan_id } = req.body;
  if (!gimnasio_id || !plan_id) return res.status(400).json({ error: 'Faltan campos' });
  try {
    const planRes = await pool.query('SELECT * FROM planes WHERE id=$1 AND activo=TRUE', [plan_id]);
    if (!planRes.rows.length) return res.status(404).json({ error: 'Plan no encontrado' });
    const plan = planRes.rows[0];
    const existing = await pool.query(
      "SELECT id FROM suscripciones WHERE usuario_id=$1 AND gimnasio_id=$2 AND estado='activa'",
      [req.user.id, gimnasio_id]
    );
    if (existing.rows.length) return res.status(409).json({ error: 'Ya tienes una suscripción activa aquí' });
    const ff = new Date(); ff.setMonth(ff.getMonth()+1);
    const sus = await pool.query(`
      INSERT INTO suscripciones (usuario_id,gimnasio_id,plan_id,estado,fecha_inicio,fecha_fin,precio_pagado)
      VALUES ($1,$2,$3,'activa',CURRENT_DATE,$4,$5) RETURNING *
    `, [req.user.id, gimnasio_id, plan_id, ff.toISOString().split('T')[0], plan.precio]);
    await pool.query(
      "INSERT INTO pagos (suscripcion_id,importe,estado,concepto) VALUES ($1,$2,'pagado',$3)",
      [sus.rows[0].id, plan.precio, `Plan ${plan.nombre}`]
    );
    await pool.query(
      "INSERT INTO notificaciones (usuario_id,tipo,titulo,mensaje) VALUES ($1,'suscripcion_nueva',$2,$3)",
      [req.user.id, '¡Suscripción activada!', `Tu plan ${plan.nombre} está activo. ¡A entrenar!`]
    );
    res.status(201).json(sus.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /suscripciones/:id — user cancel/pause
router.put('/:id', auth, async (req, res) => {
  const { estado } = req.body;
  if (!['pausada','cancelada'].includes(estado)) return res.status(400).json({ error: 'Estado no válido' });
  try {
    const { rows } = await pool.query(
      'UPDATE suscripciones SET estado=$1 WHERE id=$2 AND usuario_id=$3 RETURNING *',
      [estado, req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'No encontrada' });
    await pool.query(
      "INSERT INTO notificaciones (usuario_id,tipo,titulo,mensaje) VALUES ($1,'suscripcion_cambio',$2,$3)",
      [req.user.id,
       estado === 'cancelada' ? 'Suscripción cancelada' : 'Suscripción pausada',
       estado === 'cancelada' ? 'Tu suscripción ha sido cancelada.' : 'Tu suscripción está en pausa.']
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /suscripciones/:id/admin — gym owner
router.put('/:id/admin', auth, requireRol('gimnasio','admin'), async (req, res) => {
  const { estado } = req.body;
  if (!estado) return res.status(400).json({ error: 'Falta estado' });
  try {
    const gymRes = await pool.query('SELECT id FROM gimnasios WHERE propietario_id=$1', [req.user.id]);
    if (!gymRes.rows.length) return res.status(404).json({ error: 'Sin gimnasio' });
    const { rows } = await pool.query(
      'UPDATE suscripciones SET estado=$1 WHERE id=$2 AND gimnasio_id=$3 RETURNING *',
      [estado, req.params.id, gymRes.rows[0].id]
    );
    if (!rows.length) return res.status(404).json({ error: 'No encontrada' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
