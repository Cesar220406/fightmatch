#!/bin/bash
# ============================================================
# FightMatch — Actualizar en producción sin recrear la BD
# Uso: bash scripts/update.sh
# ============================================================
set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

set -a; source .env.prod; set +a

echo ">>> Pull última versión..."
git pull origin master

echo ">>> Reconstruyendo frontend y backend (sin tocar la BD)..."
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build frontend backend nginx

echo "✅ Actualización completada."
docker compose -f docker-compose.prod.yml ps
