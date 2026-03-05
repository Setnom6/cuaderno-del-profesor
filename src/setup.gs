/**
 * setup.gs
 * Gestión centralizada de menús del sistema.
 * 
 * Los menús se crean automáticamente al abrir el documento (onOpen).
 * Si no aparecen, el usuario puede ejecutar createMenus() manualmente.
 * 
 * NOTA: Los menús de Google Sheets se recrean cada vez que se abre el documento.
 * No son "permanentes" en disco, pero onOpen() los crea automáticamente.
 */

/**
 * Trigger automático que se ejecuta al abrir el documento.
 * Crea todos los menús del sistema.
 */
function onOpen() {
  createMenus();
}

/**
 * Función global para crear todos los menús del sistema.
 * Puede ejecutarse manualmente desde Apps Script si los menús no aparecen.
 * 
 * Crea:
 * - 📊 Generar Trimestre: siempre visible
 * - 📉 Cálculo de Medias: funciona solo en hojas mediasN/mediasContinua
 * - 📈 Estadísticas: funciona solo en hoja estadísticas
 */
function createMenus() {
  const ui = SpreadsheetApp.getUi();
  
  // ========== MENÚ PRINCIPAL: Generar Trimestre ==========
  ui.createMenu('📊 Generar Trimestre')
    .addItem('Trimestre 1', 'trimester1')
    .addItem('Trimestre 2', 'trimester2')
    .addItem('Trimestre 3', 'trimester3')
    .addToUi();
  
  // ========== MENÚ: Cálculo de Medias ==========
  // Detectar modo activo si estamos en una hoja de medias
  const ss = SpreadsheetApp.getActive();
  const activeSheet = ss.getActiveSheet();
  const sheetName = activeSheet ? activeSheet.getName() : '';
  
  let checkComp = '';
  let checkCrit = '';
  
  if (sheetName.startsWith('medias') || sheetName === 'mediasContinua') {
    const modoActivo = detectarModoMedias(activeSheet);
    checkComp = modoActivo === 'competencias' ? '✓ ' : '';
    checkCrit = modoActivo === 'criterios' ? '✓ ' : '';
  }
  
  ui.createMenu('📉 Cálculo de Medias')
    .addItem(checkComp + 'Media por competencias', 'menu_setFormulaCompetencias')
    .addItem(checkCrit + 'Media por criterios', 'menu_setFormulaCriterios')
    .addToUi();
  
  // ========== MENÚ: Estadísticas ==========
  ui.createMenu('📈 Estadísticas')
    .addItem('Generar Análisis', 'menu_generarAnalisis')
    .addToUi();
}

// ============================================================
// FUNCIONES WRAPPER CON VERIFICACIÓN DE HOJA
// ============================================================

/**
 * Verifica si la hoja activa es una hoja de medias válida.
 * @returns {Sheet|null} La hoja si es válida, null si no
 */
function verificarHojaMedias() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const name = sheet.getName();
  
  if (name.startsWith('medias') || name === 'mediasContinua') {
    return sheet;
  }
  
  SpreadsheetApp.getUi().alert(
    '⚠️ Este menú solo funciona en las hojas de medias.\n\n' +
    'Navega a una hoja mediasN o mediasContinua y vuelve a intentarlo.'
  );
  return null;
}

/**
 * Verifica si la hoja activa es la hoja de estadísticas.
 * @returns {Sheet|null} La hoja si es válida, null si no
 */
function verificarHojaEstadisticas() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const name = sheet.getName();
  
  if (name === 'estadísticas') {
    return sheet;
  }
  
  SpreadsheetApp.getUi().alert(
    '⚠️ Este menú solo funciona en la hoja estadísticas.\n\n' +
    'Navega a la hoja "estadísticas" y vuelve a intentarlo.'
  );
  return null;
}

/**
 * Wrapper: Establece fórmula de medias por competencias.
 */
function menu_setFormulaCompetencias() {
  const sheet = verificarHojaMedias();
  if (!sheet) return;
  
  medias_setFormulaCompetencias();
  
  // Recrear menús para actualizar checkmarks
  createMenus();
}

/**
 * Wrapper: Establece fórmula de medias por criterios.
 */
function menu_setFormulaCriterios() {
  const sheet = verificarHojaMedias();
  if (!sheet) return;
  
  medias_setFormulaCriterios();
  
  // Recrear menús para actualizar checkmarks
  createMenus();
}

/**
 * Wrapper: Genera análisis de estadísticas.
 */
function menu_generarAnalisis() {
  const sheet = verificarHojaEstadisticas();
  if (!sheet) return;
  
  try {
    estadisticas_generateAnalysis(sheet);
    SpreadsheetApp.getUi().alert('✅ Análisis generado correctamente.');
  } catch(e) {
    Logger.log('menu_generarAnalisis error: ' + e);
    SpreadsheetApp.getUi().alert('❌ Error al generar análisis: ' + e);
  }
}

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

/**
 * Detecta el modo de cálculo activo en una hoja de medias.
 * @param {Sheet} sheet - Hoja de medias
 * @returns {string} 'competencias' o 'criterios'
 */
function detectarModoMedias(sheet) {
  if (!sheet) return 'competencias';
  
  const numAlumnos = sheet.getLastRow() - 1;
  if (numAlumnos <= 0) return 'competencias';
  
  const formula = sheet.getRange(2, 2).getFormula();
  if (!formula) return 'competencias';
  
  const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Contar criterios (hasta encontrar primera competencia con formato "i - nombre")
  let numCriterios = 0;
  for (let col = 3; col <= headerRow.length; col++) {
    const header = headerRow[col - 1];
    if (!header) break;
    // Las competencias tienen formato "1 - NombreCompetencia"
    // Los criterios tienen formato "1.1 - NombreCriterio"
    if (header.toString().match(/^\d+\s*-\s*[^.]/)) break;
    numCriterios++;
  }
  
  if (numCriterios === 0) return 'competencias';
  
  const lastCriterioCol = 2 + numCriterios;
  const lastCriterioLetter = columnToLetter(lastCriterioCol);
  
  // Si la fórmula contiene el rango C:lastCriterio, es modo criterios
  const rangePattern = new RegExp('C\\d+:' + lastCriterioLetter + '\\d+');
  if (rangePattern.test(formula)) {
    return 'criterios';
  }
  
  return 'competencias';
}
