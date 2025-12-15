/**
 * estadisticas_impl.gs
 * Orquesta la construcción de la hoja estadísticas.
 */

/**
 * Construye/regenera la hoja estadísticas.
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
  ensureSheetDimensions(sheetEstadisticas, 200, 10);
  
  // Crear panel de control
  estadisticas_createControlPanel(sheetEstadisticas);
  
  // Crear estilos básicos
  estadisticas_applyBaseStyles(sheetEstadisticas);
  
  return sheetEstadisticas;
}
