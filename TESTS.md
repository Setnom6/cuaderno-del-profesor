# Guía de Tests del Sistema de Calificaciones

## ⚠️ ADVERTENCIA CRÍTICA ⚠️

**LOS TESTS DE INTEGRACIÓN MODIFICAN LA HOJA DE CÁLCULO**

Si ejecutas tests en tu hoja de producción con datos reales, **PERDERÁS TODOS TUS DATOS**.

### Cómo ejecutar tests de forma segura

**Opción 1: Hoja separada (RECOMENDADO)**
1. Crea una **copia** de tu hoja de producción solo para tests
2. Nómbrala como "Cuaderno Profesor - TESTS" o similar
3. Ejecuta tests **SOLO** en esa copia
4. Nunca confundas la hoja de tests con la de producción

**Opción 2: Backup completo**
1. **HAZ BACKUP** antes: Archivo → Crear una copia
2. Ejecuta los tests
3. Si algo falla, restaura desde el backup: Archivo → Historial de versiones

---

## Estructura de Tests

El proyecto tiene **5 archivos de tests** en `src/tests/`:

### Tests Unitarios (4 archivos) - SEGUROS
Tests de lógica pura que **NO modifican** el spreadsheet:

1. **test_utils.gs** - Funciones utilitarias
   - `normalizeString`, `columnToLetter`, `findHeaderIndex`
   - `makeRowSignature`, `localeCompareEs`
   - `buildCalifHeaders`, `deduplicateRowsInMemory`

2. **test_main.gs** - Lógica principal
   - `buildAlumnosFromRows` (básico, duplicados, ordenación, vacío)
   - `arraysEqual`

3. **test_calificaciones.gs** - Módulos de calificaciones
   - `readOldSheetData`, `buildOldDataBlocks`

4. **test_medias.gs** - Módulos de medias
   - `medias_groupClavesByCompetencia`
   - `medias_buildCriterioFormula`, `medias_buildCompetenciaFormula`
   - `medias_buildMediaFinalFormula`

### Tests de Integración (1 archivo) - ⚠️ PELIGROSOS
Tests que **SÍ MODIFICAN** el spreadsheet en 3 fases interactivas:

5. **test_integration.gs** - Flujo completo con interacción del usuario
   - **Fase 1**: Configuración inicial (usuario prepara estructura)
   - **Fase 2**: Generación y modificaciones (usuario introduce datos)
   - **Fase 3**: Regeneración y verificación (preservación de calificaciones)

---

## Ejecutar Tests

### En Google Apps Script Editor

```javascript
// Solo tests unitarios (seguros, no modifican datos)
runAllUnitTests()

// Tests de integración interactivos (MODIFICAN spreadsheet)
// Ejecutar cada fase por separado:
runIntegrationTest_Phase1()  // Lee instrucciones en Logger
runIntegrationTest_Phase2()  // Tras completar Phase1
runIntegrationTest_Phase3()  // Tras completar Phase2

// Todos los tests (unitarios + integración)
runAllTests()
```

### Verificación de resultados

Después de ejecutar tests, revisa el **Logger** en Google Apps Script:
- **Ver → Registros (Logs)**
- Cada test muestra `✓` si pasa o `✗` si falla
- Los mensajes detallan qué se verifica

---

## Tests de Integración Interactivos

Los tests de integración son **interactivos en 3 fases**:

### Fase 1: Configuración Inicial
```javascript
runIntegrationTest_Phase1()
```
- **Acción**: Lee las instrucciones en el Logger
- **Usuario configura**: hojas `listado`, `criterios`, `instrumentos`
- **Objetivo**: Estructura inicial exacta para el test
- **Siguiente**: Ejecutar `runIntegrationTest_Phase2()`

### Fase 2: Generación y Modificaciones
```javascript
runIntegrationTest_Phase2()
```
- **Acción**: Genera `calificaciones1` y `medias1`
- **Verifica**: Estructura generada correctamente
- **Usuario introduce**: Calificaciones de prueba y modifica instrumentos
- **Objetivo**: Datos iniciales para verificar preservación
- **Siguiente**: Ejecutar `runIntegrationTest_Phase3()`

