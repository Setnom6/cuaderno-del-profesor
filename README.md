# Evaluación Automatizada con Google Apps Script

Este proyecto permite tener un Cuaderno del Profesor en formato de hoja de cálculo de Google de forma que emplea un sistema de calificaciones basada en Competencias, Criterios e Instrumentos de Evaluación que es fácil de mantener y completar.

---

## Qué hace

Para cada clase, basándose en el ```listado``` de alumnos, los ```criterios``` de evaluación y una serie de ```instrumentos``` de evaluación por trimestre, crea un desglose de las calificaciones y calcula la media trimestral.

## Instalación

Para una correcta instalación y ejemplos de uso, vaya al ```Tutorial.pdf``` que se encuentra en la raíz de este repositorio. El propio tutorial, así como la ```plantillaInicial``` y un Cuaderno del Profesor completo como ejemplo de uso (```ejemploCompleto```) también se pueden acceder desde

[Drive del repositorio](https://drive.google.com/drive/folders/1Wz7NI7SP5aU2EMRdMaSD7-jkM6zbL2Xv?usp=sharing)

---

## Estructura del repositorio

```
appsscript.json        # Configuración del proyecto Apps Script
LICENSE                # Licencia del proyecto
README.md              # Este archivo
src/
  # === Punto de entrada ===
  main.gs                        # API pública (trimester1/2/3, wrappers buildCalificaciones/buildMedias)
  utils.gs                       # Funciones generales reutilizables (formato, normalización)
  
  # === Sistema de calificaciones (arquitectura modular) ===
  calificaciones_impl.gs         # Orquestador: coordina data + format
  calificaciones_data.gs         # Manejo de datos (headers, fórmulas, validaciones)
  calificaciones_format.gs       # Formato específico (merges, colores, anchos, bordes)
  
  # === Sistema de medias (arquitectura modular - mirror) ===
  medias_impl.gs                 # Orquestador: coordina data + format
  medias_data.gs                 # Manejo de datos (lectura criterios, fórmulas de media)
  medias_format.gs               # Formato específico (colores, anchos, formato condicional)
  
  # === Sistema de estadísticas/análisis (Fase 1) ===
  estadisticas_impl.gs               # Orquestador: coordina análisis y panel
  estadisticas_panel.gs              # Creación del panel de control
  estadisticas_analyze.gs            # Implementación de 4 tipos de análisis
  estadisticas_format.gs             # Formato específico de estadísticas
  estadisticas_menu.gs               # Menú personalizado para estadísticas
  
  # === Menú principal ===
  medias_menu.gs                     # Menú contextual (medias + estadísticas)
  
  # === Tests (estructura mirror) ===
  tests/
    test_runner.gs                     # Suite maestra: ejecuta todos los tests
    integration_test.gs                # Tests de integración con casos edge
    
    # Tests unitarios (uno por módulo principal)
    main_test.gs                       # Tests para main.gs
    utils_test.gs                      # Tests para utils.gs
    calificaciones_test.gs             # Tests legacy para calificaciones
    calificaciones_impl_test.gs        # Tests para calificaciones_impl.gs
    calificaciones_data_test.gs        # Tests para calificaciones_data.gs
    calificaciones_format_test.gs      # Tests para calificaciones_format.gs
    medias_impl_test.gs                # Tests para medias_impl.gs
    medias_data_test.gs                # Tests para medias_data.gs
    medias_format_test.gs              # Tests para medias_format.gs
```

### Arquitectura

**Separación de responsabilidades:**
- **utils.gs**: Funciones agnósticas de datos (formato general, normalización, helpers)
- **{module}_impl.gs**: Orquestadores que coordinan data + format en 5 fases claramente definidas
- **{module}_data.gs**: Lógica de datos (lectura, mapeo, construcción de fórmulas)
- **{module}_format.gs**: Lógica de apariencia (colores, bordes, anchos, formato condicional)

**Convención de nombres:**
- Funciones generales (utils.gs): sin prefijo, reutilizables en todo el proyecto
- Funciones específicas: prefijadas por módulo (`calif_*`, `medias_*`)

**Testing:**
- Estructura mirror: cada archivo de src/ tiene su correspondiente test
- Tests de integración cubren casos edge (alumnos vacíos, duplicados, sin criterios, etc.)
- Suite maestra `runAllTests()` ejecuta todos los tests en secuencia

**Nota:** La plantilla inicial del Drive ya contiene un proyecto de Apps Script con este código fuente; el código se incluye aquí localmente por completitud y para facilitar el control de versiones.

## Arquitectura modular

El proyecto sigue una arquitectura de **separación de responsabilidades** dividida en capas:

### 1. Capa de datos (`calificaciones_data.gs`)
- **Responsabilidad:** Lectura, mapeo y copia de datos antiguos
- **Funciones principales:**
  - `readOldSheetData()` - Lee datos de hoja existente
  - `buildOldDataBlocks()` - Construye estructura de bloques por instrumento
  - `copyOldDataToTemp()` - Copia datos preservando criterios coincidentes

### 2. Capa de utilidades (`utils.gs`)
- **Responsabilidad:** Funciones puras reutilizables sin efectos laterales
- **Funciones principales:**
  - `buildCalifHeaders()` - Construcción de headers de calificaciones
  - `deduplicateRowsInMemory()` - Deduplicación robusta con firma normalizada
  - `ensureSheetDimensions()` - Manejo de dimensiones de hoja
  - `deleteExcessRows()` - Limpieza de filas sobrantes
  - `columnToLetter()`, `normalizeString()`, `makeRowSignatureNormalized()` - Helpers

### 3. Capa de formateo (`formatter.gs`)
- **Responsabilidad:** Todo lo relacionado con apariencia y formato visual
- **Funciones principales:**
  - `formatter_applyHeaderMerges()` - Fusiones de celdas
  - `formatter_applyAverageFormulas()` - Fórmulas de media
  - `formatter_applyDataValidation()` - Validaciones y formato condicional
  - `formatter_applyColumnWidths()` - Anchos de columna
  - `formatter_applyVerticalInstrumentBorders()` - Bordes visuales
  - `formatter_applyNumberFormat()` - Formato numérico

### 4. Capa de orquestación (`calificaciones_impl.gs`)
- **Responsabilidad:** Coordinar el flujo completo sin lógica de negocio
- **Flujo en dos fases:**
  1. **Fase de datos:** Preparar → Construir temporal → Copiar antiguos → Deduplicar → Escribir
  2. **Fase de formato:** Merges → Colores → Fórmulas → Validaciones → Anchos → Bordes

### 5. API pública (`calificacionesConstructor.gs`, `main.gs`)
- **Responsabilidad:** Mantener contratos públicos estables
- `buildCalificaciones()` - Wrapper que delega a `buildCalificacionesImpl()`
- `trimester1()`, `trimester2()`, `trimester3()` - Funciones de entrada

## Tests

El proyecto incluye una suite completa de tests unitarios y de integración.

**📖 Para información detallada sobre estructura, ejecución y requisitos de tests, consulta [TESTS.md](TESTS.md)**

### ⚠️ ADVERTENCIA IMPORTANTE

Los tests de integración **MODIFICAN EL SPREADSHEET**. Ejecuta estos tests **SOLO** en una hoja separada de prueba, nunca en tu hoja de producción con datos reales.

### Ejecutar tests rápidamente:

```javascript
// Solo tests unitarios (seguros)
runAllUnitTests()

// Tests de integración interactivos (⚠️ modifican spreadsheet)
runIntegrationTest_Phase1()  // Lee instrucciones primero
runIntegrationTest_Phase2()  // Tras completar Phase1
runIntegrationTest_Phase3()  // Tras completar Phase2

// Todos los tests
runAllTests()
```

## Hoja Estadísticas (Fase 1)

La hoja **estadísticas** se genera automáticamente cuando se crea el **Trimestre 1**. Proporciona análisis dinámicos de los datos de calificaciones.

### Características

- **Panel de Control** (filas 1-18):
  - Selector de tipo de análisis
  - Selector de alumno (para análisis individuales)
  - Lista de instrumentos con selección mediante marcas "X"
  - Botón **Generar Análisis** en el menú contextual

- **4 tipos de análisis disponibles:**
  1. **Media por Instrumentos**: Promedio de calificaciones de instrumentos seleccionados (todos los alumnos)
  2. **Criterios Evaluaciones**: Conteo de evaluaciones por criterios, agrupadas por trimestre
  3. **Notas por Alumno**: Desglose de calificaciones de un alumno específico por criterios y trimestres
  4. **Dashboard General**: Resumen de estadísticas generales por trimestre (n° alumnos, media clase, suspensos)

### Cómo usar

1. **Navega** a la hoja **estadísticas**
2. **Configura** los parámetros en el panel de control:
   - Selecciona el tipo de análisis en la lista desplegable
   - Marca con "X" los instrumentos que deseas incluir (opcional según el tipo)
   - Selecciona un alumno si es necesario (para análisis individual)
3. **Haz clic** en el menú **Estadísticas** → **Generar Análisis**
4. El análisis se regenerará completamente en la zona de resultados (a partir de la fila 20)

### Notas

- Cada análisis limpia y regenera los resultados completos
- Los instrumentos se extraen automáticamente de las hojas calificacionesN
- La lista de alumnos se pobla desde calificaciones1
- Los análisis leen datos en tiempo real de las hojas de calificaciones y medias

## Verificación tras refactorización

Después de cualquier cambio importante:

1. **Ejecutar tests:** `runAllTests()` en el editor
2. **Ejecutar generación manual:** `trimester1()` (o el trimestre correspondiente)
3. **Verificar hoja generada:**
   - Ordenación correcta de alumnos (primer apellido, segundo apellido como desempate)
   - No hay filas duplicadas
   - Datos antiguos preservados correctamente
   - Formato, colores, fórmulas aplicados correctamente

## Créditos
Creado por José Manuel Montes Armenteros.  
Inspirado en un sistema modular de evaluación en Google Sheets para docentes.

Licencia: BSD 3-Clause License
