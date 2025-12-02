/**
 * medias_data.gs
 * Lógica de manejo de datos para la hoja mediasN.
 * Construye fórmulas de medias por criterio y media final.
 */

/**
 * Devuelve un objeto { clave -> [col1, col2, ...] } basado en la fila 2 (claves) de sheetCalif.
 * Mapea cada criterio a las columnas donde aparece en la hoja de calificaciones.
 * @param {Sheet} sheetCalif - Hoja de calificaciones
 * @param {Array<string>} clavesLista - Lista de claves de criterios
 * @returns {Object<string, Array<number>>}
 */
function medias_getCriterioColumnMap(sheetCalif, clavesLista) {
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
 * Lee las claves de criterios desde la hoja "criterios".
 * @param {Sheet} sheetCriteria
 * @returns {Array<string>}
 */
function medias_readClavesFromCriteria(sheetCriteria) {
  if (!sheetCriteria) return [];
  
  const criteriosHdr = sheetCriteria.getRange(1, 1, 1, sheetCriteria.getLastColumn())
    .getValues()[0]
    .map(h => h ? h.toString().trim().toLowerCase() : "");
  const colClaveIdx = criteriosHdr.indexOf("clave");

  let clavesLista = [];
  if (colClaveIdx !== -1) {
    const nCrit = Math.max(0, sheetCriteria.getLastRow() - 1);
    if (nCrit > 0) {
      const vals = sheetCriteria.getRange(2, colClaveIdx + 1, nCrit, 1)
        .getValues()
        .map(r => r[0] ? r[0].toString().trim() : "");
      clavesLista = vals.filter(s => s && s !== "");
    }
  } else {
    // Fallback columna D
    try {
      const nCrit = Math.max(0, sheetCriteria.getLastRow() - 1);
      const vals = sheetCriteria.getRange(2, 4, nCrit, 1)
        .getValues()
        .map(r => r[0] ? r[0].toString().trim() : "");
      clavesLista = vals.filter(s => s && s !== "");
    } catch(e) {}
  }

  return clavesLista;
}

/**
 * Agrupa claves por competencia (prefijo antes del punto: "i" en "i.j").
 * @param {Array<string>} clavesLista
 * @returns {Object<string, Array<string>>}
 */
function medias_groupClavesByCompetencia(clavesLista) {
  const competenciaToClaves = {};
  
  clavesLista.forEach(clave => {
    const comp = clave.split(".")[0];
    if (!competenciaToClaves[comp]) competenciaToClaves[comp] = [];
    competenciaToClaves[comp].push(clave);
  });

  return competenciaToClaves;
}

/**
 * Construye la fórmula de media por criterio.
 * Promedia los valores de ese criterio en todas las columnas de calificaciones donde aparece.
 * @param {number} n - Número de trimestre
 * @param {Array<number>} columnasCriterio - Columnas en calificaciones donde aparece el criterio
 * @param {number} rowCalif - Fila del alumno en calificaciones (3, 4, ...)
 * @returns {string} - Fórmula o ""
 */
function medias_buildCriterioFormula(n, columnasCriterio, rowCalif) {
  if (!columnasCriterio || columnasCriterio.length === 0) {
    return "";
  }

  const celdas = columnasCriterio.map(col => {
    const colLetter = columnToLetter(col);
    return `'calificaciones${n}'!${colLetter}${rowCalif}`;
  }).join(";");

  return `=IFERROR(AVERAGE(${celdas}); "")`;
}

/**
 * Construye la fórmula de media por competencia.
 * Promedia los criterios de esa competencia en la fila de medias.
 * @param {Array<string>} clavesComp - Claves de la competencia
 * @param {Array<string>} clavesLista - Lista completa de claves
 * @param {number} rowMedias - Fila en medias
 * @returns {string} - Fórmula o ""
 */
function medias_buildCompetenciaFormula(clavesComp, clavesLista, rowMedias) {
  const refs = clavesComp.map(cl => {
    const idx = clavesLista.indexOf(cl);
    const letter = columnToLetter(3 + idx);
    return `${letter}${rowMedias}`;
  });

  if (refs.length === 0) {
    return "";
  }

  return `=IFERROR(AVERAGE(${refs.join(";")}); "")`;
}

/**
 * Construye la fórmula de Media Final.
 * Promedia las medias por competencia (columnas ocultas auxiliares).
 * @param {number} colStart - Primera columna de medias por competencia
 * @param {number} numCompetencias - Número de competencias
 * @param {number} rowMedias - Fila en medias
 * @returns {string}
 */
function medias_buildMediaFinalFormula(colStart, numCompetencias, rowMedias) {
  if (numCompetencias === 0) return "";

  const firstLetter = columnToLetter(colStart);
  const lastLetter = columnToLetter(colStart + numCompetencias - 1);
  const rango = `${firstLetter}${rowMedias}:${lastLetter}${rowMedias}`;

  return `=IFERROR(AVERAGEIF(${rango};"<>");"")`;
}
