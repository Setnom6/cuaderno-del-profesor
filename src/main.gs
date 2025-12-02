/**
 * main.gs
 * Punto de entrada: genera/actualiza calificacionesN y mediasN para un trimestre.
 * Contiene las funciones públicas principales y wrappers.
 */

/**
 * Wrapper público de buildCalificaciones que delega en la implementación modular.
 * @param {number} n - Número de trimestre
 * @param {Array<Array<string>>} alumnos
 * @param {Array<{nombre: string, criterios: Array<string>}>} instrumentos
 * @param {Object<string, string>} claveToColor
 * @returns {{sheetCalif: Sheet, alumnos: Array<Array<string>>}}
 */
function buildCalificaciones(n, alumnos, instrumentos, claveToColor) {
  return buildCalificacionesImpl(n, alumnos, instrumentos, claveToColor);
}

/**
 * Wrapper público de buildMedias que delega en la implementación modular.
 * @param {number} n - Número de trimestre
 * @param {Sheet} sheetCalif - Hoja calificacionesN
 * @param {Array<Array<string>>} alumnos
 * @param {Sheet} sheetCriteria - Hoja "criterios"
 * @param {Object<string, string>} claveToColor
 * @returns {Sheet} La hoja mediasN creada
 */
function buildMedias(n, sheetCalif, alumnos, sheetCriteria, claveToColor) {
  return buildMediasImpl(n, sheetCalif, alumnos, sheetCriteria, claveToColor);
}

function generateTrimester(n, showAlert = true) {
  const ss = SpreadsheetApp.getActive();
  const sheetList = ss.getSheetByName("listado");
  const sheetCriteria = ss.getSheetByName("criterios");
  const sheetInstruments = ss.getSheetByName("instrumentos");

  if (!sheetList || !sheetCriteria || !sheetInstruments) {
    if (showAlert) {
      SpreadsheetApp.getUi().alert("Faltan hojas necesarias: 'listado', 'criterios' o 'instrumentos'.");
    }
    return;
  }

  // ---------- locate columns "TrimestreN" and "CriteriosN" in 'instrumentos' sheet ----------
  const hdrInst = sheetInstruments.getRange(1,1,1, sheetInstruments.getLastColumn()).getValues()[0];
  const colTrimestreIdx = hdrInst.indexOf("Trimestre" + n);
  const colCriteriosIdx = hdrInst.indexOf("Criterios" + n);

  if (colTrimestreIdx === -1 || colCriteriosIdx === -1) {
    if (showAlert) {
      SpreadsheetApp.getUi().alert("No se han encontrado las cabeceras 'Trimestre" + n + "' o 'Criterios" + n + "' en la hoja 'instrumentos'.");
    }
    return;
  }

  const trimestreCol = colTrimestreIdx + 1;
  const criteriosCol = colCriteriosIdx + 1;

  // ---------- Construir listado de alumnos a partir de la hoja 'listado' ----------
  const datosListado = readListadoRows(sheetList);
  const alumnosResult = buildAlumnosFromRows(datosListado);
  const alumnos = alumnosResult.alumnos; // array de [displayName]

  // ---------- Obtener instrumentos y criterios ----------
  const instrumentos = buildInstrumentosFromSheet(sheetInstruments, trimestreCol, criteriosCol);

  // ---------- build mapping clave->color from 'criterios' sheet (same logic as original) ----------
  const claveToColor = buildClaveToColorMap(sheetCriteria);

  // ---------- Call calificaciones constructor (build or update sheet calificacionesN) ----------
  const calificacionesResult = buildCalificaciones(n, alumnos, instrumentos, claveToColor);

  if (!calificacionesResult || !calificacionesResult.sheetCalif) {
    if (showAlert) {
      SpreadsheetApp.getUi().alert("Error construyendo/actualizando calificaciones" + n);
    }
    return;
  }

  // ---------- Call medias constructor (build mediasN). It will compute columns for each clave  ----------
  sheetMedias = buildMedias(n, calificacionesResult.sheetCalif, alumnos, sheetCriteria, claveToColor);

  // ------------------ Call to get links --------------
  writeLinks(n, calificacionesResult.sheetCalif, sheetMedias);

  if (showAlert) {
    SpreadsheetApp.getUi().alert("Calificaciones y medias para Trimestre " + n + " generadas/actualizadas correctamente.");
  }
}

