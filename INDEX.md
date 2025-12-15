# 📚 Índice de Documentación

Guía rápida para encontrar la documentación que necesitas.

---

## 🎯 Para Comenzar

### Si eres nuevo en el proyecto
1. **[README.md](README.md)** - Punto de partida
   - Qué es el proyecto
   - Cómo instalar
   - Arquitectura general
   - Comandos básicos

2. **[Tutorial.pdf](Tutorial.pdf)** - Tutorial interactivo paso a paso
   - Instalación detallada
   - Ejemplos prácticos
   - Captura de pantallas

---

## 📊 Para Usar Estadísticas (Fase 1)

### Guía de Usuario
**[ESTADISTICAS.md](ESTADISTICAS.md)** - TODO sobre la hoja estadísticas
- Panel de control explicado
- 4 tipos de análisis detallados
- Ejemplos de salida
- 4 escenarios de uso típicos
- Notas técnicas
- Troubleshooting

### Validar que Funciona
**[TESTING_ESTADISTICAS.md](TESTING_ESTADISTICAS.md)** - Plan de testing
- 8 pasos de validación (~25 min)
- Checklist de verificación
- Error handling
- Datos en tiempo real
- Pasos siguientes

---

## 🏗️ Para Entender la Arquitectura

### Resumen Visual Completo
**[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Visión general del proyecto
- Estadísticas (3411 LOC, 24 archivos)
- Arquitectura en 4 capas
- Módulos por funcionalidad
- Flujos principales
- Estructura de archivos
- Roadmap Fase 2-5

### Cambios Recientes
**[CHANGELOG.md](CHANGELOG.md)** - Historial de cambios
- Fase actual (2.1.0)
- Qué se agregó
- Qué se modificó
- Notas de implementación
- Próximas mejoras planeadas

---

## 🧪 Para Testing y Desarrollo

### Suite de Tests
**[TESTS.md](TESTS.md)** - Documentación de testing
- Cómo ejecutar tests
- Estructura de tests
- Requisitos
- ⚠️ Advertencias importantes

### Testing de Estadísticas
**[TESTING_ESTADISTICAS.md](TESTING_ESTADISTICAS.md)** - Plan específico
- 8 tests prácticos
- Error handling
- Validaciones
- Troubleshooting

---

## 📄 Otros Archivos Importantes

### Licencia
**[LICENSE](LICENSE)** - BSD 3-Clause License
- Términos de uso
- Derechos reservados
- Condiciones

### Configuración
**[appsscript.json](appsscript.json)** - Config del proyecto Apps Script
- Versión de biblioteca
- Timeouts
- Dependencias

---

## 🗂️ Estructura de Carpetas

```
├── README.md                  ← Punto de partida
├── ESTADISTICAS.md           ← Guía usuario (estadísticas)
├── PROJECT_SUMMARY.md        ← Resumen visual completo
├── CHANGELOG.md              ← Historial de cambios
├── TESTING_ESTADISTICAS.md   ← Plan de testing
├── SESSION_SUMMARY.md        ← Resumen sesión completada
├── TESTS.md                  ← Documentación testing general
├── Tutorial.pdf              ← Tutorial interactivo
├── LICENSE                   ← Licencia
├── appsscript.json          ← Config
│
└── src/
    ├── main.gs                    # API pública
    ├── utils.gs                   # Utilidades generales
    │
    ├── calificaciones_impl.gs     # Calificaciones
    ├── calificaciones_data.gs
    ├── calificaciones_format.gs
    │
    ├── medias_impl.gs             # Medias
    ├── medias_data.gs
    ├── medias_format.gs
    ├── medias_menu.gs
    │
    ├── observaciones_impl.gs      # Observaciones
    ├── observaciones_data.gs
    ├── observaciones_format.gs
    │
    ├── estadisticas_impl.gs       # ESTADÍSTICAS (Fase 1)
    ├── estadisticas_panel.gs
    ├── estadisticas_analyze.gs
    ├── estadisticas_format.gs
    ├── estadisticas_menu.gs
    │
    └── tests/
        ├── test_runner.gs
        ├── test_main.gs
        ├── test_utils.gs
        ├── test_calificaciones.gs
        ├── test_medias.gs
        ├── test_observaciones.gs
        └── test_integration.gs
```

---

## 🔍 Búsqueda Rápida

### Quiero...

**...comenzar desde cero**
→ [README.md](README.md) + [Tutorial.pdf](Tutorial.pdf)

**...usar la hoja estadísticas**
→ [ESTADISTICAS.md](ESTADISTICAS.md)

**...verificar que estadísticas funciona**
→ [TESTING_ESTADISTICAS.md](TESTING_ESTADISTICAS.md)

**...entender la arquitectura completa**
→ [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

**...ver qué cambió recientemente**
→ [CHANGELOG.md](CHANGELOG.md) o [SESSION_SUMMARY.md](SESSION_SUMMARY.md)

**...escribir nuevas pruebas**
→ [TESTS.md](TESTS.md)

**...reportar un problema**
→ [SESSION_SUMMARY.md](SESSION_SUMMARY.md) (sección Contacto)

---

## 📊 Documentación por Rol

### Para Docentes (Usuarios Finales)
1. [README.md](README.md) - Introducción
2. [Tutorial.pdf](Tutorial.pdf) - Paso a paso
3. [ESTADISTICAS.md](ESTADISTICAS.md) - Cómo usar análisis

### Para Desarrolladores
1. [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Arquitectura
2. [README.md](README.md) - Estructura detallada
3. [CHANGELOG.md](CHANGELOG.md) - Historia de cambios
4. [TESTS.md](TESTS.md) - Testing
5. **Código** - Comentarios JSDoc en cada archivo

### Para QA / Testing
1. [TESTING_ESTADISTICAS.md](TESTING_ESTADISTICAS.md) - Plan específico
2. [TESTS.md](TESTS.md) - Suite general
3. [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Arquitectura

### Para Project Managers
1. [SESSION_SUMMARY.md](SESSION_SUMMARY.md) - Estado actual
2. [CHANGELOG.md](CHANGELOG.md) - Roadmap futuro
3. [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Alcance técnico

---

## 🎯 Lecturas Recomendadas por Duración

### ⚡ Quick Read (5 min)
- [SESSION_SUMMARY.md](SESSION_SUMMARY.md) - Resumen ejecutivo

### 📖 Lectura Normal (15 min)
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Visión completa
- [CHANGELOG.md](CHANGELOG.md) - Cambios recientes

### 📚 Lectura Profunda (30+ min)
- [README.md](README.md) - Documentación técnica
- [ESTADISTICAS.md](ESTADISTICAS.md) - Guía completa
- [TESTING_ESTADISTICAS.md](TESTING_ESTADISTICAS.md) - Plan testing

### 🎓 Para Aprender (1-2 horas)
- [Tutorial.pdf](Tutorial.pdf) - Tutorial interactivo
- [TESTS.md](TESTS.md) - Sistema de testing
- Revisar código con comentarios JSDoc

---

## 📞 Soporte

### Problemas Comunes
1. Consulta [ESTADISTICAS.md](ESTADISTICAS.md) - Sección "Errores Comunes"
2. Consulta [TESTING_ESTADISTICAS.md](TESTING_ESTADISTICAS.md) - "Troubleshooting"
3. Abre una issue en GitHub

### Consultas Técnicas
1. [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Arquitectura
2. [README.md](README.md) - Detalles técnicos
3. Código con comentarios JSDoc

### Sugerencias de Features
1. Consulta [CHANGELOG.md](CHANGELOG.md) - Roadmap
2. Abre una issue con etiqueta "enhancement"

---

## 🔗 Enlaces Rápidos

| Documento | Propósito | Duración |
|-----------|-----------|----------|
| [README.md](README.md) | Punto de partida | 15 min |
| [ESTADISTICAS.md](ESTADISTICAS.md) | Usar análisis | 20 min |
| [TESTING_ESTADISTICAS.md](TESTING_ESTADISTICAS.md) | Validar código | 25 min |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Entender arquitectura | 20 min |
| [CHANGELOG.md](CHANGELOG.md) | Ver cambios | 10 min |
| [SESSION_SUMMARY.md](SESSION_SUMMARY.md) | Resumen ejecutivo | 5 min |
| [TESTS.md](TESTS.md) | Testing | 15 min |
| [Tutorial.pdf](Tutorial.pdf) | Aprender paso a paso | 60 min |

---

## ✅ Checklist de Documentación

### Para Usuarios Nuevos
- [ ] Leí [README.md](README.md)
- [ ] Seguí el [Tutorial.pdf](Tutorial.pdf)
- [ ] Ejecuté `trimester1()`
- [ ] Abrí hoja estadísticas
- [ ] Seguí los pasos en [TESTING_ESTADISTICAS.md](TESTING_ESTADISTICAS.md)
- [ ] Leí [ESTADISTICAS.md](ESTADISTICAS.md) para casos de uso

### Para Desarrolladores
- [ ] Leí [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
- [ ] Entiendo la arquitectura en 4 capas
- [ ] Revisé los archivos .gs con comentarios
- [ ] Ejecuté los tests con [TESTS.md](TESTS.md)
- [ ] Entiendo el roadmap en [CHANGELOG.md](CHANGELOG.md)

### Para Testers
- [ ] Leí [TESTING_ESTADISTICAS.md](TESTING_ESTADISTICAS.md)
- [ ] Completé los 8 pasos de validación
- [ ] Revisé todos los casos de error
- [ ] Probé datos en tiempo real

---

## 🚀 Próximos Pasos

1. **Elige tu rol:**
   - Docente → [Tutorial.pdf](Tutorial.pdf) + [ESTADISTICAS.md](ESTADISTICAS.md)
   - Desarrollador → [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) + código
   - QA → [TESTING_ESTADISTICAS.md](TESTING_ESTADISTICAS.md)

2. **Lee la documentación relevante** (ver tabla de duración)

3. **Prueba la funcionalidad** (si aplica)

4. **Proporciona feedback** o sugiere mejoras

---

## 📝 Información de Versión

- **Versión:** 2.1.0 (con Estadísticas Fase 1)
- **Estado:** Beta estable
- **Última actualización:** Dic 15, 2024
- **Documentación:** Completa y actual

---

**¡Bienvenido! Elige una sección arriba para comenzar.** 🎉
