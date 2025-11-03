/***************************************************
 * generalSheet.gs
 * Rellena y formatea la hoja "general"
 * No requiere cambios estructurales importantes
 ***************************************************/

function populateGeneral(ss, alumnos, mapCeldas) {
  const sheet = ss.getSheetByName("general");
  sheet.clear();

  const headers = [
    "Nombre", "Primer Apellido", "Segundo Apellido",
    "Calificación 1er Trim", "Calificación 2º Trim", "Calificación 3er Trim",
    "Hoja desglose"
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  const data = alumnos.map(al => {
    const baseName = sanitizeSheetName(al.primerApellido + "_" + al.nombre);
    const shDesglose = ss.getSheetByName(baseName + "_desglose");
    const url = ss.getUrl();
    const medias = mapCeldas[baseName];
    return [
      al.nombre,
      al.primerApellido,
      al.segundoApellido,
      `=IFERROR('${baseName}_media'!${medias.trim1},"")`,
      `=IFERROR('${baseName}_media'!${medias.trim2},"")`,
      `=IFERROR('${baseName}_media'!${medias.trim3},"")`,
      `=HYPERLINK("${url}#gid=${shDesglose.getSheetId()}","Abrir desglose")`
    ];
  });

  sheet.getRange(2, 1, data.length, headers.length).setValues(data);

  const header = sheet.getRange("A1:G1");
  header.setFontWeight("bold").setFontSize(11);

  const baseWidth = Math.max(...headers.map(h => h.length)) * 8;
  for (let i = 1; i <= headers.length; i++) sheet.setColumnWidth(i, baseWidth);
  sheet.getRange(2, 4, data.length, 3).setNumberFormat("0.00");
}
