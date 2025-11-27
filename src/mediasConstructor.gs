/**
 * mediasConstructor.gs
 * Construye la hoja mediasN y sus actualizaciones.
 * Contiene la función getCriterioColumnMap que calcula en qué columnas aparece cada clave.
 * Para formato llama a formatter.gs
 */

/**
 * Devuelve un objeto { clave -> [col1, col2, ...] } basado en la fila 2 (claves) de sheetCalif
 */
function getCriterioColumnMap(sheetCalif, clavesLista) {
  const result = {};
  if (!sheetCalif) return result;
  const lastCol = sheetCalif.getLastColumn();
  if (lastCol < 1) return result;

  const headerClaves = sheetCalif.getRange(2, 1, 1, lastCol).getValues()[0];

  clavesLista.forEach(clave => {
    result[clave] = [];
    for (let col = 1; col <= headerClaves.length; col++) {
      if (headerClaves[col-1] && headerClaves[col-1].toString().trim() === clave) {
        result[clave].push(col);
      }
    }
  });

  return result;
}

/**
 * Construye la hoja mediasN basándose en sheetCalif y en la lista de claves de criterios.
 * Media Final ahora = media entre medias por competencia
 */
function buildMedias(n, sheetCalif, alumnos, sheetCriteria, claveToColor) {
  const ss = SpreadsheetApp.getActive();
  const hojaMediasName = "medias" + n;

  // DELETE and recreate sheet
  let sheetMedias = ss.getSheetByName(hojaMediasName);
  if (sheetMedias) ss.deleteSheet(sheetMedias);
  sheetMedias = ss.insertSheet(hojaMediasName);

  // Read claves from sheet "criterios"
  const criteriosHdr = sheetCriteria.getRange(1,1,1,sheetCriteria.getLastColumn())
    .getValues()[0]
    .map(h => h ? h.toString().trim().toLowerCase() : "");
  const colClaveIdx = criteriosHdr.indexOf("clave"); // 0-based

  let clavesLista = [];
  if (colClaveIdx !== -1) {
    const nCrit = Math.max(0, sheetCriteria.getLastRow() - 1);
    if (nCrit > 0) {
      const vals = sheetCriteria.getRange(2, colClaveIdx+1, nCrit, 1)
        .getValues()
        .map(r => r[0] ? r[0].toString().trim() : "");
      clavesLista = vals.filter(s => s && s !== "");
    }
  } else {
    // fallback en la columna D (si no existe cabecera "clave")
    try {
      const nCrit = Math.max(0, sheetCriteria.getLastRow() - 1);
      const vals = sheetCriteria.getRange(2, 4, nCrit, 1)
        .getValues()
        .map(r => r[0] ? r[0].toString().trim() : "");
      clavesLista = vals.filter(s => s && s !== "");
    } catch(e){}
  }

  // ---------- MAP: criterio -> columnas en calificaciones ----------
  const criterioToColumns = getCriterioColumnMap(sheetCalif, clavesLista);

  // ---------- AGRUPACIÓN POR COMPETENCIA (prefijo "i" en "i.j - nombre") ----------
  const competenciaToClaves = {};
  clavesLista.forEach(clave => {
    const comp = clave.split(".")[0];  // toma la "i" de "i.j"
    if (!competenciaToClaves[comp]) competenciaToClaves[comp] = [];
    competenciaToClaves[comp].push(clave);
  });
  const competencias = Object.keys(competenciaToClaves);

  // ---------- HEADERS ----------
  const mediasHeaders = ["Alumno", "Media Final", ...clavesLista];
  sheetMedias.getRange(1, 1, 1, mediasHeaders.length).setValues([mediasHeaders]);

  // ---------- Alumnos ----------
  if (alumnos.length > 0) {
    sheetMedias.getRange(2, 1, alumnos.length, 1).setValues(alumnos);
  }

  // ---------- FORMULAS ----------
  if (alumnos.length > 0) {
    for (let iAlumno = 0; iAlumno < alumnos.length; iAlumno++) {

      const rowMedias = 2 + iAlumno;  // en hoja medias
      const rowCalif  = 3 + iAlumno;  // en hoja calificaciones

      // ===== MEDIA FINAL con columnas auxiliares =====
      if (competencias.length > 0) {

        // columna donde empezarán las medias por competencia
        let colCompStart = 3 + clavesLista.length;
        let compCols = [];

        competencias.forEach((comp, i) => {
          const col = colCompStart + i;
          compCols.push(col);

          const clavesComp = competenciaToClaves[comp];

          const refs = clavesComp.map(cl => {
            const idx = clavesLista.indexOf(cl);
            const letter = columnToLetter(3 + idx);
            return `${letter}${rowMedias}`;
          });

          if (refs.length === 0) {
            sheetMedias.getRange(rowMedias, col).setValue("");
          } else {
            sheetMedias
              .getRange(rowMedias, col)
              .setFormula(`=IFERROR(AVERAGE(${refs.join(";")}); "")`);
          }
        });

        // fórmula de la media final ignorando competencias vacías
        const firstLetter = columnToLetter(compCols[0]);
        const lastLetter  = columnToLetter(compCols[compCols.length - 1]);
        const rango = `${firstLetter}${rowMedias}:${lastLetter}${rowMedias}`;

        const formulaFinal = `=IFERROR(AVERAGEIF(${rango};"<>");"")`;
        sheetMedias.getRange(rowMedias, 2).setFormula(formulaFinal);

        // ocultar columnas auxiliares (solo una vez, no por alumno)
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

          const celdas = columnasCriterio.map(col => {
            const colLetter = columnToLetter(col);
            return `'calificaciones${n}'!${colLetter}${rowCalif}`;
          }).join(";");

          const formula = `=IFERROR(AVERAGE(${celdas}); "")`;
          sheetMedias.getRange(rowMedias, colMedias).setFormula(formula);

        } else {
          sheetMedias.getRange(rowMedias, colMedias).setValue("");
        }
      }

    } // end for alumnos
  }

  // ---------- Colores ----------
  for (let j = 0; j < clavesLista.length; j++) {
    const clave = clavesLista[j];
    const colMedias = 3 + j;
    const color = claveToColor[clave] || null;

    if (color) {
      sheetMedias.getRange(1, colMedias).setBackground(color);
      if (alumnos.length > 0) {
        sheetMedias.getRange(2, colMedias, alumnos.length, 1).setBackground(color);
      }
    }
  }

  // ---------- Formato general ----------
  sheetMedias.getRange(1, 1, 1, mediasHeaders.length)
    .setFontWeight("bold")
    .setHorizontalAlignment("center");

  if (alumnos.length > 0) {
    const mediaFinalRange = sheetMedias.getRange(1, 2, 1 + alumnos.length, 1);
    mediaFinalRange
      .setBackground("#ffffff")
      .setBorder(true, true, true, true, false, false, "#000000", SpreadsheetApp.BorderStyle.SOLID);
  }

  // ---------- Width ----------
  let maxClaveLen = 10;
  clavesLista.forEach(k => { if (k && k.length > maxClaveLen) maxClaveLen = k.length; });

  let maxNameLen = 10;
  alumnos.forEach(a => { if (a[0] && a[0].length > maxNameLen) maxNameLen = a[0].length; });

  const anchoAlumnoMedias = Math.max(200, Math.min(800, Math.round(maxNameLen * 7)));
  sheetMedias.setColumnWidth(1, anchoAlumnoMedias);

  for (let j = 0; j < clavesLista.length; j++) {
    const width = Math.max(80, Math.min(800, Math.round(clavesLista[j].length * 7)));
    sheetMedias.setColumnWidth(3 + j, width);
  }

  sheetMedias.setColumnWidth(2, 90);

  // === FORMATO DECIMAL 2 DECIMALES ===
  if (alumnos.length > 0) {
    // Media Final
    sheetMedias.getRange(2, 2, alumnos.length, 1)
      .setNumberFormat("0.00");
    
    // Medias por criterio
    sheetMedias.getRange(2, 3, alumnos.length, clavesLista.length)
      .setNumberFormat("0.00");
  }

  // === FORMATO CONDICIONAL MEDIA FINAL (<5.0 = ROJO) ===
  if (alumnos.length > 0) {
    const rule = SpreadsheetApp.newConditionalFormatRule()
      .whenNumberLessThan(5.0)
      .setFontColor("#ff0000")
      .setRanges([ sheetMedias.getRange(2, 2, alumnos.length, 1) ])
      .build();

    const rules = sheetMedias.getConditionalFormatRules();
    rules.push(rule);
    sheetMedias.setConditionalFormatRules(rules);
  }

  return sheetMedias;
}
