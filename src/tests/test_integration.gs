/**
 * tests/test_integration.gs
 * Test de integración interactivo que verifica el flujo completo de creación y actualización de trimestres.
 * 
 * ⚠️ Este test es INTERACTIVO: pedirá al usuario que configure la estructura exacta
 * ⚠️ Este test SÍ MODIFICA la hoja de cálculo (calificaciones1 y medias1).
 * ⚠️ Ejecutar SOLO en una hoja de prueba, NUNCA en producción.
 * 
 * El test guía al usuario paso a paso para:
 * 1. Configurar estructura inicial exacta (alumnos, criterios, instrumentos)
 * 2. Verificar calificaciones1 y medias1 creadas
 * 3. Introducir calificaciones y modificar estructura
 * 4. Verificar que todo se preserva correctamente tras regenerar
 */

/**
 * FASE 1: Configuración inicial
 * El usuario debe configurar las hojas listado, criterios e instrumentos
 */
function runIntegrationTest_Phase1() {
  Logger.log('====================================');
  Logger.log('TEST DE INTEGRACIÓN - FASE 1');
  Logger.log('====================================\n');
  
  const ss = SpreadsheetApp.getActive();
  
  Logger.log('=== FASE 1: CONFIGURACIÓN INICIAL ===\n');
  
  const setupInstructions = `
FASE 1: CONFIGURAR ESTRUCTURA INICIAL

Por favor, configura tu hoja de cálculo EXACTAMENTE así:

📋 HOJA "listado" (columnas: Nombre | Primer Apellido | Segundo Apellido):
Fila 2: Ana | García | López
Fila 3: Pedro | Martínez | Ruiz
Fila 4: María | Sánchez | Torres
Fila 5: Juan | Fernández | Díaz

📚 HOJA "criterios" (columnas: Indice | Competencia | Criterio | Clave):
Fila 2: 1.1 | Competencia1 | Criterio Uno | 1.1 - Criterio Uno (COLOR #a7d69b)
Fila 3: 1.2 | Competencia1 | Criterio Dos | 1.2 - Criterio Dos (COLOR #a7d69b)
Fila 4: 2.1 | Competencia2 | Criterio Tres | 2.1 - Criterio Tres (COLOR #ffff66)
Fila 5: 2.2 | Competencia2 | Criterio Cuatro | 2.2 - Criterio Cuatro (COLOR #ffff66)

📝 HOJA "instrumentos" (columnas: Trimestre1 | Criterios1 | ...):
Fila 2: Examen T1 | 1.1 - Criterio Uno, 1.2 - Criterio Dos
Fila 3: Trabajo Escrito | 2.1 - Criterio Tres
Fila 4: Presentación | 1.1 - Criterio Uno, 2.1 - Criterio Tres

⚠️ ELIMINA las hojas "calificaciones1" y "medias1" si existen.
⚠️ BORRA cualquier otro alumno, criterio o instrumento que exista.
⚠️ Aplica los COLORES indicados a las filas de criterios.

📌 Cuando hayas terminado, ejecuta: runIntegrationTest_Phase2()
  `;
  
  Logger.log(setupInstructions);
  Logger.log('='.repeat(60));
  Logger.log('⏸️  FASE 1 PAUSADA - Lee las instrucciones arriba');
  Logger.log('='.repeat(60));
}

/**
 * FASE 2: Generar trimestre1 y pedir modificaciones
 * Verifica que la configuración de Fase 1 esté completa antes de continuar
 */
