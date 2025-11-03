/***************************************************
 * buildProjectBatches.gs
 * Construcción de calificaciones por lotes (con hojas 'desglose' + 'media')
 *
 * Corrección: guarda y acumula las referencias de media (mapCeldas)
 * para que populateGeneral tenga la información necesaria.
 ***************************************************/

// CONFIG
const CLASS_FOLDER_NAME_BATCHES = "4C";
const BATCH_SIZE = 8; // nº de alumnos por lote

/**
 * Primera ejecución: crea el archivo base y guarda progreso.
 */
function initBuildProjectClase() {
  try {
    const classFolder = findClassFolderByName(CLASS_FOLDER_NAME_BATCHES);

    const fileListado = findFileInFolder(classFolder, "listado");
    const fileCriterios = findFileInFolder(classFolder, "criteriosDeEvaluacion");
    const fileInstrumentos = findFileInFolder(classFolder, "instrumentos");
    const instrumentos = parseInstrumentosFromSheet(fileInstrumentos);

    const parentFolder = getProjectFolder();
    const spreadsheetName = "calificaciones_" + CLASS_FOLDER_NAME_BATCHES;

    const newSs = SpreadsheetApp.create(spreadsheetName);
    const file = DriveApp.getFileById(newSs.getId());
    parentFolder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    // Hoja general
    const generalSheet = newSs.getSheets()[0];
    generalSheet.setName("general");
    while (newSs.getSheets().length > 1) newSs.deleteSheet(newSs.getSheets()[1]);

    // Datos base
    const ssListado = SpreadsheetApp.openById(fileListado.getId());
    const alumnos = parseListadoRows(ssListado.getSheets()[0].getDataRange().getValues())
      .sort((a, b) => a.primerApellido.localeCompare(b.primerApellido));

    const ssCriterios = SpreadsheetApp.openById(fileCriterios.getId());
    const sheetCriterios = ssCriterios.getSheets()[0];
    const criterios = parseCriteriosRows(sheetCriterios.getDataRange().getValues(), sheetCriterios);

    // Guardar estado inicial (incluimos mapCeldas vacío)
    const state = {
      alumnos,
      criterios,
      instrumentos,
      nextIndex: 0,
      ssId: newSs.getId(),
      mapCeldas: {} // baseName -> { trim1, trim2, trim3, sheetName }
    };
    PropertiesService.getScriptProperties().setProperty("BUILD_STATE", JSON.stringify(state));

    Logger.log("Proyecto inicializado: " + newSs.getUrl());
    Logger.log("Ejecuta continueBuildProjectClase() para continuar por lotes.");
    return newSs.getUrl();

  } catch (e) {
    Logger.log(" Error en initBuildProjectClase: " + e);
    throw e;
  }
}

/**
 * Continúa la construcción en lotes (reanúdalo tantas veces como necesites).
 */
function continueBuildProjectClase() {
  try {
    const props = PropertiesService.getScriptProperties().getProperty("BUILD_STATE");
    if (!props) throw new Error("No se encontró el estado guardado. Ejecuta initBuildProjectClase primero.");

    const state = JSON.parse(props);
    const newSs = SpreadsheetApp.openById(state.ssId);
    const alumnos = state.alumnos;
    const criterios = state.criterios;
    const instrumentos = state.instrumentos;
    let index = state.nextIndex;
    const mapCeldas = state.mapCeldas || {};

    const endIndex = Math.min(index + BATCH_SIZE, alumnos.length);
    const batch = alumnos.slice(index, endIndex);

    Logger.log(` Procesando alumnos ${index + 1}–${endIndex} de ${alumnos.length}`);

    // Crear hojas de alumnos y almacenar referencias de media
    batch.forEach(al => {
      const baseName = sanitizeSheetName(al.primerApellido + "_" + al.nombre);

      // Crear/desinfectar hojas
      const desgloseSheet = newSs.insertSheet(makeUniqueSheetName(newSs, baseName + "_desglose"));
      const mediaSheet = newSs.insertSheet(makeUniqueSheetName(newSs, baseName + "_media"));

      // Crear contenido
      createDesgloseForAlumno(newSs, al, criterios, instrumentos);

      // createMediaForAlumno devuelve { sheetName, trim1, trim2, trim3 }
      let mediaInfo = null;
      try {
        mediaInfo = createMediaForAlumno(newSs, al, criterios, instrumentos);
      } catch (e) {
        Logger.log(`createMediaForAlumno falló para ${baseName}: ${e}`);
        mediaInfo = null;
      }

      // Si createMediaForAlumno no devolvió referencias, intentamos localizar con getMediaRefsForAlumno
      if (!mediaInfo || !mediaInfo.trim1 || !mediaInfo.trim2 || !mediaInfo.trim3) {
        Logger.log(`Intentando fallback getMediaRefsForAlumno para ${baseName}`);
        const fallback = getMediaRefsForAlumno(newSs, al);
        if (fallback) {
          mediaInfo = mediaInfo || {};
          mediaInfo.trim1 = mediaInfo.trim1 || fallback.trim1;
          mediaInfo.trim2 = mediaInfo.trim2 || fallback.trim2;
          mediaInfo.trim3 = mediaInfo.trim3 || fallback.trim3;
          mediaInfo.sheetName = mediaInfo.sheetName || (baseName + "_media");
        } else {
          Logger.log(`No se pudieron obtener referencias de media para ${baseName}`);
        }
      }

      // Guardar en mapCeldas sólo si tenemos referencias mínimas
      if (mediaInfo && mediaInfo.trim1 && mediaInfo.trim2 && mediaInfo.trim3) {
        mapCeldas[baseName] = {
          trim1: mediaInfo.trim1,
          trim2: mediaInfo.trim2,
          trim3: mediaInfo.trim3,
          sheetName: mediaInfo.sheetName || (baseName + "_media")
        };
      } else {
        // guardamos una entrada vacía para evitar problemas de undefined
        mapCeldas[baseName] = null;
      }

      // Formato visual (opcional)
      try {
        const shMedia = newSs.getSheetByName(baseName + "_media");
        if (shMedia) {
          shMedia.setTabColor("#cccccc");
          // intentamos colorear cabecera si existe
          try { shMedia.getRange("A1:L1").setFontWeight("bold").setBackground("#e8e8e8"); } catch (e) {}
        }
      } catch (e) {
        /* noop */
      }
    });

    // Actualizar índice y guardar estado
    index = endIndex;
    state.nextIndex = index;
    state.mapCeldas = mapCeldas;

    if (index >= alumnos.length) {
      // Proyecto completo: rellenar 'general' con mapCeldas acumulado
      populateGeneral(newSs, alumnos, mapCeldas);
      PropertiesService.getScriptProperties().deleteProperty("BUILD_STATE");
      Logger.log("Proyecto completado: " + newSs.getUrl());
    } else {
      // Guardar estado parcial y seguir luego
      PropertiesService.getScriptProperties().setProperty("BUILD_STATE", JSON.stringify(state));
      Logger.log(`Lote completado (${endIndex}/${alumnos.length}).`);
      Logger.log("Ejecuta continueBuildProjectClase() para procesar el siguiente lote.");
    }

    SpreadsheetApp.flush();

  } catch (e) {
    Logger.log("Error en continueBuildProjectClase: " + e);
    throw e;
  }
}
