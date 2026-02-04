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
│     Tu Drive personal (privado)                  │
│                                                  │
│   📊 Sheet TESTS        ← código + tests        │
│   └── Para correr runAllTests()                 │
│                                                  │
│   📊 Sheet MANUAL       ← código SIN tests      │
│   └── Para pruebas manuales con datos reales    │
└─────────────────────────────────────────────────┘
         │
         │ npm run dev:push (sube a AMBOS)
         │
┌─────────────────────────────────────────────────┐
│     Drive de producción (solo maintainers)       │
│                                                  │
│   📊 PLANTILLA oficial  ← código SIN tests      │
│   └── Usuarios copian desde aquí                │
│                                                  │
│   ⚠️ Script ID privado, no está en GitHub       │
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

### Configurar tus entornos personales

Crea **DOS Google Sheets** en tu Drive:

#### 1. Sheet para TESTS AUTOMATIZADOS
- Crea un Sheet vacío
- Extensiones → Apps Script → ⚙️ → Copia Script ID
- Edita `.clasp-dev-tests.json`:
```json
{
  "scriptId": "TU_SCRIPT_ID_TESTS",
  "rootDir": "./src"
}
```

#### 2. Sheet para PRUEBAS MANUALES
- Crea otro Sheet con datos de prueba
- Copia su Script ID
- Edita `.clasp-dev-manual.json`:
```json
{
  "scriptId": "TU_SCRIPT_ID_MANUAL",
  "rootDir": "./src"
}
```

> ⚠️ Estos archivos son personales y están en `.gitignore`. No se suben a GitHub.

### Comandos de desarrollo

```bash
npm run dev:push         # Sube a AMBOS entornos de desarrollo:
                         #   - TESTS: con tests
                         #   - MANUAL: sin tests

npm run dev:open:tests   # Abre Apps Script del Sheet de tests
npm run dev:open:manual  # Abre Apps Script del Sheet manual
```

### Tests

1. `npm run dev:push`
2. Abre tu Sheet de TESTS → Apps Script
3. Ejecuta `runAllTests()`

### Publicar a producción

Solo maintainers autorizados con el Script ID de producción:

```bash
# Solicita el Script ID al maintainer y crea .clasp-prod.json
cp .clasp-prod.json.example .clasp-prod.json
# Edita con el ID real

# Deploy
./scripts/deploy.sh
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
│   └── tests/                  # Tests (solo en DEV-TESTS)
│
├── scripts/
│   ├── setup.sh                # Config inicial
│   └── deploy.sh               # Deploy a producción
│
├── .clasp-dev-tests.json.example    # Ejemplo config tests
├── .clasp-dev-manual.json.example   # Ejemplo config manual
├── .clasp-prod.json.example         # Ejemplo config producción
├── .claspignore                     # Ignorados (incluye tests)
└── .claspignore-prod                # Ignorados (SIN tests)
```

### Archivos de configuración (NO en GitHub)

| Archivo | Quién lo tiene | Contenido |
|---------|---------------|-----------|
| `.clasp-dev-tests.json` | Cada developer | Su Script ID personal (tests) |
| `.clasp-dev-manual.json` | Cada developer | Su Script ID personal (manual) |
| `.clasp-prod.json` | Solo maintainers | Script ID de producción |

---

## 📄 Licencia

BSD 3-Clause License