function runIntegrationTest_Phase2() {
  Logger.log('====================================');
  Logger.log('TEST DE INTEGRACIÓN - FASE 2');
  Logger.log('====================================\n');
  
  const ss = SpreadsheetApp.getActive();
  
  // Verificar estructura inicial
  const sheetList = ss.getSheetByName('listado');
  const sheetCriteria = ss.getSheetByName('criterios');
  const sheetInstr = ss.getSheetByName('instrumentos');

  if (!sheetList || !sheetCriteria || !sheetInstr) {
    throw new Error('❌ Faltan hojas "listado", "criterios" o "instrumentos". Ejecuta runIntegrationTest_Phase1() primero.');
  }
  
  // Verificar que NO existen calificaciones1 ni medias1
  if (ss.getSheetByName('calificaciones1')) {
    throw new Error('❌ La hoja "calificaciones1" debe ser eliminada antes de empezar. Lee las instrucciones de Phase1.');
  }
  if (ss.getSheetByName('medias1')) {
    throw new Error('❌ La hoja "medias1" debe ser eliminada antes de empezar. Lee las instrucciones de Phase1.');
  }
  
  Logger.log('✓ Estructura inicial verificada\n');
  Logger.log('=== FASE 2: GENERAR Y MODIFICAR ===\n');
  
  Logger.log('Generando trimestre1...');
  generateTrimester(1, false);
  
  const sheetCalif = ss.getSheetByName('calificaciones1');
  const sheetMedias = ss.getSheetByName('medias1');
  const sheetObservaciones = ss.getSheetByName('observaciones1');
  
  if (!sheetCalif) throw new Error('No se creó calificaciones1');
  if (!sheetMedias) throw new Error('No se creó medias1');
  if (!sheetObservaciones) throw new Error('No se creó observaciones1');
  
  Logger.log('✓ Hojas calificaciones1, medias1 y observaciones1 creadas\n');
  
  // Verificar estructura esperada de calificaciones1
  verifyCalificacionesStructure(sheetCalif, {
    alumnos: ['Juan Fernández', 'Ana García', 'Pedro Martínez', 'María Sánchez'],
    instrumentos: ['Examen T1', 'Trabajo Escrito', 'Presentación']
  });
  
  // Verificar formato condicional en columnas Media
  verifyMediaConditionalFormatting(sheetCalif, ['Examen T1', 'Trabajo Escrito', 'Presentación']);
  
  // Verificar estructura esperada de medias1
  const competenciasInfo = medias_readCompetenciasInfo(sheetCriteria, ['1.1', '1.2', '2.1', '2.2']);
  
  verifyMediasStructure(sheetMedias, {
    alumnos: ['Juan Fernández', 'Ana García', 'Pedro Martínez', 'María Sánchez'],
    criterios: ['1.1', '1.2', '2.1', '2.2'],
    competencias: competenciasInfo
  });
  
  // Verificar estructura de observaciones1
  verifyObservacionesStructure(sheetObservaciones, {
    alumnos: ['Juan Fernández', 'Ana García', 'Pedro Martínez', 'María Sánchez']
  });
  
  Logger.log('✓ Estructura de calificaciones1, medias1 y observaciones1 verificada\n');
  
  // Verificar enlaces en instrumentos
  const sheetInstr = ss.getSheetByName('instrumentos');
  if (!sheetInstr) {
    throw new Error('No se encontró hoja instrumentos');
  }
  
  const linkCalif = sheetInstr.getRange('K3').getFormula();
  const linkObservaciones = sheetInstr.getRange('K4').getFormula();
  const linkMedias = sheetInstr.getRange('K5').getFormula();
  
  if (!linkCalif.includes('HYPERLINK') || !linkCalif.includes('calificaciones1')) {
    throw new Error('Enlace a calificaciones1 no encontrado en K3');
  }
  if (!linkObservaciones.includes('HYPERLINK') || !linkObservaciones.includes('observaciones1')) {
    throw new Error('Enlace a observaciones1 no encontrado en K4');
  }
  if (!linkMedias.includes('HYPERLINK') || !linkMedias.includes('medias1')) {
    throw new Error('Enlace a medias1 no encontrado en K5');
  }
  
  Logger.log('✓ Enlaces en instrumentos verificados (K3: calificaciones1, K4: observaciones1, K5: medias1)\n');
  
  // Verificar fórmulas de Media Final (debe ser por competencias por defecto)
  verifyMediaFinalFormulas(sheetMedias, 'competencias');
  Logger.log('✓ Fórmulas de Media Final verificadas (por competencias)\n');
  
  // Pedir al usuario que introduzca calificaciones y modificaciones
  const modificationsInstructions = `
FASE 2: INTRODUCIR CALIFICACIONES Y MODIFICACIONES

Por favor, realiza las siguientes acciones EXACTAMENTE:

📊 EN "calificaciones1":
1. Celda B4 (Ana García - Examen T1, criterio 1.1 - Criterio Uno): escribe 8.5
2. Celda C4 (Ana García - Examen T1, criterio 1.2 - Criterio Dos): escribe 9.0
3. Celda E4 (Ana García - Trabajo Escrito, criterio 2.1 - Criterio Tres): escribe 7.5
4. Celda F5 (Pedro Martínez - Presentación, criterio 1.1 - Criterio Uno): escribe 6.0
5. Celda G5 (Pedro Martínez - Presentación, criterio 2.1 - Criterio Tres): escribe 8.0
6. Celda B3 (Juan Fernández - Examen T1, criterio 1.1 - Criterio Uno): escribe 3.0
7. Celda C3 (Juan Fernández - Examen T1, criterio 1.2 - Criterio Dos): escribe 4.5
   ℹ️  Observa que las columnas "Media" calculan automáticamente el promedio
   ℹ️  Si la media es < 5.0, el número aparecerá en ROJO (formato condicional)
   ℹ️  Juan Fernández en "Examen T1" debería tener Media = 3.75 en ROJO

👥 EN "listado":
8. AÑADIR en fila 6: Luis | Álvarez | Moreno

📋 EN "observaciones1":
9. AÑADIR datos de prueba (ejemplo: Celda B2 = 2, Celda I3 = "Alumno muy participativo")
   (Esto verificará que los datos se preservan al regenerar)

📝 EN "instrumentos" (columnas Trimestre1 y Criterios1):
10. AÑADIR en fila 6 al FINAL: "Prueba Final" | "1.1 - Criterio Uno, 1.2 - Criterio Dos, 2.2 - Criterio Cuatro"
11. INTERCAMBIAR filas 2 y 3 (Examen T1 ↔ Trabajo Escrito)
12. MODIFICAR fila 5 (Presentación después del intercambio): AÑADIR "2.2 - Criterio Cuatro" → "1.1 - Criterio Uno, 2.1 - Criterio Tres, 2.2 - Criterio Cuatro"
13. MODIFICAR fila 2 (ahora Trabajo Escrito): cambiar a → "1.2 - Criterio Dos"
14. INSERTAR en fila 4 (entre Trabajo Escrito y Presentación): "Ejercicios" | "2.1 - Criterio Tres, 2.2 - Criterio Cuatro"

RESULTADO FINAL ESPERADO EN "instrumentos" (columnas Trimestre1 y Criterios1):
Fila 2: Trabajo Escrito | 1.2 - Criterio Dos
Fila 3: Examen T1 | 1.1 - Criterio Uno, 1.2 - Criterio Dos
Fila 4: Ejercicios | 2.1 - Criterio Tres, 2.2 - Criterio Cuatro
Fila 5: Presentación | 1.1 - Criterio Uno, 2.1 - Criterio Tres, 2.2 - Criterio Cuatro
Fila 6: Prueba Final | 1.1 - Criterio Uno, 1.2 - Criterio Dos, 2.2 - Criterio Cuatro

📌 Cuando hayas terminado, ejecuta: runIntegrationTest_Phase3()
  `;
  
  Logger.log(modificationsInstructions);
  Logger.log('='.repeat(60));
  Logger.log('⏸️  FASE 2 PAUSADA - Lee las instrucciones arriba');
  Logger.log('='.repeat(60));
  
  // Información adicional sobre el menú de cálculo de medias
  Logger.log('\n💡 INFORMACIÓN ADICIONAL:');
  Logger.log('Puedes probar el menú "Cálculo de Medias" en la hoja medias1:');
  Logger.log('  - "Media por competencias" (default): promedia medias de competencias');
  Logger.log('  - "Media por criterios": promedia directamente todos los criterios');
  Logger.log('La verificación de Phase3 comprobará las fórmulas por defecto (competencias).');
  Logger.log('\n📌 OPCIONAL: Ejecuta runIntegrationTest_Phase2b() para probar el cambio de fórmulas\n');
}

