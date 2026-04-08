const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../db/pool');

// POST /api/auth/registro
router.post('/registro', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('nombre').trim().notEmpty(),
  body('rol').optional().isIn(['cliente', 'gimnasio']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const {
    email, password, nombre, apellidos,
    rol = 'cliente',
    // Campos extra para rol gimnasio
    gimnasio_nombre, gimnasio_direccion, gimnasio_telefono, gimnasio_ciudad,
  } = req.body;

  if (rol === 'gimnasio' && !gimnasio_nombre?.trim()) {
    return res.status(400).json({ error: 'El nombre del gimnasio es obligatorio' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existe = await client.query('SELECT id FROM usuarios WHERE email=$1', [email]);
    if (existe.rows.length) return res.status(409).json({ error: 'Email ya registrado' });

    const hash = await bcrypt.hash(password, 12);
    const { rows } = await client.query(
      `INSERT INTO usuarios (email, password_hash, nombre, apellidos, rol)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, email, nombre, rol`,
      [email, hash, nombre, apellidos ?? null, rol]
    );
    const user = rows[0];

    // Si es gimnasio, crear el gimnasio asociado
    if (rol === 'gimnasio') {
      const slug = (gimnasio_nombre)
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        .substring(0, 220);

      // Ensure slug uniqueness
      const slugFinal = `${slug}-${Date.now().toString(36)}`;

      await client.query(
        `INSERT INTO gimnasios (propietario_id, nombre, slug, direccion, telefono, ciudad)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [user.id, gimnasio_nombre.trim(), slugFinal,
         gimnasio_direccion ?? null, gimnasio_telefono ?? null, gimnasio_ciudad ?? null]
      );
    }

    await client.query('COMMIT');

    const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.status(201).json({ token, user });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  } finally {
    client.release();
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const { rows } = await pool.query(
      'SELECT id, email, nombre, rol, password_hash, activo FROM usuarios WHERE email=$1',
      [email]
    );
    const user = rows[0];
    if (!user || !user.activo) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
