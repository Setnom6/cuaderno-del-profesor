/**
 * calificaciones_format.gs
 * Lógica de apariencia y formato específica para la hoja de calificaciones.
 * Utiliza funciones generales de utils.gs y aplica formato específico de calificaciones.
 */

/**
 * Aplica merges de cabecera específicos de calificaciones:
 * - Columna "Alumno" fusionada en filas 1-2
 * - Cada bloque de instrumento fusionado en fila 1
 * @param {Sheet} sheet
 * @param {Array<{nombre: string, criterios: Array<string>}>} instrumentos
 */
function calif_applyHeaderMerges(sheet, instrumentos) {
  if (!sheet || !instrumentos) return;
  
  // Merge "Alumno" (filas 1-2, columna 1)
  mergeCells(sheet, 1, 1, 2, 1);
  
  // Merge cada bloque de instrumento (fila 1)
  let colPtr = 2;
  instrumentos.forEach(inst => {
    const size = inst.criterios.length + 1; // +1 para Media
    if (size > 1) {
      mergeCells(sheet, 1, colPtr, 1, size);
    }
    colPtr += size;
  });
}

/**
 * Aplica fórmulas de media (AVERAGE) en las columnas de Media de cada instrumento.
 * Específico de calificaciones: cada instrumento tiene una columna Media con AVERAGE de sus criterios.
 * @param {Sheet} sheet
 * @param {Array<{nombre: string, criterios: Array<string>}>} instrumentos
 * @param {number} numAlumnos - Número de filas de alumnos
 */
function calif_applyAverageFormulas(sheet, instrumentos, numAlumnos) {
  if (!sheet || !instrumentos || numAlumnos <= 0) return;
  
  let colPtr = 2; // Primera columna de datos (después de Alumno)
  instrumentos.forEach(inst => {
    const criterios = inst.criterios;
    const blockSize = criterios.length + 1;
    const colMedia = colPtr + criterios.length;
    
    for (let i = 0; i < numAlumnos; i++) {
      const row = 3 + i; // Fila 3 es la primera fila de datos
      const refs = criterios.map((_, idx) => columnToLetter(colPtr + idx) + row);
      const formula = `=IFERROR(AVERAGE(${refs.join(";")}); "")`;
      setFormula(sheet, row, colMedia, formula);
    }
    colPtr += blockSize;
  });
}

/**
 * Aplica validación de datos (0-10) y formato condicional (rojo si fuera de rango)
 * a las columnas de notas de calificaciones.
 * @param {Sheet} sheet
 * @param {Array<{nombre: string, criterios: Array<string>}>} instrumentos
 * @param {number} numAlumnos
 */
function calif_applyDataValidation(sheet, instrumentos, numAlumnos) {
  if (!sheet || !instrumentos || numAlumnos <= 0) return;
  
  let colPtr = 2;
  instrumentos.forEach(inst => {
    const criterios = inst.criterios;
    const blockSize = criterios.length + 1;
    
    if (criterios.length > 0) {
      const notasRange = sheet.getRange(3, colPtr, numAlumnos, criterios.length);
      
      try {
        // Validación: números entre 0 y 10
        const rule = SpreadsheetApp.newDataValidation()
                      .requireNumberBetween(0, 10)
                      .setAllowInvalid(true)
                      .build();
        notasRange.setDataValidation(rule);
        
        // Formato condicional: rojo si <0 o >10
        const redRule1 = SpreadsheetApp.newConditionalFormatRule()
                          .whenNumberLessThan(0)
                          .setBackground("red")
                          .setRanges([notasRange])
                          .build();
        const redRule2 = SpreadsheetApp.newConditionalFormatRule()
                          .whenNumberGreaterThan(10)
                          .setBackground("red")
                          .setRanges([notasRange])
                          .build();
        const rules = sheet.getConditionalFormatRules();
        sheet.setConditionalFormatRules(rules.concat([redRule1, redRule2]));
      } catch(e) {
        Logger.log('calif_applyDataValidation: ' + e);
      }
    }
    
    colPtr += blockSize;
  });
}

/**
 * Aplica anchos de columna específicos de calificaciones:
 * - Columna 1 basada en longitud máxima de nombres de alumnos
 * - Resto basado en nombre de instrumento y número de criterios
 * @param {Sheet} sheet
 * @param {Array<Array<string>>} alumnos - Matriz [[nombre], ...]
 * @param {Array<{nombre: string, criterios: Array<string>}>} instrumentos
 */
