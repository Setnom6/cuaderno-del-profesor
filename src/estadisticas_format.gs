/**
 * estadisticas_format.gs
 * Estilos y formato para la hoja estadísticas.
 */

/**
 * Aplica estilos base a la hoja estadísticas.
 * @param {Sheet} sheet - Hoja estadísticas
 */
function estadisticas_applyBaseStyles(sheet) {
  try {
    // Ancho de columnas
    sheet.setColumnWidth(1, 250);
    sheet.setColumnWidth(2, 150);
    sheet.setColumnWidth(3, 150);
    sheet.setColumnWidth(4, 150);
    sheet.setColumnWidth(5, 150);
    
    // Proteger el panel de control con advertencia (opcional)
    try {
      const panelRange = sheet.getRange('A1:B18');
      const protection = panelRange.protect()
        .setDescription('Panel de control - Modifica los valores para cambiar análisis');
      protection.setWarningOnly(true);
    } catch(e) {
      // No es crítico si no se puede proteger
    }
    
    // Freeze headers del panel
    sheet.freezeRows(1);
    
  } catch(e) {
    Logger.log('estadisticas_applyBaseStyles: ' + e);
  }
}

/**
 * Formatea una tabla de resultados de análisis.
 * @param {Sheet} sheet - Hoja estadísticas
 * @param {number} startRow - Fila de inicio
 * @param {number} endRow - Fila de fin
 * @param {number} numCols - Número de columnas
 */
function estadisticas_formatTable(sheet, startRow, endRow, numCols) {
  try {
    const range = sheet.getRange(startRow, 1, endRow - startRow + 1, numCols);
    
    // Bordes
    range.setBorder(true, true, true, true, true, true, '#999999', SpreadsheetApp.BorderStyle.SOLID);
    
    // Alineación
    range.setHorizontalAlignment('center');
    range.setVerticalAlignment('middle');
    
  } catch(e) {
    Logger.log('estadisticas_formatTable: ' + e);
  }
}