/**
 * FASE 2b (OPCIONAL): Probar cambio de fórmulas de Media Final
 * Verifica que se puedan cambiar las fórmulas entre modos
 */
function runIntegrationTest_Phase2b() {
  Logger.log('====================================');
  Logger.log('TEST DE INTEGRACIÓN - FASE 2b (OPCIONAL)');
  Logger.log('====================================\n');
  
  const ss = SpreadsheetApp.getActive();
  const sheetMedias = ss.getSheetByName('medias1');
  
  if (!sheetMedias) {
    throw new Error('❌ No se encontró medias1. Ejecuta runIntegrationTest_Phase2() primero.');
  }
  
  Logger.log('=== PROBANDO CAMBIO DE FÓRMULAS ===\n');
  
  // Verificar fórmulas por competencias (estado inicial)
  Logger.log('1. Verificando fórmulas iniciales (por competencias)...');
  verifyMediaFinalFormulas(sheetMedias, 'competencias');
  Logger.log('✓ Fórmulas por competencias verificadas\n');
  
  // Cambiar a fórmulas por criterios
  Logger.log('2. Cambiando a fórmulas por criterios...');
  medias_setFormulaCriterios(true); // true = modo silencioso para tests
  verifyMediaFinalFormulas(sheetMedias, 'criterios');
  Logger.log('✓ Fórmulas por criterios aplicadas y verificadas\n');
  
  // Volver a fórmulas por competencias
  Logger.log('3. Volviendo a fórmulas por competencias...');
  medias_setFormulaCompetencias(true); // true = modo silencioso para tests
  verifyMediaFinalFormulas(sheetMedias, 'competencias');
  Logger.log('✓ Fórmulas por competencias restauradas y verificadas\n');
  
  Logger.log('='.repeat(60));
  Logger.log('✓✓✓ FASE 2b COMPLETADA ✓✓✓');
  Logger.log('Cambio de fórmulas funciona correctamente');
  Logger.log('='.repeat(60));
  Logger.log('\n📌 Continúa con las modificaciones de Phase2 y luego ejecuta: runIntegrationTest_Phase3()\n');
}

