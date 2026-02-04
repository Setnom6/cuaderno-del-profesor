#!/bin/bash
# setup.sh - Configura el entorno de desarrollo personal

set -e

echo "🔧 Configuración del entorno de desarrollo"
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

# Crear archivos de config desde ejemplos
echo ""
echo "📝 Creando archivos de configuración..."

if [ ! -f ".clasp-dev-tests.json" ]; then
    cp .clasp-dev-tests.json.example .clasp-dev-tests.json
    echo "   ✓ Creado .clasp-dev-tests.json"
fi

if [ ! -f ".clasp-dev-manual.json" ]; then
    cp .clasp-dev-manual.json.example .clasp-dev-manual.json
    echo "   ✓ Creado .clasp-dev-manual.json"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  CONFIGURACIÓN COMPLETADA"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📝 SIGUIENTE PASO: Configura tus entornos de desarrollo"
echo ""
echo "Necesitas crear DOS Google Sheets en tu Drive personal:"
echo ""
echo "1. 📊 Sheet para TESTS AUTOMATIZADOS"
echo "   - Abre: Extensiones → Apps Script"
echo "   - Copia el Script ID"
echo "   - Edita .clasp-dev-tests.json"
echo ""
echo "2. 📊 Sheet para PRUEBAS MANUALES"
echo "   - Crea otro Sheet separado"
echo "   - Copia su Script ID"
echo "   - Edita .clasp-dev-manual.json"
echo ""
echo "Después podrás usar:"
echo "  npm run dev:push   - Sube a AMBOS entornos de desarrollo"
echo ""
echo "Para producción, solicita el Script ID al maintainer."
echo ""
