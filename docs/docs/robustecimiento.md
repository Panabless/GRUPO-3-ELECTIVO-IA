# Robustecimiento funcional · Órdenes de reabastecimiento (Equipo 3)

Alcance: el objeto de la acción de la PoC, la **orden de reabastecimiento** (tabla `orden`), y sus tablas asociadas (`alerta`, `camion`, `sector`, `carro`, `usuario`). El resto del sistema (monitor, sensores, historial) sigue simulado en el prototipo.

Dirección publicada: https://grupo-3-electivo-ia-src.vercel.app/ · Código: `src/` · Reglas de la base de datos: `src/db/esquema.sql`

## 1. Operaciones sobre la orden

| Operación | Cómo se hace en la aplicación | Quién (ver `permisos.md`) | Dónde está |
|---|---|---|---|
| Crear | Formulario «Asignar orden»: camión + sector de encuentro + camión de combustible → folio ORD-00X | Controlador | `POST /api/ordenes` |
| Consultar | Listado «Órdenes» con folio, camión, sector, camión de combustible, **estado** y hora. Al tocar un folio se abre su detalle (`#orden/ORD-00X`) | Controlador y supervisor: todas. Operador: solo las de su camión de combustible | `GET /api/ordenes` y `GET /api/ordenes?id=` |
| Actualizar (cambio de estado) | Botón «Marcar en proceso» (emitida → en proceso) y botón «Confirmar cierre» (en proceso → cerrada, HU-05) | Operador marca en proceso; controlador confirma el cierre | `PATCH /api/ordenes?id=` con `accion` |
| Dar de baja (borrado lógico) | Botón «Anular orden» + motivo obligatorio. La orden pasa a `anulada` con fecha y motivo; **no se borra** y sigue apareciendo en el listado, tachada | Controlador, solo las que él emitió | `PATCH /api/ordenes?id=` con `accion: 'anular'` |

- No existe ninguna operación que borre filas: nadie tiene permiso `delete` sobre `orden` en la base de datos.
- **Queda fuera:** el estado `reasignada` y la extensión E2 (causa de demora). Para reasignar, se anula la orden con motivo y se emite una nueva para la misma alerta, lo que queda permitido porque la regla es «una sola orden vigente por alerta».

## 2. Reglas de validación (tres capas)

La capa 1 es el formulario (el navegador avisa antes de enviar). La capa 2 es el servidor (`src/api/_reglas.js` y `ordenes.js`), que decide siempre, aunque la petición llegue por fuera de la pantalla. La capa 3 es la base de datos (`esquema.sql`).

| Campo | Obligatorio | Tipo | Largo o rango permitido | Mensaje exacto | Formulario | Servidor | Base de datos |
|---|---|---|---|---|---|---|---|
| `correo` (inicio de sesión) | Sí | Texto con formato de correo | Hasta 100 caracteres, `algo@dominio.ext` | «Escriba su correo, por ejemplo nombre@ejemplo.cl.» Si no coincide con una cuenta: «Correo o contraseña incorrectos. Revíselos e intente de nuevo.» | ✅ | ✅ | Supabase Auth; registro abierto apagado |
| `clave` (inicio de sesión) | Sí | Texto | 1 a 72 caracteres | «Escriba su contraseña.» | ✅ | ✅ | Supabase Auth |
| `id_camion` | Sí | Código de la lista de camiones | Hasta 20 caracteres. Debe existir, tener una alerta activa y no tener ya una orden vigente | «Elija el camión que necesita combustible.» · «Ese camión no existe en la flota. Vuelva a elegirlo de la lista.» · «CAM-03 no tiene una alerta activa: no corresponde asignarle una orden.» · «CAM-07 ya tiene la orden ORD-002 vigente. No se creó otra.» | ✅ obligatorio | ✅ todo | `not null` + clave foránea + índice único «una orden vigente por alerta» |
| `id_sector` | Sí | Código de la lista de sectores | Hasta 20 caracteres. Debe existir | «Elija el sector donde el operador se encontrará con el camión.» · «Ese sector no existe. Vuelva a elegirlo de la lista.» | ✅ | ✅ | `not null` + clave foránea |
| `id_carro` | Sí | Código de la lista de camiones de combustible | Hasta 20 caracteres. Debe existir y estar `disponible` | «Elija el camión de combustible que irá; la orden le llega a su operador.» · «Ese camión de combustible no está disponible. Elija uno disponible.» | ✅ (los no disponibles aparecen deshabilitados) | ✅ | `not null` + clave foránea |
| `motivo_anulacion` | Sí, al anular | Texto | 5 a 200 caracteres, sin contar espacios en los extremos | «Escriba el motivo de la anulación (entre 5 y 200 caracteres).» | ✅ (`maxlength` 200) | ✅ | `check` 5–200 + `check` «anulada exige motivo y fecha» |
| `accion` (cambio de estado) | Sí | Lista cerrada | `en_proceso`, `cerrar`, `anular`, cada una solo desde ciertos estados | «Acción no reconocida. Use los botones de la orden.» · «La orden ORD-002 está «cerrada»: no se puede anular. Recargue para ver su estado actual.» | Solo muestra los botones posibles | ✅ | Disparador `orden_cambio_permitido` |
| `estado` (orden) | Sí | Lista cerrada | `emitida`, `en_proceso`, `reasignada`, `cerrada`, `anulada` | Lo asigna el sistema; la persona no lo escribe | — | ✅ | `check` de lista + por defecto `emitida` |
| `id_usuario` (quién emite) | Sí | Código | Lo pone el servidor con la persona que inició sesión; no se acepta del formulario | — | — | ✅ | Política `orden_crear`: debe ser el usuario conectado |

