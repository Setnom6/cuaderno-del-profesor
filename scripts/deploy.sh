#!/bin/bash
# deploy.sh - Script para desplegar a DEV o PROD

set -e

ENV=${1:-dev}

if [ "$ENV" != "dev" ] && [ "$ENV" != "prod" ]; then
    echo "❌ Uso: ./scripts/deploy.sh [dev|prod]"
    exit 1
fi

CONFIG_FILE=".clasp-${ENV}.json"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ No existe $CONFIG_FILE. Configúralo primero."
    exit 1
fi

# Verificar que tiene scriptId válido
SCRIPT_ID=$(grep -o '"scriptId": *"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
if [ "$SCRIPT_ID" = "TU_SCRIPT_ID_DESARROLLO" ] || [ "$SCRIPT_ID" = "TU_SCRIPT_ID_PRODUCCION" ]; then
    echo "❌ Configura el scriptId en $CONFIG_FILE"
    echo "   Puedes obtenerlo desde: Extensiones > Apps Script > Configuración del proyecto"
    exit 1
fi

echo "🚀 Desplegando a $ENV..."
cp "$CONFIG_FILE" .clasp.json
clasp push
rm .clasp.json
echo "✅ Desplegado correctamente a $ENV"