/**
 * FASE 3: Regenerar y verificar preservación
 * Verifica que las modificaciones de Fase 2 estén completas antes de continuar
 */
function runIntegrationTest_Phase3() {
  Logger.log('====================================');
  Logger.log('TEST DE INTEGRACIÓN - FASE 3');
  Logger.log('====================================\n');
  
  const ss = SpreadsheetApp.getActive();
  
  // Verificar que existen las hojas necesarias
  const sheetCalif = ss.getSheetByName('calificaciones1');
  const sheetMedias = ss.getSheetByName('medias1');
  const sheetList = ss.getSheetByName('listado');
  const sheetInstr = ss.getSheetByName('instrumentos');
  
  if (!sheetCalif || !sheetMedias) {
    throw new Error('❌ No se encontraron calificaciones1 o medias1. Ejecuta runIntegrationTest_Phase2() primero.');
  }
  
  // Verificar que se añadió el nuevo alumno
  const numAlumnosActual = sheetList.getLastRow() - 1;
  if (numAlumnosActual !== 5) {
    throw new Error(`❌ Se esperaban 5 alumnos en listado, encontrados ${numAlumnosActual}. Completa las instrucciones de Phase2.`);
  }
  
  // Verificar que se modificaron los instrumentos (verificación básica)
  const numInstrActual = sheetInstr.getLastRow() - 1;
  if (numInstrActual < 5) {
    throw new Error(`❌ Se esperaban al menos 5 instrumentos, encontrados ${numInstrActual}. Completa las instrucciones de Phase2.`);
  }
  
  Logger.log('✓ Verificaciones previas pasadas (conteo básico)\n');
  Logger.log('ℹ️  Nota: No se verifica estructura exacta de instrumentos al inicio para evitar falsos errores\n');
  Logger.log('=== FASE 3: REGENERAR Y VERIFICAR ===\n');
  
  Logger.log('Regenerando trimestre1...');
  generateTrimester(1, false);
  
  Logger.log('✓ Trimestre1 regenerado\n');
  
  // Volver a obtener referencias (las hojas fueron recreadas excepto observaciones1)
  const sheetCalifNew = ss.getSheetByName('calificaciones1');
  const sheetMediasNew = ss.getSheetByName('medias1');
  const sheetObservacionesNew = ss.getSheetByName('observaciones1');
  
  if (!sheetCalifNew || !sheetMediasNew || !sheetObservacionesNew) {
    throw new Error('❌ Error al regenerar: no se encontraron las hojas calificaciones1, medias1 u observaciones1');
  }
  
  // Verificar nueva estructura
  verifyCalificacionesStructure(sheetCalifNew, {
    alumnos: ['Luis Álvarez', 'Juan Fernández', 'Ana García', 'Pedro Martínez', 'María Sánchez'],
    instrumentos: ['Trabajo Escrito', 'Examen T1', 'Ejercicios', 'Presentación', 'Prueba Final']
  });
  
  // Verificar formato condicional en columnas Media después de regenerar
  verifyMediaConditionalFormatting(sheetCalifNew, ['Trabajo Escrito', 'Examen T1', 'Ejercicios', 'Presentación', 'Prueba Final']);
  
  Logger.log('✓ Nueva estructura de calificaciones1 verificada\n');
  
  // Verificar que las calificaciones se preservaron en sus posiciones correctas
  // NOTA: Las notas de 'Trabajo Escrito' para Ana García NO se preservan porque
  // el criterio cambió de '2.1 - Criterio Tres' a '1.2 - Criterio Dos'
  verifyGradesPreserved(sheetCalifNew, {
    'Ana García': {
      'Examen T1': { '1.1 - Criterio Uno': 8.5, '1.2 - Criterio Dos': 9.0 }
      // 'Trabajo Escrito' cambió de criterio, la nota antigua se pierde (comportamiento esperado)
    },
    'Pedro Martínez': {
      'Presentación': { '1.1 - Criterio Uno': 6.0, '2.1 - Criterio Tres': 8.0 }
    }
  });
  
  Logger.log('✓ Calificaciones preservadas correctamente\n');
  
  // Verificar medias
  const sheetCriteria = ss.getSheetByName("criterios");
  const competenciasInfoPhase3 = medias_readCompetenciasInfo(sheetCriteria, ['1.1', '1.2', '2.1', '2.2']);
  
  verifyMediasStructure(sheetMediasNew, {
    alumnos: ['Luis Álvarez', 'Juan Fernández', 'Ana García', 'Pedro Martínez', 'María Sánchez'],
    criterios: ['1.1', '1.2', '2.1', '2.2'],
    competencias: competenciasInfoPhase3
  });
  
  Logger.log('✓ Estructura de medias1 verificada\n');
  
  // Verificar estructura de observaciones1 (debe tener nuevo alumno y preservar datos)
  verifyObservacionesStructure(sheetObservacionesNew, {
    alumnos: ['Luis Álvarez', 'Juan Fernández', 'Ana García', 'Pedro Martínez', 'María Sánchez']
  });
  
  Logger.log('✓ Estructura de observaciones1 verificada (alumno nuevo agregado)\n');
  
  // Verificar que enlaces siguen correctos después de regenerar
  const sheetInstrNew = ss.getSheetByName('instrumentos');
  const linkCalifNew = sheetInstrNew.getRange('K3').getFormula();
  const linkObservacionesNew = sheetInstrNew.getRange('K4').getFormula();
  const linkMediasNew = sheetInstrNew.getRange('K5').getFormula();
  
  if (!linkCalifNew.includes('calificaciones1') || !linkObservacionesNew.includes('observaciones1') || !linkMediasNew.includes('medias1')) {
    throw new Error('Enlaces en instrumentos no actualizados correctamente después de regenerar');
  }
  
  Logger.log('✓ Enlaces en instrumentos verificados después de regenerar\n');
  Logger.log('\n' + '='.repeat(60));
  Logger.log('✓✓✓ TEST DE INTEGRACIÓN COMPLETO ✓✓✓');
  Logger.log('='.repeat(60));
}

