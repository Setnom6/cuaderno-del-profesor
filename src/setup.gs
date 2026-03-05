/**
 * setup.gs
 * Gestión centralizada de menús del sistema.
 * 
 * Los menús se crean automáticamente al abrir el documento (onOpen).
 * Si no aparecen, el usuario puede ejecutar createMenus() manualmente.
 * 
 * NOTA: Los menús de Google Sheets se recrean cada vez que se abre el documento.
 * No son "permanentes" en disco, pero onOpen() los crea automáticamente.
 * 
 * OPCIONES DE CREACIÓN:
 * El sistema permite configurar qué hojas se crean al generar un trimestre.
 * Las opciones se guardan usando PropertiesService (persistentes).
 * - Crear Estadísticas: false por defecto
 * - Crear Media Continua: true por defecto
 * - Crear Observaciones: false por defecto
 */

// ============================================================
// CONSTANTES DE OPCIONES
// ============================================================
const OPTION_KEYS = {
  CREAR_ESTADISTICAS: 'opcion_crear_estadisticas',
  CREAR_MEDIA_CONTINUA: 'opcion_crear_media_continua',
  CREAR_OBSERVACIONES: 'opcion_crear_observaciones'
};

const OPTION_DEFAULTS = {
  [OPTION_KEYS.CREAR_ESTADISTICAS]: false,
  [OPTION_KEYS.CREAR_MEDIA_CONTINUA]: true,
  [OPTION_KEYS.CREAR_OBSERVACIONES]: false
};

// ============================================================
// GESTIÓN DE OPCIONES (PropertiesService)
// ============================================================

/**
 * Obtiene el valor de una opción de creación.
 * @param {string} key - Clave de la opción
 * @returns {boolean} Valor de la opción
 */
function getCreationOption(key) {
  const props = PropertiesService.getDocumentProperties();
  const value = props.getProperty(key);
  
  if (value === null) {
    return OPTION_DEFAULTS[key] || false;
  }
  
  return value === 'true';
}

/**
 * Establece el valor de una opción de creación.
 * @param {string} key - Clave de la opción
 * @param {boolean} value - Nuevo valor
 */
function setCreationOption(key, value) {
  const props = PropertiesService.getDocumentProperties();
  props.setProperty(key, value.toString());
}

/**
 * Alterna el valor de una opción de creación.
 * @param {string} key - Clave de la opción
 * @returns {boolean} Nuevo valor
 */
function toggleCreationOption(key) {
  const current = getCreationOption(key);
  setCreationOption(key, !current);
  return !current;
}

/**
 * Obtiene todas las opciones de creación actuales.
 * @returns {Object} Objeto con todas las opciones
 */
function getAllCreationOptions() {
  return {
    crearEstadisticas: getCreationOption(OPTION_KEYS.CREAR_ESTADISTICAS),
    crearMediaContinua: getCreationOption(OPTION_KEYS.CREAR_MEDIA_CONTINUA),
    crearObservaciones: getCreationOption(OPTION_KEYS.CREAR_OBSERVACIONES)
  };
}

// ============================================================
// FUNCIONES DE MENÚ PARA TOGGLE DE OPCIONES
// ============================================================

/**
 * Toggle: Crear Estadísticas
 */
function menu_toggleCrearEstadisticas() {
  const newValue = toggleCreationOption(OPTION_KEYS.CREAR_ESTADISTICAS);
  SpreadsheetApp.getActiveSpreadsheet().toast(
    newValue ? 'Estadísticas SE CREARÁN al generar trimestre' : 'Estadísticas NO se crearán al generar trimestre',
    newValue ? '✓ Activado' : '○ Desactivado',
    3
  );
  createMenus();
}

/**
 * Toggle: Crear Media Continua
 */
function menu_toggleCrearMediaContinua() {
  const newValue = toggleCreationOption(OPTION_KEYS.CREAR_MEDIA_CONTINUA);
  SpreadsheetApp.getActiveSpreadsheet().toast(
    newValue ? 'Media Continua SE CREARÁ al generar trimestre' : 'Media Continua NO se creará al generar trimestre',
    newValue ? '✓ Activado' : '○ Desactivado',
    3
  );
  createMenus();
}

/**
 * Toggle: Crear Observaciones
 */
function menu_toggleCrearObservaciones() {
  const newValue = toggleCreationOption(OPTION_KEYS.CREAR_OBSERVACIONES);
  SpreadsheetApp.getActiveSpreadsheet().toast(
    newValue ? 'Observaciones SE CREARÁN al generar trimestre' : 'Observaciones NO se crearán al generar trimestre',
    newValue ? '✓ Activado' : '○ Desactivado',
    3
  );
  createMenus();
}

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
 * - ⚙️ Opciones de creación: configurar qué hojas se crean
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
  
  // ========== MENÚ: Opciones de creación ==========
  const options = getAllCreationOptions();
  const checkEstad = options.crearEstadisticas ? '✓ ' : '○ ';
  const checkMedia = options.crearMediaContinua ? '✓ ' : '○ ';
  const checkObserv = options.crearObservaciones ? '✓ ' : '○ ';
  
  ui.createMenu('⚙️ Opciones de creación')
    .addItem(checkEstad + 'Crear Estadísticas', 'menu_toggleCrearEstadisticas')
    .addItem(checkMedia + 'Crear Media Continua', 'menu_toggleCrearMediaContinua')
    .addItem(checkObserv + 'Crear Observaciones', 'menu_toggleCrearObservaciones')
    .addToUi();
  
  // ========== MENÚ: Cálculo de Medias ==========
  // Detectar modo activo si estamos en una hoja de medias
  const ss = SpreadsheetApp.getActive();
  const activeSheet = ss.getActiveSheet();
  const sheetName = activeSheet ? activeSheet.getName() : '';
  
  let checkComp = '○ ';
  let checkCrit = '○ ';
  
  if (sheetName.startsWith('medias') || sheetName === 'mediasContinua') {
    const modoActivo = detectarModoMedias(activeSheet);
    checkComp = modoActivo === 'competencias' ? '✓ ' : '○ ';
    checkCrit = modoActivo === 'criterios' ? '✓ ' : '○ ';
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
