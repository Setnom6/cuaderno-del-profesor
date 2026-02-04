/**
 * medias_continua.gs
 * Construye la hoja mediasContinua que calcula medias acumuladas
 * de todas las hojas de calificaciones existentes (1, 2, 3).
 */

/**
 * Construye la hoja mediasContinua basándose en todas las hojas de calificaciones existentes.
 * Reutiliza la lógica de mediasN pero referencia múltiples hojas.
 * @param {Array<Array<string>>} alumnos - Lista de alumnos [[nombre1], [nombre2], ...]
 * @param {Sheet} sheetCriteria - Hoja "criterios"
 * @param {Object<string, string>} claveToColor - Mapa clave -> color
 * @returns {Sheet} La hoja mediasContinua creada
 */
function buildMediasContinua(alumnos, sheetCriteria, claveToColor) {
  const ss = SpreadsheetApp.getActive();
  const hojaMediasName = "mediasContinua";

  // Detectar qué hojas de calificaciones existen
  const califSheets = [];
  for (let n = 1; n <= 3; n++) {
    const sheet = ss.getSheetByName("calificaciones" + n);
    if (sheet) {
      califSheets.push({ n: n, sheet: sheet });
    }
  }

  // Si no hay ninguna hoja de calificaciones, no crear mediasContinua
  if (califSheets.length === 0) {
    return null;
  }

  // DELETE and recreate sheet
  let sheetMedias = ss.getSheetByName(hojaMediasName);
  if (sheetMedias) ss.deleteSheet(sheetMedias);
  sheetMedias = ss.insertSheet(hojaMediasName);

  // ========== FASE 1: LECTURA DE DATOS ==========
  const clavesLista = medias_readClavesFromCriteria(sheetCriteria);
  
  // Construir mapa de criterio -> columnas para CADA hoja de calificaciones
  const criterioToColumnsBySheet = califSheets.map(cs => ({
    n: cs.n,
    map: medias_getCriterioColumnMap(cs.sheet, clavesLista)
  }));
  
  const competenciaToClaves = medias_groupClavesByCompetencia(clavesLista);
  const competencias = Object.keys(competenciaToClaves);
  const competenciasInfo = medias_readCompetenciasInfo(sheetCriteria, clavesLista);

  // ========== FASE 2: CONSTRUCCIÓN DE HEADERS ==========
  const mediasHeaders = ["Alumno", "Media Final", ...clavesLista];
  sheetMedias.getRange(1, 1, 1, mediasHeaders.length).setValues([mediasHeaders]);
  
  // Escribir headers de competencias (columnas ocultas)
  if (competenciasInfo.length > 0) {
    const colCompStart = 3 + clavesLista.length;
    const competenciaHeaders = competenciasInfo.map(comp => `${comp.indice} - ${comp.nombre}`);
    sheetMedias.getRange(1, colCompStart, 1, competenciaHeaders.length).setValues([competenciaHeaders]);
  }

  // ========== FASE 3: ESCRITURA DE ALUMNOS ==========
  if (alumnos.length > 0) {
    sheetMedias.getRange(2, 1, alumnos.length, 1).setValues(alumnos);
  }

  // ========== FASE 4: CONSTRUCCIÓN DE FÓRMULAS ==========
  if (alumnos.length > 0) {
    for (let iAlumno = 0; iAlumno < alumnos.length; iAlumno++) {
      const rowMedias = 2 + iAlumno;
      const rowCalif  = 3 + iAlumno;

      // ===== MEDIA FINAL CON COLUMNAS AUXILIARES =====
      if (competencias.length > 0) {
        const colCompStart = 3 + clavesLista.length;
        const compCols = [];

        competencias.forEach((comp, i) => {
          const col = colCompStart + i;
          compCols.push(col);

          const formula = medias_buildCompetenciaFormula(
            competenciaToClaves[comp],
            clavesLista,
            rowMedias
          );
          setFormula(sheetMedias, rowMedias, col, formula);
        });

        const formulaFinal = medias_buildMediaFinalFormula(colCompStart, competencias.length, rowMedias);
        setFormula(sheetMedias, rowMedias, 2, formulaFinal);

        if (rowMedias === 2) {
          sheetMedias.hideColumns(colCompStart, competencias.length);
        }
      } else {
        sheetMedias.getRange(rowMedias, 2).setValue("");
      }

      // ===== MEDIA POR CRITERIO (col 3 en adelante) - TODAS LAS HOJAS =====
      for (let j = 0; j < clavesLista.length; j++) {
        const clave = clavesLista[j];
        const colMedias = 3 + j;
        
        // Construir fórmula que promedia de TODAS las hojas de calificaciones
        const formula = mediasContinua_buildCriterioFormula(clave, criterioToColumnsBySheet, rowCalif);
        
        if (formula) {
          setFormula(sheetMedias, rowMedias, colMedias, formula);
        } else {
          sheetMedias.getRange(rowMedias, colMedias).setValue("");
        }
      }
    }

    // ===== Fila de resumen (media de todos los alumnos) =====
    const summaryRow = 2 + alumnos.length;
    try {
      sheetMedias.getRange(summaryRow, 1).setValue("Medias");
      const totalHeaders = mediasHeaders.length + competenciasInfo.length;
      for (let col = 2; col <= totalHeaders; col++) {
        const colLetter = columnToLetter(col);
        const rango = `${colLetter}2:${colLetter}${summaryRow - 1}`;
        const formula = `=IFERROR(AVERAGEIF(${rango};"<>");"")`;
        setFormula(sheetMedias, summaryRow, col, formula);
      }
    } catch (e) {
      Logger.log('buildMediasContinua (summaryRow): ' + e);
    }
  }

  // ========== FASE 5: FORMATO ==========
  const totalHeaders = mediasHeaders.length + competenciasInfo.length;
  applyHeaderFormatting(sheetMedias, 1, 1, 1, totalHeaders);

  medias_applyColorsByClave(sheetMedias, clavesLista, alumnos.length, claveToColor);

  if (competenciasInfo.length > 0) {
    const colCompStart = 3 + clavesLista.length;
    medias_applyCompetenciaColors(sheetMedias, competenciasInfo, colCompStart, alumnos.length);
  }

  if (competenciasInfo.length > 0 && clavesLista.length > 0) {
    const colLastCriterio = 2 + clavesLista.length;
    medias_applySeparatorBorder(sheetMedias, colLastCriterio, alumnos.length + 1);
  }

  if (alumnos.length > 0) {
    medias_applyMediaFinalFormat(sheetMedias, alumnos.length + 1);
  }

  if (alumnos.length > 0) {
    medias_applySummaryRowBorder(sheetMedias, 2 + alumnos.length, totalHeaders);
  }

  medias_applyColumnWidths(sheetMedias, alumnos, clavesLista, competenciasInfo);

  if (alumnos.length > 0 && totalHeaders > 2) {
    applyDecimalFormat(sheetMedias, 2, 2, alumnos.length + 1, totalHeaders - 1, 2);
  }

  if (alumnos.length > 0) {
    medias_applyConditionalFormatting(sheetMedias, alumnos.length);
  }

  if (alumnos.length > 0) {
    medias_applyAlumnosColumnShading(sheetMedias, alumnos.length);
  }

  freezeRows(sheetMedias, 1);
  freezeColumns(sheetMedias, 2);
  
  if (alumnos.length > 0) {
    const summaryRow = 2 + alumnos.length;
    const maxRows = sheetMedias.getMaxRows();
    if (maxRows > summaryRow) {
      sheetMedias.deleteRows(summaryRow + 1, maxRows - summaryRow);
    }
  }
  
  if (alumnos.length > 0) {
    const numRows = 2 + alumnos.length;
    medias_protectSheet(sheetMedias, numRows, totalHeaders);
  }

  return sheetMedias;
}

/**
 * Construye la fórmula de media por criterio que busca en TODAS las hojas de calificaciones.
 * @param {string} clave - Clave del criterio
 * @param {Array<{n: number, map: Object}>} criterioToColumnsBySheet - Mapas por hoja
 * @param {number} rowCalif - Fila del alumno en calificaciones (3, 4, ...)
 * @returns {string} - Fórmula o ""
 */
function mediasContinua_buildCriterioFormula(clave, criterioToColumnsBySheet, rowCalif) {
  const celdas = [];
  
  for (const sheetInfo of criterioToColumnsBySheet) {
    const columnas = sheetInfo.map[clave];
    if (columnas && columnas.length > 0) {
      for (const col of columnas) {
        const colLetter = columnToLetter(col);
        celdas.push(`'calificaciones${sheetInfo.n}'!${colLetter}${rowCalif}`);
      }
    }
  }
  
  if (celdas.length === 0) {
    return "";
  }
  
  return `=IFERROR(AVERAGE(${celdas.join(";")}); "")`;
}
