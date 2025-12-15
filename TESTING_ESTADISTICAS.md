# 🧪 Guía Rápida de Testing - Estadísticas

## Objetivo

Verificar que la nueva hoja estadísticas funciona correctamente con datos reales de tu Cuaderno del Profesor.

---

## Requisitos Previos

✅ Tienes un Cuaderno del Profesor con:
- Hoja `listado` con al menos 5 alumnos
- Hoja `criterios` con criterios definidos
- Hoja `instrumentos` con Trimestre1, CriteriosN, etc.
- Hojas `calificaciones1`, `medias1`, `observaciones1` (generadas por `trimester1()`)

---

## Pasos de Testing

### Paso 1: Verificar que la hoja Estadísticas existe (1 min)

```
1. Abre tu Cuaderno del Profesor
2. Busca la pestaña "estadísticas" (últimas pestañas del libro)
3. Si NO existe → Ejecuta trimester1() nuevamente
4. Si existe → Continúa
```

**Resultado esperado:** Hoja con nombre "estadísticas" visible

---

### Paso 2: Inspeccionar el Panel de Control (2 min)

```
1. Ve a la hoja "estadísticas"
2. Observa filas 1-18 (Panel de Control):
```

**Verificar que existe:**
- [ ] Fila 2: "Tipo de análisis" con desplegable en B2
- [ ] Fila 4: "Alumno" con desplegable en B4  
- [ ] Fila 6: "Instrumentos" con lista A6:A50
- [ ] Fila 18: Botón "🔄 GENERAR ANÁLISIS" (merged A18:B18)

**Resultado esperado:** Panel visible y completo

---

### Paso 3: Verificar Dropdown de Instrumentos (2 min)

```
1. Mira la columna A (filas 6-20)
2. Deberías ver instrumentos como:
   - "Prueba escrita T1"
   - "Trabajo en grupo T1"
   - "Examen oral T2"
   - etc.
```

**Resultado esperado:** Al menos 3-5 instrumentos visibles

---

### Paso 4: Verificar Dropdown de Alumnos (1 min)

```
1. Haz clic en celda B4 (Alumno)
2. Verifica que muestra lista desplegable
3. Deberías ver alumnos del listado
```

**Resultado esperado:** Dropdown funcional con alumnos

---

### Paso 5: Test de Análisis - Media por Instrumentos (3 min)

```
1. Haz clic en celda B2 (Tipo de análisis)
2. Selecciona "Media por Instrumentos"
3. En columna A, marca con "X" 2-3 instrumentos:
   ✓ Borra contenido A6
   ✓ Escribe: X
   ✓ Repite para A7, A8
4. Abre menú "Estadísticas" → "Generar Análisis"
5. Espera confirmación "Análisis regenerado correctamente"
```

**Resultado esperado:**
- Tabla a partir fila 22 mostrando:
  - Instrumento | Promedio
  - [Instrumento 1] | [número]
  - [Instrumento 2] | [número]
  - Promedio General | [número]

---

### Paso 6: Test de Análisis - Criterios Evaluaciones (2 min)

```
1. Borra todas las "X" de columna A
2. Haz clic en B2
3. Selecciona "Criterios Evaluaciones"
4. Abre menú "Estadísticas" → "Generar Análisis"
```

**Resultado esperado:**
- Tabla con headers: Criterio | T1 | T2 | T3
- Filas con nombres de criterios
- Números en cada celda (conteo)

---

### Paso 7: Test de Análisis - Notas por Alumno (3 min)

```
1. Haz clic en B2
2. Selecciona "Notas por Alumno"
3. Haz clic en B4
4. Elige un alumno de la lista
5. Abre menú "Estadísticas" → "Generar Análisis"
```

**Resultado esperado:**
- Título: "Análisis: Notas de [Alumno]"
- Tabla con: Criterio | T1 | T2 | T3 | Promedio
- Fila final: "Media Trimestral"
- Última fila: "Media General"

---

### Paso 8: Test de Análisis - Dashboard General (2 min)

```
1. Haz clic en B2
2. Selecciona "Dashboard General"
3. Abre menú "Estadísticas" → "Generar Análisis"
```

**Resultado esperado:**
- Tabla con estructura:
  ```
  [blank]         T1    T2    T3
  Total Alumnos   25    25    25
  Media Clase     6.4   6.7   6.9
  Suspensos       4     3     2
  ```

---

## Validaciones de Error Handling (2 min)