/* helpers and exposed functions */

function trimester1(){ generateTrimester(1); }
function trimester2(){ generateTrimester(2); }
function trimester3(){ generateTrimester(3); }

/**
 * Obtener filas del listado (columnas A..C) a partir de la hoja `listado`.
 * Devuelve un array bidimensional con las filas leídas (sin cabecera).
 * @param {Sheet} sheetList
 * @returns {Array<Array<any>>}
 */
function readListadoRows(sheetList) {
  if (!sheetList) return [];
  const listadoLastRow = Math.max(sheetList.getLastRow(), 2);
  const numRows = Math.max(0, listadoLastRow - 1);
  if (numRows <= 0) return [];
  return sheetList.getRange(2, 1, numRows, 3).getValues();
}

/**
 * Construye la lista de alumnos (displayName) a partir de las filas del listado.
 * Mantiene la lógica existente: displayName = nombre + ' ' + primer apellido;
 * usa surnameKey (apellido1 + apellido2) para ordenar y conserva homónimos si las filas difieren.
 * @param {Array<Array<any>>} datosListado
 * @returns {{alumnos: Array<Array<string>>, uniqueAlumnosRaw: Array<Object>}}
 */
function buildAlumnosFromRows(datosListado) {
  const alumnosRaw = (datosListado || [])
    .filter(r => r[0] && r[1])
    .map(r => {
      const nombres = normalizeString(r[0]);
      const apellido1 = normalizeString(r[1]);
      const apellido2 = normalizeString(r[2]);
      const displayName = (nombres + ' ' + apellido1).trim();
      const surnameKey = (apellido1 + (apellido2 ? ' ' + apellido2 : '')).trim();
      const sourceRow = [nombres, apellido1, apellido2];
      return { displayName, surnameKey, nombres, sourceRow };
    });

  // Ordenar por surnameKey y desempatar por nombres
  alumnosRaw.sort((a, b) => {
    const cmp = localeCompareEs(a.surnameKey, b.surnameKey);
    if (cmp !== 0) return cmp;
    return localeCompareEs(a.nombres, b.nombres);
  });

  // Deduplicación segura: solo eliminar entradas si la fila A..C es idéntica.
  const seenMap = {}; // displayName -> [rowSig,...]
  const uniqueAlumnosRaw = [];
  alumnosRaw.forEach(a => {
    const nameKey = a.displayName || '';
    const rowSig = makeRowSignature(a.sourceRow);
    if (!seenMap[nameKey]) {
      seenMap[nameKey] = [rowSig];
      uniqueAlumnosRaw.push(a);
    } else {
      const matches = seenMap[nameKey].some(sig => sig === rowSig);
      if (!matches) {
        seenMap[nameKey].push(rowSig);
        uniqueAlumnosRaw.push(a);
        Logger.log("Homónimo detectado para '" + nameKey + "' con distinto contenido; se conservan ambas filas.");
      } else {
        Logger.log("Duplicado exacto detectado para '" + nameKey + "' — una de las filas idénticas será ignorada.");
      }
    }
  });

  const alumnos = uniqueAlumnosRaw.map(a => [a.displayName]);
  return { alumnos, uniqueAlumnosRaw };
}

/**
 * Extrae instrumentos y sus criterios desde la hoja `instrumentos` para un trimestre dado.
 * Ordena lexicográficamente las claves de criterios (locale 'es').
 * @param {Sheet} sheetInstruments
 * @param {number} trimestreCol - índice 1-based
 * @param {number} criteriosCol - índice 1-based
 * @returns {Array<Object>} - [{ nombre, criterios: [...] }, ...]
 */
