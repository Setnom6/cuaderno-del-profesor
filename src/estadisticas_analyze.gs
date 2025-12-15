/**
 * estadisticas_analyze.gs
 * Implementa los diferentes tipos de análisis disponibles.
 */

/**
 * Análisis A: Media por instrumentos seleccionados.
 * Muestra media general de todos los alumnos para cada instrumento seleccionado.
 * @param {Sheet} sheet - Hoja estadísticas
 * @param {Array<string>} instrumentosSeleccionados - Lista de instrumentos como "Nombre (Tn)"
 */
function analisis_mediaInstrumentos(sheet, instrumentosSeleccionados) {
  if (!instrumentosSeleccionados || instrumentosSeleccionados.length === 0) {
    sheet.getRange('A20').setValue('⚠️ Debe seleccionar al menos un instrumento');
    return;
  }
  
  try {
    const ss = SpreadsheetApp.getActive();
    
    // Headers
    sheet.getRange('A20').setValue('MEDIA POR INSTRUMENTOS SELECCIONADOS');
    sheet.getRange('A20').setFontSize(12).setFontWeight('bold');
    
    sheet.getRange('A21').setValue('Instrumento');
    sheet.getRange('B21').setValue('Media General');
    sheet.getRange('A21:B21').setFontWeight('bold').setBackground('#CCCCCC');
    
    let row = 22;
    
    // Procesar cada instrumento seleccionado
    instrumentosSeleccionados.forEach(instrumento => {
      const match = instrumento.match(/^(.+?)\s+\(T(\d+)\)$/);
      if (!match) return;
      
      const instrNombre = match[1];
      const trimestre = match[2];
      
      const sheetCalif = ss.getSheetByName(`calificaciones${trimestre}`);
      if (!sheetCalif) return;
      
      // Encontrar columna de Media del instrumento
      const headers1 = sheetCalif.getRange(1, 1, 1, sheetCalif.getLastColumn()).getValues()[0];
      let mediaCol = -1;
      
      for (let col = 0; col < headers1.length; col++) {
        if (headers1[col]?.toString().trim() === instrNombre) {
          // Buscar columna Media (columna siguiente con criterios.length + 1)
          // En estructura de calificaciones, Media está después de los criterios del instrumento
          // Simplificado: buscar la siguiente columna no vacía o con borde
          mediaCol = col + 2; // Aproximación: generalmente está 2 columnas después
          break;
        }
      }
      
      if (mediaCol <= 0 || mediaCol > sheetCalif.getLastColumn()) {
        // Intentar búsqueda más robusta
        const headerRow2 = sheetCalif.getRange(2, 1, 1, sheetCalif.getLastColumn()).getValues()[0];
        for (let col = 0; col < headerRow2.length; col++) {
          if (headerRow2[col]?.toString().trim() === 'Media' || 
              headers1[col]?.toString().includes('Media')) {
            mediaCol = col + 1;
            break;
          }
        }
      }
      
      if (mediaCol > 0) {
        // Calcular media de la columna Media (filas 3 en adelante)
        const numAlumnos = sheetCalif.getLastRow() - 2;
        if (numAlumnos > 0) {
          const mediaValues = sheetCalif.getRange(3, mediaCol, numAlumnos, 1).getValues();
          const suma = mediaValues.reduce((acc, cell) => {
            const val = parseFloat(cell[0]);
            return acc + (isNaN(val) ? 0 : val);
          }, 0);
          const mediaGeneral = (suma / numAlumnos).toFixed(2);
          
          sheet.getRange(row, 1).setValue(instrumento);
          sheet.getRange(row, 2).setValue(mediaGeneral);
          row++;
        }
      }
    });
    
    // Aplicar formato
    sheet.getRange(`A22:B${row - 1}`).setHorizontalAlignment('center');
    sheet.getRange(`B22:B${row - 1}`).setNumberFormat('0.00');
    
  } catch(e) {
    Logger.log('analisis_mediaInstrumentos: ' + e);
    sheet.getRange('A20').setValue('Error: ' + e.message);
  }
}

/**
 * Análisis B: Criterios - Evaluaciones totales.
 * Muestra cuántas veces se ha evaluado cada criterio en total y por trimestre.
 * @param {Sheet} sheet - Hoja estadísticas
 */
