const router = require('express').Router();
const pool = require('../db/pool');
const { auth, requireRol } = require('../middleware/auth');

// GET /api/gimnasios — listado con filtros opcionales
router.get('/', async (req, res) => {
  const { ciudad, arte, lesion_id, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  const conditions = ['g.activo = TRUE'];

  if (ciudad) {
    params.push(`%${ciudad}%`);
    conditions.push(`g.ciudad ILIKE $${params.length}`);
  }
  if (arte) {
    params.push(arte);
    conditions.push(`EXISTS (
      SELECT 1 FROM gimnasio_artes_marciales gam
      JOIN artes_marciales am ON am.id = gam.arte_marcial_id
      WHERE gam.gimnasio_id = g.id AND am.slug = $${params.length}
    )`);
  }
  if (lesion_id) {
    // Support comma-separated list of lesion IDs — gym must have a compatible art for ALL of them
    const lesionIds = String(lesion_id).split(',').map(Number).filter(Boolean);
    if (lesionIds.length === 1) {
      params.push(lesionIds[0]);
      conditions.push(`EXISTS (
        SELECT 1 FROM gimnasio_artes_marciales gam2
        JOIN compatibilidades c ON c.arte_marcial_id = gam2.arte_marcial_id
        WHERE gam2.gimnasio_id = g.id AND c.lesion_id = $${params.length} AND c.compatible = TRUE
      )`);
    } else if (lesionIds.length > 1) {
      params.push(lesionIds);
      params.push(lesionIds.length);
      conditions.push(`(
        SELECT COUNT(DISTINCT c.lesion_id)
        FROM gimnasio_artes_marciales gam2
        JOIN compatibilidades c ON c.arte_marcial_id = gam2.arte_marcial_id
        WHERE gam2.gimnasio_id = g.id
          AND c.lesion_id = ANY($${params.length - 1}::int[])
          AND c.compatible = TRUE
      ) = $${params.length}`);
    }
  }

  const where = conditions.join(' AND ');
  params.push(Number(limit), Number(offset));

  try {
    const { rows } = await pool.query(
      `SELECT g.id, g.nombre, g.slug, g.ciudad, g.provincia,
              g.imagen_url, g.precio_desde, g.verificado,
              array_agg(DISTINCT am.nombre) FILTER (WHERE am.nombre IS NOT NULL) AS artes
       FROM gimnasios g
       LEFT JOIN gimnasio_artes_marciales gam ON gam.gimnasio_id = g.id
       LEFT JOIN artes_marciales am ON am.id = gam.arte_marcial_id
       WHERE ${where}
       GROUP BY g.id
       ORDER BY g.verificado DESC, g.nombre ASC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// GET /api/gimnasios/mio — gimnasio del usuario autenticado (rol=gimnasio)
router.get('/mio', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT g.*, array_agg(DISTINCT am.id) FILTER (WHERE am.id IS NOT NULL) AS arte_ids,
              array_agg(DISTINCT am.nombre) FILTER (WHERE am.nombre IS NOT NULL) AS artes
       FROM gimnasios g
       LEFT JOIN gimnasio_artes_marciales gam ON gam.gimnasio_id = g.id
       LEFT JOIN artes_marciales am ON am.id = gam.arte_marcial_id
       WHERE g.propietario_id = $1 AND g.activo = TRUE
       GROUP BY g.id
       LIMIT 1`,
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'No tienes ningún gimnasio registrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// GET /api/gimnasios/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT g.*, array_agg(DISTINCT am.nombre) FILTER (WHERE am.nombre IS NOT NULL) AS artes
       FROM gimnasios g
       LEFT JOIN gimnasio_artes_marciales gam ON gam.gimnasio_id = g.id
       LEFT JOIN artes_marciales am ON am.id = gam.arte_marcial_id
       WHERE g.slug = $1 AND g.activo = TRUE
       GROUP BY g.id`,
      [req.params.slug]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Gimnasio no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// GET /api/gimnasios/:id/artes — ids de artes marciales del gimnasio
router.get('/:id/artes', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT arte_marcial_id FROM gimnasio_artes_marciales WHERE gimnasio_id=$1',
      [req.params.id]
    );
    res.json(rows.map((r) => r.arte_marcial_id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// PUT /api/gimnasios/:id/artes — reemplaza todas las artes del gimnasio
router.put('/:id/artes', auth, requireRol('admin', 'gimnasio'), async (req, res) => {
  const { arte_ids } = req.body; // array of integers
  if (!Array.isArray(arte_ids)) return res.status(400).json({ error: 'arte_ids debe ser un array' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM gimnasio_artes_marciales WHERE gimnasio_id=$1', [req.params.id]);
    for (const aid of arte_ids) {
      await client.query(
        'INSERT INTO gimnasio_artes_marciales (gimnasio_id, arte_marcial_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [req.params.id, aid]
      );
    }
    await client.query('COMMIT');
    res.json({ ok: true, count: arte_ids.length });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  } finally {
    client.release();
  }
});

// PUT /api/gimnasios/:id
router.put('/:id', auth, requireRol('admin', 'gimnasio'), async (req, res) => {
  const { nombre, slug, descripcion, direccion, ciudad, provincia,
          codigo_postal, telefono, email_contacto, sitio_web, imagen_url,
          precio_desde, verificado } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE gimnasios
       SET nombre=$1, slug=$2, descripcion=$3, direccion=$4, ciudad=$5, provincia=$6,
           codigo_postal=$7, telefono=$8, email_contacto=$9, sitio_web=$10,
           imagen_url=$11, precio_desde=$12, verificado=COALESCE($13, verificado)
       WHERE id=$14 RETURNING *`,
      [nombre, slug, descripcion, direccion, ciudad, provincia,
       codigo_postal, telefono, email_contacto, sitio_web,
       imagen_url, precio_desde, verificado, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'No encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

// DELETE /api/gimnasios/:id (soft delete)
router.delete('/:id', auth, requireRol('admin'), async (req, res) => {
  try {
    await pool.query('UPDATE gimnasios SET activo=FALSE WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

// POST /api/gimnasios — crear gimnasio (rol: gimnasio, admin)
router.post('/', auth, requireRol('gimnasio', 'admin'), async (req, res) => {
  const { nombre, slug, descripcion, direccion, ciudad, provincia,
          codigo_postal, telefono, email_contacto, sitio_web, imagen_url,
          latitud, longitud, precio_desde, horario } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO gimnasios
         (propietario_id, nombre, slug, descripcion, direccion, ciudad, provincia,
          codigo_postal, telefono, email_contacto, sitio_web, imagen_url,
          latitud, longitud, precio_desde, horario)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [req.user.id, nombre, slug, descripcion, direccion, ciudad, provincia,
       codigo_postal, telefono, email_contacto, sitio_web, imagen_url,
       latitud, longitud, precio_desde, horario ? JSON.stringify(horario) : null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') return res.status(409).json({ error: 'Slug ya en uso' });
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
