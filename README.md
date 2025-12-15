# Cuaderno del Profesor Automatizado

Sistema de evaluación basado en competencias, criterios e instrumentos para Google Sheets.

## Instalación

1. Abre tu Google Sheet
2. Importa los archivos de `src/` en tu proyecto de Apps Script
3. Completa las hojas: `listado`, `criterios`, `instrumentos`
4. Ejecuta `trimester1()` en la consola

## Uso

### Generar Trimestre
```javascript
trimester1()  // Trimestre 1
trimester2()  // Trimestre 2
trimester3()  // Trimestre 3
```

### Generar Estadísticas
1. Abre la hoja `estadísticas`
2. Marca con X los instrumentos que deseas incluir
3. Menú **Estadísticas** → **Generar Análisis**

## Estructura

- **calificacionesN** - Desglose de calificaciones por instrumento
- **mediasN** - Promedios por competencias y criterios
- **observacionesN** - Observaciones sobre los alumnos
- **estadísticas** - Tabla de media de instrumentos seleccionados para todos los alumnos

## Licencia

BSD 3-Clause License
