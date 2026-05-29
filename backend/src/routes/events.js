const router = require('express').Router();
const pool   = require('../db/pool');

/**
 * POST /api/events
 * Registra una interacción de usuario (fire-and-forget, sin auth requerida).
 * Body: { tipo: string, payload?: object }
 * Siempre responde 202 — el insert no bloquea al cliente.
 */
router.post('/', async (req, res) => {
  const { tipo, payload } = req.body;
  if (!tipo || typeof tipo !== 'string') {
    return res.status(400).json({ error: 'tipo requerido' });
  }

  // Responder inmediatamente — el insert es asíncrono y no crítico
  res.status(202).json({ ok: true });

  try {
    await pool.query(
      'INSERT INTO events (tipo, payload) VALUES ($1, $2)',
      [tipo.slice(0, 100), JSON.stringify(payload ?? {})]
    );
  } catch (err) {
    console.error('[events] insert failed:', err.message);
  }
});

/**
 * GET /api/events/summary
 * Panel de analytics para admin. Devuelve eventos agrupados de múltiples formas.
 */
router.get('/summary', async (req, res) => {
  try {
    const [byType, byDay, topArtes, topCities] = await Promise.all([
      // Eventos por tipo (últimos 30 días)
      pool.query(`
        SELECT tipo, COUNT(*) AS total
        FROM events
        WHERE created_at > NOW() - INTERVAL '30 days'
        GROUP BY tipo
        ORDER BY total DESC
        LIMIT 10
      `),

      // Eventos por día (últimos 30 días)
      pool.query(`
        SELECT TO_CHAR(created_at::date, 'YYYY-MM-DD') AS dia, COUNT(*) AS total
        FROM events
        WHERE created_at > NOW() - INTERVAL '30 days'
        GROUP BY created_at::date
        ORDER BY created_at::date ASC
      `),

      // Top artes más vistas (evento tipo 'arte_view', campo slug en payload)
      pool.query(`
        SELECT payload->>'slug' AS arte, COUNT(*) AS total
        FROM events
        WHERE tipo = 'arte_view'
          AND payload->>'slug' IS NOT NULL
          AND created_at > NOW() - INTERVAL '30 days'
        GROUP BY arte
        ORDER BY total DESC
        LIMIT 8
      `),

      // Top ciudades más buscadas (evento tipo 'buscar', campo ciudad en payload)
      pool.query(`
        SELECT COALESCE(NULLIF(payload->>'ciudad', ''), '(sin filtro)') AS ciudad, COUNT(*) AS total
        FROM events
        WHERE tipo = 'buscar'
          AND created_at > NOW() - INTERVAL '30 days'
        GROUP BY ciudad
        ORDER BY total DESC
        LIMIT 8
      `),
    ]);

    res.json({
      by_type:    byType.rows,
      by_day:     byDay.rows,
      top_artes:  topArtes.rows,
      top_cities: topCities.rows,
    });
  } catch (err) {
    console.error('[events/summary]', err.message);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;
