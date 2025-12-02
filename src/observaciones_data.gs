/**
 * observaciones_data.gs
 * Lógica de manejo de datos para la hoja observacionesN.
 * Define la estructura y validaciones de datos.
 */

/**
 * Retorna la lista de headers para la hoja observaciones.
 * @returns {Array<string>}
 */
function observaciones_getHeaders() {
  return [
    "Alumno",
    "Faltas injustificadas",
    "Faltas justificadas",
    "Retrasos",
    "Faltas Injustificadas (días completos)",
    "Faltas justificadas (días completos)",
    "Tarea",
    "Libro",
    "Observaciones adicionales"
  ];
}

/**
 * Retorna los índices de columnas que requieren validación de números enteros.
 * @returns {Array<number>} Índices de columnas (1-based)
 */
function observaciones_getNumericColumns() {
  // Columnas 2-8 (Faltas injustificadas hasta Libro)
  return [2, 3, 4, 5, 6, 7, 8];
}
