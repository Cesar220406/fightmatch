const router = require('express').Router();
const pool = require('../db/pool');
const { auth, requireRol, optionalAuth } = require('../middleware/auth');

// POST /api/contactos — enviar mensaje de contacto a un gimnasio
router.post('/', optionalAuth, async (req, res) => {
  const { gimnasio_id, nombre, email, mensaje } = req.body;
  if (!gimnasio_id || !nombre?.trim() || !email?.trim() || !mensaje?.trim()) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO contactos (gimnasio_id, nombre, email, mensaje)
       VALUES ($1,$2,$3,$4) RETURNING id`,
      [gimnasio_id, nombre.trim(), email.trim(), mensaje.trim()]
    );
    res.status(201).json({ ok: true, id: rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// GET /api/contactos?gimnasio_id=xxx — mensajes de un gimnasio (propietario o admin)
router.get('/', auth, async (req, res) => {
  const { gimnasio_id } = req.query;
  if (!gimnasio_id) return res.status(400).json({ error: 'gimnasio_id requerido' });

  try {
    // Verify the user owns the gym (or is admin)
    if (req.user.rol !== 'admin') {
      const { rows } = await pool.query(
        'SELECT id FROM gimnasios WHERE id=$1 AND propietario_id=$2',
        [gimnasio_id, req.user.id]
      );
      if (!rows[0]) return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { rows } = await pool.query(
      `SELECT id, nombre, email, mensaje, leido, creado_en
       FROM contactos WHERE gimnasio_id=$1 ORDER BY creado_en DESC`,
      [gimnasio_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// PATCH /api/contactos/:id/leido — marcar como leído
router.patch('/:id/leido', auth, requireRol('admin', 'gimnasio'), async (req, res) => {
  try {
    await pool.query('UPDATE contactos SET leido=TRUE WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
