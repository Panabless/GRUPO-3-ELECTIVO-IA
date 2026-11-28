-- PoC Equipo 3 · Órdenes de reabastecimiento (HU-04 y HU-05) · Avance 8
-- Ejecutar completo en Supabase: SQL Editor -> New query -> pegar -> Run.
-- Crea las tablas según docs/datos/estructura_datos.md, las reglas de la base de datos (tercera capa
-- de validación), los permisos por rol con seguridad a nivel de fila (RLS) y datos de ejemplo inventados.
-- Las cuentas de prueba se crean aparte en Authentication -> Users (ver README); este archivo las une
-- con la tabla usuario por el correo.

drop table if exists orden, alerta, carro, camion, sector, usuario cascade;
drop sequence if exists orden_folio;
drop function if exists usuario_actual(), rol_actual(), yo(), validar_cambio_orden() cascade;

-- ============================================================ tablas
create table sector (
  id_sector text primary key,
  nombre    text not null
);

create table usuario (
  id_usuario text primary key,
  nombre     text not null,
  correo     text not null unique,              -- une al usuario con su cuenta de inicio de sesión
  rol        text not null check (rol in ('controlador', 'supervisor', 'operador'))
);

create table camion (
  id_camion             text primary key,
  nombre                text not null,
  nivel_combustible     numeric not null check (nivel_combustible between 0 and 100),
  estado                text not null check (estado in ('normal', 'alerta', 'critico', 'sin_senal', 'en_proceso', 'abastecido')),
  ultimo_abastecimiento timestamptz
);

create table carro (
  id_carro    text primary key,
  nombre      text not null,
  id_operador text not null unique references usuario (id_usuario),
  estado      text not null check (estado in ('disponible', 'ocupado', 'fuera_de_servicio'))
);

create table alerta (
  id_alerta       text primary key,
  id_camion       text not null references camion (id_camion),
  nivel_detectado numeric check (nivel_detectado between 0 and 100),  -- vacío si el sensor no reporta (E1)
  creada_en       timestamptz not null default now(),
  activa          boolean not null default true
);

-- El folio se genera en la base de datos: ORD-001, ORD-002, ...
create sequence orden_folio start 1;

create table orden (
  id_orden         text primary key default 'ORD-' || lpad(nextval('orden_folio')::text, 3, '0'),
  id_alerta        text not null references alerta (id_alerta),
  id_sector        text not null references sector (id_sector),
  id_usuario       text not null references usuario (id_usuario),   -- controlador que la emitió
  id_carro         text not null references carro (id_carro),
  emitida_en       timestamptz not null default now(),
  estado           text not null default 'emitida'
                   check (estado in ('emitida', 'en_proceso', 'reasignada', 'cerrada', 'anulada')),
  cerrada_en       timestamptz,
  causa_demora     text check (char_length(causa_demora) <= 200),
  anulada_en       timestamptz,
  motivo_anulacion text check (char_length(btrim(motivo_anulacion)) between 5 and 200),
  -- Baja lógica: una orden anulada guarda cuándo y por qué; nunca se borra.
  check (estado <> 'anulada' or (anulada_en is not null and motivo_anulacion is not null)),
  check (estado <> 'cerrada' or cerrada_en is not null)
);

-- Una alerta tiene como máximo una orden vigente. Si la orden se anula, se puede emitir otra.
-- También frena el doble envío: el segundo intento choca aquí.
create unique index orden_una_vigente_por_alerta on orden (id_alerta) where estado <> 'anulada';

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

-- ============================================================ datos de ejemplo (inventados)
insert into sector values ('SEC-A', 'Sector A'), ('SEC-B', 'Sector B'), ('SEC-C', 'Sector C'), ('SEC-D', 'Sector D');

-- Los correos deben ser iguales a los de las cuentas creadas en Authentication -> Users.
insert into usuario values
  ('USR-01', 'Controlador Turno A', 'controlador.a@ejemplo.cl', 'controlador'),
  ('USR-02', 'Supervisor de turno', 'supervisor@ejemplo.cl', 'supervisor'),
  ('USR-03', 'Operador camión de combustible A', 'operador.a@ejemplo.cl', 'operador'),
  ('USR-04', 'Operador camión de combustible B', 'operador.b@ejemplo.cl', 'operador');

insert into camion values
  ('CAM-07', 'Camión 07', 12, 'critico', '2026-11-26 21:10-03'),
  ('CAM-12', 'Camión 12', 13, 'critico', '2026-11-26 18:40-03'),
  ('CAM-19', 'Camión 19', 14, 'critico', '2026-11-26 20:30-03'),
  ('CAM-21', 'Camión 21', 40, 'sin_senal', '2026-11-26 23:05-03'),
  ('CAM-03', 'Camión 03', 33, 'normal', '2026-11-27 06:15-03');

insert into carro values
  ('CAR-01', 'Camión de combustible 1', 'USR-03', 'disponible'),
  ('CAR-02', 'Camión de combustible 2', 'USR-04', 'fuera_de_servicio');

insert into alerta (id_alerta, id_camion, nivel_detectado, creada_en, activa) values
  ('ALR-100', 'CAM-19', 11, '2026-11-25 09:00-03', false),   -- alerta antigua, ya atendida
  ('ALR-101', 'CAM-07', 12, now(), true),
  ('ALR-102', 'CAM-12', 13, now(), true),
  ('ALR-103', 'CAM-19', 14, now(), true),
  ('ALR-104', 'CAM-21', null, now(), true);                   -- sin señal: no hay nivel que registrar
-- CAM-03 no tiene alerta activa: sirve para probar que el servidor rechaza la orden.

-- Orden antigua del operador B (ORD-001, cerrada). Sirve para la prueba de pedir el registro de otro usuario.
insert into orden (id_alerta, id_sector, id_usuario, id_carro, emitida_en, estado, cerrada_en)
values ('ALR-100', 'SEC-C', 'USR-01', 'CAR-02', '2026-11-25 09:05-03', 'cerrada', '2026-11-25 09:40-03');
