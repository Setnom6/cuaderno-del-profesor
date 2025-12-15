/**
 * estadisticas_analyze.gs
 * Genera el análisis de Media por Instrumentos para todos los alumnos.
 */

/**
 * Genera tabla de media por instrumentos seleccionados para todos los alumnos.
 * @param {Sheet} sheet - Hoja estadísticas
 */
function estadisticas_generateAnalysis(sheet) {
  try {
    const ss = SpreadsheetApp.getActive();
    
    // Encontrar el último instrumento listado (col A, desde fila 4)
    let listaStartRow = 4;
    let lastInstRow = listaStartRow - 1;
    while (true) {
      const val = sheet.getRange(lastInstRow + 1, 1).getValue();
      if (val && val.toString().trim() !== '') {
        lastInstRow++;
      } else {
        break;
      }
    }
    const resultStartRow = Math.max(lastInstRow + 2, listaStartRow + 2); // dejar una fila en blanco
    
    // Limpiar área de resultados dinámica
    try {
      const maxRows = sheet.getMaxRows();
      sheet.getRange(resultStartRow, 1, Math.max(0, maxRows - resultStartRow + 1), 26).clearContent();
    } catch(e) {}
    
    // Leer instrumentos seleccionados (celdas A4 hacia abajo con X en columna B)
    const instrumentosSeleccionados = [];
    let row = 4;
    while (true) {
      const valor = sheet.getRange(row, 1).getValue();
      if (!valor || valor.toString().trim() === '') break;
      
      const marca = sheet.getRange(row, 2).getValue();
      if (marca && marca.toString().trim().toUpperCase() === 'X') {
        instrumentosSeleccionados.push(valor.toString().trim());
      }
      row++;
    }
    
    if (instrumentosSeleccionados.length === 0) {
      sheet.getRange('A100').setValue('⚠️ No hay instrumentos seleccionados. Marca al menos uno con X en columna B');
      return;
    }
    
    // Obtener lista de alumnos desde calificaciones1
    const sheetCalif = ss.getSheetByName('calificaciones1');
    if (!sheetCalif) {
      sheet.getRange('A100').setValue('❌ Error: No encontrada hoja calificaciones1');
      return;
    }
    
    // Leer alumnos (columna A, desde fila 3)
    const alumnos = [];
    let alumRow = 3;
    while (alumRow <= sheetCalif.getLastRow()) {
      const alumno = sheetCalif.getRange(alumRow, 1).getValue();
      if (!alumno || alumno.toString().trim() === '') break;
      alumnos.push(alumno.toString().trim());
      alumRow++;
    }
    
    if (alumnos.length === 0) {
      sheet.getRange('A100').setValue('❌ Error: No se encontraron alumnos en calificaciones1');
      return;
    }
    
    // Construir tabla de resultados
    const resultados = [];
    resultados.push(['Alumno', ...instrumentosSeleccionados, 'MEDIA']);
    
    alumnos.forEach(alumno => {
      const fila = [alumno];
      const valoresNumricos = [];
      
      // Para cada instrumento, buscar su valor en calificacionesN (columna Media del instrumento)
      instrumentosSeleccionados.forEach(instrumento => {
        // Extraer trimestre desde el sufijo (Tn) al final
        const matchTrimestre = instrumento.match(/\(T(\d)\)/);
        if (!matchTrimestre) {
          fila.push('');
          return;
        }
        
        const trimestre = matchTrimestre[1];
        const sheetCalifTrim = ss.getSheetByName(`calificaciones${trimestre}`);
        
        if (!sheetCalifTrim) {
          fila.push('');
          return;
        }
        
        // Buscar alumno en calificacionesN y obtener valor de la columna Media del instrumento
        const valor = buscarMediaInstrumentoEnCalificaciones(sheetCalifTrim, alumno, instrumento);
        if (typeof valor === 'number' && isFinite(valor)) {
          fila.push(valor);
          valoresNumricos.push(valor);
        } else {
          fila.push('');
        }
      });
      
      // Calcular media
      let media = '';
      if (valoresNumricos.length > 0) {
        media = (valoresNumricos.reduce((a, b) => a + b) / valoresNumricos.length).toFixed(2);
      }
      
      fila.push(media);
      resultados.push(fila);
    });
    
    // Escribir resultados inmediatamente debajo de la lista
    const resultRange = sheet.getRange(resultStartRow, 1, resultados.length, resultados[0].length);
    resultRange.setValues(resultados);
    
    // Formatear header
    sheet.getRange(resultStartRow, 1, 1, resultados[0].length)
      .setFontWeight('bold')
      .setBackground('#CCCCCC');
    
    // Formatear columna MEDIA en negrita
    const ultimaCol = resultados[0].length;
    sheet.getRange(resultStartRow + 1, ultimaCol, resultados.length - 1, 1)
      .setFontWeight('bold');
    
    // Formatear números
    if (resultados.length > 1 && ultimaCol > 2) {
      sheet.getRange(resultStartRow + 1, 2, resultados.length - 1, ultimaCol - 2)
        .setNumberFormat('0.00');
    }

    // Formato condicional: en la última columna (MEDIA), rojo si < 5
    if (resultados.length > 1) {
      try {
        const mediaRange = sheet.getRange(resultStartRow + 1, ultimaCol, resultados.length - 1, 1);
        const redRule = SpreadsheetApp.newConditionalFormatRule()
          .whenNumberLessThan(5)
          .setFontColor('#FF0000')
          .setRanges([mediaRange])
          .build();
        const rules = sheet.getConditionalFormatRules();
        sheet.setConditionalFormatRules(rules.concat([redRule]));
      } catch(e) {}
    }
    
  } catch(e) {
    Logger.log('estadisticas_generateAnalysis error: ' + e);
    sheet.getRange('A100').setValue('❌ Error: ' + e.toString());
  }
}

