const router = require('express').Router();
const pool = require('../db/pool');
const { auth, requireRol } = require('../middleware/auth');

// GET /api/compatibilidades?lesiones=1,2,3 — busca artes compatibles con múltiples lesiones
router.get('/', async (req, res) => {
  const { lesiones } = req.query;
  if (!lesiones) return res.status(400).json({ error: 'Parámetro lesiones requerido' });

  const ids = lesiones.split(',').map(Number).filter(Boolean);
  if (!ids.length) return res.status(400).json({ error: 'IDs de lesión inválidos' });

  try {
    // Artes marciales compatibles con TODAS las lesiones indicadas
    const { rows } = await pool.query(
      `SELECT am.id, am.nombre, am.slug, am.descripcion, am.imagen_url,
              COUNT(c.id) AS lesiones_compatibles
       FROM artes_marciales am
       JOIN compatibilidades c ON c.arte_marcial_id = am.id
       WHERE c.lesion_id = ANY($1) AND c.compatible = TRUE AND am.activo = TRUE
       GROUP BY am.id
       HAVING COUNT(c.id) = $2
       ORDER BY am.nombre`,
      [ids, ids.length]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// POST /api/compatibilidades — crear/actualizar compatibilidad
router.post('/', auth, requireRol('admin', 'editor'), async (req, res) => {
  const { arte_marcial_id, lesion_id, compatible, nivel_recomendado, notas } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO compatibilidades (arte_marcial_id, lesion_id, compatible, nivel_recomendado, notas, creado_por)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (arte_marcial_id, lesion_id)
       DO UPDATE SET compatible=$3, nivel_recomendado=$4, notas=$5, actualizado_en=NOW()
       RETURNING *`,
      [arte_marcial_id, lesion_id, compatible, nivel_recomendado ?? null, notas ?? null, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