function analisis_criteriosEvaluaciones(sheet) {
  try {
    sheet.getRange('A20').setValue('EVALUACIONES POR CRITERIO');
    sheet.getRange('A20').setFontSize(12).setFontWeight('bold');
    
    sheet.getRange('A21').setValue('Criterio');
    sheet.getRange('B21').setValue('T1');
    sheet.getRange('C21').setValue('T2');
    sheet.getRange('D21').setValue('T3');
    sheet.getRange('E21').setValue('Total');
    sheet.getRange('A21:E21').setFontWeight('bold').setBackground('#CCCCCC');
    
    const ss = SpreadsheetApp.getActive();
    const criteriosMap = {}; // clave -> {t1, t2, t3}
    
    // Recorrer calificaciones1, 2, 3
    for (let trimestre = 1; trimestre <= 3; trimestre++) {
      const sheetCalif = ss.getSheetByName(`calificaciones${trimestre}`);
      if (!sheetCalif) continue;
      
      // Leer fila 2 (claves de criterios)
      const claves = sheetCalif.getRange(2, 1, 1, sheetCalif.getLastColumn()).getValues()[0];
      
      claves.forEach((clave, idx) => {
        const claveStr = clave?.toString().trim() || '';
        if (claveStr && claveStr !== 'Alumno' && !claveStr.startsWith('Alumno')) {
          if (!criteriosMap[claveStr]) {
            criteriosMap[claveStr] = { t1: 0, t2: 0, t3: 0 };
          }
          criteriosMap[claveStr][`t${trimestre}`]++;
        }
      });
    }
    
    // Escribir resultados
    let row = 22;
    Object.keys(criteriosMap).sort().forEach(clave => {
      const datos = criteriosMap[clave];
      const total = datos.t1 + datos.t2 + datos.t3;
      
      sheet.getRange(row, 1).setValue(clave);
      sheet.getRange(row, 2).setValue(datos.t1);
      sheet.getRange(row, 3).setValue(datos.t2);
      sheet.getRange(row, 4).setValue(datos.t3);
      sheet.getRange(row, 5).setValue(total);
      row++;
    });
    
    // Formato
    sheet.getRange(`A22:E${row - 1}`).setHorizontalAlignment('center');
    
  } catch(e) {
    Logger.log('analisis_criteriosEvaluaciones: ' + e);
    sheet.getRange('A20').setValue('Error: ' + e.message);
  }
}

/**
 * Análisis C: Alumno - Notas por criterio en los 3 trimestres.
 * @param {Sheet} sheet - Hoja estadísticas
 * @param {string} alumnoSeleccionado - Nombre del alumno
 */
