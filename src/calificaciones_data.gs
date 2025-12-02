/**
 * calificaciones_data.gs
 * Funciones para leer, mapear y copiar datos antiguos de hojas de calificaciones.
 * Separado de la implementación principal para facilitar pruebas y mantenimiento.
 */

/**
 * Lee los datos de una hoja existente de calificaciones y extrae headers y mapeo de alumnos.
 * @param {Sheet} sheet - Hoja de calificaciones existente (o null)
 * @returns {{
 *   oldData: Array<Array<any>> | null,
 *   oldHeadersRow1: Array<string>,
 *   oldHeadersRow2: Array<string>,
 *   oldRowByAlumno: Object<string, number>
 * }}
 */
function readOldSheetData(sheet) {
  const result = {
    oldData: null,
    oldHeadersRow1: [],
    oldHeadersRow2: [],
    oldRowByAlumno: {}
  };

  if (!sheet) return result;

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  
  if (lastRow < 2 || lastCol < 1) return result;

  result.oldData = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  result.oldHeadersRow1 = result.oldData[0].map(x => x ? x.toString().trim() : "");
  result.oldHeadersRow2 = result.oldData[1].map(x => x ? x.toString().trim() : "");

  // Mapear nombres de alumnos a índice de fila (0-based en oldData)
  for (let r = 2; r < result.oldData.length; r++) {
    const val = (result.oldData[r][0] || "").toString().trim();
    if (val !== "") result.oldRowByAlumno[val] = r;
  }

  return result;
}

/**
 * Construye un mapa de bloques de datos antiguos por instrumento.
 * Cada bloque contiene la información de columnas (clave de criterio) y los datos.
 * @param {Array<string>} oldHeadersRow1 - Primera fila de headers (nombres de instrumentos)
 * @param {Array<string>} oldHeadersRow2 - Segunda fila de headers (claves de criterios)
 * @param {Array<Array<any>>} oldData - Matriz completa de datos antiguos
 * @returns {Object<string, {startCol: number, endCol: number, columns: Array<{clave: string, colIndex: number}>, data: Array<Array<any>>}>}
 */
function buildOldDataBlocks(oldHeadersRow1, oldHeadersRow2, oldData) {
  const oldBlocks = {};

  if (!oldHeadersRow1 || oldHeadersRow1.length === 0) return oldBlocks;

  let ptr = 1; // Empezar después de "Alumno"
  while (ptr < oldHeadersRow1.length) {
    const instName = oldHeadersRow1[ptr];
    if (!instName) {
      ptr++;
      continue;
    }

    // Encontrar el rango de columnas de este instrumento
    let start = ptr;
    let end = ptr;
    while (end + 1 < oldHeadersRow1.length && 
           (oldHeadersRow1[end + 1] === "" || oldHeadersRow1[end + 1] === instName)) {
      end++;
    }

    // Extraer columnas de criterios (sin "Media")
    const cols = [];
    for (let c = start; c <= end; c++) {
      const clave = oldHeadersRow2[c];
      if (clave && clave !== "Media") {
        cols.push({ clave, colIndex: c });
      }
    }

    // Extraer datos del bloque
    const blockData = [];
    if (oldData && oldData.length > 2) {
      for (let r = 2; r < oldData.length; r++) {
        blockData.push(oldData[r].slice(start, end + 1));
      }
    }

    oldBlocks[instName] = {
      startCol: start,
      endCol: end,
      columns: cols,
      data: blockData
    };

    ptr = end + 1;
  }

  return oldBlocks;
}

/**
 * Copia datos antiguos desde los bloques al sheet temporal basándose en el mapeo de alumnos e instrumentos.
 * Modifica la hoja temporal in-place escribiendo valores en las celdas correspondientes.
 * @param {Sheet} tempSheet - Hoja temporal donde copiar
 * @param {Array<Array<string>>} alumnos - Lista de alumnos [[nombre], ...]
 * @param {Array<{nombre: string, criterios: Array<string>}>} instrumentos - Instrumentos actuales
 * @param {Object} oldBlocks - Bloques de datos antiguos por instrumento (de buildOldDataBlocks)
 * @param {Object<string, number>} oldRowByAlumno - Mapeo nombre->índice en oldData
 * @param {Array<Array<any>>} oldData - Datos antiguos completos
 */
function copyOldDataToTemp(tempSheet, alumnos, instrumentos, oldBlocks, oldRowByAlumno, oldData) {
  if (!tempSheet || !alumnos || !instrumentos || !oldBlocks || !oldData) return;

  let colPtrNew = 2; // Empezar después de columna "Alumno"

  instrumentos.forEach(inst => {
    const blockSize = inst.criterios.length + 1; // +1 para Media
    const oldBlock = oldBlocks[inst.nombre];

    if (oldBlock) {
      inst.criterios.forEach((clave, idx) => {
        const colNew = colPtrNew + idx;
        const oldColObj = oldBlock.columns.find(c => c.clave === clave);
        
        if (oldColObj) {
          const oldCol = oldColObj.colIndex;
          for (let i = 0; i < alumnos.length; i++) {
            const alumnoNombre = alumnos[i][0];
            const oldRowIndex = oldRowByAlumno[alumnoNombre];
            
            if (oldRowIndex !== undefined) {
              const val = oldData[oldRowIndex][oldCol];
              try {
                tempSheet.getRange(3 + i, colNew).setValue(val);
              } catch(e) {
                Logger.log(`copyOldDataToTemp: error copiando valor: ${e}`);
              }
            }
          }
        }
      });
    }

    colPtrNew += blockSize;
  });
}
