/**
 * observaciones_data.gs
 * Lógica de manejo de datos para la hoja observacionesN.
 * Define la estructura y validaciones de datos.
 */

/**
 * Retorna la lista de headers para la hoja observaciones.
 * @returns {Array<string>}
 */
function observaciones_getHeaders() {
  return [
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
}

/**
 * Retorna los índices de columnas que requieren validación de números enteros.
 * @returns {Array<number>} Índices de columnas (1-based)
 */
function observaciones_getNumericColumns() {
  // Columnas 2-8 (Faltas injustificadas hasta Libro)
  return [2, 3, 4, 5, 6, 7, 8];
}

/**
 * Actualiza la lista de alumnos en una hoja observacionesN existente.
 * Compara el listado actual de la hoja con el nuevo listado (ya ordenado alfabéticamente).
 * Inserta filas para nuevos alumnos en sus posiciones correspondientes.
 * Elimina filas/columnas sobrantes.
 * @param {Sheet} sheet - Hoja observacionesN existente
 * @param {Array<Array<string>>} newAlumnos - Nueva lista de alumnos [[nombre1], [nombre2], ...] ordenada
 */
function observaciones_updateStudentList(sheet, newAlumnos) {
  if (!sheet || newAlumnos.length === 0) return;
  
  const headers = observaciones_getHeaders();
  const numCols = headers.length;
  
  // Leer alumnos actuales de la hoja
  const lastRow = sheet.getLastRow();
  const currentAlumnos = lastRow > 1 
    ? sheet.getRange(2, 1, lastRow - 1, 1).getValues().map(r => r[0]) 
    : [];
  
  // Crear lista de nuevos alumnos (planos)
  const newAlumnosList = newAlumnos.map(a => a[0]);
  
  // Si los listados son idénticos, solo limpiar filas/columnas extras y salir
  if (JSON.stringify(currentAlumnos) === JSON.stringify(newAlumnosList)) {
    Logger.log('observaciones_updateStudentList: listado sin cambios');
    // Limpiar filas y columnas sobrantes
    const finalRow = 1 + newAlumnosList.length;
    const maxRows = sheet.getMaxRows();
    if (maxRows > finalRow) {
      sheet.deleteRows(finalRow + 1, maxRows - finalRow);
    }
    const maxCols = sheet.getMaxColumns();
    if (maxCols > numCols) {
      sheet.deleteColumns(numCols + 1, maxCols - numCols);
    }
    return;
  }
  
  Logger.log('observaciones_updateStudentList: detectados cambios en el listado');
  
  // Construir índice de alumnos actuales con sus filas
  const currentMap = {};
  currentAlumnos.forEach((alumno, idx) => {
    currentMap[alumno] = 2 + idx; // fila real en la hoja
  });
  
  // Procesar cada alumno del nuevo listado
  let targetRow = 2;
  for (let i = 0; i < newAlumnosList.length; i++) {
    const newAlumno = newAlumnosList[i];
    const existingRow = currentMap[newAlumno];
    
    if (existingRow) {
      // El alumno existe, pero puede estar en la posición incorrecta
      if (existingRow !== targetRow) {
        // Mover la fila a la posición correcta
        sheet.moveRows(sheet.getRange(existingRow, 1, 1, numCols), targetRow);
        // Actualizar el mapa de posiciones
        for (const nombre in currentMap) {
          if (currentMap[nombre] === existingRow) {
            currentMap[nombre] = targetRow;
          } else if (currentMap[nombre] >= targetRow && currentMap[nombre] < existingRow) {
            currentMap[nombre]++;
          }
        }
      }
    } else {
      // Alumno nuevo, insertar fila
      if (targetRow <= sheet.getLastRow()) {
        sheet.insertRowBefore(targetRow);
      } else {
        // Añadir fila al final si es necesario
        sheet.insertRowAfter(sheet.getLastRow());
      }
      sheet.getRange(targetRow, 1).setValue(newAlumno);
      
      // Aplicar formato a la nueva fila
      observaciones_applyRowFormatting(sheet, targetRow, numCols);
      
      // Actualizar el mapa de posiciones (todos los que están después se desplazan)
      for (const nombre in currentMap) {
        if (currentMap[nombre] >= targetRow) {
          currentMap[nombre]++;
        }
      }
    }
    
    targetRow++;
  }
  
  // Eliminar filas sobrantes al final (alumnos que ya no están en el listado)
  const finalRow = 1 + newAlumnosList.length;
  if (sheet.getLastRow() > finalRow) {
    sheet.deleteRows(finalRow + 1, sheet.getLastRow() - finalRow);
  }
  
  // Eliminar filas vacías físicas sobrantes
  const maxRows = sheet.getMaxRows();
  if (maxRows > finalRow) {
    sheet.deleteRows(finalRow + 1, maxRows - finalRow);
  }
  
  // Eliminar columnas sobrantes
  const maxCols = sheet.getMaxColumns();
  if (maxCols > numCols) {
    sheet.deleteColumns(numCols + 1, maxCols - numCols);
  }
  
  // Reaplicar formato completo
  observaciones_applyColumnWidths(sheet, newAlumnos, numCols);
  observaciones_applyDataValidation(sheet, newAlumnosList.length);
  observaciones_applyColumnFormatting(sheet, newAlumnosList.length);
  observaciones_applyBorders(sheet, newAlumnosList.length, numCols);
  observaciones_applyAlignment(sheet, newAlumnosList.length, numCols);
  observaciones_protectHeadersAndAlumnos(sheet, newAlumnosList.length, numCols);
}
