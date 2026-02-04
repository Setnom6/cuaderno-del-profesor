/**
 * observaciones_impl.gs
 * Orquesta la construcción de la hoja observacionesN.
 * Delega lectura de datos a observaciones_data.gs y formato a observaciones_format.gs.
 */

/**
 * Construye la hoja observacionesN si no existe.
 * Si ya existe, compara el listado de alumnos y actualiza insertando nuevos alumnos en sus posiciones correspondientes.
 * @param {number} n - Número del trimestre
 * @param {Array<Array<string>>} alumnos - Lista de alumnos [[nombre1], [nombre2], ...] (ya ordenados alfabéticamente)
 * @returns {Sheet} La hoja observacionesN (existente o creada)
 */
function buildObservacionesImpl(n, alumnos) {
  const ss = SpreadsheetApp.getActive();
  const hojaObservacionesName = "observaciones" + n;

  // Verificar si la hoja ya existe
  let sheetObservaciones = ss.getSheetByName(hojaObservacionesName);
  if (sheetObservaciones) {
    // Comparar listado actual con el de la hoja
    observaciones_updateStudentList(sheetObservaciones, alumnos);
    Logger.log(`Hoja ${hojaObservacionesName} actualizada con nuevos alumnos si los hay`);
    return sheetObservaciones;
  }

  // Crear nueva hoja
  sheetObservaciones = ss.insertSheet(hojaObservacionesName);

  // ========== FASE 1: CONSTRUCCIÓN DE HEADERS ==========
  const observacionesHeaders = [
    "Alumno",
    "Faltas injustificadas",
    "Faltas justificadas",
    "Retrasos",
    "Faltas Injustificadas (días completos)",
    "Faltas justificadas (días completos)",
    "Tarea",
    "Libro",
    "Observaciones adicionales"
  ];
  
  sheetObservaciones.getRange(1, 1, 1, observacionesHeaders.length).setValues([observacionesHeaders]);

  // ========== FASE 2: ESCRITURA DE ALUMNOS ==========
  if (alumnos.length > 0) {
    sheetObservaciones.getRange(2, 1, alumnos.length, 1).setValues(alumnos);
  }

  // ========== FASE 3: FORMATO ==========
  // Formato general del header
  applyHeaderFormatting(sheetObservaciones, 1, 1, 1, observacionesHeaders.length);

  // Formato específico de observaciones
  observaciones_applyColumnWidths(sheetObservaciones, alumnos, observacionesHeaders.length);
  
  // Validación de datos (solo números enteros en columnas 2-8)
  if (alumnos.length > 0) {
    observaciones_applyDataValidation(sheetObservaciones, alumnos.length);
  }
  
  // Formato de columna Alumno y Observaciones adicionales
  observaciones_applyColumnFormatting(sheetObservaciones, alumnos.length);
  
  // Bordes en todas las celdas del rango de datos
  if (alumnos.length > 0) {
    observaciones_applyBorders(sheetObservaciones, alumnos.length, observacionesHeaders.length);
  }
  
  // Alineación a la izquierda de headers y observaciones adicionales
  if (alumnos.length > 0) {
    observaciones_applyAlignment(sheetObservaciones, alumnos.length, observacionesHeaders.length);
  }
  
  // Proteger headers y columna de alumnos con advertencia
  observaciones_protectHeadersAndAlumnos(sheetObservaciones, alumnos.length, observacionesHeaders.length);

  // Freeze primera fila
  freezeRows(sheetObservaciones, 1);

  // Eliminar filas sobrantes
  const maxRows = sheetObservaciones.getMaxRows();
  const usedRows = 1 + alumnos.length; // header + alumnos
  if (maxRows > usedRows) {
    sheetObservaciones.deleteRows(usedRows + 1, maxRows - usedRows);
  }
  
  // Eliminar columnas sobrantes
  const maxCols = sheetObservaciones.getMaxColumns();
  const usedCols = observacionesHeaders.length;
  if (maxCols > usedCols) {
    sheetObservaciones.deleteColumns(usedCols + 1, maxCols - usedCols);
  }

  return sheetObservaciones;
}
