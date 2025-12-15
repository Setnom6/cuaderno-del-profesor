/**
 * estadisticas_panel.gs
 * Crea y gestiona el panel de control de la hoja estadísticas.
 */

/**
 * Crea el panel de control en la hoja estadísticas.
 * @param {Sheet} sheet - Hoja estadísticas
 */
function estadisticas_createControlPanel(sheet) {
  try {
    // ===== SECCIÓN 1: TIPO DE ANÁLISIS =====
    sheet.getRange('A1').setValue('PANEL DE CONTROL - ESTADÍSTICAS');
    sheet.getRange('A1').setFontSize(14).setFontWeight('bold');
    
    sheet.getRange('A2').setValue('Tipo de Análisis:');
    sheet.getRange('B2').setValue('Media por instrumentos seleccionados');
    
    // Validación con lista desplegable
    try {
      const tiposAnalisis = [
        'Media por instrumentos seleccionados',
        'Criterios - Evaluaciones totales',
        'Alumno - Notas por criterio',
        'Dashboard - Resumen general'
      ];
      
      const rule = SpreadsheetApp.newDataValidation()
        .requireValueInList(tiposAnalisis, true)
        .build();
      sheet.getRange('B2').setDataValidation(rule);
    } catch(e) {
      Logger.log('Error creando validación tipo análisis: ' + e);
    }
    
    // ===== SECCIÓN 2: ALUMNO SELECCIONADO =====
    sheet.getRange('A4').setValue('Alumno (para análisis individual):');
    sheet.getRange('B4').setValue('');
    
    // ===== SECCIÓN 3: INSTRUMENTOS SELECCIONADOS =====
    sheet.getRange('A6').setValue('Instrumentos (marca con X):');
    sheet.getRange('B6').setValue('Seleccionar');
    
    // Llenar lista de instrumentos disponibles
    estadisticas_populateInstrumentsList(sheet);
    
    // ===== BOTÓN GENERAR =====
    sheet.getRange('A18:B18').merge();
    sheet.getRange('A18').setValue('🔄 GENERAR ANÁLISIS');
    sheet.getRange('A18')
      .setBackground('#4CAF50')
      .setFontColor('white')
      .setFontWeight('bold')
      .setFontSize(12)
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');
    
    // Nota informativa
    sheet.getRange('A19').setValue('↓ Datos del análisis aparecerán abajo ↓');
    sheet.getRange('A19').setFontStyle('italic').setFontColor('#666666');
    
    // Aplicar estilos
    sheet.getRange('A1:B4').setHorizontalAlignment('left');
    sheet.getRange('A2:A19').setFontWeight('bold');
    
  } catch(e) {
    Logger.log('estadisticas_createControlPanel: ' + e);
  }
}

/**
 * Rellena la lista de instrumentos disponibles desde todas las hojas calificacionesN.
 * @param {Sheet} sheet - Hoja estadísticas
 */
function estadisticas_populateInstrumentsList(sheet) {
  try {
    const ss = SpreadsheetApp.getActive();
    const instrumentosSet = new Set();
    
    // Buscar instrumentos en todas las hojas calificacionesN
    for (let trimestre = 1; trimestre <= 3; trimestre++) {
      const sheetCalif = ss.getSheetByName(`calificaciones${trimestre}`);
      if (sheetCalif) {
        // Leer headers fila 1 (instrumentos)
        const headers = sheetCalif.getRange(1, 1, 1, sheetCalif.getLastColumn()).getValues()[0];
        
        let colPtr = 2; // Empezar después de Alumno
        let idx = 0;
        
        // Parsear instrumentos desde headers
        for (let col = 1; col < headers.length; col++) {
          const headerText = headers[col]?.toString().trim() || '';
          
          // Si es no vacío y no es un criterio (no tiene guión), es nombre de instrumento
          if (headerText && !headerText.includes(' - ') && headerText !== '') {
            instrumentosSet.add(`${headerText} (T${trimestre})`);
            idx++;
          }
        }
      }
    }
    
    // Escribir instrumentos en columna A a partir de fila 6
    const instrumentosArray = Array.from(instrumentosSet).sort();
    if (instrumentosArray.length > 0) {
      const instrumentosRange = sheet.getRange(6, 1, instrumentosArray.length, 1);
      instrumentosRange.setValues(instrumentosArray.map(i => [i]));
    }
    
  } catch(e) {
    Logger.log('estadisticas_populateInstrumentsList: ' + e);
  }
}

/**
 * Rellena la lista de alumnos disponibles en la validación de alumno.
 * @param {Sheet} sheet - Hoja estadísticas
 */
function estadisticas_populateAlumnosList(sheet) {
  try {
    const ss = SpreadsheetApp.getActive();
    const alumnosSet = new Set();
    
    // Buscar alumnos en calificaciones1
    const sheetCalif = ss.getSheetByName('calificaciones1');
    if (sheetCalif && sheetCalif.getLastRow() > 2) {
      const alumnos = sheetCalif.getRange(3, 1, sheetCalif.getLastRow() - 2, 1).getValues();
      alumnos.forEach(row => {
        if (row[0]) alumnosSet.add(row[0].toString().trim());
      });
    }
    
    // Crear lista desplegable
    const alumnosList = Array.from(alumnosSet).sort();
    if (alumnosList.length > 0) {
      try {
        const rule = SpreadsheetApp.newDataValidation()
          .requireValueInList(alumnosList, true)
          .build();
        sheet.getRange('B4').setDataValidation(rule);
      } catch(e) {
        Logger.log('Error creando validación alumnos: ' + e);
      }
    }
    
  } catch(e) {
    Logger.log('estadisticas_populateAlumnosList: ' + e);
  }
}
