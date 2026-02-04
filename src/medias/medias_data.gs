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
 * Lee la información de competencias desde la hoja "criterios".
 * Para cada competencia retorna: índice, nombre y color (del primer criterio de esa competencia).
 * @param {Sheet} sheetCriteria - Hoja "criterios"
 * @param {Array<string>} clavesLista - Lista de claves de criterios
 * @returns {Array<{indice: string, nombre: string, color: string}>}
 */
function medias_readCompetenciasInfo(sheetCriteria, clavesLista) {
  if (!sheetCriteria || !clavesLista || clavesLista.length === 0) return [];
  
  // Leer headers de la hoja criterios
  const criteriosHdr = sheetCriteria.getRange(1, 1, 1, sheetCriteria.getLastColumn())
    .getValues()[0]
    .map(h => h ? h.toString().trim().toLowerCase() : "");
  
  const colIndiceIdx = criteriosHdr.indexOf("indice");
  const colCompetenciaIdx = criteriosHdr.indexOf("competencia");
  const colClaveIdx = criteriosHdr.indexOf("clave");
  
  if (colIndiceIdx === -1 || colCompetenciaIdx === -1) {
    return [];
  }
  
  const numCrit = Math.max(0, sheetCriteria.getLastRow() - 1);
  if (numCrit === 0) return [];
  
  // Leer todas las filas de criterios
  const indicesVals = sheetCriteria.getRange(2, colIndiceIdx + 1, numCrit, 1).getValues().map(r => r[0] ? r[0].toString().trim() : "");
  const competenciasVals = sheetCriteria.getRange(2, colCompetenciaIdx + 1, numCrit, 1).getValues().map(r => r[0] ? r[0].toString().trim() : "");
  
  // Leer colores de la columna clave (o columna D como fallback)
  let coloresVals;
  if (colClaveIdx !== -1) {
    coloresVals = sheetCriteria.getRange(2, colClaveIdx + 1, numCrit, 1).getBackgrounds().map(r => r[0]);
  } else {
    coloresVals = sheetCriteria.getRange(2, 4, numCrit, 1).getBackgrounds().map(r => r[0]);
  }
  
  // Agrupar por competencia y extraer el primer criterio de cada una
  const competenciaMap = {}; // indice -> {nombre, color}
  
  for (let i = 0; i < numCrit; i++) {
    const indice = indicesVals[i];
    const nombreComp = competenciasVals[i];
    const color = coloresVals[i];
    
    if (!indice || !nombreComp) continue;
    
    // Extraer el índice de la competencia (parte antes del punto)
    const indiceComp = indice.split(".")[0];
    
    // Solo guardar el primer criterio de cada competencia
    if (!competenciaMap[indiceComp]) {
      competenciaMap[indiceComp] = {
        indice: indiceComp,
        nombre: nombreComp,
        color: color || "#ffffff"
      };
    }
  }
  
  // Convertir a array y ordenar por índice
  const competenciasInfo = Object.keys(competenciaMap)
    .sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      return numA - numB;
    })
    .map(indice => competenciaMap[indice]);
  
  return competenciasInfo;
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
