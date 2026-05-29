# FightMatch — Plan de pruebas y seguridad

Documento de referencia para el TFG. Cubre pruebas funcionales, pruebas de seguridad, rate limiting, cabeceras HTTP y backup.

---

## 1. Pruebas funcionales

### 1.1 Autenticación y rutas privadas

**Caso: acceso sin token → redirección a login**

```bash
# Perfil sin token — el frontend redirige, el backend responde 401
curl -s -o /dev/null -w "%{http_code}" https://fightmatch.duckdns.org/api/favoritos
# Esperado: 401
```

**Caso: token inválido → 401**

```bash
curl -s -H "Authorization: Bearer TOKENINVALIDO" \
     https://fightmatch.duckdns.org/api/favoritos
# Esperado: {"error":"Token inválido o expirado"}
```

**Caso: token válido de usuario deportista intenta acceder a ruta de gimnasio → 403**

```bash
TOKEN=$(curl -s -X POST https://fightmatch.duckdns.org/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@test.com","password":"password123"}' | jq -r .token)

curl -s -H "Authorization: Bearer $TOKEN" \
     https://fightmatch.duckdns.org/api/gimnasios/mio
# Esperado: 404 (el usuario no tiene gimnasio asignado)
```

---

### 1.2 Control de acceso por rol (RBAC)

| Endpoint | Rol requerido | Sin rol → |
|----------|--------------|-----------|
| `DELETE /api/gimnasios/:id` | `admin` | 403 |
| `PUT /api/gimnasios/:id` | `admin`, `gimnasio` | 403 |
| `POST /api/gimnasios/mio/equipo` | `gimnasio` (propietario) | 403/404 |
| `GET /api/gimnasios/mio/estadisticas` | `gimnasio` | 403/404 |

**Prueba de acceso denegado (rol deportista intentando borrar gimnasio):**

```bash
TOKEN_DEPORTISTA="<token de usuario con rol=deportista>"

curl -s -X DELETE \
     -H "Authorization: Bearer $TOKEN_DEPORTISTA" \
     https://fightmatch.duckdns.org/api/gimnasios/1
# Esperado: {"error":"Acceso denegado"}
```

---

### 1.3 Sistema de reseñas

**Crear reseña (auth requerida):**

```bash
TOKEN="<token válido>"
GIMNASIO_ID="<uuid del gimnasio>"

curl -s -X POST \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{"puntuacion": 5, "comentario": "Excelente instalaciones."}' \
     https://fightmatch.duckdns.org/api/gimnasios/$GIMNASIO_ID/reviews
# Esperado: 201 con id, puntuacion, comentario, created_at
```

**Leer reseñas (público):**

```bash
curl -s https://fightmatch.duckdns.org/api/gimnasios/$GIMNASIO_ID/reviews
# Esperado: array de reseñas con nombre de usuario
```

**Puntuación fuera de rango:**

```bash
curl -s -X POST \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{"puntuacion": 6}' \
     https://fightmatch.duckdns.org/api/gimnasios/$GIMNASIO_ID/reviews
# Esperado: 400 {"error":"Puntuación entre 1 y 5 requerida"}
```

---

### 1.4 Tracking de eventos

**Registrar evento (fire-and-forget):**

```bash
curl -s -X POST \
     -H "Content-Type: application/json" \
     -d '{"tipo": "arte_view", "payload": {"slug": "boxeo"}}' \
     https://fightmatch.duckdns.org/api/events
# Esperado: 202 {"ok":true} — respuesta inmediata, insert asíncrono
```

**Verificar en BD:**

```bash
docker exec fightmatch_db psql -U fightmatch -d fightmatch \
  -c "SELECT tipo, payload, created_at FROM events ORDER BY created_at DESC LIMIT 5;"
```

---

### 1.5 Endpoints de búsqueda

**Filtrado por arte marcial:**

```bash
curl -s "https://fightmatch.duckdns.org/api/gimnasios?arte=boxeo&limit=5" | jq '.[].nombre'
```

**Filtrado por ciudad:**

```bash
curl -s "https://fightmatch.duckdns.org/api/gimnasios?ciudad=Madrid&limit=5" | jq '.[].ciudad'
```

**Búsqueda geolocalizada:**

