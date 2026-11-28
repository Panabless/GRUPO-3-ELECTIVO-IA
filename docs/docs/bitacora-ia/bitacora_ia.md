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
  - Se recorrió la pantalla en un navegador: campos vacíos, éxito y prueba con CAR-02.
  - Ya publicado en Vercel con Supabase real (22-11-2026): Simón Gallardo comprobó que la página carga los datos desde Supabase y que el servidor rechaza CAM-03 por no tener alerta activa. Natalia Órdenes registró la orden de CAM-07 (folio ORD-001), comprobó en `?prueba` que el Camión de combustible 2 fuera de servicio es rechazado y revisó en Supabase que la tabla `orden` quedó con una sola fila. Luego probó estos casos de error, y en ninguno apareció una fila nueva en la tabla `orden`:
    - Caso 1 (camión de combustible fuera de servicio): CAM-12 con el Camión de combustible 2 en el Sector D. Mostró «La orden no se guardó - Ese camión de combustible no está disponible. Elija uno disponible.»
    - Caso 2 (orden duplicada): CAM-07 con el Camión de combustible 1 en el Sector B. Mostró «La orden no se guardó - CAM-07 ya tiene la orden ORD-001 registrada. No se creó otra.»
    - Caso 3 (camión sin alerta): CAM-03 con el Camión de combustible 1 en el Sector B. Mostró «La orden no se guardó - CAM-03 no tiene una alerta activa: no corresponde asignarle una orden.»
    - Caso 4 (campos vacíos): sin elegir ningún dato. Mostró «Elija el camión que necesita combustible.», «Elija el sector donde el operador se encontrará con el camión.» y «Elija el camión de combustible que irá; la orden le llega a su operador.»
  - Video (22-11-2026): Gabriel Vásquez recorrió la página publicada en incógnito y grabó la demostración: registró la orden de CAM-12 (folio ORD-003) y mostró que se mantiene al recargar; luego intentó una segunda orden para CAM-21, que el servidor rechazó porque ya tenía la orden ORD-002, y una orden para CAM-03, rechazada por no tener alerta activa.
  - Corrección al publicar: la primera versión mostraba «No se pudieron cargar los datos». En los registros (Logs) de Vercel apareció «Invalid API key»: la clave de Supabase se había copiado mal en las variables de entorno. Se volvió a copiar desde la fuente, se republicó y funcionó.

## Encargo 6: Robustecimiento, seguridad y permisos sobre la orden (Avance 8)

**Encargo entregado al agente (formato clase 6.1):**
- **Contexto:** PoC del Avance 7 publicada (asignar la orden, HU-04, en `src/`). Se entregaron las instrucciones del Avance 8, `docs/historias.md` (HU-04 y HU-05), `docs/datos/estructura_datos.md` y, como especificación, dos tablas propuestas por el agente a partir de las historias y revisadas por Simón Gallardo:
  - el conjunto de reglas de validación (campo, obligatorio, tipo, largo o rango, mensaje), que quedó en `docs/robustecimiento.md`;
  - la matriz de permisos: el controlador crea, consulta todas, cierra y anula solo las propias; el operador consulta y marca en proceso solo las de su camión de combustible; el supervisor solo consulta. Quedó en `docs/permisos.md`.
- **Intención:** Completar sobre la orden las operaciones de consultar, actualizar el estado y anular (baja lógica), con validación en tres capas y estados de pantalla. Agregar inicio de sesión y permisos por rol verificados en el servidor y en la base de datos.
- **Restricciones:**
  - Solo la orden y sus tablas, sin ampliar el alcance.
  - Ninguna regla puede quedar solo en la pantalla, y ocultar un botón no cuenta como permiso.
  - La clave secreta de Supabase nunca va en el navegador ni en el repositorio.
  - Nunca borrar filas.
  - Sin librerías nuevas.
  - Conservar lo que la persona escribió cuando hay un error.
  - Datos y cuentas ficticios.
