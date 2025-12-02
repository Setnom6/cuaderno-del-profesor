/**
 * test_runner.gs
 * Suite maestra de tests del proyecto.
 * 
 * Funciones disponibles:
 *   - runAllUnitTests() → Solo tests unitarios (sin modificar hojas)
 *   - runIntegrationTests() → Solo tests de integración (modifica hojas)
 *   - runAllTests() → Todos los tests (unitarios + integración)
 */

/**
 * Ejecuta todos los tests unitarios del proyecto.
 * Estos tests verifican lógica pura sin modificar el spreadsheet.
 */
function runAllUnitTests() {
  Logger.log('====================================');
  Logger.log('EJECUTANDO TESTS UNITARIOS');
  Logger.log('====================================\n');
  
  const suites = [
    { name: 'Utils Tests', fn: runUtilsTests },
    { name: 'Main Tests', fn: runMainTests },
    { name: 'Calificaciones Tests', fn: runCalificacionesTests },
    { name: 'Medias Tests', fn: runMediasTests }
  ];
  
  let totalPassed = 0;
  let totalFailed = 0;
  const failedSuites = [];
  
  suites.forEach(suite => {
    try {
      suite.fn();
      totalPassed++;
    } catch(e) {
      totalFailed++;
      failedSuites.push(suite.name);
      Logger.log(`✗ ${suite.name} falló: ${e.message}\n`);
    }
  });
  
  Logger.log('====================================');
  Logger.log('RESUMEN TESTS UNITARIOS');
  Logger.log('====================================');
  Logger.log(`Suites pasadas: ${totalPassed}/${suites.length}`);
  Logger.log(`Suites fallidas: ${totalFailed}/${suites.length}`);
  
  if (totalFailed === 0) {
    Logger.log('\n✓✓✓ TODOS LOS TESTS UNITARIOS PASARON ✓✓✓');
  } else {
    Logger.log('\n✗✗✗ ALGUNOS TESTS FALLARON ✗✗✗');
    Logger.log('Suites fallidas: ' + failedSuites.join(', '));
    throw new Error(`${totalFailed} suite(s) de tests fallaron`);
  }
}

/**
 * Ejecuta todos los tests (unitarios + integración).
 * ⚠️ ADVERTENCIA: Los tests de integración MODIFICAN la hoja de cálculo.
 * ⚠️ Ejecutar SOLO en hojas de prueba, NUNCA en producción.
 */
function runAllTests() {
  Logger.log('====================================');
  Logger.log('EJECUTANDO TODOS LOS TESTS');
  Logger.log('(Unitarios + Integración)');
  Logger.log('====================================\n');
  
  const allResults = [];
  let totalFailed = 0;
  
  // Tests unitarios
  try {
    runAllUnitTests();
    allResults.push('✓ Tests Unitarios');
  } catch (e) {
    allResults.push('✗ Tests Unitarios: ' + e.message);
    totalFailed++;
  }
  
  // Tests de integración
  Logger.log('\n⚠️⚠️⚠️ INICIANDO TESTS DE INTEGRACIÓN ⚠️⚠️⚠️');
  Logger.log('⚠️ Estos tests MODIFICAN la hoja de cálculo');
  Logger.log('⚠️ Asegúrate de estar en una hoja de PRUEBA\n');
  
  try {
    runIntegrationTests();
    allResults.push('✓ Tests de Integración');
  } catch (e) {
    allResults.push('✗ Tests de Integración: ' + e.message);
    totalFailed++;
  }
  
  // Resumen final
  Logger.log('\n====================================');
  Logger.log('RESUMEN DE TODOS LOS TESTS');
  Logger.log('====================================');
  Logger.log(allResults.join('\n'));
  
  if (totalFailed === 0) {
    Logger.log('\n✓✓✓ TODOS LOS TESTS PASARON ✓✓✓');
  } else {
    Logger.log(`\n✗✗✗ ${totalFailed} SUITE(S) FALLARON ✗✗✗`);
    throw new Error(`${totalFailed} suite(s) de tests fallaron`);
  }
}


