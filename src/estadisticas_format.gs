/**
 * estadisticas_format.gs
 * Estilos para la hoja estadísticas.
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
    
    // Freeze primera fila
    sheet.freezeRows(1);
    
  } catch(e) {
    Logger.log('estadisticas_applyBaseStyles: ' + e);
  }
}
    
    // Alineación
    range.setHorizontalAlignment('center');
    range.setVerticalAlignment('middle');
    
  } catch(e) {
    Logger.log('estadisticas_formatTable: ' + e);
  }
}
