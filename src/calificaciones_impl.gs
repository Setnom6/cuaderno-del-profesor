/**
 * calificaciones_impl.gs
 * Implementación modular de la construcción de la hoja de calificaciones.
 * 
 * Esta función orquesta el proceso completo delegando en funciones especializadas:
 * - utils.gs: construcción de headers, deduplicación, dimensiones
 * - calificaciones_data.gs: lectura y mapeo de datos antiguos
 * - formatter.gs: merges, formato, colores, fórmulas, validaciones, anchos
 * 
 * El flujo está separado en dos fases claras:
 * 1. FASE DE DATOS: preparar sheet, construir temporal, copiar datos antiguos, deduplicar, escribir
 * 2. FASE DE FORMATO: merges, colores, fórmulas, validaciones, anchos, bordes
 */

/**
 * Implementación de buildCalificaciones.
 * @param {number} n - Número de trimestre (1, 2 o 3)
 * @param {Array<Array<string>>} alumnos - Lista de alumnos [[nombre], ...]
 * @param {Array<{nombre: string, criterios: Array<string>}>} instrumentos
 * @param {Object<string, string>} claveToColor - Mapa clave de criterio -> color
 * @returns {{sheetCalif: Sheet, alumnos: Array<Array<string>>}}
 */
function buildCalificacionesImpl(n, alumnos, instrumentos, claveToColor) {
  const ss = SpreadsheetApp.getActive();
  const hojaCalifName = "calificaciones" + n;

  // ===== FASE 1: DATOS =====
  
  // 1.1 Preparar hoja de calificaciones
  let sheetCalif = ss.getSheetByName(hojaCalifName);
  if (sheetCalif) {
    sheetCalif.getRange(1, 1, sheetCalif.getMaxRows(), sheetCalif.getMaxColumns()).breakApart();
  } else {
    sheetCalif = ss.insertSheet(hojaCalifName);
  }

  // 1.2 Construir headers usando función pura
  const { headerRow1, headerRow2, totalCols } = buildCalifHeaders(instrumentos);

  // 1.3 Crear hoja temporal
  let temp = ss.getSheetByName("TEMP_CALIF");
  if (temp) ss.deleteSheet(temp);
  temp = ss.insertSheet("TEMP_CALIF");
  temp.clear();

  // Escribir headers
  temp.getRange(1, 1, 1, totalCols).setValues([headerRow1]);
  temp.getRange(2, 1, 1, totalCols).setValues([headerRow2]);
  
  // Escribir alumnos y datos vacíos
  if (alumnos.length > 0) {
    temp.getRange(3, 1, alumnos.length, 1).setValues(alumnos);
    if (totalCols > 1) {
      const emptyData = Array.from({ length: alumnos.length }, () => Array(totalCols - 1).fill(""));
      temp.getRange(3, 2, alumnos.length, totalCols - 1).setValues(emptyData);
    }
  }

  // 1.4 Leer datos antiguos de la hoja existente
  const oldSheetData = readOldSheetData(sheetCalif);
  
  // 1.5 Construir bloques de datos antiguos por instrumento
  const oldBlocks = buildOldDataBlocks(
    oldSheetData.oldHeadersRow1,
    oldSheetData.oldHeadersRow2,
    oldSheetData.oldData
  );

  // 1.6 Copiar datos antiguos al temporal
  copyOldDataToTemp(
    temp,
    alumnos,
    instrumentos,
    oldBlocks,
    oldSheetData.oldRowByAlumno,
    oldSheetData.oldData
  );

  // 1.7 Leer datos del temporal y deduplicar en memoria
  let tempValues = temp.getDataRange().getValues();
  const dedupResult = deduplicateRowsInMemory(tempValues, 2); // 2 filas de header
  
  if (dedupResult.duplicatesRemoved > 0) {
    Logger.log(`buildCalificaciones: eliminados ${dedupResult.duplicatesRemoved} duplicados en temporal`);
    tempValues = dedupResult.dedupedData;
  }

  // 1.8 Escribir a la hoja de calificaciones
  const writeNumRows = tempValues.length;
  const writeNumCols = tempValues[0] ? tempValues[0].length : totalCols;

  sheetCalif.clear({ contentsOnly: false, formatOnly: false });
  ensureSheetDimensions(sheetCalif, writeNumRows, writeNumCols);
  sheetCalif.getRange(1, 1, writeNumRows, writeNumCols).setValues(tempValues);

  // 1.9 Eliminar filas sobrantes
  deleteExcessRows(sheetCalif, writeNumRows);

  // 1.10 Verificar post-escritura y re-deduplicar si necesario
  const writtenValues = sheetCalif.getRange(1, 1, writeNumRows, writeNumCols).getValues();
  const postWriteDedupResult = deduplicateRowsInMemory(writtenValues, 2);
  
  let finalNumRows = writeNumRows;
  let finalNumCols = writeNumCols;
  
  if (postWriteDedupResult.duplicatesRemoved > 0) {
    Logger.log(`buildCalificaciones: detectados ${postWriteDedupResult.duplicatesRemoved} duplicados post-escritura; reescribiendo`);
    const uniqueData = postWriteDedupResult.dedupedData;
    finalNumRows = uniqueData.length;
    finalNumCols = uniqueData[0] ? uniqueData[0].length : writeNumCols;
    
    sheetCalif.clear({ contentsOnly: false, formatOnly: false });
    ensureSheetDimensions(sheetCalif, finalNumRows, finalNumCols);
    sheetCalif.getRange(1, 1, finalNumRows, finalNumCols).setValues(uniqueData);
    tempValues = uniqueData;
  }

  // 1.11 Limpiar columnas sobrantes
  if (sheetCalif.getMaxColumns() > totalCols) {
    try {
      sheetCalif.getRange(1, totalCols + 1, sheetCalif.getMaxRows(), sheetCalif.getMaxColumns() - totalCols)
        .clearContent().clearFormat();
      sheetCalif.deleteColumns(totalCols + 1, sheetCalif.getMaxColumns() - totalCols);
    } catch(e) {
      Logger.log('buildCalificaciones: error limpiando columnas sobrantes: ' + e);
    }
  }

  // ===== FASE 2: FORMATO Y APARIENCIA =====
  
  const numAlumnos = alumnos.length;

  // 2.1 Aplicar merges de headers (específico de calificaciones)
  calif_applyHeaderMerges(sheetCalif, instrumentos);

  // 2.2 Aplicar formato de headers (función general)
  applyHeaderFormatting(sheetCalif, 1, 1, 2, finalNumCols);
  // Ajuste especial: fila 2 alineada a la izquierda
  try {
    sheetCalif.getRange(2, 1, 1, finalNumCols).setHorizontalAlignment("left");
  } catch(e) {}

  // 2.3 Aplicar colores por clave de criterio (específico de calificaciones)
  calif_applyColorsByClave(sheetCalif, numAlumnos, finalNumCols, claveToColor);

  // 2.4 Aplicar fórmulas de media (específico de calificaciones)
  calif_applyAverageFormulas(sheetCalif, instrumentos, numAlumnos);

  // 2.5 Aplicar validación de datos (0-10) y formato condicional
  calif_applyDataValidation(sheetCalif, instrumentos, numAlumnos);

  // 2.6 Aplicar formato condicional a columnas Media (texto rojo si < 5.0)
  calif_applyMediaConditionalFormatting(sheetCalif, instrumentos, numAlumnos);

  // 2.7 Aplicar anchos de columna (específico de calificaciones)
  calif_applyColumnWidths(sheetCalif, alumnos, instrumentos);

  // 2.8 Aplicar bordes verticales (específico de calificaciones)
  const rowsToBorder = 2 + numAlumnos;
  calif_applyVerticalInstrumentBorders(sheetCalif, instrumentos, rowsToBorder);

  // 2.9 Aplicar formato decimal a datos (función general)
  if (numAlumnos > 0 && finalNumCols > 1) {
    applyDecimalFormat(sheetCalif, 3, 2, numAlumnos, finalNumCols - 1);
  }

  // 2.10 Congelar columna de alumnos (función general)
  freezeColumns(sheetCalif, 1);

  // ===== LIMPIEZA FINAL =====
  
  // Eliminar hoja temporal
  try {
    ss.deleteSheet(temp);
  } catch(e) {
    Logger.log('buildCalificaciones: error eliminando temporal: ' + e);
  }

  return { sheetCalif, alumnos };
}
