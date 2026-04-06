#!/bin/bash
# ============================================================
# FightMatch — Script de deploy en Hetzner
# Uso: bash scripts/deploy.sh
# Requisitos: .env.prod en la raíz del proyecto
# ============================================================
set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

# ── Cargar variables de entorno ────────────────────────────────────────────────
if [ ! -f .env.prod ]; then
  echo "❌ Falta el archivo .env.prod  (cópialo de .env.prod.example y edítalo)"
  exit 1
fi
set -a; source .env.prod; set +a

# ── Validar variables obligatorias ────────────────────────────────────────────
for var in DOMAIN POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB JWT_SECRET; do
  if [ -z "${!var}" ]; then
    echo "❌ Variable $var no definida en .env.prod"
    exit 1
  fi
done

# ── Reemplazar YOUR_DOMAIN en la config de Nginx ──────────────────────────────
echo ">>> Configurando Nginx para dominio: $DOMAIN"
sed -i "s/YOUR_DOMAIN/$DOMAIN/g" nginx/conf.d/fightmatch.conf

# ── Obtener certificado SSL (primera vez) ─────────────────────────────────────
# Solo si no existen certificados previos
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
  echo ">>> Obteniendo certificado SSL con Let's Encrypt..."
  # Levantamos nginx en modo solo HTTP primero para el challenge
  docker compose -f docker-compose.prod.yml --env-file .env.prod up -d nginx certbot

  # Esperar a que nginx esté listo
  sleep 5

  docker compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path /var/www/certbot \
    --email "admin@$DOMAIN" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "www.$DOMAIN"

  echo ">>> Certificado obtenido. Reiniciando Nginx con SSL..."
  docker compose -f docker-compose.prod.yml --env-file .env.prod restart nginx
fi

# ── Pull de la última versión ─────────────────────────────────────────────────
echo ">>> Actualizando código..."
git pull origin main

# ── Build y arranque de todos los servicios ───────────────────────────────────
echo ">>> Construyendo y levantando servicios..."
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# ── Verificar que todo está corriendo ─────────────────────────────────────────
echo ""
echo ">>> Estado de los contenedores:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Deploy completado."
echo "   App disponible en: https://$DOMAIN"
