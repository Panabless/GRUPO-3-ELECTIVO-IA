# Permisos · Monitor de combustible de flota autónoma (Equipo 3)

Alcance: la **orden de reabastecimiento** (tabla `orden`) y sus tablas asociadas. Dirección: https://grupo-3-electivo-ia-src.vercel.app/

## Matriz de roles y permisos

| Rol | Crear | Consultar | Actualizar (estado) | Dar de baja (anular) |
|---|---|---|---|---|
| **Controlador de flota** (quien registra) | **Todos** · asigna órdenes a cualquier camión con alerta activa (HU-04) | **Todos** · necesita ver toda la flota para priorizar | **Todos** · confirma el cierre de cualquier orden en proceso (HU-05), porque el turno siguiente hereda las pendientes | **Solo los propios** · anula solo las órdenes que él emitió, con motivo y mientras no estén cerradas |
| **Operador del camión de combustible** (quien resuelve) | **Ninguno** · recibe órdenes, no las crea | **Solo los propios** · ve solo las órdenes de su camión de combustible | **Solo los propios** · marca «en proceso» las órdenes de su camión de combustible | **Ninguno** · no puede anular una orden que no emitió |
| **Supervisor** (quien supervisa) | **Ninguno** · no opera la flota | **Todos** · revisa tiempos y demoras de todos los turnos | **Ninguno** · solo observa | **Ninguno** · solo observa |
| **Administrador** (quien administra) | **Ninguno** · no opera la flota | **Ninguno** desde la aplicación · trabaja en el panel de Supabase | **Ninguno** desde la aplicación | **Ninguno** · gestiona cuentas y roles (Authentication y tabla `usuario`), no órdenes |

- Cuentas de prueba: **controlador** y **operador**. Se enviaron por correo a la profesora; no están en el repositorio.
- El supervisor existe en los datos (`USR-02`) y en las políticas, pero no tiene cuenta de prueba.
- El administrador no es un rol de la aplicación: es quien administra el proyecto en Supabase.

### Dónde se verifica cada permiso (denegar por defecto)

| Capa | Qué hace | Archivo |
|---|---|---|
| 1. Pantalla | Sin sesión, cualquier dirección muestra «Iniciar sesión». Solo muestra los botones que el rol puede usar. **Esto no es un control de acceso**: con `?prueba` se muestran todos y el servidor igual rechaza | `src/index.html` |
| 2. Servidor | Toda petición exige un token válido (401 si no hay) y una cuenta con rol en `usuario` (403 si no tiene). Antes de actuar, revisa el rol, la pertenencia (operador: que la orden sea de su camión de combustible; anular: que la haya emitido él) y el estado | `src/api/_auth.js`, `src/api/ordenes.js` |
| 3. Base de datos | RLS activado en las 6 tablas, sin permisos para `anon` y con los mínimos para `authenticated`. El correo de `usuario` no se expone. Nadie puede borrar (`delete`). Un disparador valida qué cambio de estado puede hacer cada rol | `src/db/esquema.sql` |

### Credenciales

- El navegador nunca recibe una clave de Supabase. Inicia sesión a través de `/api/login`, recibe solo su token personal (dura 1 hora) y lo guarda mientras la pestaña está abierta.
- El servidor usa la clave pública (`SUPABASE_PUBLISHABLE_KEY`) junto con el token de la persona. Así **toda consulta pasa por RLS**.
- La clave secreta de Supabase, la que se salta RLS, **no se usa en ninguna parte del código** ni está en Vercel.
- Los valores viven solo en las variables de entorno de Vercel. `.env.example` tiene solo los nombres, y `.env` está en `.gitignore`.
- El registro abierto de cuentas está apagado en Supabase (Authentication → Sign In / Providers). Una cuenta creada por fuera, sin fila en `usuario`, no ve ni hace nada.

## Políticas de acceso (RLS)

Extracto de `src/db/esquema.sql`, que se ejecuta completo en Supabase:

