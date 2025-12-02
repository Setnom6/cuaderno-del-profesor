/**
 * tests/test_calificaciones.gs
 * Tests unitarios para las funciones de calificaciones_impl, calificaciones_data y calificaciones_format.
 * Verifica lógica pura, construcción de estructuras y fórmulas.
 * NO modifica el spreadsheet.
 */

function runCalificacionesTests() {
  Logger.log('=== INICIANDO TESTS DE CALIFICACIONES ===');
  const results = [];
  
  // Tests de calificaciones_data
  try {
    test_readOldSheetData_null();
    results.push('✓ test_readOldSheetData_null');
  } catch(e) {
    results.push('✗ test_readOldSheetData_null: ' + e.message);
  }
  
  try {
    test_buildOldDataBlocks_empty();
    results.push('✓ test_buildOldDataBlocks_empty');
  } catch(e) {
    results.push('✗ test_buildOldDataBlocks_empty: ' + e.message);
  }
  
  try {
    test_buildOldDataBlocks_singleInstrument();
    results.push('✓ test_buildOldDataBlocks_singleInstrument');
  } catch(e) {
    results.push('✗ test_buildOldDataBlocks_singleInstrument: ' + e.message);
  }
  
  Logger.log(results.join('\n'));
  Logger.log('=== FIN TESTS DE CALIFICACIONES ===\n');
}

function test_readOldSheetData_null() {
  const result = readOldSheetData(null);
  assertEqual(result.oldData, null, 'old data null');
  assertEqual(result.oldHeadersRow1.length, 0, 'headers empty');
  assertEqual(Object.keys(result.oldRowByAlumno).length, 0, 'row map empty');
}

function test_buildOldDataBlocks_empty() {
  const result = buildOldDataBlocks([], [], null);
  assertEqual(Object.keys(result).length, 0, 'no blocks');
}

function test_buildOldDataBlocks_singleInstrument() {
  const headerRow1 = ['Alumno', 'Examen 1', '', 'Examen 1'];
  const headerRow2 = ['Alumno', '1.1', '1.2', 'Media'];
  const oldData = [
    headerRow1,
    headerRow2,
    ['Juan', 8, 9, 8.5],
    ['Ana', 7, 8, 7.5]
  ];
  
  const result = buildOldDataBlocks(headerRow1, headerRow2, oldData);
  assertTrue('Examen 1' in result, 'has instrument');
  assertEqual(result['Examen 1'].columns.length, 2, 'two criteria');
  assertEqual(result['Examen 1'].columns[0].clave, '1.1', 'first clave');
  assertEqual(result['Examen 1'].columns[1].clave, '1.2', 'second clave');
}

// Helpers de aserción
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: esperado '${expected}', obtenido '${actual}'`);
  }
}

function assertTrue(condition, message) {
  if (!condition) {
    throw new Error(`${message}: esperado true`);
  }
}

function assertFalse(condition, message) {
  if (condition) {
    throw new Error(`${message}: esperado false`);
  }
}
