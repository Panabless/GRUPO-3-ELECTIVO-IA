# src · Prueba de concepto HU-04 (asignar orden)

| Archivo | Qué hace |
|---|---|
| `index.html` | Pantalla «Asignar orden»: formulario, validación en el navegador, folio o error, lista de órdenes. Con `?prueba` en la dirección no valida, para comprobar que el servidor rechaza. |
| `api/ordenes.js` | `POST`: valida en el servidor y guarda la orden en Supabase. `GET`: últimas órdenes guardadas. |
| `api/opciones.js` | `GET`: camiones, sectores y camiones de combustible para las listas. |
| `api/_reglas.js` | Campos obligatorios y mensajes de error (una sola definición). |
| `api/_supabase.js` | Conexión con Supabase usando las variables de entorno; si no responde, lanza el error de «sin conexión». |
| `db/esquema.sql` | Tablas, restricciones y datos de ejemplo inventados. Se pega en el SQL Editor de Supabase. |
| `package.json` | Indica a Vercel que use Node 18 o superior. No hay dependencias que instalar. |

Instrucciones completas en el [README principal](../README.md).