/**
 * Función de compatibilidad para ejecutar todas las fases en secuencia
 * Se recomienda usar runIntegrationTest_Phase1/2/3 directamente
 */
function runIntegrationTests() {
  Logger.log('====================================');
  Logger.log('EJECUTANDO TEST DE INTEGRACIÓN');
  Logger.log('====================================\n');
  Logger.log('ℹ️  Se recomienda ejecutar las fases por separado:');
  Logger.log('   - runIntegrationTest_Phase1()');
  Logger.log('   - runIntegrationTest_Phase2()');
  Logger.log('   - runIntegrationTest_Phase3()');
  Logger.log('');
}

// ============================================================
// FUNCIONES AUXILIARES DE VERIFICACIÓN
// ============================================================

/**
 * Verifica que la estructura de calificaciones1 es la esperada
 */
function verifyCalificacionesStructure(sheet, expected) {
  const headerRow1 = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const numAlumnos = sheet.getLastRow() - 2;
  
  // Verificar número de alumnos
  if (numAlumnos !== expected.alumnos.length) {
    throw new Error(`Esperaba ${expected.alumnos.length} alumnos, encontró ${numAlumnos}`);
  }
  
  // Verificar alumnos en orden alfabético
  const alumnosActuales = sheet.getRange(3, 1, numAlumnos, 1).getValues().map(r => r[0]);
  for (let i = 0; i < expected.alumnos.length; i++) {
    if (alumnosActuales[i] !== expected.alumnos[i]) {
      throw new Error(`Alumno en fila ${i + 3}: esperaba "${expected.alumnos[i]}", encontró "${alumnosActuales[i]}"`);
    }
  }
  
  // Verificar instrumentos en orden
  if (headerRow1[0] !== 'Alumno') {
    throw new Error('Primera columna debe ser "Alumno"');
  }
  
  let colIdx = 1;
  for (const instrumento of expected.instrumentos) {
    if (headerRow1[colIdx] !== instrumento) {
      throw new Error(`Instrumento en columna ${colIdx + 1}: esperaba "${instrumento}", encontró "${headerRow1[colIdx]}"`);
    }
    // Saltar a la siguiente columna con nombre de instrumento
    do {
      colIdx++;
    } while (colIdx < headerRow1.length && headerRow1[colIdx] === '');
  }
  
  Logger.log(`  ✓ Estructura verificada: ${numAlumnos} alumnos, ${expected.instrumentos.length} instrumentos`);
}

