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
## Encargo 3: Prototipo navegable y corrección de la estructura de datos (Avance 5)

- **Objetivo:** Construir el prototipo navegable del flujo principal a partir de las historias y los wireframes del Avance 4, y corregir la estructura de datos según la retroalimentación del Avance 3, porque el formulario del prototipo solo puede usar campos que existan en ella.
- **Instrucción entregada:** Simón le pidió a Claude armar el código del prototipo, entregándole las instrucciones del Avance 5, la retroalimentación del Avance 3, docs/historias.md, docs/wireframes/ y docs/datos/estructura_datos.md. Se pidió usar los nombres de campos de la estructura de datos y que la navegación, la validación del formulario y los estados funcionaran de verdad.
- **Respuesta obtenida:** Un prototipo en prototipo/index.html (4 pantallas, retorno en todas, dos caminos alternativos, estados vacío, cargando y sin conexión), docs/prototipo.md y la estructura de datos con la tabla CARRO, ORDEN.id_carro, ORDEN.causa_demora y ALERTA.nivel_detectado opcional.
- **Qué se aceptó y qué se corrigió:** Se aceptó la estructura de 4 pantallas porque sigue el wireframe del Avance 4. Se corrigió: (1) el formulario pedía un «Operador» que no existía en la estructura de datos; se reemplazó por el camión de combustible (CARRO), que trae a su operador, y así también se incorporó el carro que pidió la profesora; (2) el camión sin señal no tenía nivel, pero 'nivel_combustible' es obligatorio; ahora muestra su último nivel marcado como no confiable; (3) al cerrar la orden, CAM-07 seguía en 12 %; (4) los ejemplos de la estructura se contradecían con el flujo (CAM-07 «critico» con su orden cerrada); se corrigió, pero al compararlo con el prototipo en vivo (no solo con la propia tabla) apareció una segunda contradicción: ese mismo camión y esa misma alerta, en `prototipo/index.html`, seguían «crítico» y sin orden asignada, porque es el camión que se usa para asignar la orden en la demo interactiva. Se separaron los dos casos usando CAM-30 para el ejemplo con la orden ya cerrada, dejando CAM-19 y CAM-07 intactos porque sí coinciden con el prototipo. También se agregó 'ultimo_abastecimiento' a CAMION, campo que el prototipo usa (pantalla de detalle, HU-02) pero que faltaba en la estructura; (5) el análisis ético mostró que la lista dejaba al final a los camiones sin señal; se cambió el orden (ver docs/etica.md).
- **Cómo se verificó:** Se recorrió el prototipo en un navegador de principio a fin, más los dos caminos alternativos, Cancelar y los tres estados. Se siguió el caso CAM-07 en la estructura de datos (alerta → orden → cierre) para revisar que todas las tablas contaran la misma historia y que cada clave externa de los ejemplos existiera. Además, se comparó cada ID de camión, carro y orden de la estructura de datos directamente contra los datos de ejemplo del código ('prototipo/index.html'), no solo contra el propio documento, para confirmar que ningún ID contara dos historias distintas. Asimismo, se calcularon los contrastes de color y se midieron los botones para B3. El enlace publicado fue recorrido por Ikki Saito.

## Encargo 4: Diseño de prueba de usuarios, pauta de validación y plan de levantamiento (Avance 6)

- **Objetivo:** Ajustar las tareas, la pauta y el plan de la prueba de usuarios a las condiciones de la sala de control (ruidosa, confidencial y con poco tiempo disponible) y revisar que no sugirieran respuestas.
- **Instrucción entregada:** Las instrucciones del Avance 6, el borrador del contenido de `docs/prueba-usuarios.md` y `docs/pauta-validacion.md`, el prototipo publicado y las restricciones del lugar con todos los antecedentes pertinentes.
- **Respuesta obtenida:** Correcciones de redacción y de diseño de ambos documentos y un plan con grabación solo de pantalla y menos participantes.
- **Qué se aceptó y qué se corrigió:** Se aceptó mantener las tres tareas y los tiempos del borrador. Se corrigió: (1) la tarea 1 insinuaba que había un dato dudoso y ahora pregunta qué camión revisaría primero; (2) una pregunta de cierre suponía que hubo dificultad y ahora pregunta qué fue lo más fácil y lo más difícil; (3) el criterio de la tarea 2 decía «carro», pero la pantalla dice «camión de combustible»; (4) se agregó qué hacer si la tarea 3 depende de una orden que no se registró en la tarea 2. Se ajustó la muestra a 1 o 2 controladores, 1 jefe de turno y 1 operador, con umbrales de «todos sin ayuda». 
- **Cómo se verificó:** Se compararon los escenarios y los criterios de éxito con los datos de ejemplo y los nombres de pantalla del prototipo, y se revisó cada pregunta para que no sugiera la respuesta ni pida opiniones sobre el futuro.

