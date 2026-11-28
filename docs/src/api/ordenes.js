// /api/ordenes · operaciones sobre la orden de reabastecimiento. Toda petición exige sesión.
//   GET                 listado de órdenes que la persona puede ver, con su estado (consultar)
//   GET    ?id=ORD-001  detalle de una orden
//   POST                crea una orden (solo controlador)                          HU-04
//   PATCH  ?id=ORD-001  { accion: 'en_proceso' }          operador, órdenes de su camión de combustible
//                       { accion: 'cerrar' }              controlador, confirma el cierre      HU-05
//                       { accion: 'anular', motivo }      controlador, solo las que él emitió (baja lógica)
// El servidor revisa rol, pertenencia y datos ANTES de tocar la base de datos. Después, la base de datos
// vuelve a revisar con sus políticas (RLS) y su disparador: si algo se escapa aquí, allá se detiene.
import { db, SinConexion, ErrorDB } from './_supabase.js';
import { exigirSesion, NoAutorizado } from './_auth.js';
import { MENSAJES, validarOrden, validarMotivo, ID_ORDEN } from './_reglas.js';

const CAMPOS = 'id_orden,estado,emitida_en,cerrada_en,anulada_en,motivo_anulacion,id_usuario,id_carro,id_sector,id_alerta,'
  + 'alerta(id_camion),sector(nombre),carro(nombre,id_operador),usuario(nombre)';
const ESTADO_TXT = { emitida: 'emitida', en_proceso: 'en proceso', cerrada: 'cerrada', anulada: 'anulada', reasignada: 'reasignada' };
const q = encodeURIComponent;
const falla = (res, status, mensaje, errores) => res.status(status).json({ ok: false, mensaje, ...(errores ? { errores } : {}) });

export default async function handler(req, res) {
  try {
    const sesion = await exigirSesion(req);
    const id = (req.query && req.query.id) || new URL(req.url, 'http://x').searchParams.get('id');
    if (req.method === 'GET') return id ? await detalle(res, sesion, id) : await listar(res, sesion);
    if (req.method === 'POST') return await crear(req, res, sesion);
    if (req.method === 'PATCH') return await cambiar(req, res, sesion, id);
    return falla(res, 405, 'Método no permitido.');
  } catch (e) {
    if (e instanceof NoAutorizado) return falla(res, e.status, e.message);
    if (e instanceof ErrorDB && e.status === 401) return falla(res, 401, 'Su sesión expiró. Vuelva a iniciar sesión.');
    if (e instanceof ErrorDB && (e.status === 403 || e.codigo === '42501')) return falla(res, 403, 'La base de datos rechazó la acción: su rol no tiene permiso.');
    if (e instanceof ErrorDB && e.codigo === '23514') return falla(res, 400, 'Algún dato no cumple las reglas y no se guardó. Revise el formulario.');
    console.error('ordenes:', e.message);
    if (e instanceof SinConexion) return falla(res, 503, MENSAJES.sin_conexion);
    return falla(res, 500, MENSAJES.inesperado);
  }
}

function leerBody(req) {
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  return body || {};
}

async function listar(res, { token, yo }) {
  const ordenes = await db(`orden?select=${CAMPOS}&order=emitida_en.desc&limit=100`, token);
  return res.status(200).json({ ok: true, usuario: yo, ordenes });
}

async function buscar(token, id) {
  if (typeof id !== 'string' || !ID_ORDEN.test(id)) return null;
  const [o] = await db(`orden?select=${CAMPOS}&id_orden=eq.${q(id)}`, token);
  return o || null;   // si no existe o la política no deja verla, para el servidor es lo mismo: no está
}

async function detalle(res, { token, yo }, id) {
  const orden = await buscar(token, id);
  if (!orden) return falla(res, 404, MENSAJES.no_existe(ID_ORDEN.test(String(id)) ? id : 'solicitada'));
  return res.status(200).json({ ok: true, usuario: yo, orden });
}

