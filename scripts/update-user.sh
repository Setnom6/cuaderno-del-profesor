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

# Usar .claspignore de producción (excluye tests)
cp .claspignore-prod .claspignore

# Crear archivo temporal de configuración
cat > "$TEMP_CLASP" << EOF
{
  "scriptId": "$SCRIPT_ID",
  "rootDir": "./src"
}
EOF

# Hacer push usando el archivo temporal
npx clasp push --project "$TEMP_CLASP"

# Eliminar archivo temporal y restaurar .claspignore
rm -f "$TEMP_CLASP"
git checkout .claspignore

echo "✅ Actualización completada (sin tests)"
echo "🔒 El Script ID no ha sido almacenado"
