# 📊 Resumen del Proyecto - Cuaderno del Profesor Automatizado

## 🎯 Visión General

Sistema completo de evaluación basado en **Competencias, Criterios e Instrumentos** para docentes en Google Sheets. Genera automáticamente hojas de calificaciones, medias, observaciones y ahora **análisis estadísticos dinámicos**.

---

## 📈 Estadísticas del Proyecto

| Métrica | Valor |
|---------|-------|
| **Líneas de código (src/)** | 3,411 |
| **Archivos .gs** | 24 |
| **Hojas generadas** | 4 tipos (calificaciones, medias, observaciones, estadísticas) |
| **Trimestres soportados** | 3 |
| **Análisis disponibles** | 4 tipos |
| **Tests** | 6 suites |
| **Commits recientes** | 4 (estadísticas Fase 1) |

---

## 🏗️ Arquitectura

### Capas del Proyecto

```
┌─────────────────────────────────────────┐
│    API Pública (main.gs)               │
│  trimester1(), trimester2(), etc.      │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────────────────────────────────┐
       │                                            │
┌──────▼────────────────────┐     ┌──────────────────────────┐
│ Orquestadores (*_impl.gs) │     │ Menús Contextuales       │
│ - Coordinan flujo         │     │ medias_menu.gs           │
│ - 5 fases claramente      │     │ estadisticas_menu.gs     │
└──────┬────────────────────┘     └──────────────────────────┘
       │
   ┌───┴──────────────────┬─────────────────┬──────────────────┐
   │                      │                 │                  │
┌──▼──────────────┐  ┌────▼──────────┐  ┌──▼──────────┐  ┌───▼────────┐
│ Data Layers     │  │ Format Layers │  │ Utils.gs    │  │ Tests      │
│ (*_data.gs)     │  │ (*_format.gs) │  │ General     │  │ (6 suites) │
│ - Lectura       │  │ - Estilos     │  │ utilities   │  │            │
│ - Procesamiento │  │ - Colores     │  │             │  │            │
│ - Validación    │  │ - Bordes      │  │             │  │            │
└────────────────┘  └───────────────┘  └─────────────┘  └────────────┘
```

### Módulos por Funcionalidad

| Módulo | Archivos | Responsabilidad |
|--------|----------|-----------------|
| **Calificaciones** | 3 + tests | Crear/actualizar hoja calificacionesN con instrumentos y criterios |
| **Medias** | 3 + tests | Calcular promedios por competencias y criterios; menú de alternancia |
| **Observaciones** | 3 + tests | Crear/actualizar lista de observaciones con actualización inteligente |
| **Estadísticas** | 5 | Panel dinámico + 4 análisis; menú contextual |
| **Utilidades** | 1 | Funciones agnósticas reutilizables |

---

## 🚀 Características Implementadas

### ✅ Trimestre 1 (Core)
- [x] Generación automática de calificacionesN
- [x] Cálculo de mediasN (2 modos: competencias/criterios)
- [x] Creación de observacionesN
- [x] Actualización inteligente (preserva datos)
- [x] Protecciones con warning-only mode
- [x] Menú contextual para medias

### ✅ Trimestre 2 & 3 (Extensión)
- [x] Regeneración manteniendo datos previos
- [x] Soporte multilingüe (español)
- [x] Validaciones de datos

### ✅ Estadísticas (Fase 1)
- [x] Panel de control interactivo
- [x] 4 tipos de análisis:
  - [x] Media por Instrumentos
  - [x] Criterios Evaluaciones
  - [x] Notas por Alumno
  - [x] Dashboard General
- [x] Menú contextual "Estadísticas"
- [x] Validación de parámetros
- [x] Regeneración completa

### ✅ Documentación
- [x] README.md (arquitectura + uso)
- [x] ESTADISTICAS.md (guía usuario)
- [x] CHANGELOG.md (historial)
- [x] TESTS.md (testing)
- [x] Comentarios en código (JSDoc)

---

## 📁 Estructura de Archivos