function calif_applyColumnWidths(sheet, alumnos, instrumentos) {
  if (!sheet || !instrumentos) return;
  
  // Columna 1: ancho basado en nombres de alumnos
  let maxNameLen = 10;
  if (alumnos && alumnos.length > 0) {
    alumnos.forEach(a => {
      if (a[0] && a[0].length > maxNameLen) maxNameLen = a[0].length;
    });
  }
  const col1Width = Math.max(200, Math.min(800, Math.round(maxNameLen * 7)));
  setColumnWidth(sheet, 1, col1Width);
  
  // Columnas de instrumentos: ancho basado en nombre y blockSize
  let colPtr = 2;
  instrumentos.forEach(inst => {
    const blockSize = inst.criterios.length + 1;
    const perCol = Math.max(90, Math.min(420, Math.ceil(Math.max(inst.nombre.length * 10, 80 * blockSize) / blockSize)));
    for (let k = 0; k < blockSize; k++) {
      setColumnWidth(sheet, colPtr + k, perCol);
    }
    colPtr += blockSize;
  });
}

/**
 * Aplica bordes verticales específicos de calificaciones:
 * - Borde horizontal entre filas 1 y 2
 * - Borde vertical derecho completo
 * - Borde dashed en columna Media de cada instrumento
 * - Borde vertical izquierdo de cada bloque
 * @param {Sheet} sheet
 * @param {Array<{nombre: string, criterios: Array<string>}>} instrumentos
 * @param {number} rowsToBorder - Número de filas a las que aplicar (normalmente 2 + alumnos.length)
 */
function calif_applyVerticalInstrumentBorders(sheet, instrumentos, rowsToBorder) {
  if (!sheet) return;

  const lastRow = rowsToBorder;
  const lastCol = sheet.getLastColumn();
  let colPtr = 2;

  // Número de columnas de instrumentos
  const numberOfHeaderCols = (instrumentos || []).reduce((sum, inst) => {
    const k = inst?.criterios?.length || 0;
    return sum + (k + 1);
  }, 0);

  // 1) Borde horizontal entre filas 1 y 2
  try {
    if (numberOfHeaderCols > 0) {
      sheet.getRange(2, 2, 1, numberOfHeaderCols)
        .setBorder(true, null, false, null, null, null, "black",
                   SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    }
  } catch (e) {
    Logger.log("calif_applyVerticalInstrumentBorders - horizontal separator: " + e);
  }

  // 2) Borde vertical derecho completo
  try {
    sheet.getRange(1, lastCol, lastRow, 1)
      .setBorder(false, false, false, true, null, null, "black",
                 SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  } catch (e) {
    Logger.log("calif_applyVerticalInstrumentBorders - rightmost border: " + e);
  }

  // 3) Borde dashed en columna Media de cada instrumento
  colPtr = 2;
  for (let b = 0; b < instrumentos.length; b++) {
    const criteriosCount = instrumentos[b]?.criterios?.length || 0;
    const blockSize = criteriosCount + 1;
    const mediaCol = colPtr + criteriosCount;

    try {
      sheet.getRange(1, mediaCol, lastRow, 1)
        .setBorder(false, true, false, false, null, null, "black",
                   SpreadsheetApp.BorderStyle.DASHED);
    } catch (e) {
      Logger.log("calif_applyVerticalInstrumentBorders - dashed media: " + e);
    }

    colPtr += blockSize;
  }

  // 4) Borde vertical izquierdo de cada bloque
  colPtr = 2;
  for (let b = 0; b < instrumentos.length; b++) {
    const criteriosCount = instrumentos[b]?.criterios?.length || 0;
    const blockSize = criteriosCount + 1;

    try {
      sheet.getRange(1, colPtr, lastRow, 1)
        .setBorder(false, true, false, false, null, null, "black",
                   SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    } catch (e) {
      Logger.log("calif_applyVerticalInstrumentBorders - block border: " + e);
    }

    colPtr += blockSize;
  }
}

/**
 * Aplica colores por clave de criterio en calificaciones.
 * Específico de calificaciones: colorea fila 2 (claves) y datos (fila 3+) según mapa.
 * @param {Sheet} sheet
 * @param {number} numAlumnos
 * @param {number} finalNumCols
 * @param {Object<string, string>} claveToColor - Mapa clave -> color
 */
function calif_applyColorsByClave(sheet, numAlumnos, finalNumCols, claveToColor) {
  if (!sheet || !claveToColor) return;
  
  for (let c = 1; c <= finalNumCols; c++) {
    const clave = sheet.getRange(2, c).getValue()?.toString().trim() || "";
    if (clave && claveToColor[clave]) {
      const color = claveToColor[clave];
      applyBackgroundColor(sheet, 2, c, 1, 1, color);
      if (numAlumnos > 0) {
        applyBackgroundColor(sheet, 3, c, numAlumnos, 1, color);
      }
    } else {
      try {
        clearBackgroundColor(sheet, 1, c, sheet.getLastRow(), 1);
      } catch(e) {}
    }
  }
}
