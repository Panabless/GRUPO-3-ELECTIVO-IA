-- PoC Equipo 3 · Asignar orden de reabastecimiento (HU-04)
-- Ejecutar completo en Supabase: SQL Editor -> New query -> pegar -> Run.
-- Crea las tablas según docs/datos/estructura_datos.md y carga datos de ejemplo (inventados).
-- La base de datos es la tercera capa de validación: obligatorios, listas cerradas y claves.

drop table if exists orden, alerta, carro, camion, sector, usuario cascade;
drop sequence if exists orden_folio;

create table sector (
  id_sector text primary key,
  nombre    text not null
);

create table usuario (
  id_usuario text primary key,
  nombre     text not null,
  correo     text,
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
  id_orden     text primary key default 'ORD-' || lpad(nextval('orden_folio')::text, 3, '0'),
  id_alerta    text not null unique references alerta (id_alerta),   -- 1:1: una alerta origina una sola orden
  id_sector    text not null references sector (id_sector),
  id_usuario   text not null references usuario (id_usuario),
  id_carro     text not null references carro (id_carro),
  emitida_en   timestamptz not null default now(),
  estado       text not null default 'emitida' check (estado in ('emitida', 'en_proceso', 'reasignada', 'cerrada')),
  cerrada_en   timestamptz,
  causa_demora text check (char_length(causa_demora) <= 200)
);

-- Seguridad: nadie entra directo desde el navegador. Solo la función del servidor (clave secreta) lee y escribe.
alter table sector  enable row level security;
alter table usuario enable row level security;
alter table camion  enable row level security;
alter table carro   enable row level security;
alter table alerta  enable row level security;
alter table orden   enable row level security;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

-- ---------------------------------------------------------------- datos de ejemplo (inventados)
insert into sector values ('SEC-A', 'Sector A'), ('SEC-B', 'Sector B'), ('SEC-C', 'Sector C'), ('SEC-D', 'Sector D');

insert into usuario values
  ('USR-01', 'Controlador Turno A', 'controlador.a@ejemplo.cl', 'controlador'),
  ('USR-03', 'Operador camión de combustible A', 'operador.a@ejemplo.cl', 'operador'),
  ('USR-04', 'Operador camión de combustible B', 'operador.b@ejemplo.cl', 'operador');

insert into camion values
  ('CAM-07', 'Camión 07', 12, 'critico', '2026-11-20 21:10-03'),
  ('CAM-12', 'Camión 12', 13, 'critico', '2026-11-20 18:40-03'),
  ('CAM-19', 'Camión 19', 14, 'critico', '2026-11-20 20:30-03'),
  ('CAM-21', 'Camión 21', 40, 'sin_senal', '2026-11-20 23:05-03'),
  ('CAM-03', 'Camión 03', 33, 'normal', '2026-11-21 06:15-03');

insert into carro values
  ('CAR-01', 'Camión de combustible 1', 'USR-03', 'disponible'),
  ('CAR-02', 'Camión de combustible 2', 'USR-04', 'fuera_de_servicio');

insert into alerta (id_alerta, id_camion, nivel_detectado) values
  ('ALR-101', 'CAM-07', 12),
  ('ALR-102', 'CAM-12', 13),
  ('ALR-103', 'CAM-19', 14),
  ('ALR-104', 'CAM-21', null);   -- sin señal: no hay nivel que registrar
-- CAM-03 no tiene alerta activa: sirve para probar que el servidor rechaza la orden.
