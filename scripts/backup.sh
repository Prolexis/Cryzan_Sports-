#!/bin/sh
set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/cryzan_sport_db_${TIMESTAMP}.sql"

mkdir -p ${BACKUP_DIR}

echo "📦 Respaldando base de datos cryzan_sport_db..."
docker exec -t cryzan_sport_db pg_dump -U cryzan cryzan_sport_db > ${BACKUP_FILE}

echo "✅ Respaldo completado con éxito: ${BACKUP_FILE}"
