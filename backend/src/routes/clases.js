const router = require('express').Router();
const pool = require('../db/pool');
const { auth, requireRol } = require('../middleware/auth');

// GET /clases?gimnasio_id= — public
router.get('/', async (req, res) => {
  const { gimnasio_id } = req.query;
  if (!gimnasio_id) return res.status(400).json({ error: 'Falta gimnasio_id' });
  try {
    const { rows } = await pool.query(
      'SELECT * FROM clases WHERE gimnasio_id=$1 AND activa=TRUE ORDER BY dia_semana,hora_inicio',
      [gimnasio_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /clases/mias — gym owner
router.get('/mias', auth, requireRol('gimnasio','admin'), async (req, res) => {
  try {
    const gymRes = await pool.query('SELECT id FROM gimnasios WHERE propietario_id=$1', [req.user.id]);
    if (!gymRes.rows.length) return res.status(404).json({ error: 'Sin gimnasio' });
    const { rows } = await pool.query(
      'SELECT * FROM clases WHERE gimnasio_id=$1 ORDER BY dia_semana,hora_inicio',
      [gymRes.rows[0].id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /clases
router.post('/', auth, requireRol('gimnasio','admin'), async (req, res) => {
  const { nombre, instructor, arte_marcial, dia_semana, hora_inicio, hora_fin, aforo_max } = req.body;
  if (!nombre || dia_semana === undefined || !hora_inicio || !hora_fin)
    return res.status(400).json({ error: 'Faltan campos' });
  try {
    const gymRes = await pool.query('SELECT id FROM gimnasios WHERE propietario_id=$1', [req.user.id]);
    if (!gymRes.rows.length) return res.status(404).json({ error: 'Sin gimnasio' });
    const { rows } = await pool.query(`
      INSERT INTO clases (gimnasio_id,nombre,instructor,arte_marcial,dia_semana,hora_inicio,hora_fin,aforo_max)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *
    `, [gymRes.rows[0].id, nombre, instructor||null, arte_marcial||null,
        dia_semana, hora_inicio, hora_fin, aforo_max||20]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /clases/:id
router.put('/:id', auth, requireRol('gimnasio','admin'), async (req, res) => {
  const { nombre,instructor,arte_marcial,dia_semana,hora_inicio,hora_fin,aforo_max,activa } = req.body;
  try {
    const gymRes = await pool.query('SELECT id FROM gimnasios WHERE propietario_id=$1', [req.user.id]);
    if (!gymRes.rows.length) return res.status(404).json({ error: 'Sin gimnasio' });
    const { rows } = await pool.query(`
      UPDATE clases SET
        nombre=COALESCE($1,nombre), instructor=COALESCE($2,instructor),
        arte_marcial=COALESCE($3,arte_marcial), dia_semana=COALESCE($4,dia_semana),
        hora_inicio=COALESCE($5,hora_inicio), hora_fin=COALESCE($6,hora_fin),
        aforo_max=COALESCE($7,aforo_max), activa=COALESCE($8,activa)
      WHERE id=$9 AND gimnasio_id=$10 RETURNING *
    `, [nombre,instructor,arte_marcial,dia_semana,hora_inicio,hora_fin,
        aforo_max,activa,req.params.id,gymRes.rows[0].id]);
    if (!rows.length) return res.status(404).json({ error: 'No encontrada' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /clases/:id
router.delete('/:id', auth, requireRol('gimnasio','admin'), async (req, res) => {
  try {
    const gymRes = await pool.query('SELECT id FROM gimnasios WHERE propietario_id=$1', [req.user.id]);
    if (!gymRes.rows.length) return res.status(404).json({ error: 'Sin gimnasio' });
    const { rows } = await pool.query(
      'DELETE FROM clases WHERE id=$1 AND gimnasio_id=$2 RETURNING id',
      [req.params.id, gymRes.rows[0].id]
    );
    if (!rows.length) return res.status(404).json({ error: 'No encontrada' });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
