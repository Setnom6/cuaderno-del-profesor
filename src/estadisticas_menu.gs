/**
 * estadisticas_menu.gs
 * Menú contextual para la hoja estadísticas.
 */

/**
 * Crea el menú "Estadísticas" cuando se abre la hoja.
 */
function createEstadisticasMenu() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    ui.createMenu('Estadísticas')
      .addItem('Generar Análisis', 'onGenerarAnalisis')
      .addToUi();
    
  } catch(e) {
    Logger.log('createEstadisticasMenu: ' + e);
  }
}

/**
 * Genera el análisis cuando se ejecuta desde el menú.
 */
function onGenerarAnalisis() {
  try {
    const ss = SpreadsheetApp.getActive();
    const sheet = ss.getSheetByName('estadísticas');
    
    if (!sheet) {
      SpreadsheetApp.getUi().alert('No se encontró la hoja estadísticas.');
      return;
    }
    
    // Generar análisis
    estadisticas_generateAnalysis(sheet);
    SpreadsheetApp.getUi().alert('Análisis generado correctamente.');
    
  } catch(e) {
    Logger.log('onGenerarAnalisis error: ' + e);
    SpreadsheetApp.getUi().alert('Error al generar análisis: ' + e);
  }
}
