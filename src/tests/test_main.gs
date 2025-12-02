/**
 * tests/test_main.gs
 * Tests unitarios para las funciones de main.gs.
 * Verifica lógica de construcción de alumnos, instrumentos y mapas de color.
 * NO modifica el spreadsheet.
 */

function runMainTests() {
  Logger.log('=== INICIANDO TESTS DE MAIN ===');
  const results = [];
  
  // Tests de buildAlumnosFromRows
  try {
    test_buildAlumnosFromRows_basic();
    results.push('✓ test_buildAlumnosFromRows_basic');
  } catch(e) {
    results.push('✗ test_buildAlumnosFromRows_basic: ' + e.message);
  }
  
  try {
    test_buildAlumnosFromRows_duplicates();
    results.push('✓ test_buildAlumnosFromRows_duplicates');
  } catch(e) {
    results.push('✗ test_buildAlumnosFromRows_duplicates: ' + e.message);
  }
  
  try {
    test_buildAlumnosFromRows_ordering();
    results.push('✓ test_buildAlumnosFromRows_ordering');
  } catch(e) {
    results.push('✗ test_buildAlumnosFromRows_ordering: ' + e.message);
  }
  
  try {
    test_buildAlumnosFromRows_empty();
    results.push('✓ test_buildAlumnosFromRows_empty');
  } catch(e) {
    results.push('✗ test_buildAlumnosFromRows_empty: ' + e.message);
  }
  
  // Tests de arraysEqual
  try {
    test_arraysEqual();
    results.push('✓ test_arraysEqual');
  } catch(e) {
    results.push('✗ test_arraysEqual: ' + e.message);
  }
  
  Logger.log(results.join('\n'));
  Logger.log('=== FIN TESTS DE MAIN ===\n');
}

function test_buildAlumnosFromRows_basic() {
  const datosListado = [
    ['Juan', 'García', 'López'],
    ['Ana', 'Martínez', '']
  ];
  
  const result = buildAlumnosFromRows(datosListado);
  assertEqual(result.alumnos.length, 2, 'num alumnos');
  assertEqual(result.alumnos[0][0], 'Juan García', 'display name 1');
  assertEqual(result.alumnos[1][0], 'Ana Martínez', 'display name 2');
}

function test_buildAlumnosFromRows_duplicates() {
  const datosListado = [
    ['Juan', 'García', 'López'],
    ['Juan', 'García', 'López'],  // Duplicado exacto
    ['Juan', 'García', 'Pérez']   // Homónimo distinto
  ];
  
  const result = buildAlumnosFromRows(datosListado);
  // Debe eliminar duplicado exacto pero conservar homónimo
  assertEqual(result.alumnos.length, 2, 'duplicates handled');
}

function test_buildAlumnosFromRows_ordering() {
  const datosListado = [
    ['María', 'Pérez', ''],
    ['Juan', 'Álvarez', ''],
    ['Ana', 'García', '']
  ];
  
  const result = buildAlumnosFromRows(datosListado);
  // Debe ordenar por apellido
  assertEqual(result.alumnos[0][0], 'Juan Álvarez', 'first by surname');
  assertEqual(result.alumnos[1][0], 'Ana García', 'second by surname');
  assertEqual(result.alumnos[2][0], 'María Pérez', 'third by surname');
}

function test_buildAlumnosFromRows_empty() {
  const datosListado = [];
  const result = buildAlumnosFromRows(datosListado);
  assertEqual(result.alumnos.length, 0, 'empty list');
}

function test_arraysEqual() {
  assertTrue(arraysEqual(['a', 'b'], ['a', 'b']), 'equal arrays');
  assertFalse(arraysEqual(['a', 'b'], ['a', 'c']), 'different arrays');
  assertFalse(arraysEqual(['a'], ['a', 'b']), 'different lengths');
  assertFalse(arraysEqual(null, ['a']), 'null array');
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