```sql
-- ============================================================ quién es el usuario conectado
-- Supabase entrega el correo de la cuenta en el token (auth.jwt()). Con él se busca su fila en usuario.
-- "security definer" permite leer usuario sin abrir la tabla completa.
create function usuario_actual() returns text
language sql stable security definer set search_path = public as $$
  select id_usuario from usuario where lower(correo) = lower(auth.jwt() ->> 'email')
$$;

create function rol_actual() returns text
language sql stable security definer set search_path = public as $$
  select rol from usuario where lower(correo) = lower(auth.jwt() ->> 'email')
$$;

create function yo() returns table (id_usuario text, nombre text, rol text)
language sql stable security definer set search_path = public as $$
  select id_usuario, nombre, rol from usuario where lower(correo) = lower(auth.jwt() ->> 'email')
$$;

revoke all on function usuario_actual(), rol_actual(), yo() from public, anon;
grant execute on function usuario_actual(), rol_actual(), yo() to authenticated;

-- ============================================================ permisos: denegar por defecto
-- 1. Nadie tiene permisos sobre las tablas, ni siquiera quien inició sesión.
revoke all on all tables in schema public from anon, authenticated;
revoke all on sequence orden_folio from anon, authenticated;

-- 2. Solo se abre lo justo a quien inició sesión. Sin sesión (anon) no hay nada.
grant select on sector, camion, carro, alerta to authenticated;
grant select (id_usuario, nombre, rol) on usuario to authenticated;      -- el correo no se expone
grant select, insert on orden to authenticated;
grant update (estado, cerrada_en, anulada_en, motivo_anulacion) on orden to authenticated;  -- no se puede cambiar camión, sector ni carro
grant usage on sequence orden_folio to authenticated;
-- No hay permiso de borrar (delete) para nadie: la baja es lógica (estado 'anulada').

-- 3. Seguridad a nivel de fila (RLS) activada en todas las tablas: una fila solo se ve o se cambia
--    si alguna política lo permite.
alter table sector  enable row level security;
alter table usuario enable row level security;
alter table camion  enable row level security;
alter table carro   enable row level security;
alter table alerta  enable row level security;
alter table orden   enable row level security;

-- Catálogos: los lee cualquier persona con un rol en el sistema. Una cuenta sin fila en usuario no ve nada.
create policy leer_sector  on sector  for select to authenticated using (rol_actual() is not null);
create policy leer_usuario on usuario for select to authenticated using (rol_actual() is not null);
create policy leer_camion  on camion  for select to authenticated using (rol_actual() is not null);
create policy leer_carro   on carro   for select to authenticated using (rol_actual() is not null);
create policy leer_alerta  on alerta  for select to authenticated using (rol_actual() is not null);

-- Consultar órdenes: controlador y supervisor ven todas; el operador, solo las de su camión de combustible.
create policy orden_consultar on orden for select to authenticated using (
  rol_actual() in ('controlador', 'supervisor')
  or (rol_actual() = 'operador'
      and id_carro in (select c.id_carro from carro c where c.id_operador = usuario_actual()))
);

-- Crear: solo el controlador, a su propio nombre y siempre como 'emitida'.
create policy orden_crear on orden for insert to authenticated with check (
  rol_actual() = 'controlador' and id_usuario = usuario_actual() and estado = 'emitida'
);

-- Actualizar: el operador solo toca órdenes de su camión de combustible; el controlador, cualquiera.
create policy orden_actualizar_operador on orden for update to authenticated
  using (rol_actual() = 'operador'
         and id_carro in (select c.id_carro from carro c where c.id_operador = usuario_actual()))
  with check (rol_actual() = 'operador'
         and id_carro in (select c.id_carro from carro c where c.id_operador = usuario_actual()));

create policy orden_actualizar_controlador on orden for update to authenticated
  using (rol_actual() = 'controlador')
  with check (rol_actual() = 'controlador');

-- Qué cambio de estado puede hacer cada rol. Las políticas no ven el estado anterior de la fila,
-- por eso esta regla va en un disparador (trigger) que compara el antes (old) y el después (new):
--   operador:     emitida -> en_proceso                    (va a abastecer)
--   controlador:  en_proceso -> cerrada                    (confirma el cierre, HU-05)
--   controlador:  emitida o en_proceso -> anulada          (baja lógica, solo las que él emitió)
create function validar_cambio_orden() returns trigger
language plpgsql as $$
declare r text := rol_actual();
begin
  if current_user <> 'authenticated' then return new; end if;   -- el panel de Supabase (administración) no pasa por aquí
  if r = 'operador' and old.estado = 'emitida' and new.estado = 'en_proceso' then return new; end if;
  if r = 'controlador' and old.estado = 'en_proceso' and new.estado = 'cerrada' then return new; end if;
  if r = 'controlador' and old.estado in ('emitida', 'en_proceso') and new.estado = 'anulada'
     and old.id_usuario = usuario_actual() then return new; end if;
  raise exception 'Cambio no permitido: % -> % para el rol %', old.estado, new.estado, coalesce(r, 'sin rol')
    using errcode = '42501';
end $$;

create trigger orden_cambio_permitido before update on orden
  for each row execute function validar_cambio_orden();
```