### Fase 3: Regeneración y Verificación
```javascript
runIntegrationTest_Phase3()
```
- **Acción**: Regenera hojas con nueva estructura
- **Verifica**: Calificaciones preservadas correctamente
- **Objetivo**: Confirmar que el sistema maneja cambios sin pérdida de datos
- **Resultado**: Test completo ✓

---

## Rangos de Números para Tests

Para evitar conflictos con datos de producción:

| Uso | Números | Hojas |
|-----|---------|-------|
| **Producción** | 1, 2, 3 | `calificaciones1-3`, `medias1-3` |
| **Tests calificaciones** | 901-903 | `calificaciones901-903`, `medias901-903` |
| **Tests medias** | 911-912 | `calificaciones911-912`, `medias911-912` |
| **Tests integración** | 950-953 | `calificaciones950-953`, `medias950-953` |

**NUNCA uses números 1, 2, 3 en tests** - son para producción.

---

## Requisitos para Tests de Integración

Tu spreadsheet de **PRUEBA** debe tener las hojas base:

### Hoja "listado"
```
Nombre | Primer Apellido | Segundo Apellido
Ana    | García          | López
Pedro  | Martínez        | Ruiz
María  | Sánchez         | Torres
Juan   | Fernández       | Díaz
```

### Hoja "criterios"
```
Indice | Competencia  | Criterio           | Clave
1.1    | Competencia1 | Criterio Uno       | 1.1 - Criterio Uno
1.2    | Competencia1 | Criterio Dos       | 1.2 - Criterio Dos
2.1    | Competencia2 | Criterio Tres      | 2.1 - Criterio Tres
2.2    | Competencia2 | Criterio Cuatro    | 2.2 - Criterio Cuatro
```

### Hoja "instrumentos"
```
Trimestre1      | Criterios1
Examen T1       | 1.1 - Criterio Uno, 1.2 - Criterio Dos
Trabajo Escrito | 2.1 - Criterio Tres
Presentación    | 1.1 - Criterio Uno, 2.1 - Criterio Tres
```

---

## Añadir Nuevos Tests

### Tests unitarios

1. Añade función en el archivo correspondiente:
```javascript
function test_myNewFeature() {
  const result = myFunction(input);
  assertEqual(result, expectedValue, 'descripción del test');
}
```

2. Añádela al runner del archivo:
```javascript
function runUtilsTests() {
  // ... tests existentes ...
  try {
    test_myNewFeature();
    results.push('✓ test_myNewFeature');
  } catch(e) {
    results.push('✗ test_myNewFeature: ' + e.message);
  }
}
```

### Tests de integración

1. Añade función en `test_integration.gs`
2. Intégrala en el flujo de fases existente
3. Asegúrate de preservar el estado del spreadsheet

---

## Funciones de Ayuda

Todos los archivos de test incluyen funciones auxiliares:

```javascript
assertEqual(actual, expected, mensaje)
assertTrue(condition, mensaje)
assertFalse(condition, mensaje)
```

Ejemplo de uso:
```javascript
function test_example() {
  assertEqual(suma(2, 3), 5, 'suma básica');
  assertTrue(esPar(4), 'número par');
  assertFalse(esPar(3), 'número impar');
}
```

---

## Recuperación de Datos

Si ejecutaste tests por error en producción:

1. **NO cierres la pestaña**
2. Ve a: **Archivo → Historial de versiones**
3. Busca la última versión **antes** de ejecutar los tests
4. Restaura esa versión
5. Alternativamente, busca backups automáticos de Google Drive

---

## Conclusión

**🚨 REGLAS DE ORO 🚨**

1. ✅ **Tests unitarios**: Ejecuta libremente (seguros)
2. ⚠️ **Tests de integración**: SOLO en hoja de PRUEBA separada
3. 🚫 **NUNCA** ejecutes tests en la hoja de producción
4. 💾 **SIEMPRE** haz backup antes de ejecutar tests de integración
5. 📝 **Verifica** el nombre de la hoja antes de ejecutar cualquier test

**Ante la duda, NO ejecutes tests de integración.**
