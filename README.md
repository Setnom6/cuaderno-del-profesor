# Cuaderno del Profesor Automatizado

Sistema de evaluación basado en competencias, criterios e instrumentos para Google Sheets.

> 📖 Para documentación técnica detallada del sistema, consulta [docs/SISTEMA.md](docs/SISTEMA.md)

---

## 📋 Índice

- [Para Usuarios](#-para-usuarios)
- [Para Desarrolladores](#-para-desarrolladores)
- [Comandos npm](#-comandos-npm)
- [Estructura del proyecto](#-estructura-del-proyecto)

---

## 📋 Para Usuarios

### Obtener la plantilla

1. Abre el [enlace a la plantilla](https://docs.google.com/spreadsheets/d/ID_PLANTILLA/template/preview)
2. Clic en **"Usar plantilla"** o **Archivo → Hacer una copia**
3. Se creará una copia en tu Drive con todo el código incluido

### Configuración inicial

Completa estas 3 hojas antes de generar calificaciones:

| Hoja | Qué hacer |
|------|-----------|
| `listado` | Nombre, Apellido1, Apellido2 de cada alumno |
| `criterios` | Claves de criterios con colores por competencia |
| `instrumentos` | Nombres de instrumentos y criterios asociados por trimestre |

### Uso

1. **(Opcional)** Configura qué hojas crear con **⚙️ Opciones de creación**:
   - ○ Crear Estadísticas (desactivado por defecto)
   - ✓ Crear Media Continua (activado por defecto)
   - ○ Crear Observaciones (desactivado por defecto)
2. Usa el menú **📊 Generar Trimestre → Trimestre 1** (o T2, T3)
3. Se generarán las hojas según la configuración (siempre: `calificaciones1`, `medias1`)
4. Introduce las notas en `calificaciones1`
5. Para análisis: marca instrumentos con X en `estadísticas` y usa **📈 Estadísticas → Generar Análisis**

> ⚠️ Si los menús no aparecen: **Extensiones → Apps Script → ejecutar `createMenus()`**

### Hojas generadas

| Hoja | Descripción | Opcional |
|------|-------------|----------|
| `calificacionesN` | Notas por instrumento y criterio, con media por instrumento | No |
| `mediasN` | Medias por criterio y por competencia (trimestre N) | No |
| `mediasContinua` | Medias acumuladas de todos los trimestres | Sí (activa por defecto) |
| `observacionesN` | Faltas, retrasos y observaciones de alumnos | Sí |
| `estadísticas` | Análisis comparativo de instrumentos seleccionados | Sí |

> 📖 Más detalles sobre cada hoja en [docs/SISTEMA.md](docs/SISTEMA.md)

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

> ⚠️ **Requisito**: Node.js 18+ (clasp no funciona con versiones anteriores)
> 
> Para actualizar Node.js:
> ```bash
> # Usando nvm (recomendado)
> curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
> source ~/.bashrc
> nvm install 20
> nvm use 20
> ```

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
npm run prod:push        # Sube código a la plantilla oficial
npm run prod:open        # Abre Apps Script de producción
```

### Actualizar usuarios

Para actualizar el Apps Script de un usuario específico (sin guardar su ID):

```bash
npm run update:user <SCRIPT_ID>
```

El ID se pasa como argumento y no se almacena en ningún archivo.

---

## 🛠️ Comandos npm

| Comando | Descripción |
|---------|-------------|
| `npm run login` | Autenticarse con clasp en Google |
| `npm run dev:push` | Subir código a ambos entornos DEV |
| `npm run dev:tests` | Subir solo a DEV-TESTS (con tests) |
| `npm run dev:manual` | Subir solo a DEV-MANUAL (sin tests) |
| `npm run dev:open:tests` | Abrir Apps Script de DEV-TESTS |
| `npm run dev:open:manual` | Abrir Apps Script de DEV-MANUAL |
| `npm run prod:push` | Subir a producción (sin tests) |
| `npm run prod:open` | Abrir Apps Script de producción |
| `npm run update:user <ID>` | Actualizar Apps Script de un usuario |

---

## 📁 Estructura del proyecto

```
├── src/
│   ├── main.gs                 # Punto de entrada, trimester1/2/3()
│   ├── setup.gs                # Gestión de menús (createMenus, onOpen)
│   ├── utils.gs                # Funciones auxiliares compartidas
│   ├── calificaciones/         # Módulo de calificaciones
│   │   ├── calificaciones_impl.gs
│   │   ├── calificaciones_data.gs
│   │   └── calificaciones_format.gs
│   ├── medias/                 # Módulo de medias
│   │   ├── medias_impl.gs
│   │   ├── medias_continua.gs
│   │   ├── medias_data.gs
│   │   ├── medias_format.gs
│   │   └── medias_menu.gs
│   ├── observaciones/          # Módulo de observaciones
│   │   ├── observaciones_impl.gs
│   │   ├── observaciones_data.gs
│   │   └── observaciones_format.gs
│   ├── estadisticas/           # Módulo de estadísticas
│   │   ├── estadisticas_impl.gs
│   │   ├── estadisticas_panel.gs
│   │   ├── estadisticas_analyze.gs
│   │   ├── estadisticas_format.gs
│   │   └── estadisticas_menu.gs
│   ├── tests/                  # Tests (solo en DEV-TESTS)
│   │   ├── test_runner.gs
│   │   ├── test_setup.gs
│   │   └── ...
│   └── appsscript.json         # Manifest de Apps Script
│
├── scripts/
│   ├── setup.sh                # Configuración inicial
│   └── update-user.sh          # Actualizar usuario por ID
│
├── docs/
│   └── SISTEMA.md              # Documentación técnica del sistema
│
├── .clasp-*.json.example       # Ejemplos de configuración clasp
├── .claspignore                # Archivos ignorados por clasp
└── .claspignore-prod           # Ignorados en producción (excluye tests)
```

### Archivos de configuración (privados, en .gitignore)

| Archivo | Quién lo tiene | Contenido |
|---------|---------------|-----------|
| `.clasp-dev-tests.json` | Cada developer | Su Script ID personal (tests) |
| `.clasp-dev-manual.json` | Cada developer | Su Script ID personal (manual) |
| `.clasp-prod.json` | Solo maintainers | Script ID de producción |

---

## 📄 Licencia

BSD 3-Clause License
