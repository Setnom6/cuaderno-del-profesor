#!/bin/bash
# deploy.sh - Script para desplegar a PRODUCCIÓN
# Solo para maintainers con acceso al Script ID de producción

set -e

echo "🚀 DEPLOY A PRODUCCIÓN"
echo ""

# Verificar que existe el archivo de config
if [ ! -f ".clasp-prod.json" ]; then
    echo "❌ No existe .clasp-prod.json"
    echo ""
    echo "Si eres maintainer, crea el archivo con el Script ID de producción."
    echo "Si no lo eres, solicita acceso al maintainer del proyecto."
    exit 1
fi

SCRIPT_ID=$(grep -o '"scriptId": *"[^"]*"' ".clasp-prod.json" | cut -d'"' -f4)
if [[ "$SCRIPT_ID" == *"SOLICITAR"* ]] || [[ "$SCRIPT_ID" == *"TU_SCRIPT"* ]]; then
    echo "❌ Configura el scriptId real en .clasp-prod.json"
    echo "   Solicita el ID al maintainer del proyecto."
    exit 1
fi

# Verificar que estamos en main y sin cambios pendientes
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
    echo "⚠️  No estás en la rama main (estás en: $BRANCH)"
    read -p "¿Continuar de todos modos? (y/N): " confirm
    if [ "$confirm" != "y" ]; then
        exit 1
    fi
fi

# Verificar cambios sin commitear
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Tienes cambios sin commitear:"
    git status --short
    echo ""
    read -p "¿Continuar de todos modos? (y/N): " confirm
    if [ "$confirm" != "y" ]; then
        exit 1
    fi
fi

echo "📦 Desplegando a producción (sin tests)..."
echo "   Script ID: ${SCRIPT_ID:0:15}..."
echo ""

# Usar .claspignore-prod para excluir tests
cp .claspignore-prod .claspignore
cp .clasp-prod.json .clasp.json
clasp push
rm .clasp.json
git checkout .claspignore

echo ""
echo "✅ Desplegado correctamente a PRODUCCIÓN"
echo ""
echo "Los usuarios que copien la plantilla tendrán el código actualizado."