async function crear(req, res, { token, yo }) {
  // 1. Rol: solo el controlador crea órdenes (aunque la petición llegue por fuera de la pantalla).
  if (yo.rol !== 'controlador') return falla(res, 403, MENSAJES.rol_no_permite(yo.rol, 'crear órdenes'));

  // 2. Formato: los tres campos son obligatorios.
  const body = leerBody(req);
  const errores = validarOrden(body);
  if (Object.keys(errores).length) return falla(res, 400, 'Revise los campos marcados.', errores);
  const id_camion = body.id_camion.trim(), id_sector = body.id_sector.trim(), id_carro = body.id_carro.trim();

  // 3. Reglas del negocio, contra la base de datos.
  const [camiones, alertas, sectores, carros] = await Promise.all([
    db(`camion?select=id_camion&id_camion=eq.${q(id_camion)}`, token),
    db(`alerta?select=id_alerta&id_camion=eq.${q(id_camion)}&activa=is.true&order=creada_en.desc`, token),
    db(`sector?select=id_sector&id_sector=eq.${q(id_sector)}`, token),
    db(`carro?select=id_carro,estado&id_carro=eq.${q(id_carro)}`, token)
  ]);
  if (!camiones.length) return falla(res, 400, MENSAJES.camion_no_existe, { id_camion: MENSAJES.camion_no_existe });
  if (!sectores.length) return falla(res, 400, MENSAJES.sector_no_existe, { id_sector: MENSAJES.sector_no_existe });
  if (!carros.length) return falla(res, 400, MENSAJES.carro_no_existe, { id_carro: MENSAJES.carro_no_existe });
  if (carros[0].estado !== 'disponible') return falla(res, 400, MENSAJES.carro_no_disponible, { id_carro: MENSAJES.carro_no_disponible });
  if (!alertas.length) return falla(res, 400, MENSAJES.sin_alerta(id_camion), { id_camion: MENSAJES.sin_alerta(id_camion) });

  // Una alerta tiene como máximo una orden vigente (no anulada).
  const ids = alertas.map(a => a.id_alerta);
  const vigentes = await db(`orden?select=id_orden,id_alerta&id_alerta=in.(${ids.map(q).join(',')})&estado=neq.anulada`, token);
  const libre = ids.find(a => !vigentes.some(v => v.id_alerta === a));
  if (!libre) {
    const m = MENSAJES.ya_tiene_orden(id_camion, vigentes[0].id_orden);
    return falla(res, 409, m, { id_camion: m });
  }

  // 4. Guardar a nombre de quien inició sesión. La base de datos genera el folio.
  try {
    const [orden] = await db('orden', token, { metodo: 'POST', cuerpo: { id_alerta: libre, id_sector, id_usuario: yo.id_usuario, id_carro } });
    return res.status(201).json({ ok: true, orden: { ...orden, id_camion } });
  } catch (e) {
    if (e instanceof ErrorDB && e.codigo === '23505') {   // doble envío casi simultáneo: la base de datos frena el segundo
      const m = MENSAJES.ya_tiene_orden(id_camion, 'anterior');
      return falla(res, 409, m, { id_camion: m });
    }
    throw e;
  }
}

async function cambiar(req, res, { token, yo }, id) {
  const { accion, motivo } = leerBody(req);
  const ACCIONES = {
    en_proceso: { rol: 'operador', desde: ['emitida'], hacia: 'en_proceso', texto: 'marcar en proceso' },
    cerrar: { rol: 'controlador', desde: ['en_proceso'], hacia: 'cerrada', texto: 'confirmar el cierre' },
    anular: { rol: 'controlador', desde: ['emitida', 'en_proceso'], hacia: 'anulada', texto: 'anular' }
  };
  const a = ACCIONES[accion];
  if (!a) return falla(res, 400, MENSAJES.accion_invalida);

  // 1. Rol, antes de mirar la orden.
  if (yo.rol !== a.rol) return falla(res, 403, MENSAJES.rol_no_permite(yo.rol, `${a.texto} órdenes`));

  // 2. Datos: el motivo de anulación es obligatorio.
  if (accion === 'anular') {
    const err = validarMotivo(motivo);
    if (err) return falla(res, 400, err, { motivo: err });
  }

  // 3. La orden existe y es visible para esta persona.
  const orden = await buscar(token, id);
  if (!orden) return falla(res, 404, MENSAJES.no_existe(ID_ORDEN.test(String(id)) ? id : 'solicitada'));

  // 4. Pertenencia.
  if (a.rol === 'operador' && orden.carro?.id_operador !== yo.id_usuario) return falla(res, 404, MENSAJES.no_existe(id));
  if (accion === 'anular' && orden.id_usuario !== yo.id_usuario) return falla(res, 403, MENSAJES.no_es_suya);

  // 5. Estado actual.
  if (!a.desde.includes(orden.estado)) return falla(res, 409, MENSAJES.estado_no_permite(id, ESTADO_TXT[orden.estado] || orden.estado, a.texto));

  // 6. Guardar. El filtro por estado evita pisar un cambio hecho por otra persona al mismo tiempo.
  const ahora = new Date().toISOString();
  const cambios = { estado: a.hacia };
  if (a.hacia === 'cerrada') cambios.cerrada_en = ahora;
  if (a.hacia === 'anulada') { cambios.anulada_en = ahora; cambios.motivo_anulacion = motivo.trim(); }
  const [actualizada] = await db(`orden?id_orden=eq.${q(id)}&estado=eq.${q(orden.estado)}`, token, { metodo: 'PATCH', cuerpo: cambios });
  if (!actualizada) return falla(res, 409, MENSAJES.estado_no_permite(id, 'cambiada por otra persona', a.texto));
  return res.status(200).json({ ok: true, orden: { ...orden, ...actualizada } });
}
