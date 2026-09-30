# Bitácora de uso de IA

## Encargo 1: Estructura de carpetas y guía de configuración del repositorio

- **Objetivo:** Obtener la estructura de carpetas mínima y los pasos para preparar el repositorio del Avance 3 (ramas, carpetas, README, .gitignore y .env.example).
- **Instrucción entregada:** Se entregaron a la IA las instrucciones del Avance 3 y los Avances 1 y 2 en PDF, y se pidió un paso a paso de lo que había que hacer.
- **Respuesta obtenida:** Una guía con la rama dev, las carpetas src/ y docs/ (unidad1, bitacora-ia, datos), el .gitignore, el .env.example, un README con cinco secciones y los comandos de git.
- **Qué se aceptó y qué se corrigió:** Se aceptó la estructura de carpetas y los archivos. Se corrigió el flujo de trabajo: el repositorio pertenece a otra cuenta del equipo, por lo que no fue posible agregar al colaborador desde la cuenta propia. Los títulos del README quedaron sin espacio después de los # y se corrigieron.
- **Cómo se verificó:** Se comparó cada punto con la lista de la Figura 1 de las instrucciones. Se revisó con git status y en github.com que las carpetas y archivos estuvieran en la rama dev.

## Encargo 2: Boceto de las tablas de la base de datos

- **Objetivo:** Proponer las tablas, campos, claves y relaciones a partir de los sustantivos del caso de uso del Avance 2.
- **Instrucción entregada:** Se pidió un diagrama en Mermaid y dos ejemplos por tabla con los campos obligatorios marcados, siguiendo el formato de la Figura 2 de las instrucciones.
- **Respuesta obtenida:** Cinco tablas (CAMION, ALERTA, ORDEN, SECTOR, USUARIO) con tipos, claves primarias y externas, cardinalidades y filas de ejemplo.
- **Qué se aceptó y qué se corrigió:** Se aceptó la propuesta de cinco tablas sin cambiar su estructura. Se revisó que cada tabla saliera de un sustantivo del caso de uso del Avance 2 (camión, alerta, orden, sector y controlador). Se comprobó que los estados de CAMION incluyeran los del escenario y las extensiones (crítico, sin señal, en proceso y abastecido), y que el nivel inicial y la hora del evento se pudieran obtener desde ALERTA, como exige la postcondición del caso de uso. Se dejó cerrada_en como campo opcional en ORDEN, porque queda vacío hasta que el carro abastecedor termina.
- **Cómo se verificó:** Se contrastó cada tabla con los pasos del escenario principal del Avance 2, se comprobó que cada tabla tuviera dos ejemplos completos sin campos obligatorios vacíos y se revisó que el diagrama se dibujara en GitHub.