## Pruebas de rotura

Las ejecutó Natalia Órdenes con dos cuentas de roles distintos (controlador y operador) en la dirección publicada. Video (2–3 min): PENDIENTE (pegar el enlace).

| Prueba | Resultado | Minuto del video |
|---|---|---|
| 1. Entrar a una dirección interna sin haber iniciado sesión: en incógnito, `https://grupo-3-electivo-ia-src.vercel.app/#orden/ORD-001`, y también `…/api/ordenes` | La página no muestra la orden y pide «Inicie sesión para ver esta página». La dirección `/api/ordenes` responde 401 `"Debe iniciar sesión para usar el sistema."` sin datos | PENDIENTE |
| 2. Pedir el registro de otro usuario cambiando el identificador en la dirección: con la cuenta del operador A, abrir `/#orden/ORD-001`, que es del camión de combustible del operador B | «No encontramos esa orden. La orden ORD-001 no existe o no tiene permiso para verla.» (404). El servidor no la encuentra porque la política `orden_consultar` no se la deja ver | PENDIENTE |
| 3. Hacer una acción no permitida para el rol sin usar la interfaz: con la cuenta del operador, crear una orden desde la consola del navegador (F12 → Console), con el código de abajo | 403 `"Su rol (operador) no permite crear órdenes."` y no se crea nada. Si se salta el servidor, la base de datos también la rechaza: «new row violates row-level security policy» | PENDIENTE |
| 4. Revisar el repositorio, incluido su historial, en busca de credenciales | 0 resultados de `sb_secret`, `sb_publishable`, `eyJhbGci` (JWT) ni contraseñas en el código actual (búsqueda en GitHub) ni en el historial completo (`git log -p --all`). Solo aparecen los **nombres** de las variables | PENDIENTE |

Código para la prueba 3. Se pega en la consola con la sesión del operador abierta; si Chrome lo pide, antes se escribe `allow pasting`:

```js
fetch('/api/ordenes', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + JSON.parse(sessionStorage.sesion).token },
  body: JSON.stringify({ id_camion: 'CAM-12', id_sector: 'SEC-A', id_carro: 'CAR-01' }) }).then(r => r.json()).then(console.log)
```

**Hallazgo sobre credenciales:** en el Avance 7, la clave secreta del proyecto Supabase anterior se compartió por WhatsApp y en una captura enviada al agente de IA. Nunca entró al repositorio, pero quedó expuesta fuera de él. Medida: el Avance 8 usa un proyecto Supabase nuevo sin clave secreta en uso, y el proyecto anterior se dio de baja (PENDIENTE confirmar).
