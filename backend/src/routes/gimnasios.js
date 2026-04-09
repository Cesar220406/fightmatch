const router = require('express').Router();
const pool = require('../db/pool');
const { auth, requireRol } = require('../middleware/auth');

// GET /api/gimnasios — listado con filtros opcionales (incluye geolocalización Haversine)
router.get('/', async (req, res) => {
  const { ciudad, arte, lesion_id, page = 1, limit = 20, lat, lng, radio_km } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  const conditions = ['g.activo = TRUE'];

  const useGeo = lat && lng && radio_km && Number(radio_km) > 0
    && !isNaN(Number(lat)) && !isNaN(Number(lng));

  if (useGeo) {
    // Only include gyms that have coordinates
    conditions.push('g.latitud IS NOT NULL AND g.longitud IS NOT NULL');
  }

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

  // Haversine distance expression
  let distanciaExpr = 'NULL::numeric';
  let havingClause = '';
  if (useGeo) {
    params.push(Number(lat), Number(lng));
    const pLat = params.length - 1;
    const pLng = params.length;
    distanciaExpr = `ROUND((6371 * 2 * ASIN(SQRT(
      POWER(SIN((RADIANS($${pLat}) - RADIANS(g.latitud)) / 2), 2) +
      COS(RADIANS($${pLat})) * COS(RADIANS(g.latitud)) *
      POWER(SIN((RADIANS($${pLng}) - RADIANS(g.longitud)) / 2), 2)
    )))::numeric, 1)`;
    params.push(Number(radio_km));
    const pRadio = params.length;
    havingClause = `HAVING (6371 * 2 * ASIN(SQRT(
      POWER(SIN((RADIANS($${pLat}) - RADIANS(g.latitud)) / 2), 2) +
      COS(RADIANS($${pLat})) * COS(RADIANS(g.latitud)) *
      POWER(SIN((RADIANS($${pLng}) - RADIANS(g.longitud)) / 2), 2)
    ))) <= $${pRadio}`;
  }

  params.push(Number(limit), Number(offset));
  const orderBy = useGeo ? distanciaExpr : 'g.verificado DESC, g.nombre ASC';

  try {
    const { rows } = await pool.query(
      `SELECT g.id, g.nombre, g.slug, g.ciudad, g.provincia,
              g.imagen_url, g.precio_desde, g.verificado, g.latitud, g.longitud,
              array_agg(DISTINCT am.nombre) FILTER (WHERE am.nombre IS NOT NULL) AS artes,
              ${distanciaExpr} AS distancia_km
       FROM gimnasios g
       LEFT JOIN gimnasio_artes_marciales gam ON gam.gimnasio_id = g.id
       LEFT JOIN artes_marciales am ON am.id = gam.arte_marcial_id
       WHERE ${where}
       GROUP BY g.id
       ${havingClause}
       ORDER BY ${orderBy}
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

// GET /api/gimnasios/mio/clientes — usuarios que han añadido el gimnasio a favoritos
router.get('/mio/clientes', auth, async (req, res) => {
  try {
    const { rows: gymRows } = await pool.query(
      'SELECT id FROM gimnasios WHERE propietario_id=$1 AND activo=TRUE LIMIT 1',
      [req.user.id]
    );
    if (!gymRows[0]) return res.status(404).json({ error: 'No tienes ningún gimnasio' });
    const { rows } = await pool.query(
      `SELECT u.id, u.nombre, u.apellidos, u.email, u.avatar_url, f.creado_en AS desde
       FROM favoritos f
       JOIN usuarios u ON u.id = f.usuario_id
       WHERE f.gimnasio_id = $1
       ORDER BY f.creado_en DESC`,
      [gymRows[0].id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// GET /api/gimnasios/mio/equipo — trabajadores del gimnasio
router.get('/mio/equipo', auth, async (req, res) => {
  try {
    const { rows: gymRows } = await pool.query(
      'SELECT id FROM gimnasios WHERE propietario_id=$1 AND activo=TRUE LIMIT 1',
      [req.user.id]
    );
    if (!gymRows[0]) return res.status(404).json({ error: 'No tienes ningún gimnasio' });
    const { rows } = await pool.query(
      `SELECT u.id, u.nombre, u.apellidos, u.email, u.avatar_url, gt.rol_equipo, gt.creado_en
       FROM gimnasio_trabajadores gt
       JOIN usuarios u ON u.id = gt.usuario_id
       WHERE gt.gimnasio_id = $1
       ORDER BY gt.creado_en ASC`,
      [gymRows[0].id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// POST /api/gimnasios/mio/equipo — añadir trabajador por email
router.post('/mio/equipo', auth, async (req, res) => {
  const { email, rol_equipo = 'entrenador' } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requerido' });
  try {
    const { rows: gymRows } = await pool.query(
      'SELECT id FROM gimnasios WHERE propietario_id=$1 AND activo=TRUE LIMIT 1',
      [req.user.id]
    );
    if (!gymRows[0]) return res.status(404).json({ error: 'No tienes ningún gimnasio' });
    const { rows: userRows } = await pool.query(
      'SELECT id, nombre, apellidos, email, avatar_url FROM usuarios WHERE email=$1 AND activo=TRUE',
      [email]
    );
    if (!userRows[0]) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (userRows[0].id === req.user.id) return res.status(400).json({ error: 'No puedes añadirte a ti mismo' });
    await pool.query(
      `INSERT INTO gimnasio_trabajadores (gimnasio_id, usuario_id, rol_equipo)
       VALUES ($1,$2,$3) ON CONFLICT (gimnasio_id, usuario_id) DO UPDATE SET rol_equipo=$3`,
      [gymRows[0].id, userRows[0].id, rol_equipo]
    );
    res.status(201).json({ ...userRows[0], rol_equipo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// DELETE /api/gimnasios/mio/equipo/:userId — eliminar trabajador
router.delete('/mio/equipo/:userId', auth, async (req, res) => {
  try {
    const { rows: gymRows } = await pool.query(
      'SELECT id FROM gimnasios WHERE propietario_id=$1 AND activo=TRUE LIMIT 1',
      [req.user.id]
    );
    if (!gymRows[0]) return res.status(404).json({ error: 'No tienes ningún gimnasio' });
    await pool.query(
      'DELETE FROM gimnasio_trabajadores WHERE gimnasio_id=$1 AND usuario_id=$2',
      [gymRows[0].id, req.params.userId]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// GET /api/gimnasios/mio/estadisticas — métricas del gimnasio
router.get('/mio/estadisticas', auth, async (req, res) => {
  try {
    const { rows: gymRows } = await pool.query(
      'SELECT id FROM gimnasios WHERE propietario_id=$1 AND activo=TRUE LIMIT 1',
      [req.user.id]
    );
    if (!gymRows[0]) return res.status(404).json({ error: 'No tienes ningún gimnasio' });
    const gid = gymRows[0].id;

    const [total, nuevos, artes, mensajesSinLeer] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total FROM favoritos WHERE gimnasio_id=$1', [gid]),
      pool.query(
        `SELECT COUNT(*) AS total FROM favoritos
         WHERE gimnasio_id=$1 AND creado_en >= date_trunc('month', NOW())`,
        [gid]
      ),
      pool.query(
        `SELECT am.nombre, COUNT(DISTINCT f.usuario_id) AS fans
         FROM gimnasio_artes_marciales gam
         JOIN artes_marciales am ON am.id = gam.arte_marcial_id
         LEFT JOIN usuario_artes_marciales uam ON uam.arte_marcial_id = gam.arte_marcial_id
         LEFT JOIN favoritos f ON f.usuario_id = uam.usuario_id AND f.gimnasio_id = $1
         WHERE gam.gimnasio_id = $1
         GROUP BY am.nombre
         ORDER BY fans DESC
         LIMIT 5`,
        [gid]
      ),
      pool.query('SELECT COUNT(*) AS total FROM contactos WHERE gimnasio_id=$1 AND leido=FALSE', [gid]),
    ]);

    res.json({
      clientes_total:      Number(total.rows[0].total),
      clientes_este_mes:   Number(nuevos.rows[0].total),
      artes_populares:     artes.rows,
      mensajes_sin_leer:   Number(mensajesSinLeer.rows[0].total),
    });
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
          precio_desde, verificado, horario } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE gimnasios
       SET nombre=$1, slug=$2, descripcion=$3, direccion=$4, ciudad=$5, provincia=$6,
           codigo_postal=$7, telefono=$8, email_contacto=$9, sitio_web=$10,
           imagen_url=$11, precio_desde=$12, verificado=COALESCE($13, verificado),
           horario=COALESCE($15::jsonb, horario)
       WHERE id=$14 RETURNING *`,
      [nombre, slug, descripcion, direccion, ciudad, provincia,
       codigo_postal, telefono, email_contacto, sitio_web,
       imagen_url, precio_desde, verificado, req.params.id,
       horario ? JSON.stringify(horario) : null]
    );
    if (!rows[0]) return res.status(404).json({ error: 'No encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
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
