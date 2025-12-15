/**
 * medias_format.gs
 * Lógica de apariencia y formato específica para la hoja mediasN.
 * Utiliza funciones generales de utils.gs.
 */

/**
 * Aplica colores por clave de criterio en medias.
 * Colorea header (fila 1) y datos (fila 2+) según mapa de colores.
 * @param {Sheet} sheet
 * @param {Array<string>} clavesLista - Lista de claves
 * @param {number} numAlumnos
 * @param {Object<string, string>} claveToColor - Mapa clave -> color
 */
function medias_applyColorsByClave(sheet, clavesLista, numAlumnos, claveToColor) {
  if (!sheet || !claveToColor) return;
  
  for (let j = 0; j < clavesLista.length; j++) {
    const clave = clavesLista[j];
    const colMedias = 3 + j;
    const color = claveToColor[clave] || null;

    if (color) {
      applyBackgroundColor(sheet, 1, colMedias, 1, 1, color);
      if (numAlumnos > 0) {
        applyBackgroundColor(sheet, 2, colMedias, numAlumnos, 1, color);
      }
    }
  }
}

/**
 * Aplica formato especial a la columna "Media Final":
 * - Fondo blanco
 * - Borde grueso negro a izquierda y derecha
 * @param {Sheet} sheet
 * @param {number} numAlumnos
 */