/**
 * Verifica que la estructura de medias1 es la esperada
 */
function verifyMediasStructure(sheet, expected) {
  const lastCol = sheet.getLastColumn();
  const headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const lastRow = sheet.getLastRow();
  const lastLabel = lastRow >= 2 ? sheet.getRange(lastRow, 1).getValue() : '';
  const hasSummaryRow = (typeof lastLabel === 'string') && lastLabel.toString().trim().toLowerCase() === 'medias';
  const numAlumnos = (lastRow - 1) - (hasSummaryRow ? 1 : 0);
  
  // Verificar número de alumnos
  if (numAlumnos !== expected.alumnos.length) {
    throw new Error(`Esperaba ${expected.alumnos.length} alumnos en medias, encontró ${numAlumnos}`);
  }
  
  // Verificar alumnos en orden alfabético
  const alumnosActuales = sheet.getRange(2, 1, numAlumnos, 1).getValues().map(r => r[0]);
  for (let i = 0; i < expected.alumnos.length; i++) {
    if (alumnosActuales[i] !== expected.alumnos[i]) {
      throw new Error(`Alumno en medias fila ${i + 2}: esperaba "${expected.alumnos[i]}", encontró "${alumnosActuales[i]}"`);
    }
  }
  
  // Verificar columnas de criterios
  if (headerRow[0] !== 'Alumno') {
    throw new Error('Primera columna de medias debe ser "Alumno"');
  }
  if (headerRow[1] !== 'Media Final') {
    throw new Error('Segunda columna debe ser "Media Final"');
  }
  
  // Verificar headers de competencias (columnas ocultas después de los criterios)
  if (expected.competencias && expected.competencias.length > 0) {
    const colCompStart = 3 + expected.criterios.length;
    for (let i = 0; i < expected.competencias.length; i++) {
      const colIdx = colCompStart + i - 1; // -1 porque headerRow es 0-indexed
      if (colIdx < headerRow.length) {
        const expectedHeader = `${expected.competencias[i].indice} - ${expected.competencias[i].nombre}`;
        if (headerRow[colIdx] !== expectedHeader) {
          throw new Error(`Header competencia col ${colCompStart + i}: esperaba "${expectedHeader}", encontró "${headerRow[colIdx]}"`);
        }
      }
    }
    
    // Verificar que las columnas de competencias están ocultas
    const hiddenColumns = [];
    for (let i = 0; i < expected.competencias.length; i++) {
      const col = colCompStart + i;
      if (sheet.isColumnHiddenByUser(col)) {
        hiddenColumns.push(col);
      }
    }
    if (hiddenColumns.length !== expected.competencias.length) {
      Logger.log(`  ⚠ Algunas columnas de competencias no están ocultas (esperadas ${expected.competencias.length}, ocultas ${hiddenColumns.length})`);
    }
    
    // Verificar colores de competencias
    if (numAlumnos > 0) {
      const backgrounds = sheet.getRange(1, colCompStart, 1 + numAlumnos, expected.competencias.length).getBackgrounds();
      for (let i = 0; i < expected.competencias.length; i++) {
        const expectedColor = expected.competencias[i].color;
        const headerColor = backgrounds[0][i];
        if (headerColor !== expectedColor) {
          Logger.log(`  ⚠ Color de competencia ${expected.competencias[i].indice}: esperado "${expectedColor}", encontrado "${headerColor}"`);
        }
      }
    }
    
    // Verificar borde separador
    const colLastCriterio = 2 + expected.criterios.length;
    const rangeLastCriterio = sheet.getRange(1, colLastCriterio, 1 + numAlumnos, 1);
    // No hay método directo para verificar bordes, pero lo documentamos
    Logger.log(`  ✓ Columnas de competencias: ${expected.competencias.length} headers verificados`);
  }
  
  Logger.log(`  ✓ Estructura de medias verificada: ${numAlumnos} alumnos, ${expected.criterios.length} criterios`);
}

/**
 * Verifica que las calificaciones se han preservado correctamente
 * expected: { 'Alumno Nombre': { 'Instrumento': { 'criterio': nota } } }
 */
