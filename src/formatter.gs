/**
 * formatter.gs
 * Funciones relacionadas con formato de las hojas (merges, bordes, colores, anchos, etc.)
 * Exporta funciones que usan los constructores.
 */

/**
 * Aplica bordes verticales (izquierdo) en la primera columna de cada bloque de instrumento.
 * sheetCalif: hoja donde aplicar
 * instrumentos: array [{nombre, criterios: [...]}, ...]
 * rowsToBorder: número de filas a las que aplicar (normalmente 2 + alumnos.length)
 */
function formatter_applyVerticalInstrumentBorders(sheetCalif, instrumentos, rowsToBorder) {
  if (!sheetCalif) return;

  const sheet = sheetCalif;
  const lastRow = rowsToBorder;
  const lastCol = sheet.getLastColumn();  // se usa como referencia real siempre
  let colPtr = 2;

  // número de columnas reales de instrumentos (no usadas ya para cálculos de bordes finales)
  const numberOfHeaderCols = (instrumentos || []).reduce((sum, inst) => {
    const k = inst?.criterios?.length || 0;
    return sum + (k + 1);
  }, 0);

  // === 1) Borde horizontal entre filas 1 y 2 ===
  try {
    if (numberOfHeaderCols > 0) {
      sheet.getRange(2, 2, 1, numberOfHeaderCols)
        .setBorder(true, null, false, null, null, null, "black",
                   SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    }
  } catch (e) {
    Logger.log("Horizontal separator row1-2: " + e);
  }

  // === 2) Borde horizontal inferior completo ===
  /*try {
    sheet.getRange(lastRow, 1, 1, lastCol)
      .setBorder(null, null, true, null, null, null, "black",
                 SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  } catch (e) {
    Logger.log("Bottom border: " + e);
  }*/

  // === 3) Borde vertical derecho completo ===
  try {
    sheet.getRange(1, lastCol, lastRow, 1)
      .setBorder(false, false, false, true, null, null, "black",
                 SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  } catch (e) {
    Logger.log("Rightmost border: " + e);
  }

  // === 4) Borde dashed a la izquierda de la columna Media de cada instrumento ===
  colPtr = 2;
  for (let b = 0; b < instrumentos.length; b++) {
    const criteriosCount = instrumentos[b]?.criterios?.length || 0;
    const blockSize = criteriosCount + 1;
    const mediaCol = colPtr + criteriosCount;

    try {
      sheet.getRange(1, mediaCol, lastRow, 1)
        .setBorder(false, true, false, false, null, null, "black",
                   SpreadsheetApp.BorderStyle.DASHED_MEDIUM);
    } catch (e) {
      Logger.log("Dashed media border: " + e);
    }

    colPtr += blockSize;
  }

  // === Borde vertical izquierdo de cada bloque (función original) ===
  colPtr = 2;
  for (let b = 0; b < instrumentos.length; b++) {
    const criteriosCount = instrumentos[b]?.criterios?.length || 0;
    const blockSize = criteriosCount + 1;

    try {
      sheet.getRange(1, colPtr, lastRow, 1)
        .setBorder(false, true, false, false, null, null, "black",
                   SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    } catch (e) {
      Logger.log("formatter_applyVerticalInstrumentBorders: " + e);
    }

    colPtr += blockSize;
  }
}





/**
 * (Util) Aplica formato general de cabeceras: centrado, negrita, vertical middle
 */
function formatter_formatHeaders(sheet, startRow, startCol, numRows, numCols) {
  try {
    sheet.getRange(startRow, startCol, numRows, numCols)
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle")
      .setFontWeight("bold");
  } catch(e){}
}

/**
 * (Util) Establece colores por columnas basado en un mapa clave->color para una hoja dada.
 * rowForHeader: fila donde están las claves (por ejemplo 2)
 * dataStartRow: fila donde empiezan los datos (por ejemplo 3)
 */
function formatter_applyColorsByClave(sheet, rowForHeader, dataStartRow, claveToColor) {
  if (!sheet || !claveToColor) return;
  const lastCol = sheet.getLastColumn();
  if (lastCol < 1) return;
  const headerClaves = sheet.getRange(rowForHeader, 1, 1, lastCol).getValues()[0];
  for (let c = 1; c <= headerClaves.length; c++) {
    const clave = headerClaves[c-1] ? headerClaves[c-1].toString().trim() : "";
    if (clave && claveToColor[clave]) {
      const color = claveToColor[clave];
      sheet.getRange(rowForHeader, c).setBackground(color);
      const rows = sheet.getLastRow() - dataStartRow + 1;
      if (rows > 0) sheet.getRange(dataStartRow, c, rows, 1).setBackground(color);
    } else {
      // clear backgrounds for header+data
      try {
        sheet.getRange(rowForHeader, c, sheet.getLastRow(), 1).setBackground(null);
      } catch(e){}
    }
  }
}