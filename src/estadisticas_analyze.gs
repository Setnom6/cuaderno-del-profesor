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
    
    // Limpiar área de resultados
    sheet.getRange('A100:Z200').clearContent();
    
    // Leer instrumentos seleccionados (celdas A4 hacia abajo con X en columna B)
    const instrumentosSeleccionados = [];
    let row = 4;
    while (row < 100) {
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
      
      // Para cada instrumento, buscar su valor en mediasN
      instrumentosSeleccionados.forEach(instrumento => {
        // Extraer trimestre del instrumento (ej: "Prueba escrita T1" -> 1)
        const matchTrimestre = instrumento.match(/T(\d)/);
        if (!matchTrimestre) {
          fila.push('N/A');
          return;
        }
        
        const trimestre = matchTrimestre[1];
        const sheetMedias = ss.getSheetByName(`medias${trimestre}`);
        
        if (!sheetMedias) {
          fila.push('N/A');
          return;
        }
        
        // Buscar alumno en mediasN y obtener valor del instrumento
        const valor = buscarValorAlumnoEnHoja(sheetMedias, alumno, instrumento);
        fila.push(valor !== null ? (typeof valor === 'number' ? valor.toFixed(2) : valor) : 'N/A');
        
        if (typeof valor === 'number') {
          valoresNumricos.push(valor);
        }
      });
      
      // Calcular media
      let media = 'N/A';
      if (valoresNumricos.length > 0) {
        media = (valoresNumricos.reduce((a, b) => a + b) / valoresNumricos.length).toFixed(2);
      }
      
      fila.push(media);
      resultados.push(fila);
    });
    
    // Escribir resultados a partir de fila 100
    const resultRange = sheet.getRange(100, 1, resultados.length, resultados[0].length);
    resultRange.setValues(resultados);
    
    // Formatear header
    sheet.getRange(100, 1, 1, resultados[0].length)
      .setFontWeight('bold')
      .setBackground('#CCCCCC');
    
    // Formatear columna MEDIA en negrita
    const ultimaCol = resultados[0].length;
    sheet.getRange(101, ultimaCol, resultados.length - 1, 1)
      .setFontWeight('bold');
    
    // Formatear números
    sheet.getRange(101, 2, resultados.length - 1, ultimaCol - 2)
      .setNumberFormat('0.00');
    
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
function buscarValorAlumnoEnHoja(sheetMedias, alumno, instrumento) {
  try {
    // Leer headers (fila 1)
    const headers = sheetMedias.getRange(1, 1, 1, sheetMedias.getLastColumn()).getValues()[0];
    
    // Extraer nombre del instrumento sin trimestre
      const instrNombre = instrumento.replace(/\s*\(T\d\)/, '').trim();
    
    // Buscar columna del instrumento
    let colInstrumento = -1;
    for (let col = 0; col < headers.length; col++) {
      const header = headers[col] ? headers[col].toString().trim() : '';
      if (header === instrNombre) {
        colInstrumento = col;
        break;
      }
    }
    
    if (colInstrumento === -1) return null;
    
    // Buscar fila del alumno
    const alumnos = sheetMedias.getRange(2, 1, sheetMedias.getLastRow() - 1, 1).getValues();
    for (let row = 0; row < alumnos.length; row++) {
      const alumnoFila = alumnos[row][0] ? alumnos[row][0].toString().trim() : '';
      if (alumnoFila === alumno) {
        // Leer valor
        const valor = sheetMedias.getRange(row + 2, colInstrumento + 1).getValue();
        const numValue = parseFloat(valor);
        return isNaN(numValue) ? null : numValue;
      }
    }
    
    return null;
  } catch(e) {
    Logger.log('buscarValorAlumnoEnHoja error: ' + e);
    return null;
  }
}
