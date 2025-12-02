/**
 * utils.gs
 * Utilidades puras y helpers reutilizables para el proyecto.
 * Todas las funciones intentan ser puras y sin efectos laterales para facilitar pruebas.
 *
 * NOTA: Estas utilidades están pensadas para usarse desde otros archivos .gs.
 * Añade aquí helpers que no dependan del entorno de la hoja de cálculo (o que lo hagan de forma explícita).
 */

/**
 * Normaliza un valor cualquiera a string: convierte a string, hace trim y opcionalmente elimina diacríticos.
 * @param {any} v - Valor de entrada.
 * @param {boolean} [removeDiacritics=false] - Si true elimina tildes/diacríticos (NFD + regex).
 * @returns {string} - Cadena normalizada.
 */
function normalizeString(v, removeDiacritics) {
  const s = (v === null || v === undefined) ? "" : v.toString();
  const t = s.trim();
  if (removeDiacritics) {
    // Normalizar NFD y quitar marcas diacríticas
    return t.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  }
  return t;
}

/**
 * Convierte un índice de columna (1-based) a letra(s) de columna (A, B, ..., Z, AA, AB, ...).
 * Mismo comportamiento que la función previa en `main.gs`.
 * @param {number} col - Índice 1-based de la columna.
 * @returns {string} - Letra(s) de columna.
 */
