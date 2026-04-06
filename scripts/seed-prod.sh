#!/bin/bash
# ============================================================
# FightMatch — Cargar seed en producción
# Uso: bash scripts/seed-prod.sh
# ============================================================
cd /opt/fightmatch

set -a; source .env.prod; set +a

echo "Cargando datos de ejemplo en la base de datos..."

docker exec -i fightmatch_db psql \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  < /opt/fightmatch/database/seed.sql

echo "✅ Seed cargado. Ya puedes ver los datos en https://$DOMAIN"