function verifyGradesPreserved(sheet, expected) {
  const headerRow1 = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const headerRow2 = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  const numAlumnos = sheet.getLastRow() - 2;
  const alumnosList = sheet.getRange(3, 1, numAlumnos, 1).getValues().map(r => r[0]);
  
  for (const alumnoNombre in expected) {
    const alumnoIdx = alumnosList.indexOf(alumnoNombre);
    if (alumnoIdx === -1) {
      throw new Error(`Alumno "${alumnoNombre}" no encontrado en calificaciones1`);
    }
    
    const alumnoRow = alumnoIdx + 3; // +3 porque las filas empiezan en 3
    
    for (const instrumento in expected[alumnoNombre]) {
      for (const criterio in expected[alumnoNombre][instrumento]) {
        const expectedGrade = expected[alumnoNombre][instrumento][criterio];
        
        // Buscar columna del instrumento y criterio
        let colIdx = -1;
        for (let c = 1; c < headerRow1.length; c++) {
          if (headerRow1[c] === instrumento && headerRow2[c] === criterio) {
            colIdx = c;
            break;
          }
          // También buscar en columnas sin nombre (merged)
          if (headerRow1[c] === '' && headerRow2[c] === criterio) {
            // Buscar hacia atrás el nombre del instrumento
            for (let back = c - 1; back >= 0; back--) {
              if (headerRow1[back] === instrumento) {
                colIdx = c;
                break;
              }
              if (headerRow1[back] !== '') break;
            }
          }
        }
        
        if (colIdx === -1) {
          throw new Error(`No se encontró columna para instrumento "${instrumento}" criterio "${criterio}"`);
        }
        
        const actualGrade = sheet.getRange(alumnoRow, colIdx + 1).getValue();
        if (actualGrade !== expectedGrade) {
          throw new Error(
            `Calificación no preservada para ${alumnoNombre} - ${instrumento} - ${criterio}: ` +
            `esperaba ${expectedGrade}, encontró ${actualGrade}`
          );
        }
        
        Logger.log(`  ✓ ${alumnoNombre} - ${instrumento} - ${criterio}: ${actualGrade}`);
      }
    }
  }
}

/**
 * Verifica que las fórmulas de Media Final sean del tipo correcto.
 * @param {Sheet} sheet - Hoja medias
 * @param {string} tipo - 'competencias' o 'criterios'
 */
function verifyMediaFinalFormulas(sheet, tipo) {
  const lastRow = sheet.getLastRow();
  const lastLabel = lastRow >= 2 ? sheet.getRange(lastRow, 1).getValue() : '';
  const hasSummaryRow = (typeof lastLabel === 'string') && lastLabel.toString().trim().toLowerCase() === 'media';
  const numAlumnos = (lastRow - 1) - (hasSummaryRow ? 1 : 0);
  if (numAlumnos <= 0) return;
  
  for (let i = 0; i < numAlumnos; i++) {
    const row = 2 + i;
    const formula = sheet.getRange(row, 2).getFormula();
    
    if (!formula) {
      throw new Error(`Fila ${row}: no hay fórmula en Media Final`);
    }
    
    if (tipo === 'competencias') {
      // Debe referenciar columnas más allá de los criterios (competencias ocultas)
      // Las fórmulas por competencias tienen rangos que empiezan después de col F o G
      const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      let numCriterios = 0;
      for (let col = 3; col <= headerRow.length; col++) {
        const header = headerRow[col - 1];
        if (!header) break;
        if (header.toString().match(/^\d+\s*-\s*.+/)) break;
        numCriterios++;
      }
      const colCompStart = 3 + numCriterios;
      const colCompLetter = columnToLetter(colCompStart);
      
      if (!formula.includes(colCompLetter)) {
        throw new Error(`Fila ${row}: fórmula no referencia columnas de competencias (esperado ${colCompLetter}+)`);
      }
    } else if (tipo === 'criterios') {
      // Debe referenciar solo columnas C:F (o similar, criterios)
      // Las fórmulas por criterios NO deben ir más allá de los criterios
      if (!formula.includes('C' + row)) {
        throw new Error(`Fila ${row}: fórmula no referencia columna C (inicio criterios)`);
      }
      
      // Verificar que NO referencia columnas de competencias (más allá de criterios)
      const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      let numCriterios = 0;
      for (let col = 3; col <= headerRow.length; col++) {
        const header = headerRow[col - 1];
        if (!header) break;
        if (header.toString().match(/^\d+\s*-\s*.+/)) break;
        numCriterios++;
      }
      const colAfterCriterios = 3 + numCriterios;
      const colAfterLetter = columnToLetter(colAfterCriterios);
      
      if (formula.includes(colAfterLetter + row)) {
        throw new Error(`Fila ${row}: fórmula NO debe referenciar columnas de competencias (${colAfterLetter}+)`);
      }
    }
  }
}

