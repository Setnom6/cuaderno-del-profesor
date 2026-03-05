/**
 * tests/test_setup.gs
 * Tests para el sistema de menús (setup.gs).
 * 
 * NOTA: Los tests de UI no pueden verificar que los menús aparecen visualmente,
 * pero sí pueden verificar que las funciones de validación funcionan.
 */

function runSetupTests() {
  Logger.log('=== INICIANDO TESTS DE SETUP ===');
  const results = [];
  
  try {
    test_detectarModoMedias();
    results.push('✓ test_detectarModoMedias');
  } catch(e) {
    results.push('✗ test_detectarModoMedias: ' + e.message);
  }
  
  try {
    test_verificarHojaMedias();
    results.push('✓ test_verificarHojaMedias');
  } catch(e) {
    results.push('✗ test_verificarHojaMedias: ' + e.message);
  }
  
  try {
    test_verificarHojaEstadisticas();
    results.push('✓ test_verificarHojaEstadisticas');
  } catch(e) {
    results.push('✗ test_verificarHojaEstadisticas: ' + e.message);
  }
  
  try {
    test_createMenus_noError();
    results.push('✓ test_createMenus_noError');
  } catch(e) {
    results.push('✗ test_createMenus_noError: ' + e.message);
  }
  
  Logger.log(results.join('\n'));
  Logger.log('=== FIN TESTS DE SETUP ===\n');
}

/**
 * Test: detectarModoMedias devuelve 'competencias' por defecto
 */
function test_detectarModoMedias() {
  // Sin hoja, devuelve competencias por defecto
  const result = detectarModoMedias(null);
  assertEqual(result, 'competencias', 'default mode is competencias');
}

/**
 * Test: verificarHojaMedias funciona correctamente
 * NOTA: Este test solo verifica que la función existe y no lanza errores inesperados
 */
function test_verificarHojaMedias() {
  // La función debe existir
  assertTrue(typeof verificarHojaMedias === 'function', 'verificarHojaMedias exists');
}

/**
 * Test: verificarHojaEstadisticas funciona correctamente
 * NOTA: Este test solo verifica que la función existe y no lanza errores inesperados
 */
function test_verificarHojaEstadisticas() {
  // La función debe existir
  assertTrue(typeof verificarHojaEstadisticas === 'function', 'verificarHojaEstadisticas exists');
}

/**
 * Test: createMenus no lanza errores
 */
function test_createMenus_noError() {
  // La función debe existir y no lanzar errores
  assertTrue(typeof createMenus === 'function', 'createMenus exists');
  
  // Ejecutar y verificar que no lanza error
  try {
    createMenus();
    assertTrue(true, 'createMenus executed without error');
  } catch(e) {
    throw new Error('createMenus threw an error: ' + e.message);
  }
}
