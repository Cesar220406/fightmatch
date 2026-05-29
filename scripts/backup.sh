#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────
# FightMatch — script de backup de base de datos PostgreSQL
# Uso: bash scripts/backup.sh
# Cron (diario a las 3:00 AM):
#   0 3 * * * /opt/fightmatch/scripts/backup.sh >> /var/log/fightmatch-backup.log 2>&1
# ────────────────────────────────────────────────────────────

set -euo pipefail

BACKUP_DIR="/opt/backups/fightmatch"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="fightmatch"
DB_USER="fightmatch"
CONTAINER="fightmatch_db"       # nombre del contenedor Docker
KEEP_DAYS=7                     # días de retención

mkdir -p "$BACKUP_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Iniciando backup..."

# 1. Volcado de la base de datos
docker exec "$CONTAINER" \
  pg_dump -U "$DB_USER" "$DB_NAME" \
  | gzip > "${BACKUP_DIR}/db_${DATE}.sql.gz"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup guardado: db_${DATE}.sql.gz"

# 2. Eliminar backups más antiguos que KEEP_DAYS
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +${KEEP_DAYS} -delete
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backups antiguos eliminados (retención: ${KEEP_DAYS} días)"

# 3. Mostrar espacio usado
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backups actuales:"
ls -lh "$BACKUP_DIR" || true

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup completado."
