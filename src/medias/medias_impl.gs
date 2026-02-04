/**
 * medias_impl.gs
 * Orquesta la construcción de la hoja mediasN.
 * Delega lectura de datos a medias_data.gs y formato a medias_format.gs.
 */

/**
 * Construye la hoja mediasN basándose en sheetCalif y en la lista de claves de criterios.
 * Media Final = media entre medias por competencia (columnas auxiliares ocultas).
 * @param {number} n - Número del trimestre
 * @param {Sheet} sheetCalif - Hoja calificacionesN
 * @param {Array<Array<string>>} alumnos - Lista de alumnos [[nombre1], [nombre2], ...]
 * @param {Sheet} sheetCriteria - Hoja "criterios"
 * @param {Object<string, string>} claveToColor - Mapa clave -> color
 * @returns {Sheet} La hoja mediasN creada
 */
function buildMediasImpl(n, sheetCalif, alumnos, sheetCriteria, claveToColor) {
  const ss = SpreadsheetApp.getActive();
  const hojaMediasName = "medias" + n;

  // DELETE and recreate sheet
  let sheetMedias = ss.getSheetByName(hojaMediasName);
  if (sheetMedias) ss.deleteSheet(sheetMedias);
  sheetMedias = ss.insertSheet(hojaMediasName);

  // ========== FASE 1: LECTURA DE DATOS ==========
  const clavesLista = medias_readClavesFromCriteria(sheetCriteria);
  const criterioToColumns = medias_getCriterioColumnMap(sheetCalif, clavesLista);
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
        // Columna donde empezarán las medias por competencia
        const colCompStart = 3 + clavesLista.length;
        const compCols = [];

        // Crear fórmulas para cada competencia
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

        // Fórmula de media final
        const formulaFinal = medias_buildMediaFinalFormula(colCompStart, competencias.length, rowMedias);
        setFormula(sheetMedias, rowMedias, 2, formulaFinal);

        // Ocultar columnas auxiliares (solo una vez)
        if (rowMedias === 2) {
          sheetMedias.hideColumns(colCompStart, competencias.length);
        }
      } else {
        sheetMedias.getRange(rowMedias, 2).setValue("");
      }

      // ===== MEDIA POR CRITERIO (col 3 en adelante) =====
      for (let j = 0; j < clavesLista.length; j++) {
        const clave = clavesLista[j];
        const colMedias = 3 + j;
        const columnasCriterio = criterioToColumns[clave];

        if (columnasCriterio && columnasCriterio.length > 0) {
          const formula = medias_buildCriterioFormula(n, columnasCriterio, rowCalif);
          setFormula(sheetMedias, rowMedias, colMedias, formula);
        } else {
          sheetMedias.getRange(rowMedias, colMedias).setValue("");
        }
      }
    }

    // ===== Fila de resumen (media de todos los alumnos) =====
    const summaryRow = 2 + alumnos.length;
    try {
      // Etiqueta en primera columna
      sheetMedias.getRange(summaryRow, 1).setValue("Medias");
      // Calcular medias por columna para columnas 2..totalHeaders
      const totalHeaders = mediasHeaders.length + competenciasInfo.length;
      for (let col = 2; col <= totalHeaders; col++) {
        const colLetter = columnToLetter(col);
        const rango = `${colLetter}2:${colLetter}${summaryRow - 1}`;
        const formula = `=IFERROR(AVERAGEIF(${rango};"<>");"")`;
        setFormula(sheetMedias, summaryRow, col, formula);
      }
    } catch (e) {
      Logger.log('buildMediasImpl (summaryRow): ' + e);
    }
  }

  // ========== FASE 5: FORMATO ==========
  // Formato general del header (incluyendo competencias)
  const totalHeaders = mediasHeaders.length + competenciasInfo.length;
  applyHeaderFormatting(sheetMedias, 1, 1, 1, totalHeaders);

  // Colores por clave
  medias_applyColorsByClave(sheetMedias, clavesLista, alumnos.length, claveToColor);

  // Colores por competencia
  if (competenciasInfo.length > 0) {
    const colCompStart = 3 + clavesLista.length;
    medias_applyCompetenciaColors(sheetMedias, competenciasInfo, colCompStart, alumnos.length);
  }

  // Borde separador entre criterios y competencias (incluir fila resumen)
  if (competenciasInfo.length > 0 && clavesLista.length > 0) {
    const colLastCriterio = 2 + clavesLista.length;
    medias_applySeparatorBorder(sheetMedias, colLastCriterio, alumnos.length + 1);
  }

  // Formato especial para Media Final (incluir fila resumen)
  if (alumnos.length > 0) {
    medias_applyMediaFinalFormat(sheetMedias, alumnos.length + 1);
  }

  // Borde grueso separador para fila de resumen
  if (alumnos.length > 0) {
    medias_applySummaryRowBorder(sheetMedias, 2 + alumnos.length, totalHeaders);
  }

  // Anchos de columna
  medias_applyColumnWidths(sheetMedias, alumnos, clavesLista, competenciasInfo);

  // Formato decimal (2 decimales) - incluyendo competencias y fila resumen
  if (alumnos.length > 0 && totalHeaders > 2) {
    applyDecimalFormat(sheetMedias, 2, 2, alumnos.length + 1, totalHeaders - 1, 2);
  }

  // Formato condicional (rojo si <5)
  if (alumnos.length > 0) {
    medias_applyConditionalFormatting(sheetMedias, alumnos.length);
  }

  // Sombreado gris a columna de alumnos
  if (alumnos.length > 0) {
    medias_applyAlumnosColumnShading(sheetMedias, alumnos.length);
  }

  // Freeze primera fila y primera columna (Alumno y Media Final siempre visibles)
  freezeRows(sheetMedias, 1);
  freezeColumns(sheetMedias, 2);
  
  // Eliminar filas sobrantes por debajo de la fila Medias
  if (alumnos.length > 0) {
    const summaryRow = 2 + alumnos.length;
    const maxRows = sheetMedias.getMaxRows();
    if (maxRows > summaryRow) {
      sheetMedias.deleteRows(summaryRow + 1, maxRows - summaryRow);
    }
  }
  
  // Proteger toda la hoja con advertencia
  if (alumnos.length > 0) {
    const numRows = 2 + alumnos.length; // header + alumnos + resumen
    medias_protectSheet(sheetMedias, numRows, totalHeaders);
  }
  
  // Activar la hoja medias y crear menú
  sheetMedias.activate();
  createMediasMenu();

  return sheetMedias;
}
