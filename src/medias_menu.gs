/**
 * medias_menu.gs
 * Gestión del menú personalizado para hojas mediasN.
 * Permite alternar entre dos modos de cálculo de Media Final:
 * - Media por competencias (default): promedia las medias de competencias
 * - Media por criterios: promedia directamente todos los criterios
 */

/**
 * Crea el menú personalizado cuando se abre el spreadsheet o se activa una hoja.
 * Solo aparece cuando la hoja activa es mediasN.
 */
function onOpen() {
  const ss = SpreadsheetApp.getActive();
  const activeSheet = ss.getActiveSheet();
  
  if (activeSheet && activeSheet.getName().startsWith('medias')) {
    createMediasMenu();
  }
}

/**
 * Crea el menú "Cálculo de Medias" con las opciones de fórmula.
 * Indica con checkmarks qué modo está activo actualmente.
 */
function createMediasMenu() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getActiveSheet();
  
  // Detectar modo activo
  let modoActivo = 'competencias'; // default
  if (sheet && sheet.getName().startsWith('medias')) {
    const numAlumnos = sheet.getLastRow() - 1;
    if (numAlumnos > 0) {
      const formula = sheet.getRange(2, 2).getFormula();
      if (formula) {
        // Detectar si es modo criterios: la fórmula debe referenciar rango C:X (solo criterios)
        // Modo competencias: la fórmula referencia columnas más allá de criterios
        const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        
        // Contar criterios (hasta encontrar primera competencia con formato "i - nombre")
        let numCriterios = 0;
        for (let col = 3; col <= headerRow.length; col++) {
          const header = headerRow[col - 1];
          if (!header) break;
          if (header.toString().match(/^\d+\s*-\s*.+/)) break; // Es competencia
          numCriterios++;
        }
        
        // La última columna de criterios
        const lastCriterioCol = 2 + numCriterios;
        const lastCriterioLetter = columnToLetter(lastCriterioCol);
        
        // Si la fórmula contiene el rango completo C:lastCriterio, es modo criterios
        // Si va más allá (columnas de competencias), es modo competencias
        const rangePattern = new RegExp('C\\d+:' + lastCriterioLetter + '\\d+');
        if (rangePattern.test(formula)) {
          modoActivo = 'criterios';
        }
      }
    }
  }
  
  const checkComp = modoActivo === 'competencias' ? '✓ ' : '';
  const checkCrit = modoActivo === 'criterios' ? '✓ ' : '';
  
  ui.createMenu('Cálculo de Medias')
    .addItem(checkComp + 'Media por competencias', 'medias_setFormulaCompetencias')
    .addItem(checkCrit + 'Media por criterios', 'medias_setFormulaCriterios')
    .addToUi();
}

/**
 * Establece la fórmula de Media Final como promedio de competencias (modo default).
 * Solo modifica la columna "Media Final" (columna 2).
 * @param {boolean} silent - Si es true, no muestra alertas (para tests)
 */
