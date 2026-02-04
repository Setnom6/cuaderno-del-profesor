# Informe del Sistema de Calificaciones

Este documento describe la estructura, funcionamiento y relaciones entre las hojas del sistema de calificaciones automatizado.

---

## 📋 Índice

1. [Hojas Iniciales (Configuración)](#1-hojas-iniciales-configuración)
   - [listado](#11-listado)
   - [criterios](#12-criterios)
   - [instrumentos](#13-instrumentos)
2. [Hojas Generadas](#2-hojas-generadas)
   - [calificacionesN](#21-calificacionesn)
   - [mediasN](#22-mediasn)
   - [mediasContinua](#23-mediascontinua)
   - [observacionesN](#24-observacionesn)
   - [estadísticas](#25-estadísticas)
3. [Flujo de Datos](#3-flujo-de-datos)
4. [Estado de Desarrollo](#4-estado-de-desarrollo)

---

## 1. Hojas Iniciales (Configuración)

Estas hojas deben ser completadas manualmente **antes** de ejecutar `trimester1()`, `trimester2()` o `trimester3()`.

### 1.1 listado

**Propósito**: Contiene el listado de alumnos del curso.

**Estructura**:

| Columna | Nombre | Descripción | Ejemplo |
|---------|--------|-------------|---------|
| A | Nombre | Nombre del alumno | "Juan Carlos" |
| B | Apellido 1 | Primer apellido | "García" |
| C | Apellido 2 | Segundo apellido (opcional) | "López" |

**Notas**:
- La fila 1 es la cabecera
- Los datos empiezan en la fila 2
- El sistema genera el `displayName` como: `Nombre(s) + Apellido1` (ej: "Juan Carlos García")
- Los alumnos se ordenan alfabéticamente por `Apellido1 + Apellido2`
- Los duplicados exactos se eliminan; los homónimos con diferente apellido2 se conservan

**Acciones manuales**:
- ✅ Rellenar con los datos de los alumnos
- ✅ No dejar filas en blanco intermedias

---

### 1.2 criterios

**Propósito**: Define los criterios de evaluación y sus competencias asociadas.

**Estructura**:

| Columna | Nombre | Descripción | Ejemplo |
|---------|--------|-------------|---------|
| A | Indice | Valor numérico de competencia | "1.1", "2.3" |
| B | Competencia | Nombre Competencia | "Variedades", "Comprensión Oral" |
| C | Criterio | Nombre criterio concreto | "Planificar", "Elaborar" |
| D | Clave | Identificador del criterio | "1.1 - Reconocer", "2.1 - Comprender" |

**Notas**:
- El sistema busca la columna con cabecera "clave" (case-insensitive)
- Si no existe, usa la columna D como fallback
- El **color de fondo** de cada celda de clave se usa para colorear las columnas correspondientes en calificaciones y medias. Cada color debe ser el mismo para todos los criterios de la misma competencia
- Las competencias se identifican por el primer dígito de la clave (ej: "1.1" → competencia "1")
- La única columna imprescindible, por tanto, es la de "clave", la cual debe tener exctamente la estructura "Indice - Criterio" y estar coloreada correspondientemente, las demás columnas son de apoyo por si se quiere construir la columna de "clave" mediante fórmulas del tipo ```=A2:A & " - " & C2:C```

**Acciones manuales**:
- ✅ Definir las claves de criterios (ej: "1.1", "1.2", "2.1")
- ✅ Aplicar colores de fondo a las celdas de clave para distinguir visualmente
- ✅ Definir competencias si se quiere calcular media por competencia en medias

---

### 1.3 instrumentos

**Propósito**: Define los instrumentos de evaluación por trimestre y sus criterios asociados.

**Estructura**:

| Columna | Nombre | Descripción | Ejemplo |
|---------|--------|-------------|---------|
| A | Trimestre1 | Nombre del instrumento T1 | "Examen T1" |
| B | Criterios1 | Criterios separados por coma para el instrumento en cuestión | "1.1 - Reconocer, 2.1 - Comprender" |
| C | Trimestre2 | Nombre del instrumento T2 | "Trabajo T2" |
| D | Criterios2 | Criterios | "1.1 - Reconocer, 2.1 - Comprender" |
| E | Trimestre3 | Nombre del instrumento T3 | "Proyecto T3" |
| F | Criterios3 | Criterios | "1.1 - Reconocer, 2.1 - Comprender" |
| ... | ... | ... | ... |
| H | Botones | Botones para actualizar trimestres creados manualmente | (imagen de botón) |
| ... | ... | ... | ... |
| K | Enlaces T1 | Enlaces generados automáticamente | (fórmulas) |

**Posiciones de enlaces** (generados automáticamente):
- K3, K4, K5: Enlaces a calificaciones1, observaciones1, medias1
- K10, K11, K12: Enlaces a calificaciones2, observaciones2, medias2
- K17, K18, K19: Enlaces a calificaciones3, observaciones3, medias3

**Notas**:
- Las cabeceras deben ser exactamente: "Trimestre1", "Criterios1", "Trimestre2", etc.
- Los criterios se separan por comas
- Los criterios se ordenan alfabéticamente al procesar
- Solo se crean columnas para instrumentos que tienen criterios definidos

**Menús desplegables de criterios**:

Para seleccionar los criterios sin errores, se recomienda usar menús desplegables con multiselección:

1. Seleccionar las celdas de la columna "CriteriosN" donde se quieren los desplegables
2. Ir a **Datos → Validación de datos**
3. Configurar:
   - Criterios: "Menú desplegable (de un intervalo)"
   - Intervalo: `criterios!D2:D` (o la columna de "clave")
   - Marcar "Permitir varias selecciones"
4. Guardar

> ⚠️ **Nota sobre la plantilla**: La plantilla del sistema ya incluye estos menús desplegables preconfigurados. Sin embargo, **si modificas los criterios** (añades, eliminas o cambias claves), deberás reconfigurar manualmente los menús desplegables para que reflejen los nuevos valores.

**Botones de actualización**:

Actualmente los botones para ejecutar `trimester1()`, `trimester2()` y `trimester3()` deben crearse manualmente:

1. Insertar una imagen (Insertar → Imagen → Imagen en la celda o sobre las celdas)
2. Usar una imagen ovalada o con forma de botón
3. Clic derecho sobre la imagen → "Asignar secuencia de comandos"
4. Escribir el nombre de la función: `trimester1`, `trimester2` o `trimester3`
5. Posicionar en la columna H de la hoja instrumentos

> 💡 **Propuesta de mejora**: Reemplazar los botones manuales por un **menú desplegable en la barra de menús** de Google Sheets. 
>
> **Enfoque recomendado - Script de inicialización `setup.gs`**:
> 
> En lugar de depender de triggers `onOpen` (que pueden no funcionar consistentemente), crear un script `setup.gs` que configure todos los menús y elementos de UI del sistema de una sola vez:
>
> ```javascript
> function setupSistema() {
>   // Crear menú principal
>   // Crear menú de estadísticas
>   // Configurar triggers necesarios
> }
> ```
>
> **Flujo de uso**:
> 1. **Plantilla**: Ya viene con `setupSistema()` ejecutado, lista para usar
> 2. **Usuarios avanzados**: Si necesitan reconfigurar, pueden ir a **Extensiones → Apps Script** y ejecutar `setupSistema()` manualmente
> 3. **Tutorial**: Documentar el proceso paso a paso para usuarios que necesiten ejecutarlo
>
> **Ventajas**:
> - No depende de triggers automáticos poco fiables
> - El usuario tiene control total sobre cuándo se ejecuta
> - La plantilla funciona "out of the box"
> - Permite regenerar los menús si algo falla
>
> El menú aparecería como "📊 Calificaciones" con opciones "Generar Trimestre 1", "Generar Trimestre 2", etc.

**Acciones manuales**:
- ✅ Definir nombres de instrumentos por trimestre
- ✅ Asignar criterios a cada instrumento (separados por coma)
- ✅ Crear botones de actualización (imagen + asignar script) o usar menú si está implementado
- ✅ Reconfigurar menús desplegables si se modifican los criterios
- ❌ NO modificar la columna K (enlaces automáticos)

---

## 2. Hojas Generadas

Estas hojas se crean/actualizan automáticamente al ejecutar `trimester1()`, `trimester2()` o `trimester3()`.

### 2.1 calificacionesN

**Propósito**: Hoja principal de entrada de notas por instrumento y criterio.

**Estructura**:

```
| Alumno          | Examen T1                       | Trabajo T1                  |
|                 | 1.1 - Reconocer| 1.2    |Media  | 2.1        | 2.2    | Media |
|-----------------|----------------|--------|-------|------------|--------|-------|
| Juan García     | 7.5            | 8.0    | 7.75  | 6.0        | 7.0    | 6.50  |
| Ana López       | 9.0            | 8.5    | 8.75  | 8.0        | 9.0    | 8.50  |
```

**Características**:
- **Fila 1**: Nombres de instrumentos (celdas fusionadas por bloque)
- **Fila 2**: Claves de criterios + "Media" al final de cada bloque
- **Fila 3+**: Datos de alumnos
- **Columna A**: Nombres de alumnos (protegida)
- **Columnas de criterios**: Editables, validación 0-10, coloreadas según criterio
- **Columnas de Media**: Fórmula `=AVERAGE()`, protegidas, texto rojo si < 5

**Relación con otras hojas**:
- ← Lee alumnos de `listado`
- ← Lee instrumentos y criterios de `instrumentos`
- ← Lee colores de `criterios`
- → Alimenta a `mediasN` (fórmulas referencian estas celdas)
- → Alimenta a `estadísticas` (lee columnas Media)

**Creación y actualización**:
- Se **crea** si no existe
- Se **actualiza** si existe: conserva notas existentes, añade nuevos alumnos/instrumentos
- Los datos antiguos se copian a través de una hoja temporal para evitar pérdidas
- El único caso a tener cuidado es cuando cambiamos el nombre de un instrumento de evaluación que ya había sido creado antes e introducido sus notas. En ese caso límite, si cambiamos el nombre del instrumento (Por ejemplo, de "Presentacin" a "Presentación"), se interpretará como un instrumento distinto y se perderán las calificaciones anteriores.

**Protecciones**:
- Filas 1-2 (headers): protegidas con advertencia
- Columna A (alumnos): protegida con advertencia
- Columnas Media: protegidas con advertencia

---

### 2.2 mediasN

**Propósito**: Muestra las medias por criterio y la media final por competencia.

**Estructura**:

```
| Alumno          | Media Final | 1.1  | 1.2  | 2.1  | 2.2  | (ocultas: competencias) |
|-----------------|-------------|------|------|------|------|-------------------------|
| Juan García     | 7.12        | 7.5  | 8.0  | 6.0  | 7.0  | 7.75 | 6.50              |
| Ana López       | 8.62        | 9.0  | 8.5  | 8.0  | 9.0  | 8.75 | 8.50              |
| Medias          | 7.87        | 8.25 | 8.25 | 7.0  | 8.0  | 8.25 | 7.50              |
```

**Características**:
- **Columna A**: Nombres de alumnos
- **Columna B**: Media Final (promedio de medias por competencia)
- **Columnas C+**: Media por criterio (fórmula que referencia calificacionesN)
- **Columnas ocultas**: Medias por competencia (auxiliares para Media Final)
- **Última fila**: "Medias" - promedio de toda la clase por columna
- **Formato condicional**: Texto rojo si < 5

**Cálculo de Media Final**:
```
Media Final = AVERAGE(Media_Competencia1, Media_Competencia2, ...)
Media_CompetenciaX = AVERAGE(criterios de esa competencia)
```

**Relación con otras hojas**:
- ← Lee alumnos de `listado`
- ← Lee criterios de `criterios`
- ← Lee valores de `calificacionesN` mediante fórmulas
- → NO alimenta otras hojas directamente

**Creación y actualización**:
- Se **elimina y recrea** completamente en cada ejecución
- Las fórmulas se regeneran para reflejar cambios en calificaciones

**Protecciones**:
- Toda la hoja protegida con advertencia (solo lectura recomendada)

**Menú adicional**:
- "Cálculo de Medias" permite cambiar a un cálculo "por competencias" donde primero se agrupan los instrumentos en su competencia correspondiente y, después, se calcula la media de competencias o "por criterios" donde se ignoran las competencias y se hace una media directa de todos los criterios.

---

### 2.3 mediasContinua

**Propósito**: Muestra las medias acumuladas de todos los trimestres existentes.

**Estructura**: Idéntica a `mediasN`.

**Características**:
- Calcula la media por criterio buscando en **todas** las hojas de calificaciones existentes (`calificaciones1`, `calificaciones2`, `calificaciones3`)
- Se actualiza automáticamente cada vez que se genera cualquier trimestre
- Permite ver la evolución global del alumno sin esperar al final del curso

**Relación con otras hojas**:
- ← Lee alumnos de `listado`
- ← Lee criterios de `criterios`
- ← Lee valores de `calificaciones1`, `calificaciones2`, `calificaciones3` mediante fórmulas

**Creación y actualización**:
- Se **elimina y recrea** completamente en cada ejecución de cualquier trimestre
- Solo se crea si existe al menos una hoja de calificaciones

---

### 2.4 observacionesN

**Propósito**: Registro de asistencia y observaciones cualitativas.

**Estructura**:

| Columna | Nombre | Tipo | Descripción |
|---------|--------|------|-------------|
| A | Alumno | Texto | Nombre del alumno |
| B | Faltas injustificadas | Número | Contador de faltas |
| C | Faltas justificadas | Número | Contador de faltas |
| D | Retrasos | Número | Contador de retrasos |
| E | Faltas Injustificadas (días completos) | Número | - |
| F | Faltas justificadas (días completos) | Número | - |
| G | Tarea | Número | Contador (ej: tareas no entregadas) |
| H | Libro | Número | Contador (ej: veces sin libro) |
| I | Observaciones adicionales | Texto | Campo libre |

**Características**:
- Columnas B-H: Validación de números enteros ≥ 0
- Columna I: Texto libre, ancho amplio
- Protección: Headers y columna A protegidos con advertencia

**Relación con otras hojas**:
- ← Lee alumnos de `listado`
- → NO alimenta otras hojas (hoja independiente)

**Creación y actualización**:
- Se **crea** si no existe
- Se **actualiza** si existe: inserta nuevos alumnos en orden alfabético, conserva datos existentes
- NO se elimina/recrea para preservar observaciones escritas manualmente

> 💡 **Propuesta de mejora - Hoja opcional**: Convertir `observacionesN` en una hoja **opcional**. El usuario podría elegir si crearla o no mediante:
> - Un parámetro en la configuración del sistema
> - Una opción en el menú al generar el trimestre
> - Un checkbox o celda de configuración en la hoja `instrumentos`
>
> Esto simplificaría el documento para usuarios que no necesitan registrar asistencia.

---

### 2.5 estadísticas

**Propósito**: Análisis comparativo de medias por instrumento seleccionado.

**Estructura**:

```
MEDIA POR INSTRUMENTOS
Marca los instrumentos con X para incluir en el análisis:

| Instrumentos           | Seleccionar |
|------------------------|-------------|
| Examen T1 (T1)         | X           |
| Trabajo T1 (T1)        |             |
| Examen T2 (T2)         | X           |

(fila en blanco)

| Alumno          | Examen T1 (T1) | Examen T2 (T2) | MEDIA |
|-----------------|----------------|----------------|-------|
| Juan García     | 7.75           | 8.00           | 7.88  |
| Ana López       | 8.75           | 9.00           | 8.88  |
```

**Características**:
- **Panel de selección**: Lista de todos los instrumentos de todos los trimestres
- **Marcado**: Poner "X" en columna B para incluir instrumento
- **Tabla de resultados**: Se genera al ejecutar "Estadísticas → Generar Análisis"
- **Columna MEDIA**: Promedio de instrumentos seleccionados, negrita, rojo si < 5

**Relación con otras hojas**:
- ← Lee instrumentos de `calificaciones1`, `calificaciones2`, `calificaciones3`
- ← Lee valores de columnas Media de cada `calificacionesN`
- → NO alimenta otras hojas

**Creación y actualización**:
- Se **elimina y recrea** cada vez que se ejecuta un trimestre
- La lista de instrumentos se regenera con todos los trimestres existentes

**Uso**:
1. Marcar instrumentos con "X" en columna B
2. Menú "Estadísticas → Generar Análisis"
3. La tabla aparece debajo de la lista

> ⚠️ **Limitación actual**: El menú "Estadísticas → Generar Análisis" **no se crea automáticamente**. Actualmente requiere implementación manual del menú o usar el editor de scripts para ejecutar la función directamente.

> 💡 **Propuestas de mejora**:
> 
> **1. Hoja opcional**: Al igual que `observacionesN`, convertir `estadísticas` en una hoja opcional que el usuario pueda elegir crear o no.
>
> **2. Menú automático**: Implementar la creación automática del menú "Estadísticas" mediante:
>    - Un trigger `onOpen` que añada el menú al abrir el documento
>    - Integración con el menú principal del sistema (si se implementa)
>
> **3. Mejora de diseño**: Rediseñar la interfaz de estadísticas para:
>    - Usar checkboxes nativos en lugar de "X" manual
>    - Añadir botón de "Generar" dentro de la propia hoja
>    - Incluir gráficos automáticos de los resultados

---

## 3. Flujo de Datos

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│   listado   │────▶│             │────▶│ calificacionesN │
│  (alumnos)  │     │             │     │   (notas)       │
└─────────────┘     │             │     └────────┬────────┘
                    │             │              │
┌─────────────┐     │ trimesterN()│              ├──────────────┐
│  criterios  │────▶│             │              ▼              ▼
│  (claves,   │     │             │     ┌─────────────┐  ┌──────────────┐
│   colores)  │     │             │────▶│   mediasN   │  │mediasContinua│
└─────────────┘     │             │     │ (promedios) │  │ (acumulado)  │
                    │             │     └─────────────┘  └──────────────┘
┌─────────────┐     │             │              ▲
│instrumentos │────▶│             │     calificaciones1,2,3
│ (nombres,   │     │             │              │
│  criterios) │     │             │     ┌─────────────────┐
└─────────────┘     │             │────▶│ observacionesN  │
                    └─────────────┘     │ (asistencia)    │
                                        └─────────────────┘
                                        ┌─────────────────┐
                    ┌──────────────────▶│  estadísticas   │
                    │                   │ (análisis)      │
       calificaciones1,2,3              └─────────────────┘
```

---

## 4. Estado de Desarrollo

| Módulo | Estado | Notas |
|--------|--------|-------|
| **listado** | ✅ Estable | Lectura y procesamiento completo |
| **criterios** | ✅ Estable | Lectura de claves y colores |
| **instrumentos** | ✅ Estable | Lectura por trimestre |
| **calificacionesN** | ✅ Estable | Creación, actualización, formato, protección |
| **mediasN** | ✅ Estable | Fórmulas, competencias, formato condicional |
| **mediasContinua** | ✅ Estable | Media acumulada de todos los trimestres |
| **observacionesN** | ✅ Estable | Creación, actualización incremental |
| **estadísticas** | ✅ Funcional | Selección por X, análisis de medias |

### Posibles mejoras futuras

**Prioridad alta** (mejoras de usabilidad):
- [ ] **Script `setup.gs` de inicialización**: Crear un script que configure todos los menús y elementos de UI del sistema (menú principal, menú de estadísticas, etc.). La plantilla vendría con esto ya ejecutado, pero los usuarios podrían re-ejecutarlo desde Apps Script si es necesario. Incluir tutorial paso a paso.
- [ ] **Menús de criterios dinámicos**: Actualizar automáticamente los desplegables de instrumentos cuando cambien los criterios
- [ ] **Hojas opcionales**: Permitir elegir si crear `observacionesN` y `estadísticas`

**Prioridad media** (funcionalidades adicionales):
- [ ] Exportación a PDF/informe
- [ ] Gráficos automáticos en estadísticas
- [ ] Checkboxes nativos en estadísticas (en lugar de "X")
- [ ] Cálculo de nota final ponderada

**Prioridad baja** (integraciones):
- [ ] Integración con Google Classroom
- [ ] Histórico de cambios en observaciones
- [ ] Notificaciones automáticas a familias

---

## Apéndice: Archivos del Sistema

```
src/
├── main.gs                      # Punto de entrada, trimester1/2/3()
├── utils.gs                     # Funciones auxiliares compartidas
├── calificaciones/
│   ├── calificaciones_impl.gs   # Orquestación de calificaciones
│   ├── calificaciones_data.gs   # Lectura/copia de datos antiguos
│   └── calificaciones_format.gs # Formato visual
├── medias/
│   ├── medias_impl.gs           # Orquestación de mediasN
│   ├── medias_continua.gs       # Orquestación de mediasContinua
│   ├── medias_data.gs           # Lectura de criterios y fórmulas
│   ├── medias_format.gs         # Formato visual
│   └── medias_menu.gs           # Menú de recálculo
├── observaciones/
│   ├── observaciones_impl.gs    # Orquestación de observaciones
│   ├── observaciones_data.gs    # Actualización de alumnos
│   └── observaciones_format.gs  # Formato y validación
├── estadisticas/
│   ├── estadisticas_impl.gs     # Construcción de hoja
│   ├── estadisticas_panel.gs    # Panel de selección
│   ├── estadisticas_analyze.gs  # Generación de análisis
│   ├── estadisticas_format.gs   # Formato visual
│   └── estadisticas_menu.gs     # Menú de análisis
└── tests/
    └── ...                      # Tests automatizados
```
