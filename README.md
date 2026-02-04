# Cuaderno del Profesor Automatizado

Sistema de evaluación basado en competencias, criterios e instrumentos para Google Sheets.

---

## 📋 Para Usuarios

### Obtener la plantilla

1. Abre el [enlace a la plantilla](https://docs.google.com/spreadsheets/d/ID_PLANTILLA/template/preview)
2. Clic en **"Usar plantilla"** o **Archivo → Hacer una copia**
3. Se creará una copia en tu Drive con todo el código incluido

### Uso básico

1. Completa las hojas: `listado`, `criterios`, `instrumentos`
2. Ejecuta desde el menú: **Cuaderno → Generar Trimestre 1**
3. Para estadísticas: marca instrumentos con X y usa **Estadísticas → Generar Análisis**

### Hojas generadas

| Hoja | Descripción |
|------|-------------|
| `calificacionesN` | Desglose de calificaciones por instrumento |
| `mediasN` | Promedios por competencias y criterios |
| `observacionesN` | Observaciones sobre los alumnos |
| `estadísticas` | Media de instrumentos seleccionados |

---

## 👩‍💻 Para Desarrolladores

### Arquitectura

```
GitHub (código completo: src + tests)
    │
    ▼
┌─────────────────────────────────────────────────┐
│     Tu Drive personal (DEV)                      │
│                                                  │
│   📊 Sheet de pruebas    ← npm run dev:push     │
│   └── Apps Script (código + tests)              │
│                                                  │
│   Puedes tener varios Sheets para probar        │
│   diferentes escenarios                         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│     Drive compartido (PRODUCCIÓN)                │
│                                                  │
│   📊 PLANTILLA oficial   ← npm run prod:push    │
│   └── Apps Script (solo código, SIN tests)      │
│                                                  │
│   Usuarios copian esta plantilla                │
└─────────────────────────────────────────────────┘
```

### Setup inicial

```bash
# Clonar y configurar
git clone https://github.com/Setnom6/cuaderno-del-profesor.git
cd cuaderno-del-profesor
chmod +x scripts/*.sh
./scripts/setup.sh
```

### Configurar tu entorno personal

1. Crea un Google Sheet en tu Drive
2. Abre: **Extensiones → Apps Script**
3. Copia el Script ID: **⚙️ Configuración → ID del script**
4. Crea `.clasp-dev.json` (copiando de `.clasp-dev.json.example`):

```json
{
  "scriptId": "TU_SCRIPT_ID_PERSONAL",
  "rootDir": "./src",
  "fileExtension": "gs"
}
```

> ⚠️ `.clasp-dev.json` es personal y está en `.gitignore`. No se sube a GitHub.

### Comandos de desarrollo

```bash
npm run dev:push      # Subir código + tests a tu Sheet
npm run dev:watch     # Modo watch (sube al guardar)
npm run dev:open      # Abrir Apps Script en navegador
```

### Tests

Los tests están en `src/tests/`. Para ejecutarlos:

1. `npm run dev:push`
2. Abre tu Sheet → Apps Script
3. Ejecuta `runAllTests()`

### Publicar a producción

Solo maintainers autorizados:

```bash
# Asegúrate de estar en main y sin cambios pendientes
git status

# Deploy (excluye tests automáticamente)
npm run prod:push
```

---

## 📁 Estructura del proyecto

```
├── src/
│   ├── main.gs                 # Punto de entrada
│   ├── utils.gs                # Utilidades
│   ├── calificaciones_*.gs     # Módulo calificaciones
│   ├── medias_*.gs             # Módulo medias
│   ├── observaciones_*.gs      # Módulo observaciones
│   ├── estadisticas_*.gs       # Módulo estadísticas
│   └── tests/                  # Tests (solo en DEV)
│
├── scripts/
│   ├── setup.sh                # Config inicial
│   └── deploy.sh               # Deploy a producción
│
├── .clasp-dev.json.example     # Ejemplo config personal
├── .clasp-prod.json            # Config producción (compartida)
├── .claspignore                # Ignorados en DEV
└── .claspignore-prod           # Ignorados en PROD (sin tests)
```

---

## 📄 Licencia

BSD 3-Clause License