Un dato que no cumple no se guarda aunque se envíe por otra vía. En la dirección con `?prueba` al final, la pantalla deja de validar y de ocultar botones, y es el servidor el que rechaza.

## 3. Estados de la interfaz

| Pantalla | Carga | Vacío | Error | Éxito |
|---|---|---|---|---|
| Inicio de sesión | Botón «Entrando…» deshabilitado | — | Mensaje arriba y junto al campo; el correo escrito se conserva | Entra al listado |
| Listado de órdenes | «Cargando órdenes…» con indicador | Operador: «Todavía no le asignan órdenes a su camión de combustible. Cuando el controlador le asigne una, aparecerá aquí». Controlador: «Use el formulario de arriba para asignar la primera orden» | «No se pudo cargar la lista de órdenes» + motivo + **Reintentar** | Tabla con estado de cada orden |
| Asignar orden | «Cargando datos de la flota…» y botón «Registrando orden…» deshabilitado | — | Recuadro rojo + mensaje junto al campo. **Lo elegido no se borra** | «✓ Orden ORD-00X registrada» y aparece en la lista |
| Detalle de orden | «Cargando orden…» y botones deshabilitados mientras guarda | «No hay acciones disponibles para su rol en este estado» | «No encontramos esa orden» + **Volver al listado**. Al anular con error, **el motivo escrito se conserva** | «✓ La orden ORD-00X quedó en proceso / cerrada / anulada» |

Los mensajes distinguen quién originó el problema:

| Origen | Título que ve la persona | Ejemplo |
|---|---|---|
| La persona (dato) | «La orden no se guardó.» / «No se guardó el cambio.» | Campo vacío, camión sin alerta |
| La conexión de la persona | «Sin conexión: la orden no se guardó.» | «No hay conexión con el servidor. Lo que escribió sigue en pantalla: revise su internet y reintente.» |
| El sistema | «Problema del sistema: la orden no se guardó.» | «No pudimos guardar porque la base de datos no responde. Lo que escribió sigue en el formulario: reintente en unos segundos o avise por radio.» |
| Permiso | «No se guardó el cambio.» | «Su rol (operador) no permite anular órdenes.» |

## 4. Pruebas de robustez

Las ejecutó Natalia Órdenes en la dirección publicada, sin haber programado la funcionalidad. Antes de publicar, el agente las corrió contra una base de datos simulada y contra un Postgres local con el mismo `esquema.sql` (ver bitácora, Encargo 6).

| Intento | Resultado |
|---|---|
| 1. Enviar un campo obligatorio vacío (controlador, «Enviar orden» sin elegir nada) | La pantalla marca los tres campos con su mensaje y no envía. En `?prueba`, el servidor responde 400 «Revise los campos marcados» y no se guarda nada |
| 2. Presionar dos veces seguidas «Enviar orden» | Se crea **una sola** orden: el botón se deshabilita al primer clic. Si el segundo envío llega igual, el servidor responde 409 «CAM-07 ya tiene la orden ORD-00X vigente», y la base de datos tiene un índice único que lo frena |
| 3. Texto de longitud excesiva (motivo de anulación de 400 caracteres en `?prueba`) | 400 «Escriba el motivo de la anulación (entre 5 y 200 caracteres)». El texto escrito se conserva y la orden no cambia. En modo normal, el campo no deja escribir más de 200 |
| 4. Cortar la conexión durante el envío (DevTools → Network → Offline) | «Sin conexión: la orden no se guardó. No hay conexión con el servidor. Lo que escribió sigue en pantalla…». Los campos elegidos se mantienen |
| 5. Abrir la dirección de un registro inexistente (`/#orden/ORD-999`) | «No encontramos esa orden. La orden ORD-999 no existe o no tiene permiso para verla…» con botón «Volver al listado» (404) |

Casos límite adicionales (clase 7.1):

| Intento | Resultado |
|---|---|
| Camión sin alerta activa (CAM-03) | 400 «CAM-03 no tiene una alerta activa…» |
| Camión de combustible fuera de servicio (CAR-02, en `?prueba`) | 400 «Ese camión de combustible no está disponible…» |
| Cambio de estado fuera de orden (cerrar una orden «emitida») | 409 «La orden ORD-00X está «emitida»: no se puede confirmar el cierre…». En la base de datos, el disparador también lo rechaza |
| Anular una orden ya cerrada | 409 «… está «cerrada»: no se puede anular» |
| Folio con caracteres extraños en la dirección (`/#orden/<script>`) | 404 «La orden solicitada no existe…». El texto no se ejecuta |
| Cuenta válida pero sin rol en el sistema | 403 «Su cuenta no tiene un rol asignado en el sistema…» y no ve ningún dato |

**Pendientes declarados:**
- Los folios pueden saltar números (por ejemplo, de ORD-002 a ORD-004) cuando la base de datos rechaza un intento, porque el contador avanza igual. No afecta los datos.
- La sesión dura una hora. Al vencer, la pantalla pide iniciar sesión de nuevo y vuelve a la página que se estaba viendo.
