/**
 * estadisticas_impl.gs
 * Orquesta la construcción y regeneración de la hoja estadísticas.
 * Panel de control + análisis dinámico según parámetros seleccionados.
 */

/**
 * Construye/regenera la hoja estadísticas con panel de control y análisis.
 * @returns {Sheet} La hoja estadísticas
 */
function buildEstadisticasSheet() {
  const ss = SpreadsheetApp.getActive();
  const hojaEstadisticasName = "estadísticas";
  
  // Obtener o crear la hoja
  let sheetEstadisticas = ss.getSheetByName(hojaEstadisticasName);
  if (!sheetEstadisticas) {
    sheetEstadisticas = ss.insertSheet(hojaEstadisticasName);
  } else {
    // Limpiar contenido previo
    sheetEstadisticas.clear({ contentsOnly: false, formatOnly: false });
  }
  
  // Establecer dimensiones mínimas
  ensureSheetDimensions(sheetEstadisticas, 100, 15);
  
  // Crear panel de control
  estadisticas_createControlPanel(sheetEstadisticas);
  
  // Crear estilos básicos
  estadisticas_applyBaseStyles(sheetEstadisticas);
  
  return sheetEstadisticas;
}

/**
 * Regenera el análisis según parámetros del panel de control.
 * Se ejecuta cuando el usuario hace clic en "Generar".
 */
function estadisticas_regenerateAnalysis() {
  const ss = SpreadsheetApp.getActive();
  const sheetEstadisticas = ss.getSheetByName("estadísticas");
  
  if (!sheetEstadisticas) {
    SpreadsheetApp.getUi().alert('No se encontró hoja "estadísticas"');
    return;
  }
  
  try {
    // Limpiar área de datos (a partir de fila 20)
    const maxRows = sheetEstadisticas.getMaxRows();
    if (maxRows > 20) {
      sheetEstadisticas.deleteRows(20, maxRows - 19);
      ensureSheetDimensions(sheetEstadisticas, 100, 15);
    }
    sheetEstadisticas.getRange(20, 1, sheetEstadisticas.getMaxRows(), 15).clearContent();
    
    // Leer parámetros del panel
    const params = estadisticas_readParameters(sheetEstadisticas);
    
    if (!params.tipoAnalisis) {
      SpreadsheetApp.getUi().alert('Por favor, selecciona un tipo de análisis');
      return;
    }
    
    // Renderizar análisis según tipo
    estadisticas_renderAnalysis(sheetEstadisticas, params);
    
    Logger.log(`Análisis regenerado: ${params.tipoAnalisis}`);
    
  } catch(e) {
    Logger.log('estadisticas_regenerateAnalysis: ' + e);
    SpreadsheetApp.getUi().alert('Error al regenerar: ' + e.message);
  }
}

/**
 * Lee los parámetros del panel de control.
 * @param {Sheet} sheet - Hoja estadísticas
 * @returns {Object} Parámetros {tipoAnalisis, alumnoSeleccionado, instrumentosSeleccionados, trimestres}
 */
function estadisticas_readParameters(sheet) {
  try {
    const tipoAnalisis = sheet.getRange('B2').getValue()?.toString().trim() || '';
    const alumnoSeleccionado = sheet.getRange('B4').getValue()?.toString().trim() || '';
    
    // Leer instrumentos seleccionados (B6:B100, marcar con X)
    const instrumentosData = sheet.getRange('B6:B50').getValues();
    const instrumentosSeleccionados = [];
    
    instrumentosData.forEach((row, idx) => {
      const valor = row[0]?.toString().trim() || '';
      if (valor.toUpperCase() === 'X' || valor.toUpperCase() === 'SÍ') {
        const instrumentoNombre = sheet.getRange(6 + idx, 1).getValue()?.toString().trim() || '';
        if (instrumentoNombre) {
          instrumentosSeleccionados.push(instrumentoNombre);
        }
      }
    });
    
    return {
      tipoAnalisis,
      alumnoSeleccionado,
      instrumentosSeleccionados
    };
    
  } catch(e) {
    Logger.log('estadisticas_readParameters: ' + e);
    return {};
  }
}

/**
 * Renderiza el análisis según el tipo seleccionado.
 * @param {Sheet} sheet - Hoja estadísticas
 * @param {Object} params - Parámetros {tipoAnalisis, alumnoSeleccionado, instrumentosSeleccionados}
 */
function estadisticas_renderAnalysis(sheet, params) {
  const tipoAnalisis = params.tipoAnalisis.toLowerCase();
  
  if (tipoAnalisis.includes('media por instrumentos')) {
    analisis_mediaInstrumentos(sheet, params.instrumentosSeleccionados);
  } else if (tipoAnalisis.includes('criterios - evaluaciones')) {
    analisis_criteriosEvaluaciones(sheet);
  } else if (tipoAnalisis.includes('alumno')) {
    analisis_alumnoNotas(sheet, params.alumnoSeleccionado);
  } else if (tipoAnalisis.includes('dashboard')) {
    analisis_dashboardGeneral(sheet);
  } else {
    sheet.getRange('A20').setValue('Tipo de análisis no implementado');
  }
}