## Encargo 5: Arquitectura y prueba de concepto de HU-04 (Avance 7)

**Encargo entregado al agente (formato clase 6.1):**
- **Contexto:** Somos el Equipo 3. La solución monitorea el combustible de una flota de camiones mineros autónomos. El camino delgado elegido es HU-04 (`docs/historias.md`): el controlador asigna la orden de reabastecimiento al operador del camión de combustible, indicando el camión y el sector de encuentro. Se entregaron `docs/datos/estructura_datos.md`, `prototipo/index.html` (pantalla «Asignar orden» ya probada) y las instrucciones del Avance 7.
- **Intención:** Que esa única acción funcione de verdad publicada en Vercel. El formulario se envía, el servidor valida, la orden se guarda en Supabase y la pantalla muestra el folio o un error claro.
- **Restricciones:**
  - Validar en la pantalla y también en el servidor: un dato inválido no se guarda aunque el formulario lo deje pasar.
  - Usar solo los nombres de tablas y campos de la estructura de datos.
  - Ninguna clave en el código: las claves van solo en las variables de Vercel, y `.env.example` lleva solo los nombres.
  - Sin librerías nuevas ni servidor propio.
  - Sin pantallas extra: el resto queda simulado en el prototipo.
  - Datos de ejemplo inventados.
  - Nunca borrar lo que la persona eligió.
- **Verificación:** Probar el caso de éxito y los intentos de rotura: campo vacío, doble envío, texto larguísimo, base de datos sin conexión y registro inexistente. Comprobar en Supabase que solo el caso de éxito deja una fila.

**Registro:**
- **Objetivo:** Construir la PoC de HU-04 y documentar su arquitectura en `docs/arquitectura.md`.
- **Instrucción entregada:** El encargo de arriba, más la plantilla de la clase 5.2 (tabla de piezas y camino delgado) y la presentación de la clase 6.1 (capas de validación, mensajes de error y los 5 intentos de rotura).
- **Respuesta obtenida:** `src/index.html`, las funciones `src/api/ordenes.js` y `src/api/opciones.js`, `src/db/esquema.sql` (6 tablas con restricciones y datos de ejemplo), `docs/arquitectura.md`, la sección PoC del README y `.env.example`.
- **Qué se aceptó y qué se corrigió o rechazó:**
  - Se aceptó la arquitectura de pantalla → función de Vercel → Supabase, porque es la que pide el curso.
  - Se rechazó reutilizar el servidor Node.js del Avance 3: la profesora pidió no armar un backend propio.
  - Se rechazó que la pantalla escribiera directo en Supabase con la clave pública. Era más simple, pero cualquiera podría guardar órdenes sin pasar por la validación del servidor. Por eso las tablas tienen seguridad por filas activada y solo la función del servidor tiene la clave secreta.
  - Se corrigió que el folio se inventaba en la pantalla (en el prototipo era fijo, ORD-003). Ahora lo genera la base de datos, para que no se repita.
  - Se aceptó la regla de que un camión sin alerta activa no puede recibir orden, porque en la estructura de datos toda orden nace de una alerta.
  - El doble envío se bloquea en tres capas: el botón se desactiva mientras se envía, el servidor revisa si la alerta ya tiene orden y la base de datos tiene `id_alerta` único.
  - Se agregaron permisos explícitos para la clave del servidor en el SQL, porque los proyectos nuevos de Supabase pueden no darlos por defecto.
  - Se quitó una importación sin uso en `api/opciones.js`.
- **Cómo se verificó:**
  - Antes de publicar, se ejecutó el servidor contra una base de datos simulada con 8 casos: vacío, texto de 5.000 caracteres, camión inexistente, camión de combustible fuera de servicio, camión sin alerta, éxito (ORD-001), doble envío y cuerpo inválido. Además se probaron la base de datos caída y las variables faltantes. Solo el caso de éxito guardó una fila; los demás respondieron 400, 409 o 503 con su mensaje.
  - Se recorrió la pantalla en un navegador: campos vacíos, éxito y `?prueba` con CAR-02.
  - Ya publicado en Vercel con Supabase real: Natalia Órdenes probó https://grupo-3-electivo-ia-src.vercel.app/ en ventana de incógnito. Caso exitoso: CAM-07, Sector B y Camión de combustible 1 dieron el folio ORD-001, y la fila apareció en Supabase (tabla "orden"). Caso de error: Como prueba se usó, CAM-12 con el Camión de combustible 2 (fuera de servicio) en el Sector D y mostró "La orden no se guardó - Ese camión de combustible no está disponible. Elija uno disponible." y en Supabase no apareció una fila nueva en la tabla "orden".
