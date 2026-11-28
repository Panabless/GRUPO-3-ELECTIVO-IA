# src · Órdenes de reabastecimiento (HU-04 y HU-05)

| Archivo | Qué hace |
|---|---|
| `index.html` | Pantallas: inicio de sesión, listado de órdenes con su estado, formulario «Asignar orden» (controlador) y detalle con acciones según el rol. Con `?prueba` en la dirección no valida ni oculta botones, para comprobar que el servidor decide. |
| `api/login.js` | `POST`: inicia la sesión en Supabase Auth y devuelve el token de la persona y su rol. |
| `api/ordenes.js` | `GET` listado o detalle (`?id=`), `POST` crear, `PATCH` cambiar estado o anular (`?id=`). Revisa sesión, rol, pertenencia, datos y estado antes de guardar. |
| `api/opciones.js` | `GET`: camiones, sectores y camiones de combustible para el formulario. Exige sesión. |
| `api/_auth.js` | Denegar por defecto: sin token válido responde 401; sin rol en el sistema, 403. |
| `api/_reglas.js` | Reglas de validación y mensajes exactos (una sola definición). |
| `api/_supabase.js` | Conexión con Supabase usando la clave pública y el token de la persona, para que se apliquen las políticas RLS. No usa la clave secreta. |
| `db/esquema.sql` | Tablas, restricciones, baja lógica, permisos, políticas RLS, disparador de cambios de estado y datos de ejemplo inventados. Se pega en el SQL Editor de Supabase. |
| `package.json` | Indica a Vercel que use Node 18 o superior. No hay dependencias que instalar. |

Instrucciones completas en el [README principal](../README.md). Reglas en [docs/robustecimiento.md](../docs/robustecimiento.md) y permisos en [docs/permisos.md](../docs/permisos.md).