- **Verificación:**
  - Los 5 intentos de rotura de la clase 6.1.
  - Las 4 pruebas de la clase 6.2, con dos cuentas de roles distintos.
  - Probar las políticas como cada rol directamente en la base de datos, no solo a través de la pantalla.

**Registro:**
- **Objetivo:** Que la acción de la PoC resista uso real (datos malos, doble envío, cortes) y que cada persona solo pueda hacer lo que su rol permite.
- **Instrucción entregada:** El encargo de arriba, con las dos tablas como especificación.
- **Respuesta obtenida:**
  - `src/db/esquema.sql` nuevo: baja lógica, políticas RLS y disparador de cambios de estado.
  - `src/api/login.js` y `src/api/_auth.js`.
  - `src/api/ordenes.js` con consultar, crear, cambiar estado y anular.
  - `src/index.html` con inicio de sesión, listado, detalle y acciones.
  - `docs/robustecimiento.md` y `docs/permisos.md`.
- **Qué se aceptó y qué se corrigió o rechazó:**
  - **Corregido: políticas que se combinaban mal.** El primer borrador tenía tres políticas de actualización separadas (operador marca en proceso, controlador cierra, controlador anula). Al probarlas como cada rol en Postgres, el controlador **pudo cerrar una orden «emitida»**: Postgres combina la condición de entrada (`using`) de una política con la de salida (`with check`) de otra. Era una política permisiva con apariencia de protegida. Se corrigió dejando una política por rol y moviendo «qué cambio de estado puede hacer cada rol» a un disparador que compara el antes y el después. Se repitió la prueba y ahora se rechaza.
  - **Rechazado: seguir usando la clave secreta en el servidor.** Esa clave se salta RLS, así que las políticas habrían sido decorativas. Ahora el servidor usa el token de la persona más la clave pública, y la clave secreta se sacó de Vercel.
  - **Rechazado: iniciar sesión desde el navegador con la librería de Supabase.** Exigía poner la clave pública en la página y permitía hablar con la base de datos sin pasar por el servidor. El inicio de sesión pasa por `/api/login`.
  - **Corregido: la regla 1:1 entre alerta y orden del Avance 7 (`unique`).** Impedía emitir una orden nueva después de anular. Se cambió por «una sola orden vigente por alerta», que además sigue frenando el doble envío.
  - **Corregido: un mensaje mostraba tal cual lo que venía en la dirección.** Con `/#orden/<script>` el texto aparecía en el mensaje. La pantalla ya lo escapaba, pero el servidor ahora responde «La orden solicitada no existe».
  - **Corregido: título equivocado sin conexión.** Al cortar internet, la pantalla decía «Problema del sistema», cuando el problema era la conexión de la persona. Ahora dice «Sin conexión», para distinguir el origen como pide la pauta.
  - **Aceptado:** los botones se muestran según el rol solo por comodidad. El modo `?prueba` los muestra todos para demostrar que el servidor decide.
  - **Declarado como pendiente:** los folios pueden saltar números cuando la base de datos rechaza un intento.
- **Cómo se verificó:**
  - **Base de datos:** se ejecutó `esquema.sql` dos veces seguidas en un Postgres 16 local, con los roles `anon` y `authenticated` y `auth.jwt()` imitando Supabase. Se hicieron 33 pruebas actuando como cada rol: sin sesión, cuenta sin rol, controlador, operador A, operador B y supervisor. Ver, crear, cambiar, borrar, anular sin motivo, motivo de 300 caracteres y cambios de estado fuera de orden.
  - **Servidor:** más de 30 casos contra un Supabase simulado: inicio de sesión, 401 sin token, 404 del registro de otro operador, 403 del operador que crea o anula, doble envío, base de datos caída.
  - **Pantalla:** recorrido completo en un navegador automático, con 14 capturas, incluido el modo sin conexión.
  - **En Vercel con Supabase real (27-11-2026 en adelante):** PENDIENTE. Completar con lo que probó Natalia Órdenes y con los minutos del video.
