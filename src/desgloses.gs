/***************************************************
 * desgloses.gs
 * Construye y formatea las hojas de desglose
 * Modularizado: createDesgloseForAlumno crea el desglose de un alumno.
 ***************************************************/

/**
 * Crea/actualiza la hoja de desglose para UN alumno.
 * - ss: Spreadsheet (destino)
 * - al: { nombre, primerApellido, segundoApellido }
 * - criterios: array de criterios (según parseCriteriosRows)
 * - instrumentosPorTrim: { trim1:[], trim2:[], trim3:[] }
 *
 * Devuelve el objeto { success: true, sheetName: "<base>_desglose" } o lanza error.
 */
function createDesgloseForAlumno(ss, al, criterios, instrumentosPorTrim) {
  const baseName = sanitizeSheetName(al.primerApellido + "_" + al.nombre);
  const sheetName = baseName + "_desglose";

  // Si ya existe, limpiamos y reconstruimos (para permitir re-creación sin duplicar)
  let sh = ss.getSheetByName(sheetName);
  if (!sh) {
    sh = ss.insertSheet(makeUniqueSheetName(ss, sheetName));
  } else {
    // No eliminamos la hoja (para no romper referencias externas), solo la limpiamos
    sh.clear();
  }

  // --- Copia fiel del comportamiento anterior ---
  const competencias = [...new Set(criterios.map(c => c.competencia))];
  const colorMap = {};
  competencias.forEach(comp => {
    const c = criterios.find(x => x.competencia === comp);
    colorMap[comp] = c && c.color ? c.color : "#ffffff";
  });

  // Nueva fila superior con nombre completo del alumno
  const fullName = `${al.nombre} ${al.primerApellido} ${al.segundoApellido || ""}`.trim();
  sh.getRange(1, 1).setValue(fullName)
    .setFontWeight("bold")
    .setFontSize(12);
  const lastCol = 2 + criterios.length + 2;
  sh.getRange(1, 1, 1, lastCol).merge();
  sh.getRange(1, 1).setHorizontalAlignment("center").setBackground("#e8e8e8");

  // Ajuste: todo empieza en la fila 3
  let startRow = 3;
  const bloques = ["1er Trimestre", "2º Trimestre", "3er Trimestre"];

  bloques.forEach((bloque, bIndex) => {
    const headers = ["Instrumento"]
      .concat(criterios.map(c => (c.index || "").toString().trim()))
      .concat(["Media Instrumento", "→ Cálculo Media"]);

    const nCols = headers.length;

    // Encabezados
    const headerRange = sh.getRange(startRow, 1, 1, nCols);
    headerRange.setValues([headers])
      .setFontWeight("bold")
      .setFontSize(11);

    // Ajuste de anchos
    sh.setColumnWidth(1, 140);
    for (let ci = 2; ci <= nCols - 2; ci++) sh.setColumnWidth(ci, 45);
    sh.setColumnWidth(nCols - 1, 140);
    sh.setColumnWidth(nCols, 140);

    // Escribir instrumentos + fórmula de media
    const claveTrim = bIndex === 0 ? "trim1" : bIndex === 1 ? "trim2" : "trim3";
    const instrumentos = instrumentosPorTrim[claveTrim] || [];
    const rowsPerTrim = instrumentos.length;

    for (let i = 0; i < rowsPerTrim; i++) {
      const row = startRow + 1 + i;
      sh.getRange(row, 1).setValue(instrumentos[i]);
      const primeraCol = 2;
      const ultimaCol = 1 + criterios.length;
      const rangeCriterios = sh.getRange(row, primeraCol, 1, criterios.length).getA1Notation();
      const formulaMedia = `=IF(COUNTA(${rangeCriterios})>0,AVERAGEIF(${rangeCriterios},"<>"),"")`;
      sh.getRange(row, nCols - 1).setFormula(formulaMedia).setNumberFormat("0.00");
    }

    const endRow = startRow + rowsPerTrim;

    // Colorear por competencia
    let compActual = criterios.length ? criterios[0].competencia : null;
    let colorActual = compActual ? colorMap[compActual] : "#ffffff";
    for (let i = 0; i < criterios.length; i++) {
      const c = criterios[i];
      const colIdx = i + 2;
      if (c.competencia !== compActual) {
        compActual = c.competencia;
        colorActual = colorMap[compActual];
      }
      sh.getRange(startRow, colIdx).setBackground(colorActual);
      sh.getRange(startRow + 1, colIdx, rowsPerTrim, 1).setBackground(colorActual);
    }

    // Columnas neutras
    sh.getRange(startRow, 1).setBackground("#ffffff");
    sh.getRange(startRow + 1, 1, rowsPerTrim, 1).setBackground("#ffffff");
    sh.getRange(startRow, nCols - 1, rowsPerTrim + 1, 2).setBackground("#f3f3f3");

    // Enlace a hoja media (si existe)
    const mediaSheet = ss.getSheetByName(baseName + "_media");
    const linkCell = sh.getRange(startRow + 1, nCols);
    if (mediaSheet) {
      linkCell.setFormula(`=HYPERLINK("#gid=${mediaSheet.getSheetId()}","Ver media")`);
    } else {
      linkCell.setValue("Media no encontrada");
    }

    // Título de trimestre
    sh.getRange(startRow, 1).setValue(bloque).setFontWeight("bold").setFontSize(12);

    // Formato condicional (notas <0 y >10 en rojo)
    const notasRange = sh.getRange(startRow + 1, 2, rowsPerTrim, criterios.length);
    // Borrar reglas previas localmente y añadir las nuevas
    const rules = sh.getConditionalFormatRules();
    // Añadimos las dos reglas (no borramos otras reglas que no afecten a estas celdas)
    const ruleLess = SpreadsheetApp.newConditionalFormatRule()
      .whenNumberLessThan(0).setFontColor("#FF0000").setRanges([notasRange]).build();
    const ruleGreater = SpreadsheetApp.newConditionalFormatRule()
      .whenNumberGreaterThan(10).setFontColor("#FF0000").setRanges([notasRange]).build();
    rules.push(ruleLess, ruleGreater);
    sh.setConditionalFormatRules(rules);

    startRow = endRow + 2;
  });

  // Devolvemos info mínima
  return { success: true, sheetName: sheetName };
}

/**
 * buildDesgloses: recorre la lista de alumnos y llama a createDesgloseForAlumno
 * Conserva la firma anterior (ss, alumnos, criterios, instrumentosPorTrim).
 */
function buildDesgloses(ss, alumnos, criterios, instrumentosPorTrim) {
  alumnos.forEach(al => {
    try {
      createDesgloseForAlumno(ss, al, criterios, instrumentosPorTrim);
    } catch (e) {
      Logger.log("Error creando desglose para " + al.nombre + " " + al.primerApellido + ": " + e);
    }
  });
}