function medias_setFormulaCompetencias(silent) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getActiveSheet();
  
  if (!sheet || !sheet.getName().startsWith('medias')) {
    if (!silent) SpreadsheetApp.getUi().alert('Esta función solo funciona en hojas mediasN');
    return;
  }
  
  const numAlumnos = sheet.getLastRow() - 1;
  if (numAlumnos <= 0) {
    if (!silent) SpreadsheetApp.getUi().alert('No hay alumnos en esta hoja');
    return;
  }
  
  // Determinar columnas de competencias
  const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Contar criterios (columnas después de "Media Final" hasta la primera competencia)
  let numCriterios = 0;
  for (let col = 3; col <= headerRow.length; col++) {
    const header = headerRow[col - 1];
    if (!header) break;
    const headerStr = header.toString();
    // Competencias tienen formato "i - nombreCompetencia" donde i es un dígito solo
    if (headerStr.match(/^\d+\s*-\s*.+/)) break;
    numCriterios++;
  }
  
  const colCompStart = 3 + numCriterios;
  
  // Contar competencias (buscar headers con formato "i - nombreCompetencia")
  let numCompetencias = 0;
  for (let col = colCompStart; col <= sheet.getLastColumn(); col++) {
    const header = headerRow[col - 1];
    if (!header) break;
    const headerStr = header.toString();
    if (headerStr.match(/^\d+\s*-\s*.+/)) {
      numCompetencias++;
    } else {
      break;
    }
  }
  
  if (numCompetencias === 0) {
    if (!silent) SpreadsheetApp.getUi().alert('No se encontraron columnas de competencias');
    return;
  }
  
  // Aplicar fórmula por competencias a cada alumno
  for (let i = 0; i < numAlumnos; i++) {
    const row = 2 + i;
    const formula = medias_buildMediaFinalFormula(colCompStart, numCompetencias, row);
    setFormula(sheet, row, 2, formula);
  }
  
  if (!silent) {
    SpreadsheetApp.getUi().alert('✓ Fórmulas actualizadas: Media Final = promedio de competencias');
    // Recrear menú para actualizar checkmark
    sheet.activate();
    SpreadsheetApp.flush();
    Utilities.sleep(100); // Pequeño delay para asegurar actualización
    createMediasMenu();
  } else {
    // En tests, recrear inmediatamente
    sheet.activate();
    SpreadsheetApp.flush();
    createMediasMenu();
  }
}

/**
 * Establece la fórmula de Media Final como promedio directo de todos los criterios.
 * Solo modifica la columna "Media Final" (columna 2).
 * @param {boolean} silent - Si es true, no muestra alertas (para tests)
 */
function medias_setFormulaCriterios(silent) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getActiveSheet();
  
  if (!sheet || !sheet.getName().startsWith('medias')) {
    if (!silent) SpreadsheetApp.getUi().alert('Esta función solo funciona en hojas mediasN');
    return;
  }
  
  const numAlumnos = sheet.getLastRow() - 1;
  if (numAlumnos <= 0) {
    if (!silent) SpreadsheetApp.getUi().alert('No hay alumnos en esta hoja');
    return;
  }
  
  // Determinar número de criterios (columnas entre "Media Final" y competencias)
  const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  let numCriterios = 0;
  for (let col = 3; col <= headerRow.length; col++) {
    const header = headerRow[col - 1];
    if (!header) break;
    const headerStr = header.toString();
    // Si encuentra formato "i - nombreCompetencia" es competencia, no criterio
    if (headerStr.match(/^\d+\s*-\s*.+/)) break;
    numCriterios++;
  }
  
  if (numCriterios === 0) {
    if (!silent) SpreadsheetApp.getUi().alert('No se encontraron columnas de criterios');
    return;
  }
  
  // Aplicar fórmula por criterios a cada alumno
  for (let i = 0; i < numAlumnos; i++) {
    const row = 2 + i;
    const formula = medias_buildMediaFinalFormulaCriterios(numCriterios, row);
    setFormula(sheet, row, 2, formula);
  }
  
  if (!silent) {
    SpreadsheetApp.getUi().alert('✓ Fórmulas actualizadas: Media Final = promedio directo de criterios');
    // Recrear menú para actualizar checkmark
    sheet.activate();
    SpreadsheetApp.flush();
    Utilities.sleep(100); // Pequeño delay para asegurar actualización
    createMediasMenu();
  } else {
    // En tests, recrear inmediatamente
    sheet.activate();
    SpreadsheetApp.flush();
    createMediasMenu();
  }
}

/**
 * Construye la fórmula de Media Final basada en promedio directo de criterios.
 * @param {number} numCriterios - Número de columnas de criterios
 * @param {number} row - Fila del alumno
 * @returns {string} - Fórmula
 */
function medias_buildMediaFinalFormulaCriterios(numCriterios, row) {
  if (numCriterios === 0) return "";
  
  const firstLetter = columnToLetter(3);
  const lastLetter = columnToLetter(2 + numCriterios);
  const rango = `${firstLetter}${row}:${lastLetter}${row}`;
  
  return `=IFERROR(AVERAGEIF(${rango};"<>");"")`;
}
