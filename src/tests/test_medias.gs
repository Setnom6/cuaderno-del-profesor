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
  
  try {
    test_medias_readCompetenciasInfo();
    results.push('✓ test_medias_readCompetenciasInfo');
  } catch(e) {
    results.push('✗ test_medias_readCompetenciasInfo: ' + e.message);
  }
  
  try {
    test_medias_buildMediaFinalFormulaCriterios();
    results.push('✓ test_medias_buildMediaFinalFormulaCriterios');
  } catch(e) {
    results.push('✗ test_medias_buildMediaFinalFormulaCriterios: ' + e.message);
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

function test_medias_readCompetenciasInfo() {
  // Test con mock de datos - requiere spreadsheet
  const ss = SpreadsheetApp.getActive();
  const sheetCriteria = ss.getSheetByName("criterios");
  
  if (!sheetCriteria) {
    Logger.log('⚠ test_medias_readCompetenciasInfo: hoja "criterios" no encontrada, saltando test');
    return;
  }
  
  // Leer claves reales para el test
  const clavesLista = medias_readClavesFromCriteria(sheetCriteria);
  if (clavesLista.length === 0) {
    Logger.log('⚠ test_medias_readCompetenciasInfo: no hay claves en criterios, saltando test');
    return;
  }
  
  const competenciasInfo = medias_readCompetenciasInfo(sheetCriteria, clavesLista);
  
  // Verificar que retorna un array
  assertTrue(Array.isArray(competenciasInfo), 'returns array');
  
  // Si hay competencias, verificar estructura
  if (competenciasInfo.length > 0) {
    const firstComp = competenciasInfo[0];
    assertTrue(firstComp.hasOwnProperty('indice'), 'has indice property');
    assertTrue(firstComp.hasOwnProperty('nombre'), 'has nombre property');
    assertTrue(firstComp.hasOwnProperty('color'), 'has color property');
    assertTrue(typeof firstComp.indice === 'string', 'indice is string');
    assertTrue(typeof firstComp.nombre === 'string', 'nombre is string');
    assertTrue(typeof firstComp.color === 'string', 'color is string');
    
    // Verificar que el índice no tiene punto (es "i", no "i.j")
    assertFalse(firstComp.indice.includes('.'), 'indice should not contain dot');
    
    Logger.log(`  → Primera competencia: ${firstComp.indice} - ${firstComp.nombre} (color: ${firstComp.color})`);
  }
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

function test_medias_buildMediaFinalFormulaCriterios() {
  const formula = medias_buildMediaFinalFormulaCriterios(4, 5);
  assertTrue(formula.includes('AVERAGEIF'), 'has AVERAGEIF');
  assertTrue(formula.includes('C5'), 'references start column C5');
  assertTrue(formula.includes('F5'), 'references end column F5 (C+4-1=F)');
  assertTrue(formula.includes('<>'), 'filters non-empty values');
  
  // Verificar fórmula con 0 criterios
  const formulaEmpty = medias_buildMediaFinalFormulaCriterios(0, 5);
  assertEqual(formulaEmpty, "", 'empty formula for 0 criterios');
}