function medias_applyMediaFinalFormat(sheet, numAlumnos) {
  if (!sheet || numAlumnos <= 0) return;
  
  try {
    const mediaFinalRange = sheet.getRange(1, 2, 1 + numAlumnos, 1);
    mediaFinalRange
      .setBackground("#ffffff")
      .setBorder(false, true, false, true, false, false, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  } catch(e) {
    Logger.log('medias_applyMediaFinalFormat: ' + e);
  }
}

/**
 * Aplica formato condicional a Media Final: si <5.0 texto rojo.
 * @param {Sheet} sheet
 * @param {number} numAlumnos
 */
function medias_applyConditionalFormatting(sheet, numAlumnos) {
  if (!sheet || numAlumnos <= 0) return;
  
  try {
    const rule = SpreadsheetApp.newConditionalFormatRule()
      .whenNumberLessThan(5.0)
      .setFontColor("#ff0000")
      .setRanges([sheet.getRange(2, 2, numAlumnos, 1)])
      .build();

    const rules = sheet.getConditionalFormatRules();
    rules.push(rule);
    sheet.setConditionalFormatRules(rules);
  } catch(e) {
    Logger.log('medias_applyConditionalFormatting: ' + e);
  }
}

/**
 * Aplica anchos de columna específicos de medias:
 * - Columna 1 (Alumno): basado en longitud de nombres
 * - Columna 2 (Media Final): fijo 90px
 * - Columnas de criterios: basado en longitud de cada clave
 * - Columnas de competencias: basado en longitud del header "i - nombreCompetencia"
 * @param {Sheet} sheet
 * @param {Array<Array<string>>} alumnos
 * @param {Array<string>} clavesLista
 * @param {Array<{indice: string, nombre: string, color: string}>} competenciasInfo - Opcional
 */
function medias_applyColumnWidths(sheet, alumnos, clavesLista, competenciasInfo) {
  if (!sheet) return;
  
  // Columna 1: ancho basado en nombres
  let maxNameLen = 10;
  if (alumnos && alumnos.length > 0) {
    alumnos.forEach(a => {
      if (a[0] && a[0].length > maxNameLen) maxNameLen = a[0].length;
    });
  }
  const anchoAlumno = Math.max(200, Math.min(800, Math.round(maxNameLen * 7)));
  setColumnWidth(sheet, 1, anchoAlumno);

  // Columna 2: Media Final fija
  setColumnWidth(sheet, 2, 90);

  // Columnas de criterios
  for (let j = 0; j < clavesLista.length; j++) {
    const width = Math.max(80, Math.min(800, Math.round(clavesLista[j].length * 7)));
    setColumnWidth(sheet, 3 + j, width);
  }
  
  // Columnas de competencias (ocultas)
  if (competenciasInfo && competenciasInfo.length > 0) {
    const colCompStart = 3 + clavesLista.length;
    for (let i = 0; i < competenciasInfo.length; i++) {
      const comp = competenciasInfo[i];
      const headerText = `${comp.indice} - ${comp.nombre}`;
      const width = Math.max(120, Math.min(800, Math.round(headerText.length * 7)));
      setColumnWidth(sheet, colCompStart + i, width);
    }
  }
}

/**
 * Aplica colores a las columnas de competencias (ocultas).
 * Colorea header (fila 1) y datos (fila 2+) según el color de cada competencia.
 * @param {Sheet} sheet
 * @param {Array<{indice: string, nombre: string, color: string}>} competenciasInfo
 * @param {number} colStart - Primera columna de competencias
 * @param {number} numAlumnos
 */
function medias_applyCompetenciaColors(sheet, competenciasInfo, colStart, numAlumnos) {
  if (!sheet || !competenciasInfo || competenciasInfo.length === 0) return;
  
  for (let i = 0; i < competenciasInfo.length; i++) {
    const comp = competenciasInfo[i];
    const col = colStart + i;
    const color = comp.color || "#ffffff";
    
    // Colorear header
    applyBackgroundColor(sheet, 1, col, 1, 1, color);
    
    // Colorear datos
    if (numAlumnos > 0) {
      applyBackgroundColor(sheet, 2, col, numAlumnos, 1, color);
    }
  }
}

/**
 * Aplica borde grueso separador a la fila de resumen de medias.
 * Crea un borde horizontal grueso (SOLID_MEDIUM) en la parte superior de la fila.
 * @param {Sheet} sheet
 * @param {number} summaryRow - Fila del resumen (2 + numAlumnos)
 * @param {number} totalColumns - Total de columnas en la hoja
 */
function medias_applySummaryRowBorder(sheet, summaryRow, totalColumns) {
  if (!sheet || summaryRow < 1 || totalColumns < 1) return;
  
  try {
    // Aplicar borde superior grueso a toda la fila de resumen
    const range = sheet.getRange(summaryRow, 1, 1, totalColumns);
    range.setBorder(true, false, false, false, null, null, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  } catch(e) {
    Logger.log('medias_applySummaryRowBorder: ' + e);
  }
}

/**
 * Aplica borde grueso derecho separador entre criterios y competencias.
 * @param {Sheet} sheet
 * @param {number} colLastCriterio - Columna del último criterio
 * @param {number} numAlumnos
 */
function medias_applySeparatorBorder(sheet, colLastCriterio, numAlumnos) {
  if (!sheet || colLastCriterio < 1) return;
  
  try {
    // Aplicar borde derecho grueso a la columna del último criterio
    const numRows = 1 + numAlumnos; // header + alumnos
    const range = sheet.getRange(1, colLastCriterio, numRows, 1);
    range.setBorder(null, null, null, true, null, null, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  } catch(e) {
    Logger.log('medias_applySeparatorBorder: ' + e);
  }
}

/**
 * Protege toda la hoja mediasN con advertencia.
 * Todas las celdas muestran advertencia antes de permitir edición.
 * @param {Sheet} sheet
 * @param {number} numRows - Total de filas usadas (header + alumnos + resumen)
 * @param {number} numCols - Total de columnas usadas
 */
function medias_protectSheet(sheet, numRows, numCols) {
  if (!sheet || numRows < 1 || numCols < 1) return;
  
  try {
    // Limpiar protecciones previas
    const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
    protections.forEach(protection => protection.remove());
    
    // Proteger toda la hoja con advertencia
    const range = sheet.getRange(1, 1, numRows, numCols);
    const protection = range.protect()
      .setDescription('Hoja de medias - Los valores se calculan automáticamente');
    
    protection.setWarningOnly(true);
    
  } catch(e) {
    Logger.log('medias_protectSheet: ' + e);
  }
}

/**
 * Aplica sombreado gris claro a la columna de alumnos en mediasN.
 * @param {Sheet} sheet
 * @param {number} numAlumnos
 */
function medias_applyAlumnosColumnShading(sheet, numAlumnos) {
  if (!sheet || numAlumnos <= 0) return;
  
  try {
    // Sombrear columna de alumnos (filas 2 en adelante, datos sin header)
    const alumnosRange = sheet.getRange(2, 1, numAlumnos + 1, 1);
    alumnosRange.setBackground("#f3f3f3");
  } catch(e) {
    Logger.log('medias_applyAlumnosColumnShading: ' + e);
  }
}
