# Guía de la Hoja Estadísticas

## Introducción

La hoja **estadísticas** es un análisis dinámico que se genera automáticamente cuando creas el **Trimestre 1**. Te permite explorar los datos de calificaciones desde múltiples perspectivas sin modificar las hojas de calificaciones originales.

---

## Panel de Control (Filas 1-18)

El panel superior es donde configuras qué análisis quieres ver.

### 1. Tipo de Análisis (Celda B2)

Selector desplegable con 4 opciones:

| Opción | Descripción |
|--------|------------|
| **Media por Instrumentos** | Muestra el promedio de calificaciones de los instrumentos seleccionados |
| **Criterios Evaluaciones** | Cuenta cuántas evaluaciones hay por criterios, agrupadas por trimestre |
| **Notas por Alumno** | Detalle de todas las calificaciones de un alumno específico |
| **Dashboard General** | Resumen estadístico general (número de alumnos, media clase, suspensos) |

### 2. Selector de Alumno (Celda B4)

- **Cuándo usarlo:** Solo es relevante para el análisis "Notas por Alumno"
- **Cómo usarlo:** Desplegable con lista de todos los alumnos de la clase
- **Ignorado en:** Media por Instrumentos, Criterios Evaluaciones, Dashboard General

### 3. Instrumentos (Celdas A6:A50)

Lista de todos los instrumentos de evaluación disponibles en los 3 trimestres.

- **Cómo marcar:** Escribe una "X" (mayúscula) al lado de cada instrumento que deseas incluir
- **Cuándo es relevante:** Solo en análisis "Media por Instrumentos"
- **Nota:** Los instrumentos se organizan como: `[Nombre] T[trimestre]`

**Ejemplo:**
```
X   Prueba escrita T1
X   Trabajo en grupo T1
    Examen oral T2
X   Proyecto final T3
```

### 4. Botón Generar Análisis

- **Ubicación:** Menú contextual → **Estadísticas** → **Generar Análisis**
- **Función:** Valida los parámetros y regenera el análisis
- **Tiempo:** Por lo general < 1 segundo

---

## Tipos de Análisis Detallado

### 1. Media por Instrumentos

**Qué muestra:**
- Promedio de todas las calificaciones para cada instrumento seleccionado
- El promedio general de los instrumentos seleccionados
- Desglosado por cada alumno

**Parámetros necesarios:**
- ✅ Instrumentos (obligatorio: al menos 1)
- ❌ Alumno (se ignora)

**Ejemplo de salida:**
```
Análisis: Media por Instrumentos

Instrumento              Promedio
Prueba escrita T1       6.5
Trabajo en grupo T1     7.2
Proyecto final T3       6.8

Promedio General        6.83
```

### 2. Criterios Evaluaciones

**Qué muestra:**
- Matriz de conteo: filas = criterios, columnas = trimestres
- Cuántas evaluaciones ha recibido cada criterio en cada trimestre
- Útil para verificar balanceo de evaluaciones

**Parámetros necesarios:**
- ❌ Instrumentos (se ignora)
- ❌ Alumno (se ignora)

**Ejemplo de salida:**
```
Análisis: Criterios Evaluaciones

Criterio                T1    T2    T3
Comunicación oral       3     2     3
Trabajo en equipo       4     3     4
Creatividad             2     3     2
```

### 3. Notas por Alumno

**Qué muestra:**
- Desglose completo de calificaciones de un alumno
- Organizado por criterios
- Con promedio por trimestre y promedio general
- Incluye calificaciones de medias y criterios evaluados

**Parámetros necesarios:**
- ✅ Alumno (obligatorio)
- ❌ Instrumentos (se ignora)

**Ejemplo de salida:**
```
Análisis: Notas de Juan García

Criterio                T1    T2    T3    Promedio
Comunicación oral       7     6     8     7.0
Trabajo en equipo       6     7     7     6.7
Creatividad             8     7     6     7.0

Media Trimestral        7.0   6.7   7.0
Media General                              6.9
```

### 4. Dashboard General

