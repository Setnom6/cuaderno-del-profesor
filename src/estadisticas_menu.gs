/**
 * estadisticas_menu.gs
 * Menú y funciones de disparador para la hoja estadísticas.
 * Integra el menú personalizado cuando se abre la hoja de estadísticas.
 */

/**
 * Hook que se ejecuta al abrir el documento.
 * Detecta si la hoja activa es 'estadísticas' y crea el menú correspondiente.
 * Se integra con medias_menu.gs que ya tiene su propio onOpen.
 */
function estadisticas_onOpen() {
  const ss = SpreadsheetApp.getActive();
  const activeSheet = ss.getActiveSheet();
  
  if (activeSheet && activeSheet.getName() === 'estadísticas') {
    createEstadisticasMenu();
  }
}

/**
 * Crear menú personalizado para la hoja estadísticas.
 * Aparece solo cuando la hoja activa es 'estadísticas'.
 */
function createEstadisticasMenu() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    ui.createMenu('Estadísticas')
      .addItem('🔄 Generar Análisis', 'onGenerarAnalisis')
      .addToUi();
    
  } catch(e) {
    Logger.log('createEstadisticasMenu: ' + e);
  }
}

/**
 * Función disparada al hacer clic en "Generar Análisis" del menú.
 * Valida parámetros y regenera el análisis completo.
 */
function onGenerarAnalisis() {
  try {
    const ss = SpreadsheetApp.getActive();
    const sheet = ss.getSheetByName('estadísticas');
    
    if (!sheet) {
      SpreadsheetApp.getUi().alert('No se encontró la hoja estadísticas.');
      return;
    }
    
    // Leer parámetros del panel de control
    const params = estadisticas_readParameters(sheet);
    
    if (!params.tipo || !params.tipo.trim()) {
      SpreadsheetApp.getUi().alert('Por favor, selecciona un tipo de análisis.');
      return;
    }
    
    // Llamar a la función principal de regeneración
    estadisticas_regenerateAnalysis();
    
    SpreadsheetApp.getUi().alert('Análisis regenerado correctamente.');
    
  } catch(e) {
    Logger.log('onGenerarAnalisis error: ' + e);
    SpreadsheetApp.getUi().alert('Error al generar análisis: ' + e);
  }
}