```
sistema-calificaciones-automatizado/
├── appsscript.json                # Config Apps Script
├── LICENSE                        # BSD 3-Clause
├── README.md                      # Documentación principal
├── ESTADISTICAS.md               # Guía usuario (estadísticas)
├── CHANGELOG.md                  # Historial de cambios
├── TESTS.md                      # Documentación de testing
├── Tutorial.pdf                  # Tutorial (en Drive)
│
└── src/
    ├── main.gs                              # API pública
    ├── utils.gs                             # Utilities generales
    │
    ├── calificaciones_impl.gs               # Orquestador
    ├── calificaciones_data.gs               # Lógica de datos
    ├── calificaciones_format.gs             # Formato visual
    │
    ├── medias_impl.gs                       # Orquestador
    ├── medias_data.gs                       # Lógica de datos
    ├── medias_format.gs                     # Formato visual
    ├── medias_menu.gs                       # Menú contextual
    │
    ├── observaciones_impl.gs                # Orquestador
    ├── observaciones_data.gs                # Lógica de datos
    ├── observaciones_format.gs              # Formato visual
    │
    ├── estadisticas_impl.gs                 # Orquestador
    ├── estadisticas_panel.gs                # Panel de control
    ├── estadisticas_analyze.gs              # 4 análisis
    ├── estadisticas_format.gs               # Formato visual
    ├── estadisticas_menu.gs                 # Menú contextual
    │
    └── tests/
        ├── test_runner.gs                   # Suite maestra
        ├── test_main.gs                     # Tests para main.gs
        ├── test_utils.gs                    # Tests para utils.gs
        ├── test_calificaciones.gs           # Tests para calificaciones
        ├── test_medias.gs                   # Tests para medias
        ├── test_observaciones.gs            # Tests para observaciones
        └── test_integration.gs              # Tests de integración
```

---

## 🔄 Flujos Principales

### Flujo de Generación (Trimestral)

```
trimester1() / trimester2() / trimester3()
    │
    ├─→ Leer listado de alumnos
    ├─→ Leer criterios e instrumentos
    │
    ├─→ buildCalificaciones()
    │   └─→ Crear/actualizar hoja calificacionesN
    │
    ├─→ buildMedias()
    │   └─→ Crear/actualizar hoja mediasN
    │
    ├─→ buildObservaciones()
    │   └─→ Crear/actualizar hoja observacionesN
    │
    ├─→ (SOLO T1) buildEstadisticasSheet()
    │   └─→ Crear hoja estadísticas + panel
    │
    └─→ Mostrar confirmación
```

### Flujo de Análisis (Estadísticas)

```
Menú "Estadísticas" → "Generar Análisis"
    │
    ├─→ Validar parámetros (tipo de análisis)
    │
    ├─→ Limpiar área de resultados (fila 20+)
    │
    ├─→ Leer parámetros del panel:
    │   ├─→ Tipo de análisis
    │   ├─→ Alumno (si aplica)
    │   └─→ Instrumentos seleccionados
    │
    ├─→ Ejecutar análisis correspondiente:
    │   ├─→ analisis_mediaInstrumentos()
    │   ├─→ analisis_criteriosEvaluaciones()
    │   ├─→ analisis_alumnoNotas()
    │   └─→ analisis_dashboardGeneral()
    │
    └─→ Mostrar confirmación
```

---

## 🔐 Seguridad

### Protecciones Implementadas

| Área | Protección | Nivel |
|------|-----------|-------|
| Panel Control (estadísticas) | warning-only | Previene edición accidental |
| Headers (calificaciones, medias) | warning-only | Protege estructura |
| Fila Media Final (medias) | warning-only | Previene cálculos rotos |
| Fila Alumnos (medias) | warning-only | Previene reorganización |

### Modo Warning-Only
- ✅ Permite que el script modifique celdas
- ✅ Advierte al usuario si intenta editar manualmente
- ✅ No bloquea, solo avisa
- ✅ Ideal para datos que deben regenerarse

---

## 📊 Datos en Tiempo Real

### Característica Clave: Sin Cache

```
Edita calificaciones en calificaciones1
         ↓
Haz clic en Generar Análisis
         ↓
Lee directamente de calificaciones1 (NO de cache)
         ↓
Estadísticas se actualizan al instante
```

**Ventaja:** Datos siempre frescos, sin delay de sincronización

---

## 🧪 Testing

### Cobertura de Tests

- ✅ **Unit Tests**: 6 suites (una por módulo principal)
- ✅ **Integration Tests**: Casos edge y flujos completos
- ✅ **Smoke Tests**: Verificación básica de funciones

### Ejecución