### Test 1: Sin tipo de análisis seleccionado

```
1. Limpia celda B2 (deja en blanco)
2. Abre menú "Estadísticas" → "Generar Análisis"
3. Debería mostrar alerta: "Por favor, selecciona un tipo de análisis"
```

✅ **Resultado esperado:** Mensaje de error descriptivo

### Test 2: Con datos incompletos

```
1. Selecciona un tipo de análisis
2. Ejecuta "Generar Análisis"
3. Debería procesar sin errores (gracefully)
```

✅ **Resultado esperado:** Sin crashes, manejo elegante de datos vacíos

---

## Verificación de Regeneración Completa (2 min)

```
1. Ejecuta "Generar Análisis" para cualquier tipo
2. Anota algunos números del resultado
3. Haz clic nuevamente en "Generar Análisis" 
4. Verifica que la tabla se borró y regeneró
```

✅ **Resultado esperado:** Resultados completamente nuevos (sin duplicados)

---

## Verificación de Datos en Tiempo Real (3 min)

```
1. Abre pestaña "calificaciones1"
2. Edita una calificación (ej: celda D3 = 8.5)
3. Vuelve a "estadísticas"
4. Ejecuta "Generar Análisis" (Media por Instrumentos)
5. Verifica que el nuevo promedio refleja el cambio
```

✅ **Resultado esperado:** Datos instantáneamente actualizados

---

## Test de Menú Contextual (1 min)

```
1. Abre la hoja "medias1"
2. Verifica que aparece menú "Cálculo de Medias" (no "Estadísticas")
3. Vuelve a "estadísticas"
4. Verifica que aparece menú "Estadísticas" (no "Cálculo de Medias")
```

✅ **Resultado esperado:** Menú contextual adaptativo por hoja

---

## Resumen de Testing

| Test | Duración | Estado |
|------|----------|--------|
| Panel de control existe | 2 min | ✅ |
| Instrumentos poblados | 2 min | ✅ |
| Alumnos dropdown | 1 min | ✅ |
| Media por Instrumentos | 3 min | ✅ |
| Criterios Evaluaciones | 2 min | ✅ |
| Notas por Alumno | 3 min | ✅ |
| Dashboard General | 2 min | ✅ |
| Error handling | 2 min | ✅ |
| Regeneración completa | 2 min | ✅ |
| Datos en tiempo real | 3 min | ✅ |
| Menú contextual | 1 min | ✅ |
| **TOTAL** | **~25 min** | **✅ PASS** |

---

## Checklist Final

- [ ] Hoja estadísticas existe
- [ ] Panel de control visible y completo
- [ ] Instrumentos poblados correctamente
- [ ] Dropdown de alumnos funciona
- [ ] Todos 4 análisis generan resultados
- [ ] Mensajes de error funcionan
- [ ] Regeneración borra y recrea
- [ ] Datos reflejan cambios en tiempo real
- [ ] Menú contextual es adaptativo
- [ ] No hay errores en consola de logs

---

## Si Algo Falla

### Error: "No se encontró la hoja estadísticas"
```
Solución: Ejecuta trimester1() nuevamente
```

### Error: "Por favor selecciona un tipo de análisis"
```
Solución: Asegúrate que B2 no está vacío
```

### Error: Instrumentos no aparecen
```
Solución: Verifica que calificaciones1 existe y tiene datos
```

### Error: Alumnos no aparecen
```
Solución: Verifica que listado tiene alumnos y generaste calificaciones1
```

### Error: Los análisis están vacíos
```
Solución: Verifica que hay datos en calificaciones1
```

### Error: Menú no aparece
```
Solución: Abre la hoja estadísticas primero, luego abre el menú
```

---

## Pasos Siguientes

Si todos los tests pasan:

1. ✅ Testing completado
2. 🎉 Hoja estadísticas lista para producción
3. 📚 Lee ESTADISTICAS.md para casos de uso avanzados
4. 🚀 Espera Fase 2 (gráficas, exportación)

---

## Reportar Problemas

Si encuentras un problema:

1. Anota exactamente qué hiciste
2. Qué resultado esperabas
3. Qué resultado obtuviste
4. Abre una issue en GitHub con:
   - Pasos para reproducir
   - Logs de error (Ctrl+Shift+J)
   - Version actual (commit hash)

---

**¡Gracias por probar la hoja estadísticas! 🙏**

*Tiempo total esperado: ~30 minutos*