**Qué muestra:**
- Estadísticas generales de la clase por trimestre:
  - Número total de alumnos
  - Media final de la clase
  - Cantidad de alumnos suspendidos (< 5)
  - Porcentaje de aprobados

**Parámetros necesarios:**
- ❌ Instrumentos (se ignora)
- ❌ Alumno (se ignora)

**Ejemplo de salida:**
```
Análisis: Dashboard General

                    T1      T2      T3
Total Alumnos       25      25      25
Media Clase         6.4     6.7     6.9
Suspensos           4       3       2
% Aprobados         84%     88%     92%
```

---

## Flujo Típico de Uso

### Escenario 1: Revisar desempeño general de un alumno
1. Selecciona **Notas por Alumno**
2. Elige al alumno en la lista
3. Haz clic en **Generar Análisis**
4. Revisa el desglose completo de sus calificaciones

### Escenario 2: Comparar resultados de instrumentos específicos
1. Selecciona **Media por Instrumentos**
2. Marca con "X" solo los instrumentos que deseas comparar
3. Haz clic en **Generar Análisis**
4. Compara los promedios

### Escenario 3: Verificar balanceo de evaluaciones
1. Selecciona **Criterios Evaluaciones**
2. Haz clic en **Generar Análisis**
3. Revisa que cada criterio tenga número similar de evaluaciones por trimestre

### Escenario 4: Revisar estadísticas generales de la clase
1. Selecciona **Dashboard General**
2. Haz clic en **Generar Análisis**
3. Revisa tendencias entre trimestres

---

## Notas Importantes

### 📌 Datos en Tiempo Real
- Los análisis **leen directamente** de las hojas de calificaciones
- Si editas calificaciones en `calificaciones1`, `calificaciones2`, o `calificaciones3`, los análisis reflejarán los cambios al regenerar
- No hay delay: el cambio es inmediato

### 📌 Regeneración Completa
- Cada vez que haces clic en **Generar Análisis**, se **borra todo** lo anterior
- Se crea el análisis nuevo completamente desde cero
- Esto asegura que siempre ves datos actualizados sin duplicados

### 📌 Protección
- El panel de control está **protegido en modo lectura** (warning-only)
- Puedes editar celdas pero recibirás una advertencia
- Esto evita cambios accidentales de parámetros

### 📌 Límites
- El análisis soporta hasta 50 instrumentos (lista A6:A50)
- Compatible con hasta 3 trimestres
- Sin límite práctico en número de alumnos

### 📌 Errores Comunes

| Error | Solución |
|-------|----------|
| "Por favor selecciona un tipo de análisis" | Asegúrate de que B2 no está vacío |
| Análisis no aparece | Verifica que las hojas calificacionesN existen |
| "No se encontró la hoja estadísticas" | Ejecuta nuevamente `trimester1()` |

---

## Ejemplos de Fórmulas Internas

*Esta sección es técnica, solo para referencia.*

### Media por Instrumentos
- Lee células desde `calificacionesN` donde el nombre coincida con instrumento
- Calcula `AVERAGE()` de esas celdas
- Agrupa por alumno

### Criterios Evaluaciones
- Escanea headers de `calificacionesN` para encontrar criterios
- Cuenta filas de datos por criterio
- Organiza en tabla pivot

### Notas por Alumno
- Busca alumno en `mediasN` para datos de media
- Lee row específico de ese alumno en `calificacionesN`
- Concatena resultados de los 3 trimestres

### Dashboard General
- Lee última fila de cada `mediasN` para promedio clase
- Cuenta filas con valor < 5 para suspensos
- Calcula porcentajes

---

## Próximas Mejoras Planeadas (Fase 2+)

- [ ] Gráficas de desempeño
- [ ] Exportar análisis a PDF
- [ ] Comparativa entre alumnos
- [ ] Análisis por trimestre movido
- [ ] Pronósticos de calificación final

---

## Soporte y Contacto

Si encuentras problemas o tienes sugerencias:
1. Revisa la sección "Errores Comunes" arriba
2. Consulta [README.md](README.md) para arquitectura general
3. Abre una issue en el repositorio
