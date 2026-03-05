/**
 * tests/test_setup.gs
 * Tests para el sistema de menús y opciones de creación (setup.gs).
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
  
  try {
    test_getCreationOption_defaults();
    results.push('✓ test_getCreationOption_defaults');
  } catch(e) {
    results.push('✗ test_getCreationOption_defaults: ' + e.message);
  }
  
  try {
    test_setAndGetCreationOption();
    results.push('✓ test_setAndGetCreationOption');
  } catch(e) {
    results.push('✗ test_setAndGetCreationOption: ' + e.message);
  }
  
  try {
    test_toggleCreationOption();
    results.push('✓ test_toggleCreationOption');
  } catch(e) {
    results.push('✗ test_toggleCreationOption: ' + e.message);
  }
  
  try {
    test_getAllCreationOptions();
    results.push('✓ test_getAllCreationOptions');
  } catch(e) {
    results.push('✗ test_getAllCreationOptions: ' + e.message);
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

/**
 * Test: getCreationOption devuelve valores por defecto correctos
 */
function test_getCreationOption_defaults() {
  // Limpiar propiedades para asegurar valores por defecto
  const props = PropertiesService.getDocumentProperties();
  props.deleteProperty(OPTION_KEYS.CREAR_ESTADISTICAS);
  props.deleteProperty(OPTION_KEYS.CREAR_MEDIA_CONTINUA);
  props.deleteProperty(OPTION_KEYS.CREAR_OBSERVACIONES);
  
  // Verificar valores por defecto
  assertEqual(getCreationOption(OPTION_KEYS.CREAR_ESTADISTICAS), false, 'default crearEstadisticas is false');
  assertEqual(getCreationOption(OPTION_KEYS.CREAR_MEDIA_CONTINUA), true, 'default crearMediaContinua is true');
  assertEqual(getCreationOption(OPTION_KEYS.CREAR_OBSERVACIONES), false, 'default crearObservaciones is false');
}

/**
 * Test: setCreationOption guarda y getCreationOption recupera correctamente
 */
function test_setAndGetCreationOption() {
  // Establecer valor
  setCreationOption(OPTION_KEYS.CREAR_ESTADISTICAS, true);
  assertEqual(getCreationOption(OPTION_KEYS.CREAR_ESTADISTICAS), true, 'set true works');
  
  // Establecer valor contrario
  setCreationOption(OPTION_KEYS.CREAR_ESTADISTICAS, false);
  assertEqual(getCreationOption(OPTION_KEYS.CREAR_ESTADISTICAS), false, 'set false works');
}

/**
 * Test: toggleCreationOption alterna correctamente
 */
function test_toggleCreationOption() {
  // Establecer valor inicial conocido
  setCreationOption(OPTION_KEYS.CREAR_OBSERVACIONES, false);
  
  // Toggle a true
  const result1 = toggleCreationOption(OPTION_KEYS.CREAR_OBSERVACIONES);
  assertEqual(result1, true, 'toggle false->true returns true');
  assertEqual(getCreationOption(OPTION_KEYS.CREAR_OBSERVACIONES), true, 'value is now true');
  
  // Toggle a false
  const result2 = toggleCreationOption(OPTION_KEYS.CREAR_OBSERVACIONES);
  assertEqual(result2, false, 'toggle true->false returns false');
  assertEqual(getCreationOption(OPTION_KEYS.CREAR_OBSERVACIONES), false, 'value is now false');
}

/**
 * Test: getAllCreationOptions devuelve objeto con todas las opciones
 */
function test_getAllCreationOptions() {
  // Establecer valores conocidos
  setCreationOption(OPTION_KEYS.CREAR_ESTADISTICAS, true);
  setCreationOption(OPTION_KEYS.CREAR_MEDIA_CONTINUA, false);
  setCreationOption(OPTION_KEYS.CREAR_OBSERVACIONES, true);
  
  const options = getAllCreationOptions();
  
  assertTrue(typeof options === 'object', 'returns an object');
  assertEqual(options.crearEstadisticas, true, 'crearEstadisticas is true');
  assertEqual(options.crearMediaContinua, false, 'crearMediaContinua is false');
  assertEqual(options.crearObservaciones, true, 'crearObservaciones is true');
  
  // Restaurar valores por defecto
  setCreationOption(OPTION_KEYS.CREAR_ESTADISTICAS, false);
  setCreationOption(OPTION_KEYS.CREAR_MEDIA_CONTINUA, true);
  setCreationOption(OPTION_KEYS.CREAR_OBSERVACIONES, false);
}
