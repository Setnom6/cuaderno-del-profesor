/**
 * estadisticas_panel.gs
 * Crea el panel de control simple para seleccionar instrumentos.
 */

/**
 * Crea el panel de control en la hoja estadísticas.
 * Solo permite seleccionar instrumentos con X.
 * @param {Sheet} sheet - Hoja estadísticas
 */
function estadisticas_createControlPanel(sheet) {
  try {
    // Título
    sheet.getRange('A1').setValue('MEDIA POR INSTRUMENTOS');
    sheet.getRange('A1').setFontSize(14).setFontWeight('bold');
    
    // Instrucciones
    sheet.getRange('A2').setValue('Marca los instrumentos con X para incluir en el análisis:');
    sheet.getRange('A2').setFontStyle('italic').setFontColor('#666666');
    
    // Encabezado lista
    sheet.getRange('A3').setValue('Instrumentos');
    sheet.getRange('A3').setFontWeight('bold').setBackground('#E8E8E8');
      sheet.getRange('B3').setValue('Seleccionar');
      sheet.getRange('B3').setFontWeight('bold').setBackground('#E8E8E8');
    
    // Llenar lista de instrumentos disponibles (sin protección)
    estadisticas_populateInstrumentsList(sheet);
    
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
    
    // Escribir instrumentos en columna A a partir de fila 4
    const instrumentosArray = Array.from(instrumentosSet).sort();
    if (instrumentosArray.length > 0) {
      const instrumentosRange = sheet.getRange(4, 1, instrumentosArray.length, 1);
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
