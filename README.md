# Cuaderno del Profesor Automatizado

Sistema de evaluación basado en competencias, criterios e instrumentos para Google Sheets.

## Configuración del Entorno de Desarrollo

### Requisitos
- Node.js (v16+)
- npm
- Cuenta de Google con acceso a Google Drive

### Instalación inicial

```bash
# Clonar el repositorio
git clone https://github.com/Setnom6/cuaderno-del-profesor.git
cd cuaderno-del-profesor

# Ejecutar setup (instala dependencias y configura clasp)
chmod +x scripts/*.sh
./scripts/setup.sh
```

### Configurar los Script IDs

Necesitas dos Google Sheets con sus proyectos de Apps Script:

1. **DESARROLLO** (para pruebas):
   - Abre tu Google Sheet de pruebas
   - Ve a **Extensiones → Apps Script**
   - Clic en ⚙️ **Configuración del proyecto**
   - Copia el **ID del script**
   - Edita `.clasp-dev.json` y pega el ID en `scriptId`

2. **PRODUCCIÓN** (plantilla para usuarios):
   - Crea un Google Sheet limpio como plantilla
   - Configura su Apps Script igual que arriba
   - Edita `.clasp-prod.json` con su Script ID

### Comandos de desarrollo

```bash
# Subir código a desarrollo
npm run dev:push

# Subir código a producción
npm run prod:push

# Abrir el editor de Apps Script
npm run dev:open
npm run prod:open

# Ver estado de archivos
npm run status
```

### Flujo de trabajo

```
┌─────────────┐     git push     ┌─────────────┐
│   Local     │ ───────────────► │   GitHub    │
│  (VS Code)  │                  │    repo     │
└─────────────┘                  └─────────────┘
       │
       │ npm run dev:push
       ▼
┌─────────────────────────────────────────────────┐
│              Google Drive                        │
│  ┌───────────────┐      ┌───────────────┐       │
│  │  📊 DEV       │      │  📊 PROD      │       │
│  │  (pruebas)    │      │  (plantilla)  │       │
│  └───────────────┘      └───────────────┘       │
│         │                       │               │
│         ▼                       ▼               │
│  ┌───────────────┐      ┌───────────────┐       │
│  │  Apps Script  │      │  Apps Script  │       │
│  │  desarrollo   │      │  producción   │       │
│  └───────────────┘      └───────────────┘       │
└─────────────────────────────────────────────────┘
```

## Instalación para Usuarios

1. Haz una copia de la [plantilla de producción](TU_LINK_PLANTILLA)
2. Completa las hojas: `listado`, `criterios`, `instrumentos`
3. Ejecuta `trimester1()` desde el menú o la consola

## Uso

### Generar Trimestre
```javascript
trimester1()  // Trimestre 1
trimester2()  // Trimestre 2
trimester3()  // Trimestre 3
```

### Generar Estadísticas
1. Abre la hoja `estadísticas`
2. Marca con X los instrumentos que deseas incluir
3. Menú **Estadísticas** → **Generar Análisis**

## Estructura

- **calificacionesN** - Desglose de calificaciones por instrumento
- **mediasN** - Promedios por competencias y criterios
- **observacionesN** - Observaciones sobre los alumnos
- **estadísticas** - Tabla de media de instrumentos seleccionados para todos los alumnos

## Licencia

BSD 3-Clause License
