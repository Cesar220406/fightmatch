/**
 * Rate limiting en memoria — sin dependencias externas.
 * Ventana deslizante por IP: almacena timestamps de peticiones.
 * Limpia entradas antiguas cada 5 minutos para evitar memory leaks.
 */

const store = new Map(); // Map<ip, number[]>

// Limpieza periódica: eliminar entradas con más de 10 minutos de antigüedad
setInterval(() => {
  const cutoff = Date.now() - 600_000;
  for (const [key, times] of store.entries()) {
    const fresh = times.filter((t) => t > cutoff);
    if (fresh.length === 0) store.delete(key);
    else store.set(key, fresh);
  }
}, 300_000).unref(); // unref: no impide que el proceso cierre

/**
 * @param {object} opts
 * @param {number} opts.windowMs  Ventana en ms. Por defecto 60_000 (1 min).
 * @param {number} opts.max       Máximo de peticiones por ventana. Por defecto 100.
 */
function rateLimit({ windowMs = 60_000, max = 100 } = {}) {
  return (req, res, next) => {
    // Obtener IP real (puede venir de X-Forwarded-For si hay proxy)
    const ip = (req.headers['x-forwarded-for'] || req.ip || 'unknown')
      .toString()
      .split(',')[0]
      .trim();

    const now = Date.now();
    const windowStart = now - windowMs;

    // Filtrar solo las peticiones dentro de la ventana actual
    const times = (store.get(ip) || []).filter((t) => t > windowStart);
    times.push(now);
    store.set(ip, times);

    if (times.length > max) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      return res.status(429).json({
        error: 'Demasiadas peticiones. Espera un momento.',
      });
    }

    next();
  };
}

module.exports = rateLimit;