```javascript
// Solo unit tests (seguros)
runAllUnitTests()

// Integration tests (⚠️ modifica spreadsheet)
runIntegrationTest_Phase1()  // Lee instrucciones primero

// Todos
runAllTests()
```

---

## 🚀 Próximas Mejoras (Roadmap)

### Fase 2 (Gráficas & Exportación)
- [ ] Gráficas de desempeño por alumno
- [ ] Gráficas de desempeño por criterio
- [ ] Exportación de análisis a PDF
- [ ] Exportación a Google Docs

### Fase 3 (Análisis Avanzado)
- [ ] Comparativa entre alumnos
- [ ] Análisis de tendencias
- [ ] Proyecciones de calificación final
- [ ] Análisis de mejora/retroceso

### Fase 4 (UI/UX)
- [ ] Dashboard interactivo
- [ ] Más controles en panel
- [ ] Macros personalizadas
- [ ] Templates guardables

### Fase 5 (Integración)
- [ ] Export a plataformas educativas
- [ ] Sincronización con SIE
- [ ] API para terceros
- [ ] Webhooks de eventos

---

## 🛠️ Tecnologías

| Componente | Tecnología |
|------------|-----------|
| Lenguaje | Google Apps Script (JavaScript) |
| Plataforma | Google Sheets |
| Control de versiones | Git |
| Base de datos | Google Sheets |
| UI | Menús contextuales nativas de Apps Script |
| Documentación | Markdown |

---

## 📚 Documentación Disponible

1. **README.md** - Punto de partida, arquitectura, instalación
2. **ESTADISTICAS.md** - Guía usuario completa de análisis
3. **TESTS.md** - Documentación de testing
4. **CHANGELOG.md** - Historial de cambios
5. **Código JSDoc** - Comentarios en cada función
6. **Tutorial.pdf** - Tutorial interactivo en Drive

---

## 🤝 Contribuciones

### Cómo Contribuir

1. Fork el repositorio
2. Crea rama: `git checkout -b feature/tu-feature`
3. Commit cambios: `git commit -m "feat: descripción"`
4. Push: `git push origin feature/tu-feature`
5. Pull Request

### Estándares de Código

- Convención: `functionName()` (camelCase)
- Prefijos: `CalifModule_functionName()` para módulos específicos
- JSDoc en funciones públicas
- Tests para nuevas características

---

## 📞 Soporte

- **Issues**: Abre una issue en GitHub
- **Email**: Contacta al autor
- **Documentación**: Consulta README.md y ESTADISTICAS.md

---

## 📄 Licencia

**BSD 3-Clause License** - Ver archivo [LICENSE](LICENSE)

```
Copyright (c) 2024, José Manuel Montes Armenteros
All rights reserved.
```

---

## 👨‍💻 Autor

**José Manuel Montes Armenteros**
- Docente y desarrollador
- Especialista en evaluación basada en competencias
- Creador del sistema modular de calificaciones

---

## 🎓 Inspiración

Sistema basado en:
- Marco de Competencias Educativas
- Buenas prácticas de evaluación formativa
- Principios de evaluación por criterios
- Filosofía de automatización inteligente

---

## 📊 Métricas de Proyecto

### Fase Actual
- **Versión**: 2.1.0 (con Estadísticas Fase 1)
- **Estado**: Beta estable
- **Última actualización**: Dic 15, 2024
- **Líneas de código**: 3,411
- **Tests pasando**: ✅ Todos

### Commits Recientes
```
6a04d74 docs: agregar CHANGELOG.md
fd82883 docs: crear guía ESTADISTICAS.md
e110fa1 docs: actualizar README.md
0ec3b5e feat: implementar menú estadísticas
93c8f6a feat: mejoras de formato y protecciones
```

---

## 🎯 Próximos Pasos para el Usuario

1. ✅ **Instalación** - Importa el código a tu proyecto Apps Script
2. ✅ **Configuración** - Prepara listado, criterios, instrumentos
3. ✅ **Generación** - Ejecuta `trimester1()`
4. 🔄 **Uso** - Completa calificaciones y genera estadísticas
5. 📈 **Análisis** - Explora datos con la hoja estadísticas
6. 🚀 **Mejora** - Solicita características de Fase 2

---

**¡Gracias por usar Cuaderno del Profesor Automatizado!** 🎉
