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

  // ========== FASE 2: CONSTRUCCIÓN DE HEADERS ==========
  const mediasHeaders = ["Alumno", "Media Final", ...clavesLista];
  sheetMedias.getRange(1, 1, 1, mediasHeaders.length).setValues([mediasHeaders]);

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
  }

  // ========== FASE 5: FORMATO ==========
  // Formato general del header
  applyHeaderFormatting(sheetMedias, 1, 1, 1, mediasHeaders.length);

  // Colores por clave
  medias_applyColorsByClave(sheetMedias, clavesLista, alumnos.length, claveToColor);

  // Formato especial para Media Final
  if (alumnos.length > 0) {
    medias_applyMediaFinalFormat(sheetMedias, alumnos.length);
  }

  // Anchos de columna
  medias_applyColumnWidths(sheetMedias, alumnos, clavesLista);

  // Formato decimal (2 decimales)
  if (alumnos.length > 0 && clavesLista.length > 0) {
    applyDecimalFormat(sheetMedias, 2, 2, alumnos.length, 1 + clavesLista.length, 2);
  }

  // Formato condicional (rojo si <5)
  if (alumnos.length > 0) {
    medias_applyConditionalFormatting(sheetMedias, alumnos.length);
  }

  // Freeze primera fila
  freezeRows(sheetMedias, 1);

  return sheetMedias;
}
