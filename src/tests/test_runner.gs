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
    { name: 'Medias Tests', fn: runMediasTests },
    { name: 'Observaciones Tests', fn: runObservacionesTests }
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
  
  // Tests de integración (solo Phase1, las demás son manuales)
  Logger.log('\n⚠️⚠️⚠️ INICIANDO TESTS DE INTEGRACIÓN ⚠️⚠️⚠️');
  Logger.log('⚠️ Estos tests MODIFICAN la hoja de cálculo');
  Logger.log('⚠️ Asegúrate de estar en una hoja de PRUEBA\n');
  
  try {
    runIntegrationTest_Phase1();
    allResults.push('✓ Tests de Integración - Phase1 (instrucciones mostradas)');
    
    Logger.log('\n====================================');
    Logger.log('📋 TESTS DE INTEGRACIÓN - FASES 2 Y 3');
    Logger.log('====================================');
    Logger.log('Los tests de integración requieren interacción manual.');
    Logger.log('Phase1 completada. Para continuar:');
    Logger.log('  1. Lee las instrucciones mostradas arriba');
    Logger.log('  2. Ejecuta manualmente: runIntegrationTest_Phase2()');
    Logger.log('  3. Sigue las instrucciones de Phase2');
    Logger.log('  4. Ejecuta manualmente: runIntegrationTest_Phase3()\n');
  } catch (e) {
    allResults.push('✗ Tests de Integración - Phase1: ' + e.message);
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


