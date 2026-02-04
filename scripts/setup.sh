#!/bin/bash
# setup.sh - Configura clasp y los entornos

set -e

echo "🔧 Configuración inicial de clasp"
echo ""

# Verificar node/npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Instala Node.js primero."
    exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Login a clasp
echo ""
echo "🔐 Iniciando sesión en Google..."
echo "   Se abrirá una ventana del navegador para autorizar."
npx clasp login

echo ""
echo "✅ Configuración básica completada."
echo ""
echo "📝 Ahora necesitas configurar los Script IDs:"
echo ""
echo "1. DESARROLLO (pruebas):"
echo "   - Abre tu Google Sheet de desarrollo"
echo "   - Ve a Extensiones > Apps Script"
echo "   - Clic en ⚙️ Configuración del proyecto"
echo "   - Copia el 'ID del script'"
echo "   - Edita .clasp-dev.json y pega el ID"
echo ""
echo "2. PRODUCCIÓN (plantilla usuarios):"
echo "   - Crea una copia de tu Sheet como plantilla"
echo "   - Abre su Apps Script y copia el Script ID"
echo "   - Edita .clasp-prod.json y pega el ID"
echo ""
echo "Después podrás usar:"
echo "  npm run dev:push   - Subir código a desarrollo"
echo "  npm run prod:push  - Subir código a producción"