function columnToLetter(col) {
  let letter = '';
  while (col > 0) {
    let temp = (col - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    col = Math.floor((col - temp - 1) / 26);
  }
  return letter;
}

/**
 * Busca el índice (0-based) de una cabecera en una fila de cabeceras.
 * Comparación case-insensitive y trimmed.
 * @param {Array} headerRow - Array con los valores de la fila de cabeceras (p.ej. getValues()[0]).
 * @param {string} headerName - Nombre de cabecera a buscar.
 * @returns {number} - Índice 0-based o -1 si no existe.
 */
function findHeaderIndex(headerRow, headerName) {
  if (!headerRow || !Array.isArray(headerRow) || !headerName) return -1;
  const target = headerName.toString().trim().toLowerCase();
  for (let i = 0; i < headerRow.length; i++) {
    const h = headerRow[i] ? headerRow[i].toString().trim().toLowerCase() : '';
    if (h === target) return i;
  }
  return -1;
}

/**
 * Crea una "firma" (string) para una fila (array de celdas) que se usa para detectar duplicados exactos.
 * Normaliza cada celda (trim) y une con un separador estable.
 * @param {Array} row - Array con los valores de la fila.
 * @returns {string} - Firma de la fila.
 */
function makeRowSignature(row) {
  if (!row || !Array.isArray(row)) return '';
  return row.map(c => normalizeString(c, false)).join('|');
}

/**
 * Crea una firma robusta de fila normalizando números a 2 decimales y strings con trim.
 * Esta firma se usa para detectar duplicados exactos aun cuando existan diferencias
 * de formato (por ejemplo "8.5" vs "8,50").
 * @param {Array} row - Array con los valores de la fila.
 * @returns {string}
 */
function makeRowSignatureNormalized(row) {
  if (!row || !Array.isArray(row)) return '';
  return row.map(c => {
    if (c === null || c === undefined) return '';
    if (typeof c === 'number') return Number(c).toFixed(2);
    const s = c.toString().trim();
    const sNum = Number(s.replace(/,/g, '.'));
    if (!isNaN(sNum)) return sNum.toFixed(2);
    return s;
  }).join('|');
}

/**
 * Comparador de strings usando locale 'es' con sensibilidad base y comparación numérica.
 * Útil para ordenaciones con comportamiento consistente en español.
 * @param {string} a
 * @param {string} b
 * @returns {number} - <0 si a<b, 0 si igual, >0 si a>b
 */
function localeCompareEs(a, b) {
  const sa = (a === null || a === undefined) ? '' : a.toString();
  const sb = (b === null || b === undefined) ? '' : b.toString();
  return sa.localeCompare(sb, 'es', { sensitivity: 'base', numeric: true });
}

/**
 * Lectura segura de un rango: devuelve un array bidimensional aunque el rango sea 0 filas/columnas.
 * @param {Sheet} sheet - Hoja de cálculo
 * @param {number} startRow - 1-based
 * @param {number} startCol - 1-based
 * @param {number} numRows
 * @param {number} numCols
 * @returns {Array<Array<any>>}
 */
function readRangeValuesSafe(sheet, startRow, startCol, numRows, numCols) {
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (numRows <= 0 || numCols <= 0) return [];
  // Clamp
  const r = Math.max(0, Math.min(numRows, Math.max(0, lastRow - startRow + 1)));
  const c = Math.max(0, Math.min(numCols, Math.max(0, lastCol - startCol + 1)));
  if (r <= 0 || c <= 0) return Array.from({ length: 0 }, () => Array(c).fill(''));
  return sheet.getRange(startRow, startCol, r, c).getValues();
}

/**
 * Construye las dos filas de headers para la hoja de calificaciones.
 * Row1 contiene los nombres de instrumentos (merged), Row2 contiene los criterios individuales.
 * @param {Array<{nombre: string, criterios: Array<string>}>} instrumentos
 * @returns {{headerRow1: Array<string>, headerRow2: Array<string>, totalCols: number}}
 */
function buildCalifHeaders(instrumentos) {
  const headerRow1 = ["Alumno"];
  const headerRow2 = ["Alumno"];
  
  instrumentos.forEach(inst => {
    const k = inst.criterios.length;
    if (k === 0) return; // ignorar instrumentos sin criterios

    for (let j = 0; j < k; j++) {
      if (j === 0) headerRow1.push(inst.nombre);
      else headerRow1.push("");
      headerRow2.push(inst.criterios[j]);
    }
    headerRow1.push(inst.nombre);
    headerRow2.push("Media");
  });

  return {
    headerRow1,
    headerRow2,
    totalCols: headerRow2.length
  };
}

/**
 * Deduplica filas en memoria usando firma normalizada.
 * Preserva las primeras N filas como headers y deduplica el resto.
 * @param {Array<Array<any>>} data - Matriz de datos (rows x cols)
 * @param {number} headerRows - Número de filas de cabecera a preservar sin deduplicar
 * @returns {{dedupedData: Array<Array<any>>, duplicatesRemoved: number}}
 */
function deduplicateRowsInMemory(data, headerRows) {
  if (!data || data.length <= headerRows) {
    return { dedupedData: data, duplicatesRemoved: 0 };
  }

  const seenSigs = new Set();
  const result = [];
  let duplicatesCount = 0;

  // Copiar headers sin procesar
  for (let r = 0; r < headerRows && r < data.length; r++) {
    result.push(data[r]);
  }

  // Deduplicar filas de datos
  for (let r = headerRows; r < data.length; r++) {
    const row = data[r];
    const sig = makeRowSignatureNormalized(row);
    if (!seenSigs.has(sig)) {
      seenSigs.add(sig);
      result.push(row);
    } else {
      duplicatesCount++;
    }
  }

  return { dedupedData: result, duplicatesRemoved: duplicatesCount };
}

/**
 * Elimina filas sobrantes de una hoja tras escribir datos.
 * Si hay más filas en la hoja que las escritas, intenta deleteRows o clearContent.
 * @param {Sheet} sheet - Hoja de cálculo
 * @param {number} writtenRows - Número de filas escritas
 */
function deleteExcessRows(sheet, writtenRows) {
  if (!sheet || writtenRows < 1) return;
  
  const maxRows = sheet.getMaxRows();
  if (maxRows > writtenRows) {
    try {
      const rowsToDelete = maxRows - writtenRows;
      sheet.deleteRows(writtenRows + 1, rowsToDelete);
      Logger.log(`deleteExcessRows: eliminadas ${rowsToDelete} filas sobrantes.`);
    } catch (e) {
      try {
        sheet.getRange(writtenRows + 1, 1, maxRows - writtenRows, sheet.getMaxColumns()).clearContent();
        Logger.log('deleteExcessRows: no se pudieron borrar filas; contenido limpiado.');
      } catch (err) {
        Logger.log('deleteExcessRows: error al intentar eliminar/limpiar: ' + err);
      }
    }
  }
}

/**
 * Asegura que la hoja tenga dimensiones mínimas (filas y columnas).
 * Inserta filas/columnas si es necesario.
 * @param {Sheet} sheet
 * @param {number} minRows
 * @param {number} minCols
 */
function ensureSheetDimensions(sheet, minRows, minCols) {
  if (!sheet) return;
  
  const maxCols = sheet.getMaxColumns();
  const maxRows = sheet.getMaxRows();
  
  if (maxCols < minCols) {
    sheet.insertColumnsAfter(maxCols, minCols - maxCols);
  }
  if (maxRows < minRows) {
    sheet.insertRowsAfter(maxRows, minRows - maxRows);
  }
}

// ===== FUNCIONES GENERALES DE FORMATEO =====

/**
 * Aplica formato general de cabeceras: centrado, negrita, vertical middle.
 * Función genérica utilizable desde cualquier módulo.
 * @param {Sheet} sheet
 * @param {number} startRow - 1-based
 * @param {number} startCol - 1-based
 * @param {number} numRows
 * @param {number} numCols
 */
function applyHeaderFormatting(sheet, startRow, startCol, numRows, numCols) {
  if (!sheet || numRows <= 0 || numCols <= 0) return;
  try {
    sheet.getRange(startRow, startCol, numRows, numCols)
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle")
      .setFontWeight("bold");
  } catch(e) {
    Logger.log('applyHeaderFormatting: ' + e);
  }
}

/**
 * Aplica formato numérico decimal (0.00) a un rango.
 * Función genérica utilizable desde cualquier módulo.
 * @param {Sheet} sheet
 * @param {number} startRow - 1-based
 * @param {number} startCol - 1-based
 * @param {number} numRows
 * @param {number} numCols
 */
function applyDecimalFormat(sheet, startRow, startCol, numRows, numCols) {
  if (!sheet || numRows <= 0 || numCols <= 0) return;
  try {
    sheet.getRange(startRow, startCol, numRows, numCols).setNumberFormat("0.00");
  } catch(e) {
    Logger.log('applyDecimalFormat: ' + e);
  }
}

/**
 * Aplica un color de fondo a un rango.
 * Función genérica utilizable desde cualquier módulo.
 * @param {Sheet} sheet
 * @param {number} startRow - 1-based
 * @param {number} startCol - 1-based
 * @param {number} numRows
 * @param {number} numCols
 * @param {string} color - Color en formato hex (#RRGGBB) o nombre
 */
function applyBackgroundColor(sheet, startRow, startCol, numRows, numCols, color) {
  if (!sheet || numRows <= 0 || numCols <= 0) return;
  try {
    sheet.getRange(startRow, startCol, numRows, numCols).setBackground(color);
  } catch(e) {
    Logger.log('applyBackgroundColor: ' + e);
  }
}

/**
 * Limpia el color de fondo de un rango.
 * @param {Sheet} sheet
 * @param {number} startRow - 1-based
 * @param {number} startCol - 1-based
 * @param {number} numRows
 * @param {number} numCols
 */
function clearBackgroundColor(sheet, startRow, startCol, numRows, numCols) {
  if (!sheet || numRows <= 0 || numCols <= 0) return;
  try {
    sheet.getRange(startRow, startCol, numRows, numCols).setBackground(null);
  } catch(e) {
    Logger.log('clearBackgroundColor: ' + e);
  }
}

/**
 * Congela columnas en una hoja.
 * @param {Sheet} sheet
 * @param {number} numColumns - Número de columnas a congelar desde la izquierda
 */
function freezeColumns(sheet, numColumns) {
  if (!sheet || numColumns < 0) return;
  try {
    sheet.setFrozenColumns(numColumns);
  } catch(e) {
    Logger.log('freezeColumns: ' + e);
  }
}

/**
 * Congela filas en una hoja.
 * @param {Sheet} sheet
 * @param {number} numRows - Número de filas a congelar desde arriba
 */
function freezeRows(sheet, numRows) {
  if (!sheet || numRows < 0) return;
  try {
    sheet.setFrozenRows(numRows);
  } catch(e) {
    Logger.log('freezeRows: ' + e);
  }
}

/**
 * Establece el ancho de una columna.
 * @param {Sheet} sheet
 * @param {number} column - Índice 1-based de la columna
 * @param {number} width - Ancho en píxeles
 */
function setColumnWidth(sheet, column, width) {
  if (!sheet || column < 1 || width < 0) return;
  try {
    sheet.setColumnWidth(column, width);
  } catch(e) {
    Logger.log('setColumnWidth: ' + e);
  }
}

/**
 * Fusiona un rango de celdas.
 * @param {Sheet} sheet
 * @param {number} startRow - 1-based
 * @param {number} startCol - 1-based
 * @param {number} numRows
 * @param {number} numCols
 */
function mergeCells(sheet, startRow, startCol, numRows, numCols) {
  if (!sheet || numRows <= 0 || numCols <= 0) return;
  try {
    sheet.getRange(startRow, startCol, numRows, numCols).merge();
  } catch(e) {
    Logger.log('mergeCells: ' + e);
  }
}

/**
 * Establece una fórmula en una celda.
 * @param {Sheet} sheet
 * @param {number} row - 1-based
 * @param {number} col - 1-based
 * @param {string} formula - Fórmula a establecer (debe empezar con =)
 */
function setFormula(sheet, row, col, formula) {
  if (!sheet || row < 1 || col < 1 || !formula) return;
  try {
    sheet.getRange(row, col).setFormula(formula);
  } catch(e) {
    Logger.log('setFormula: ' + e);
  }
}
