const router = require('express').Router();
const pool   = require('../db/pool');

// GET /api/stats — métricas públicas para la landing
router.get('/', async (_req, res) => {
  try {
    const [gimnasios, artes, usuarios, posts] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total FROM gimnasios WHERE activo = TRUE"),
      pool.query("SELECT COUNT(*) AS total FROM artes_marciales WHERE activo = TRUE"),
      pool.query("SELECT COUNT(*) AS total FROM usuarios WHERE activo = TRUE AND rol = 'cliente'"),
      pool.query("SELECT COUNT(*) AS total FROM posts WHERE estado = 'publicado'"),
    ]);
    res.json({
      gimnasios: Number(gimnasios.rows[0].total),
      artes:     Number(artes.rows[0].total),
      usuarios:  Number(usuarios.rows[0].total),
      posts:     Number(posts.rows[0].total),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
