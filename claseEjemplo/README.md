# Estructura de Carpeta de Clase

Cada carpeta de clase (por ejemplo, "claseEjemplo") debe contener siempre exactamente tres archivos de Google Sheets:

1. listado
2. instrumentos
3. criteriosDeEvaluacion

Estos tres archivos son imprescindibles para que el sistema de calificaciones funcione correctamente. 
El script utiliza sus nombres y su estructura interna para generar y actualizar las hojas de calificaciones automáticamente.

## ARCHIVO "listado"

Este archivo debe contener el listado completo de alumnos matriculados en la clase.
Debe tener exactamente tres columnas con los siguientes encabezados (escritos así, respetando mayúsculas y espacios):

Nombre | Primer Apellido | Segundo Apellido

## ARCHIVO "instrumentos"

Este archivo define los instrumentos de evaluación aplicados a lo largo del curso.
Debe tener exactamente tres columnas con los siguientes encabezados (escritos así, respetando mayúsculas y espacios):

Primer Trimestre | Segundo Trimestre | Tercer Trimestre

## ARCHIVO "criteriosDeEvaluacion"

Este archivo define los criterios de evaluación y su relación con las competencias.
Debe contener exactamente las siguientes columnas en la primera fila:

Index | Competencia | Criterio

Reglas:

La columna "Index" identifica el criterio con formato i.j, donde:
i = número de la competencia
j = número de orden dentro de esa competencia
Ejemplo: 1.1, 1.2, 2.1, 3.4, etc.

La columna "Competencia" debe contener el nombre o código de la competencia (por ejemplo, "Comunicación lingüística").

La columna "Criterio" contiene la descripción completa del criterio de evaluación.

Colores de fondo:

Los colores de fondo de las celdas de las columnas "Index" y "Competencia" se utilizan para identificar las competencias y mantener la coherencia visual.

Asigna un color de fondo distinto a cada competencia (por ejemplo, azul para C1, verde para C2, etc.).

El script reutilizará esos colores en las hojas de desglose de los alumnos.