```bash
curl -s "https://fightmatch.duckdns.org/api/gimnasios?lat=40.416775&lng=-3.703790&radio_km=5" \
  | jq '.[].distancia_km'
```

---

## 2. Rate limiting

### Implementación

`backend/src/middleware/rateLimit.js` — ventana deslizante en memoria (Map de timestamps por IP).

- **API general**: 100 peticiones / minuto / IP → `app.use('/api', rateLimit({ windowMs: 60_000, max: 100 }))`
- **Endpoints de auth**: 10 peticiones / minuto / IP → `app.use('/api/auth', rateLimit({ windowMs: 60_000, max: 10 }))`

### Prueba de rate limiting

```bash
# Disparar 15 peticiones de login seguidas (supera el límite de 10/min)
for i in $(seq 1 15); do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"x@x.com","password":"wrong"}' \
    https://fightmatch.duckdns.org/api/auth/login)
  echo "Petición $i: $CODE"
done
# Esperado: primeras ~10 devuelven 401, las siguientes devuelven 429
```

**Respuesta 429:**

```json
{
  "error": "Demasiadas peticiones. Espera un momento."
}
```

Con cabecera `Retry-After: 60` (segundos hasta que se vacía la ventana).

---

## 3. Cabeceras de seguridad HTTP

### Configuradas en `nginx/conf.d/fightmatch.conf`

| Cabecera | Valor | Protección |
|----------|-------|-----------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Fuerza HTTPS durante 1 año |
| `X-Frame-Options` | `DENY` | Previene clickjacking |
| `X-Content-Type-Options` | `nosniff` | Previene MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limita headers Referer |
| `X-XSS-Protection` | `1; mode=block` | Bloquea XSS en navegadores legacy |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(self)` | Limita APIs del navegador |
| `Content-Security-Policy` | `default-src 'self'; ...` | Limita orígenes de recursos |

### Verificación con curl

```bash
curl -sI https://fightmatch.duckdns.org | grep -E "Strict|X-Frame|X-Content|Referrer|Permissions|Content-Security"
```

### Verificación online

- [securityheaders.com](https://securityheaders.com/?q=fightmatch.duckdns.org) — puntuación A o superior

---

## 4. Helmet (backend)

`helmet` está instalado y activo en `backend/src/index.js`:

```js
app.use(helmet());
```

Activa por defecto: `X-DNS-Prefetch-Control`, `X-Download-Options`, `X-Permitted-Cross-Domain-Policies`, `X-Powered-By` eliminada, etc.

**Verificar que X-Powered-By no aparece:**

```bash
curl -sI https://fightmatch.duckdns.org/api/health | grep -i powered
# Esperado: sin resultado (header eliminado por helmet)
```

---

## 5. Backup de base de datos

### Script: `scripts/backup.sh`

Realiza un `pg_dump` del contenedor PostgreSQL, lo comprime con gzip y elimina backups con más de 7 días de antigüedad.

**Ejecución manual:**

```bash
bash /opt/fightmatch/scripts/backup.sh
```

**Configurar cron (diario a las 3:00 AM):**

```bash
crontab -e
# Añadir:
0 3 * * * /opt/fightmatch/scripts/backup.sh >> /var/log/fightmatch-backup.log 2>&1
```

**Restaurar backup:**

```bash
# 1. Descomprimir
gunzip -c /opt/backups/fightmatch/db_20260507_030000.sql.gz > /tmp/restore.sql

# 2. Restaurar en el contenedor
docker exec -i fightmatch_db psql -U fightmatch -d fightmatch < /tmp/restore.sql
```

---

## 6. Resumen de arquitectura de seguridad

```
[Browser] ──HTTPS──► [Nginx] ──HTTP──► [Next.js frontend]
                        │
                        └──HTTP──► [Express backend]
                                       │
                               [helmet][rateLimit]
                                       │
                               [JWT auth middleware]
                                       │
                               [PostgreSQL]
```

- **Capa 1 — Nginx**: TLS 1.2/1.3, HSTS, cabeceras de seguridad HTTP
- **Capa 2 — Express/Helmet**: eliminación de fingerprinting, cabeceras adicionales
- **Capa 3 — Rate limiting**: protección contra brute-force y DDoS
- **Capa 4 — JWT**: stateless, RS256-compatible, expiración configurable
- **Capa 5 — RBAC**: middleware `requireRol()` en rutas sensibles
