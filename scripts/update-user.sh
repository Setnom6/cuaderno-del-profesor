#!/bin/bash
# Script para actualizar el Apps Script de un usuario específico
# Uso: ./scripts/update-user.sh <SCRIPT_ID>
# El ID no se guarda en ningún archivo

set -e

if [ -z "$1" ]; then
    echo "❌ Error: Debes proporcionar el Script ID"
    echo "Uso: ./scripts/update-user.sh <SCRIPT_ID>"
    exit 1
fi

SCRIPT_ID="$1"
TEMP_CLASP=".clasp-temp.json"

echo "🔄 Actualizando Apps Script del usuario..."

# Crear archivo temporal de configuración
cat > "$TEMP_CLASP" << EOF
{
  "scriptId": "$SCRIPT_ID",
  "rootDir": "./src"
}
EOF

# Hacer push usando el archivo temporal
npx clasp push --project "$TEMP_CLASP"

# Eliminar archivo temporal inmediatamente
rm -f "$TEMP_CLASP"

echo "✅ Actualización completada"
echo "🔒 El Script ID no ha sido almacenado"
