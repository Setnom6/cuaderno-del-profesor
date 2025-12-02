/**
 * tests/test_observaciones.gs
 * Tests unitarios para las funciones de observaciones_impl, observaciones_data y observaciones_format.
 * Verifica lógica de estructura de observaciones.
 * NO modifica el spreadsheet en tests unitarios puros.
 */

function runObservacionesTests() {
  Logger.log('=== INICIANDO TESTS DE OBSERVACIONES ===');
  const results = [];
  
  // Tests de observaciones_data
  try {
    test_observaciones_getHeaders();
    results.push('✓ test_observaciones_getHeaders');
  } catch(e) {
    results.push('✗ test_observaciones_getHeaders: ' + e.message);
  }
  
  try {
    test_observaciones_getNumericColumns();
    results.push('✓ test_observaciones_getNumericColumns');
  } catch(e) {
    results.push('✗ test_observaciones_getNumericColumns: ' + e.message);
  }
  
  Logger.log(results.join('\n'));
  Logger.log('=== FIN TESTS DE OBSERVACIONES ===\n');
}

function test_observaciones_getHeaders() {
  const headers = observaciones_getHeaders();
  
  assertEqual(headers.length, 9, 'debe tener 9 columnas');
  assertEqual(headers[0], 'Alumno', 'primera columna es Alumno');
  assertEqual(headers[1], 'Faltas injustificadas', 'segunda columna');
  assertEqual(headers[8], 'Observaciones adicionales', 'última columna');
}

function test_observaciones_getNumericColumns() {
  const numericCols = observaciones_getNumericColumns();
  
  assertEqual(numericCols.length, 7, 'debe tener 7 columnas numéricas');
  assertEqual(numericCols[0], 2, 'primera columna numérica es 2');
  assertEqual(numericCols[6], 8, 'última columna numérica es 8');
  
  // Verificar que no incluye columna 1 (Alumno) ni 9 (Observaciones adicionales)
  assertFalse(numericCols.includes(1), 'no debe incluir columna Alumno');
  assertFalse(numericCols.includes(9), 'no debe incluir columna Observaciones adicionales');
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
