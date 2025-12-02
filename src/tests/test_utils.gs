/**
 * tests/test_utils.gs
 * Tests unitarios para todas las funciones de utils.gs.
 * Estos tests NO modifican el spreadsheet, solo verifican lógica pura.
 */

function runUtilsTests() {
  Logger.log('=== INICIANDO TESTS DE UTILS ===');
  const results = [];
  
  // Tests de normalización
  try {
    test_normalizeString();
    results.push('✓ test_normalizeString');
  } catch(e) {
    results.push('✗ test_normalizeString: ' + e.message);
  }
  
  // Tests de conversión de columna
  try {
    test_columnToLetter();
    results.push('✓ test_columnToLetter');
  } catch(e) {
    results.push('✗ test_columnToLetter: ' + e.message);
  }
  
  // Tests de búsqueda de headers
  try {
    test_findHeaderIndex();
    results.push('✓ test_findHeaderIndex');
  } catch(e) {
    results.push('✗ test_findHeaderIndex: ' + e.message);
  }
  
  // Tests de firmas de fila
  try {
    test_makeRowSignature();
    results.push('✓ test_makeRowSignature');
  } catch(e) {
    results.push('✗ test_makeRowSignature: ' + e.message);
  }
  
  try {
    test_makeRowSignatureNormalized();
    results.push('✓ test_makeRowSignatureNormalized');
  } catch(e) {
    results.push('✗ test_makeRowSignatureNormalized: ' + e.message);
  }
  
  // Tests de comparación
  try {
    test_localeCompareEs();
    results.push('✓ test_localeCompareEs');
  } catch(e) {
    results.push('✗ test_localeCompareEs: ' + e.message);
  }
  
  // Tests de construcción de headers
  try {
    test_buildCalifHeaders();
    results.push('✓ test_buildCalifHeaders');
  } catch(e) {
    results.push('✗ test_buildCalifHeaders: ' + e.message);
  }
  
  // Tests de deduplicación
  try {
    test_deduplicateRowsInMemory();
    results.push('✓ test_deduplicateRowsInMemory');
  } catch(e) {
    results.push('✗ test_deduplicateRowsInMemory: ' + e.message);
  }
  
  Logger.log(results.join('\n'));
  Logger.log('=== FIN TESTS DE UTILS ===\n');
}

function test_normalizeString() {
  assertEqual(normalizeString('  Hola  '), 'Hola', 'trim');
  assertEqual(normalizeString(123), '123', 'number');
  assertEqual(normalizeString(null), '', 'null');
  assertEqual(normalizeString(undefined), '', 'undefined');
}

function test_columnToLetter() {
  assertEqual(columnToLetter(1), 'A', 'col 1');
  assertEqual(columnToLetter(26), 'Z', 'col 26');
  assertEqual(columnToLetter(27), 'AA', 'col 27');
  assertEqual(columnToLetter(52), 'AZ', 'col 52');
}

function test_findHeaderIndex() {
  const headers = ['Nombre', 'Apellido', 'Email'];
  assertEqual(findHeaderIndex(headers, 'nombre'), 0, 'case insensitive');
  assertEqual(findHeaderIndex(headers, '  Email  '), 2, 'trim');
  assertEqual(findHeaderIndex(headers, 'Edad'), -1, 'not found');
}

function test_makeRowSignature() {
  const row = ['Juan', 'Pérez', '  García  '];
  const sig = makeRowSignature(row);
  assertEqual(sig, 'Juan|Pérez|García', 'signature');
}

function test_makeRowSignatureNormalized() {
  const row1 = ['Juan', 8.5, 'García'];
  const row2 = ['Juan', '8.50', 'García'];
  assertEqual(makeRowSignatureNormalized(row1), makeRowSignatureNormalized(row2), 'normalized numbers');
}

function test_localeCompareEs() {
  assertTrue(localeCompareEs('Álvarez', 'Benítez') < 0, 'alphabetical');
  assertTrue(localeCompareEs('García', 'García') === 0, 'equal');
  assertTrue(localeCompareEs('Pérez', 'López') > 0, 'reverse alphabetical');
}

function test_buildCalifHeaders() {
  const instrumentos = [
    { nombre: 'Ex1', criterios: ['1.1', '1.2'] },
    { nombre: 'Tarea', criterios: ['2.1'] }
  ];
  
  const result = buildCalifHeaders(instrumentos);
  // Estructura: Alumno + Ex1 + '' + Ex1(Media) + Tarea + Tarea(Media) = 6 columns
  // Row1: ['Alumno', 'Ex1', '', 'Ex1', 'Tarea', 'Tarea']
  // Row2: ['Alumno', '1.1', '1.2', 'Media', '2.1', 'Media']
  assertEqual(result.headerRow1.length, 6, 'row1 length');
  assertEqual(result.headerRow2.length, 6, 'row2 length');
  assertEqual(result.totalCols, 6, 'total cols');
  assertEqual(result.headerRow1[0], 'Alumno', 'header alumno');
  assertEqual(result.headerRow1[1], 'Ex1', 'first instrument');
  assertEqual(result.headerRow1[3], 'Ex1', 'media column for Ex1');
  assertEqual(result.headerRow2[3], 'Media', 'media label');
  assertEqual(result.headerRow1[4], 'Tarea', 'second instrument');
  assertEqual(result.headerRow2[2], '1.2', 'criterio 1.2');
}

function test_deduplicateRowsInMemory() {
  const data = [
    ['Header1', 'Header2'],
    ['Alumno', 'Nota'],
    ['Juan', 8],
    ['Ana', 9],
    ['Juan', 8]  // Duplicado
  ];
  
  const result = deduplicateRowsInMemory(data, 2);
  assertEqual(result.dedupedData.length, 4, 'duplicates removed');
  assertEqual(result.duplicatesRemoved, 1, 'count duplicates');
}

// Helper de aserción
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
