/**
 * observaciones_format.gs
 * Lógica de apariencia y formato específica para la hoja observacionesN.
 * Utiliza funciones generales de utils.gs.
 */

/**
 * Aplica anchos de columna específicos de observaciones:
 * - Columna 1 (Alumno): basado en longitud de nombres
 * - Columnas 2-8 (numéricas): ancho estándar
 * - Columna 9 (Observaciones adicionales): muy ancha para texto largo
 * @param {Sheet} sheet
 * @param {Array<Array<string>>} alumnos
 * @param {number} numColumns - Número total de columnas
 */
function observaciones_applyColumnWidths(sheet, alumnos, numColumns) {
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

  // Columnas 2-8: ancho estándar para números
  for (let col = 2; col <= 8; col++) {
    setColumnWidth(sheet, col, 120);
  }

  // Columna 9: muy ancha para observaciones adicionales
  setColumnWidth(sheet, 9, 400);
}

/**
 * Aplica validación de datos a columnas numéricas.
 * Solo acepta números enteros positivos (incluyendo 0).
 * @param {Sheet} sheet
 * @param {number} numAlumnos
 */
function observaciones_applyDataValidation(sheet, numAlumnos) {
  if (!sheet || numAlumnos <= 0) return;
  
  try {
    const numericColumns = observaciones_getNumericColumns();
    
    // Crear regla de validación: solo números enteros >= 0
    const rule = SpreadsheetApp.newDataValidation()
      .requireNumberGreaterThanOrEqualTo(0)
      .setAllowInvalid(false)
      .setHelpText('Solo números enteros positivos (0 o mayor)')
      .build();
    
    // Aplicar a cada columna numérica
    numericColumns.forEach(col => {
      const range = sheet.getRange(2, col, numAlumnos, 1);
      range.setDataValidation(rule);
    });
  } catch(e) {
    Logger.log('observaciones_applyDataValidation: ' + e);
  }
}

/**
 * Aplica formato específico a columnas especiales:
 * - Columna Alumno: fondo gris claro
 * - Columna Observaciones adicionales: ajuste de texto activado
 * @param {Sheet} sheet
 * @param {number} numAlumnos
 */
function observaciones_applyColumnFormatting(sheet, numAlumnos) {
  if (!sheet || numAlumnos <= 0) return;
  
  try {
    // Columna Alumno: fondo gris claro
    const alumnosRange = sheet.getRange(2, 1, numAlumnos, 1);
    alumnosRange.setBackground("#f3f3f3");
    
    // Columna Observaciones adicionales: ajuste de texto y alineación vertical arriba
    const observacionesRange = sheet.getRange(2, 9, numAlumnos, 1);
    observacionesRange.setWrap(true);
    observacionesRange.setVerticalAlignment("top");
  } catch(e) {
    Logger.log('observaciones_applyColumnFormatting: ' + e);
  }
}

/**
 * Aplica bordes a todas las celdas del rango de datos (headers + alumnos).
 * @param {Sheet} sheet
 * @param {number} numAlumnos
 * @param {number} numColumns
 */
function observaciones_applyBorders(sheet, numAlumnos, numColumns) {
  if (!sheet || numAlumnos <= 0) return;
  
  try {
    // Aplicar bordes a todo el rango (header + datos)
    const range = sheet.getRange(1, 1, numAlumnos + 1, numColumns);
    range.setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID);
  } catch(e) {
    Logger.log('observaciones_applyBorders: ' + e);
  }
}

/**
 * Aplica alineación a la izquierda para headers y columna de observaciones adicionales.
 * @param {Sheet} sheet
 * @param {number} numAlumnos
 * @param {number} numColumns
 */
function observaciones_applyAlignment(sheet, numAlumnos, numColumns) {
  if (!sheet || numAlumnos <= 0) return;
  
  try {
    // Headers: alinear a la izquierda
    const headerRange = sheet.getRange(1, 1, 1, numColumns);
    headerRange.setHorizontalAlignment("left");
    
    // Columna Observaciones adicionales (columna 9): alinear a la izquierda
    const observacionesRange = sheet.getRange(2, 9, numAlumnos, 1);
    observacionesRange.setHorizontalAlignment("left");
  } catch(e) {
    Logger.log('observaciones_applyAlignment: ' + e);
  }
}

/**
 * Protege headers y columna de alumnos con advertencia (permite editar tras confirmar).
 * Esto previene ediciones accidentales pero permite cambios deliberados.
 * @param {Sheet} sheet
 * @param {number} numAlumnos
 * @param {number} numColumns - Total de columnas
 */
function observaciones_protectHeadersAndAlumnos(sheet, numAlumnos, numColumns) {
  if (!sheet) return;
  
  try {
    // Limpiar protecciones previas
    const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
    protections.forEach(protection => protection.remove());
    
    // 1. Proteger headers (fila 1, todas las columnas)
    const headersRange = sheet.getRange(1, 1, 1, numColumns);
    const headersProtection = headersRange.protect()
      .setDescription('Headers - Estructura generada automáticamente');
    headersProtection.setWarningOnly(true);
    
    // 2. Proteger columna Alumno (filas 2+)
    if (numAlumnos > 0) {
      const alumnosRange = sheet.getRange(2, 1, numAlumnos, 1);
      const alumnosProtection = alumnosRange.protect()
        .setDescription('Nombres de alumnos - Se sincronizan automáticamente con el listado');
      alumnosProtection.setWarningOnly(true);
    }
    
  } catch(e) {
    Logger.log('observaciones_protectHeadersAndAlumnos: ' + e);
  }
}

/**
 * Aplica formato completo a una fila individual de alumno.
 * Útil cuando se inserta un nuevo alumno en medio de la hoja.
 * @param {Sheet} sheet
 * @param {number} row - Número de fila a formatear
 * @param {number} numColumns - Número total de columnas
 */
function observaciones_applyRowFormatting(sheet, row, numColumns) {
  if (!sheet || row < 2) return;
  
  try {
    // Columna Alumno: fondo gris claro
    sheet.getRange(row, 1).setBackground("#f3f3f3");
    
    // Columna Observaciones adicionales: ajuste de texto y alineación
    const obsCol = 9;
    if (obsCol <= numColumns) {
      sheet.getRange(row, obsCol)
        .setWrap(true)
        .setVerticalAlignment("top")
        .setHorizontalAlignment("left");
    }
    
    // Validación de datos para columnas numéricas (2-8)
    const numericColumns = observaciones_getNumericColumns();
    const rule = SpreadsheetApp.newDataValidation()
      .requireNumberGreaterThanOrEqualTo(0)
      .setAllowInvalid(false)
      .setHelpText('Solo números enteros positivos (0 o mayor)')
      .build();
    
    numericColumns.forEach(col => {
      if (col <= numColumns) {
        sheet.getRange(row, col).setDataValidation(rule);
      }
    });
    
    // Bordes
    sheet.getRange(row, 1, 1, numColumns)
      .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID);
      
  } catch(e) {
    Logger.log('observaciones_applyRowFormatting: ' + e);
  }
}
