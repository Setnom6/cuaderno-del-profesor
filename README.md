# Evaluación Automatizada con Google Apps Script

Este proyecto permite tener un Cuaderno del Profesor en formato de hoja de cálculo de Google de forma que emplea un sistema de calificaciones basada en Competencias, Criterios e Instrumentos de Evaluación que es fácil de mantener y completar.

---

## Qué hace

Para cada clase, basándose en el ```listado``` de alumnos, los ```criterios``` de evaluación y una serie de ```instrumentos``` de evaluación por trimestre, crea un desglose de las calificaciones y calcula la media trimestral.

## Instalación

Para una correcta instalación y ejemplos de uso, vaya al ```Tutorial.pdf``` que se encuentra en la raíz de este repositorio. El propio tutorial, así como la ```plantillaInicial``` y un Cuaderno del Profesor completo como ejemplo de uso (```ejemploCompleto```) también se pueden acceder desde

[Drive del repositorio](https://drive.google.com/drive/folders/1Wz7NI7SP5aU2EMRdMaSD7-jkM6zbL2Xv?usp=sharing)

---

## Estructura del repositorio

- `README.md` — Documentación (este archivo).
- `LICENSE` — Licencia del proyecto.
- `src/` — Código fuente del proyecto (archivos de Apps Script):
	- `calificacionesConstructor.gs` — Lógica para construir las calificaciones por alumno/criterio.
	- `formatter.gs` — Funciones de formato y utilidades para la hoja de cálculo.
	- `main.gs` — Entradas principales y funciones de orquestación.
	- `mediasConstructor.gs` — Cálculo de medias y promedios por trimestre y materia.

Nota sobre la plantilla de Drive

La `plantillaInicial` disponible en el Drive del repositorio ya contiene un proyecto de Google Apps Script con el código fuente operativo. El código que aparece en esa plantilla también se incluye en la carpeta `src/` de este repositorio por completitud y para facilitar su edición y auditoría local. Puedes usar directamente la plantilla en Drive para comenzar, o bien importar/pegar los archivos de `src/` en tu propio proyecto de Apps Script si prefieres trabajar desde el editor web.

## Créditos
Creado por José Manuel Montes Armenteros.  
Inspirado en un sistema modular de evaluación en Google Sheets para docentes.

Licencia: BSD 3-Clause License
