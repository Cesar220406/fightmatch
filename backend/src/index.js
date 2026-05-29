require('dotenv').config();
const express   = require('express');
const helmet    = require('helmet');
const cors      = require('cors');
const morgan    = require('morgan');
const rateLimit = require('./middleware/rateLimit');

const app = express();

// Seguridad
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));

// Body parsing
app.use(express.json());

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting
// Límite estricto para endpoints de autenticación (prevenir brute-force)
app.use('/api/auth', rateLimit({ windowMs: 60_000, max: 10 }));
// Límite general para toda la API
app.use('/api', rateLimit({ windowMs: 60_000, max: 100 }));

// Rutas
app.use('/api', require('./routes'));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// 404
app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Arranque
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`FightMatch API escuchando en http://localhost:${PORT}`);
});
