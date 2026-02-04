#!/bin/bash
# deploy.sh - Script para desplegar a PRODUCCIÓN
# Solo para mantainers con acceso al Script ID de producción

set -e

echo "🚀 DEPLOY A PRODUCCIÓN"
echo ""

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

# Verificar config de producción
if [ ! -f ".clasp-prod.json" ]; then
    echo "❌ No existe .clasp-prod.json"
    exit 1
fi

SCRIPT_ID=$(grep -o '"scriptId": *"[^"]*"' ".clasp-prod.json" | cut -d'"' -f4)
if [[ "$SCRIPT_ID" == *"TU_SCRIPT"* ]] || [[ "$SCRIPT_ID" == *"SCRIPT_ID"* ]]; then
    echo "❌ Configura el scriptId real en .clasp-prod.json"
    exit 1
fi

echo "📦 Desplegando a producción (sin tests)..."
echo "   Script ID: ${SCRIPT_ID:0:20}..."
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