function analisis_alumnoNotas(sheet, alumnoSeleccionado) {
  if (!alumnoSeleccionado || alumnoSeleccionado.trim() === '') {
    sheet.getRange('A20').setValue('⚠️ Debe seleccionar un alumno');
    return;
  }
  
  try {
    const ss = SpreadsheetApp.getActive();
    
    sheet.getRange('A20').setValue(`NOTAS DE ${alumnoSeleccionado.toUpperCase()} POR CRITERIO`);
    sheet.getRange('A20').setFontSize(12).setFontWeight('bold');
    
    sheet.getRange('A21').setValue('Criterio');
    sheet.getRange('B21').setValue('T1');
    sheet.getRange('C21').setValue('T2');
    sheet.getRange('D21').setValue('T3');
    sheet.getRange('E21').setValue('Promedio');
    sheet.getRange('A21:E21').setFontWeight('bold').setBackground('#CCCCCC');
    
    const notasMap = {}; // clave -> {t1, t2, t3}
    
    // Buscar alumno en cada trimestre
    for (let trimestre = 1; trimestre <= 3; trimestre++) {
      const sheetCalif = ss.getSheetByName(`calificaciones${trimestre}`);
      if (!sheetCalif) continue;
      
      // Buscar fila del alumno
      const alumnosCol = sheetCalif.getRange(3, 1, sheetCalif.getLastRow() - 2, 1).getValues();
      let alumnoRow = -1;
      
      for (let i = 0; i < alumnosCol.length; i++) {
        if (alumnosCol[i][0]?.toString().trim() === alumnoSeleccionado) {
          alumnoRow = 3 + i;
          break;
        }
      }
      
      if (alumnoRow <= 0) continue;
      
      // Leer claves (fila 2) y notas del alumno
      const claves = sheetCalif.getRange(2, 1, 1, sheetCalif.getLastColumn()).getValues()[0];
      const notas = sheetCalif.getRange(alumnoRow, 1, 1, sheetCalif.getLastColumn()).getValues()[0];
      
      claves.forEach((clave, idx) => {
        const claveStr = clave?.toString().trim() || '';
        if (claveStr && claveStr !== 'Alumno' && !claveStr.startsWith('Alumno')) {
          if (!notasMap[claveStr]) {
            notasMap[claveStr] = { t1: null, t2: null, t3: null };
          }
          const nota = parseFloat(notas[idx]);
          if (!isNaN(nota)) {
            notasMap[claveStr][`t${trimestre}`] = nota;
          }
        }
      });
    }
    
    // Escribir resultados
    let row = 22;
    Object.keys(notasMap).sort().forEach(clave => {
      const notas = notasMap[clave];
      const validos = [notas.t1, notas.t2, notas.t3].filter(n => n !== null);
      const promedio = validos.length > 0 
        ? (validos.reduce((a, b) => a + b, 0) / validos.length).toFixed(2)
        : '';
      
      sheet.getRange(row, 1).setValue(clave);
      sheet.getRange(row, 2).setValue(notas.t1 !== null ? notas.t1 : '');
      sheet.getRange(row, 3).setValue(notas.t2 !== null ? notas.t2 : '');
      sheet.getRange(row, 4).setValue(notas.t3 !== null ? notas.t3 : '');
      sheet.getRange(row, 5).setValue(promedio);
      row++;
    });
    
    // Formato
    sheet.getRange(`A22:E${row - 1}`).setHorizontalAlignment('center');
    sheet.getRange(`B22:E${row - 1}`).setNumberFormat('0.00');
    
  } catch(e) {
    Logger.log('analisis_alumnoNotas: ' + e);
    sheet.getRange('A20').setValue('Error: ' + e.message);
  }
}

/**
 * Análisis D: Dashboard - Resumen general.
 * Muestra estadísticas generales de la clase.
 * @param {Sheet} sheet - Hoja estadísticas
 */
function analisis_dashboardGeneral(sheet) {
  try {
    sheet.getRange('A20').setValue('DASHBOARD - RESUMEN GENERAL');
    sheet.getRange('A20').setFontSize(12).setFontWeight('bold');
    
    const ss = SpreadsheetApp.getActive();
    let row = 21;
    
    // Estadísticas por trimestre
    for (let trimestre = 1; trimestre <= 3; trimestre++) {
      const sheetMedias = ss.getSheetByName(`medias${trimestre}`);
      const sheetCalif = ss.getSheetByName(`calificaciones${trimestre}`);
      
      if (!sheetMedias || !sheetCalif) continue;
      
      const numAlumnos = sheetCalif.getLastRow() - 2;
      
      sheet.getRange(row, 1).setValue(`TRIMESTRE ${trimestre}`);
      sheet.getRange(row, 1).setFontWeight('bold').setBackground('#E8F4F8');
      
      sheet.getRange(row + 1, 1).setValue('Alumnos evaluados:');
      sheet.getRange(row + 1, 2).setValue(numAlumnos);
      
      // Media Final general
      if (numAlumnos > 0) {
        const mediaFinalCol = 2; // Col B en mediasN
        const mediaValues = sheetMedias.getRange(2, mediaFinalCol, numAlumnos, 1).getValues();
        const suma = mediaValues.reduce((acc, cell) => {
          const val = parseFloat(cell[0]);
          return acc + (isNaN(val) ? 0 : val);
        }, 0);
        const mediaGeneral = (suma / numAlumnos).toFixed(2);
        
        sheet.getRange(row + 2, 1).setValue('Media Final Clase:');
        sheet.getRange(row + 2, 2).setValue(mediaGeneral);
        sheet.getRange(row + 2, 2).setNumberFormat('0.00');
        
        // Contar suspensos (< 5)
        const suspensos = mediaValues.filter(cell => parseFloat(cell[0]) < 5).length;
        sheet.getRange(row + 3, 1).setValue('Alumnos con Media < 5:');
        sheet.getRange(row + 3, 2).setValue(suspensos);
      }
      
      row += 5;
    }
    
  } catch(e) {
    Logger.log('analisis_dashboardGeneral: ' + e);
    sheet.getRange('A20').setValue('Error: ' + e.message);
  }
}