function buildInstrumentosFromSheet(sheetInstruments, trimestreCol, criteriosCol) {
  if (!sheetInstruments) return [];
  const instLastRow = Math.max(sheetInstruments.getLastRow(), 2);
  const instNames = instLastRow - 1 > 0 ? sheetInstruments.getRange(2, trimestreCol, Math.max(0, instLastRow-1)).getValues().map(r=>r[0]) : [];
  const instCriteria = instLastRow - 1 > 0 ? sheetInstruments.getRange(2, criteriosCol, Math.max(0, instLastRow-1)).getValues().map(r=>r[0]) : [];

  const instrumentos = [];
  for (let i = 0; i < instNames.length; i++) {
    const name = instNames[i];
    if (name && name.toString().trim() !== "") {
      const criteriosCell = (instCriteria[i] || "").toString();
      let criteriosList = criteriosCell === "" ? [] : criteriosCell.split(",").map(s=>s.trim()).filter(s=>s!="");
      if (criteriosList.length > 0) {
        criteriosList.sort((a, b) => localeCompareEs(a, b));
        Logger.log(`Instrument: ${name}`);
        Logger.log(`Original: ${criteriosCell}`);
        Logger.log(`Sorted: ${criteriosList.join(', ')}`);
      }
      if (criteriosList.length > 0) {
        instrumentos.push({ nombre: name.toString().trim(), criterios: criteriosList });
      }
    }
  }
  return instrumentos;
}

/**
 * Construye un mapa clave->color desde la hoja `criterios`.
 * Mantiene la lógica de búsqueda de columna "clave" y el fallback a columna D.
 * @param {Sheet} sheetCriteria
 * @returns {Object} clave->color
 */
function buildClaveToColorMap(sheetCriteria) {
  const criteriosHdr = sheetCriteria.getRange(1,1,1,sheetCriteria.getLastColumn()).getValues()[0].map(h => h ? h.toString().trim().toLowerCase() : "");
  const colClaveIdx = criteriosHdr.indexOf("clave"); // 0-based
  let claveToColor = {};
  if (colClaveIdx !== -1) {
    const numCrit = Math.max(0, sheetCriteria.getLastRow() - 1);
    if (numCrit > 0) {
      const arrClaves = sheetCriteria.getRange(2, colClaveIdx+1, numCrit, 1).getValues().map(r=> r[0] ? r[0].toString().trim() : "");
      const arrColors = sheetCriteria.getRange(2, colClaveIdx+1, numCrit, 1).getBackgrounds().map(r=> r[0]);
      for (let i=0;i<arrClaves.length;i++){
        const clave = arrClaves[i];
        if (clave && clave !== "") claveToColor[clave] = arrColors[i];
      }
    }
  } else {
    // fallback: try column D (4)
    try {
      const numCrit = Math.max(0, sheetCriteria.getLastRow() - 1);
      const arrClaves = sheetCriteria.getRange(2,4, numCrit, 1).getValues().map(r=> r[0] ? r[0].toString().trim() : "");
      const arrColors = sheetCriteria.getRange(2,4, numCrit, 1).getBackgrounds().map(r=> r[0]);
      for (let i=0;i<arrClaves.length;i++){
        const clave = arrClaves[i];
        if (clave && clave !== "") claveToColor[clave] = arrColors[i];
      }
    } catch(e){}
  }
  return claveToColor;
}

function arraysEqual(a,b) {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i=0;i<a.length;i++){
    const va = a[i] ? a[i].toString().trim() : "";
    const vb = b[i] ? b[i].toString().trim() : "";
    if (va !== vb) return false;
  }
  return true;
}

// ===== ENLACES EN HOJA INSTRUMENTOS =====
function writeLinks(n, sheetCalif, sheetMedias) {

  const ss = SpreadsheetApp.getActive();
  const sheetInstr = ss.getSheetByName("instrumentos");
  if (!sheetInstr) return;

  const califGid = sheetCalif.getSheetId();
  const mediasGid = sheetMedias.getSheetId();

  // mapa de posiciones
  const posiciones = {
    1: { calif: "K3",  medias: "K5"  },
    2: { calif: "K10", medias: "K12" },
    3: { calif: "K17", medias: "K19" }
  };

  if (!posiciones[n]) return;

  // hipervínculos internos usando el gid
  sheetInstr.getRange(posiciones[n].calif)
    .setFormula(`=HYPERLINK("#gid=${califGid}"; "calificaciones${n}")`);

  sheetInstr.getRange(posiciones[n].medias)
    .setFormula(`=HYPERLINK("#gid=${mediasGid}"; "medias${n}")`);
}