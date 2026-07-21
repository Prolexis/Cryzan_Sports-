#!/bin/sh
set -e

echo "🚀 Iniciando Cryzan Sport App..."

echo "📦 Generando Cliente Prisma (binaryTargets)..."
npx prisma generate

echo "📦 Ejecutando Prisma Push & Seed..."
npx prisma db push --skip-generate || echo "⚠️ Advertencia: No se pudo conectar a la BD para el push directo."
npx prisma db seed || echo "⚠️ Advertencia: Ocurrió un detalle durante la siembra de datos."

echo "✅ Listo. Iniciando servidor..."
exec "$@"
