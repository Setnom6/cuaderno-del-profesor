# Changelog

Todos los cambios notables de este proyecto están documentados en este archivo.

## [Sin releasar] - 2024

### Agregado

#### Hoja Estadísticas (Fase 1)
- **Nueva hoja `estadísticas`** generada automáticamente al crear Trimestre 1
- **Panel de Control** (filas 1-18) con:
  - Selector de tipo de análisis (dropdown)
  - Selector de alumno (dropdown)
  - Lista de instrumentos con selección por "X"
  - Botón "Generar Análisis" en menú contextual

- **4 tipos de análisis implementados:**
  1. **Media por Instrumentos**: Promedio de calificaciones de instrumentos seleccionados
  2. **Criterios Evaluaciones**: Matriz de conteo de evaluaciones por criterios y trimestre
  3. **Notas por Alumno**: Desglose completo de calificaciones de un alumno
  4. **Dashboard General**: Estadísticas generales de clase por trimestre

- **Archivos nuevos:**
  - `estadisticas_impl.gs` - Orquestador principal
  - `estadisticas_panel.gs` - Creación y gestión del panel de control
  - `estadisticas_analyze.gs` - Implementación de los 4 análisis
  - `estadisticas_format.gs` - Estilos y formato
  - `estadisticas_menu.gs` - Menú contextual e integración

- **Menú contextual mejorado:**
  - Menú "Estadísticas" aparece cuando estás en la hoja `estadísticas`
  - Item "🔄 Generar Análisis" dispara regeneración de análisis
  - Validación de parámetros antes de ejecutar

- **Documentación:**
  - `ESTADISTICAS.md` - Guía completa de usuario
  - Sección actualizada en `README.md`

### Modificado

- `medias_menu.gs`:
  - El hook `onOpen()` ahora detecta ambas hojas: mediasN y estadísticas
  - Crea menú contextual apropiado según la hoja activa

### Características Técnicas

- **Datos en tiempo real**: Los análisis leen directamente de hojas de calificaciones
- **Regeneración completa**: Cada análisis borra y recrea los resultados
- **Protección de panel**: Area de control protegida con warning-only mode
- **Soporte completo de 3 trimestres**: Análisis agrupa datos de T1, T2, T3
- **Manejo de errores**: Validaciones y mensajes de error descriptivos

### Notas de Implementación

- Los instrumentos se extraen automáticamente de `calificacionesN`
- La lista de alumnos se pobla desde `calificaciones1`
- Los análisis soportan hasta 50 instrumentos (A6:A50)
- Protección de panel permite edición con advertencia (no bloquea)

---

## [v2.0] - Previo a estadísticas

### Agregado
- Sistema modular completo de calificaciones, medias y observaciones
- Protecciones con setWarningOnly(true) en múltiples hojas
- Mejoras de formato: headers superpuestos, columnas sombreadas, bordes destacados
- Sistema inteligente de actualización de observaciones

### Modificado
- Arquitectura refactorizada en capas: impl, data, format
- Mecanismo de protección mejorado

---

## Próximas Mejoras Planeadas (Fase 2+)

- [ ] **Gráficas**: Gráficos de desempeño por alumno y por criterio
- [ ] **Exportación**: Exportar análisis a PDF
- [ ] **Comparativas**: Comparación entre alumnos
- [ ] **Análisis avanzados**: Proyecciones, tendencias
- [ ] **Dashboard mejorado**: Vista general interactiva
- [ ] **Tests automatizados**: Tests para estadísticas

---

## Cómo Actualizar

Si estás usando una versión anterior y quieres usar estadísticas:

1. Actualiza tu proyecto Apps Script con los archivos `estadisticas_*.gs`
2. Actualiza `medias_menu.gs` (cambios en `onOpen()`)
3. Ejecuta `trimester1()` nuevamente para generar la hoja estadísticas
4. Navega a la hoja `estadísticas` y abre el menú contextual
5. Consulta `ESTADISTICAS.md` para guía de uso

---

## Versionado

Este proyecto sigue [Semantic Versioning](https://semver.org/):
- **MAJOR**: Cambios incompatibles en API pública
- **MINOR**: Nuevas características sin romper compatibilidad
- **PATCH**: Correcciones de bugs

Versión actual: **2.1.0** (con estadísticas Fase 1)

---

## Autores

- **José Manuel Montes Armenteros** - Creador principal
- Basado en sistema modular de evaluación para docentes

---

## Licencia

BSD 3-Clause License - Ver archivo [LICENSE](LICENSE) para detalles
