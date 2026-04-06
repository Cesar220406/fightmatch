#!/bin/bash
# Ejecutado automáticamente por el contenedor de PostgreSQL al inicializarse
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    \i /docker-entrypoint-initdb.d/schema.sql
    \i /docker-entrypoint-initdb.d/seed.sql
EOSQL

echo "Base de datos FightMatch inicializada correctamente."