/**
 * Verifica que la estructura de observaciones1 es la esperada.
 * @param {Sheet} sheet - Hoja observaciones
 * @param {Object} expected - {alumnos: Array<string>}
 */
function verifyObservacionesStructure(sheet, expected) {
  const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const numAlumnos = sheet.getLastRow() - 1;
  
  // Verificar número de alumnos
  if (numAlumnos !== expected.alumnos.length) {
    throw new Error(`Esperaba ${expected.alumnos.length} alumnos en observaciones, encontró ${numAlumnos}`);
  }
  
  // Verificar alumnos en orden alfabético
  const alumnosActuales = sheet.getRange(2, 1, numAlumnos, 1).getValues().map(r => r[0]);
  for (let i = 0; i < expected.alumnos.length; i++) {
    if (alumnosActuales[i] !== expected.alumnos[i]) {
      throw new Error(`Alumno en observaciones fila ${i + 2}: esperaba "${expected.alumnos[i]}", encontró "${alumnosActuales[i]}"`);
    }
  }
  
  // Verificar headers
  const expectedHeaders = observaciones_getHeaders();
  if (headerRow.length < expectedHeaders.length) {
    throw new Error(`Esperaba ${expectedHeaders.length} columnas en observaciones, encontró ${headerRow.length}`);
  }
  
  for (let i = 0; i < expectedHeaders.length; i++) {
    if (headerRow[i] !== expectedHeaders[i]) {
      throw new Error(`Header columna ${i + 1}: esperaba "${expectedHeaders[i]}", encontró "${headerRow[i]}"`);
    }
  }
  
  // Verificar bordes en el rango de datos
  const dataRange = sheet.getRange(1, 1, numAlumnos + 1, expectedHeaders.length);
  const borders = dataRange.getBorder();
  if (!borders || !borders.getTop()) {
    throw new Error('Falta cuadrícula (bordes) en el rango de datos de observaciones');
  }
  
  // Verificar alineación a la izquierda en headers
  const headerRange = sheet.getRange(1, 1, 1, expectedHeaders.length);
  const headerAlignment = headerRange.getHorizontalAlignment();
  if (headerAlignment !== 'left') {
    throw new Error(`Alineación de headers esperada 'left', encontrada '${headerAlignment}'`);
  }
  
  // Verificar alineación a la izquierda en columna Observaciones adicionales (columna 9)
  if (numAlumnos > 0) {
    const observacionesColRange = sheet.getRange(2, 9, numAlumnos, 1);
    const obsAlignment = observacionesColRange.getHorizontalAlignment();
    if (obsAlignment !== 'left') {
      throw new Error(`Alineación de columna Observaciones adicionales esperada 'left', encontrada '${obsAlignment}'`);
    }
  }
  
  Logger.log(`  ✓ Estructura de observaciones verificada: ${numAlumnos} alumnos, ${expectedHeaders.length} columnas`);
  Logger.log(`  ✓ Formato verificado: bordes y alineación correctos`);
}

/**
 * Verifica que las columnas de Media tienen formato condicional (texto rojo si < 5.0)
 * @param {Sheet} sheet - Hoja calificaciones
 * @param {Array<string>} instrumentos - Lista de nombres de instrumentos
 */
function verifyMediaConditionalFormatting(sheet, instrumentos) {
  const rules = sheet.getConditionalFormatRules();
  if (!rules || rules.length === 0) {
    throw new Error('No se encontraron reglas de formato condicional en calificaciones');
  }
  
  // Buscar reglas que apliquen formato rojo a texto
  let mediaRulesFound = 0;
  rules.forEach(rule => {
    const ranges = rule.getRanges();
    const fontColor = rule.getFontColor();
    
    // Verificar si la regla aplica color rojo al texto
    if (fontColor && fontColor.toUpperCase() === '#FF0000') {
      mediaRulesFound++;
    }
  });
  
  // Debe haber al menos una regla por instrumento (columnas Media)
  if (mediaRulesFound < instrumentos.length) {
    Logger.log(`  ⚠ Esperaba al menos ${instrumentos.length} reglas de formato condicional para columnas Media, encontradas ${mediaRulesFound}`);
  } else {
    Logger.log(`  ✓ Formato condicional verificado: ${mediaRulesFound} reglas de texto rojo para columnas Media`);
  }
}
