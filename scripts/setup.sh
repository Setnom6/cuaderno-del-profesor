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

# Crear .clasp-dev.json desde el ejemplo
if [ ! -f ".clasp-dev.json" ]; then
    cp .clasp-dev.json.example .clasp-dev.json
    echo ""
    echo "✅ Creado .clasp-dev.json desde el ejemplo"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  CONFIGURACIÓN COMPLETADA"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📝 SIGUIENTE PASO: Configura tu entorno de desarrollo personal"
echo ""
echo "1. Crea un Google Sheet en tu Drive para pruebas"
echo "2. Abre: Extensiones → Apps Script"
echo "3. Copia el Script ID desde: ⚙️ Configuración del proyecto"
echo "4. Edita .clasp-dev.json y pega tu Script ID"
echo ""
echo "Después podrás usar:"
echo "  npm run dev:push   - Subir código (con tests) a tu Sheet de desarrollo"
echo "  npm run dev:watch  - Modo watch (sube automáticamente al guardar)"
echo ""
