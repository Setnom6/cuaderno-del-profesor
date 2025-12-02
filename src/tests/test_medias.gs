/**
 * tests/test_medias.gs
 * Tests unitarios para las funciones de medias_impl, medias_data y medias_format.
 * Verifica lógica de construcción de fórmulas y agrupación de criterios.
 * NO modifica el spreadsheet.
 */

function runMediasTests() {
  Logger.log('=== INICIANDO TESTS DE MEDIAS ===');
  const results = [];
  
  // Tests de medias_data
  try {
    test_medias_groupClavesByCompetencia();
    results.push('✓ test_medias_groupClavesByCompetencia');
  } catch(e) {
    results.push('✗ test_medias_groupClavesByCompetencia: ' + e.message);
  }
  
  try {
    test_medias_buildCriterioFormula();
    results.push('✓ test_medias_buildCriterioFormula');
  } catch(e) {
    results.push('✗ test_medias_buildCriterioFormula: ' + e.message);
  }
  
  try {
    test_medias_buildCompetenciaFormula();
    results.push('✓ test_medias_buildCompetenciaFormula');
  } catch(e) {
    results.push('✗ test_medias_buildCompetenciaFormula: ' + e.message);
  }
  
  try {
    test_medias_buildMediaFinalFormula();
    results.push('✓ test_medias_buildMediaFinalFormula');
  } catch(e) {
    results.push('✗ test_medias_buildMediaFinalFormula: ' + e.message);
  }
  
  Logger.log(results.join('\n'));
  Logger.log('=== FIN TESTS DE MEDIAS ===\n');
}

function test_medias_groupClavesByCompetencia() {
  const claves = ['1.1', '1.2', '2.1', '3.1', '1.3'];
  const result = medias_groupClavesByCompetencia(claves);
  
  assertEqual(Object.keys(result).length, 3, 'three competencias');
  assertEqual(result['1'].length, 3, 'comp 1 has 3 claves');
  assertEqual(result['2'].length, 1, 'comp 2 has 1 clave');
  assertEqual(result['3'].length, 1, 'comp 3 has 1 clave');
  assertTrue(result['1'].includes('1.1'), 'has 1.1');
  assertTrue(result['1'].includes('1.2'), 'has 1.2');
  assertTrue(result['1'].includes('1.3'), 'has 1.3');
}

function test_medias_buildCriterioFormula() {
  const formula = medias_buildCriterioFormula(1, [3, 5, 7], 5);
  assertTrue(formula.includes('AVERAGE'), 'has AVERAGE');
  assertTrue(formula.includes('calificaciones1'), 'references sheet');
  assertTrue(formula.includes('C5'), 'references column C');
  assertTrue(formula.includes('E5'), 'references column E');
  assertTrue(formula.includes('G5'), 'references column G');
}

function test_medias_buildCompetenciaFormula() {
  const claves = ['1.1', '1.2'];
  const clavesLista = ['1.1', '1.2', '2.1'];
  const formula = medias_buildCompetenciaFormula(claves, clavesLista, 5);
  
  assertTrue(formula.includes('AVERAGE'), 'has AVERAGE');
  assertTrue(formula.includes('C5'), 'references C5 for 1.1');
  assertTrue(formula.includes('D5'), 'references D5 for 1.2');
}

function test_medias_buildMediaFinalFormula() {
  const formula = medias_buildMediaFinalFormula(6, 3, 5);
  assertTrue(formula.includes('AVERAGEIF'), 'has AVERAGEIF');
  assertTrue(formula.includes('F5'), 'references start column');
  assertTrue(formula.includes('H5'), 'references end column (6+3-1=8=H)');
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