/**
 * Busca el valor de un instrumento para un alumno en una hoja de medias.
 * @param {Sheet} sheetMedias - Hoja de medias (mediasN)
 * @param {string} alumno - Nombre del alumno
 * @param {string} instrumento - Nombre del instrumento (ej: "Prueba escrita T1")
 * @returns {number|null} Valor encontrado o null
 */
function buscarMediaInstrumentoEnCalificaciones(sheetCalif, alumno, instrumento) {
  try {
    if (!sheetCalif) return null;
    const lastCol = sheetCalif.getLastColumn();
    if (lastCol < 2) return null;

    // Leer headers fila 1 y fila 2
    const headersRow1 = sheetCalif.getRange(1, 1, 1, lastCol).getValues()[0].map(v => v ? v.toString().trim() : "");
    const headersRow2 = sheetCalif.getRange(2, 1, 1, lastCol).getValues()[0].map(v => v ? v.toString().trim() : "");

    // Nombre del instrumento sin sufijo (Tn)
    const instrNombre = instrumento.replace(/\s*\(T\d\)/, '').trim();

    // Construir mapa instrumento -> columna Media
    let currentInstrument = '';
    let mediaColByInstrument = {};
    for (let c = 2; c <= lastCol; c++) { // columnas 2..last
      const h1 = headersRow1[c - 1];
      if (h1) currentInstrument = h1;
      const h2 = headersRow2[c - 1];
      if (h2 === 'Media' && currentInstrument) {
        mediaColByInstrument[currentInstrument] = c;
      }
    }

    const mediaCol = mediaColByInstrument[instrNombre];
    if (!mediaCol) return null;

    // Buscar fila del alumno (columna A, desde fila 3)
    const lastRow = sheetCalif.getLastRow();
    if (lastRow < 3) return null;
    const alumnosVals = sheetCalif.getRange(3, 1, lastRow - 2, 1).getValues();
    let foundRow = -1;
    for (let i = 0; i < alumnosVals.length; i++) {
      const name = alumnosVals[i][0] ? alumnosVals[i][0].toString().trim() : '';
      if (name === alumno) { foundRow = 3 + i; break; }
    }
    if (foundRow === -1) return null;

    const valor = sheetCalif.getRange(foundRow, mediaCol).getValue();
    // Aceptar solo números finitos. Tratar Date/strings como nulos.
    if (valor instanceof Date) return null;
    if (typeof valor === 'number' && isFinite(valor)) return valor;
    if (typeof valor === 'string') {
      const normalized = valor.replace(/,/g, '.');
      const n = parseFloat(normalized);
      return isNaN(n) ? null : n;
    }
    return null;
  } catch(e) {
    Logger.log('buscarMediaInstrumentoEnCalificaciones error: ' + e);
    return null;
  }
}
