// /api/ordenes
//   POST: crea una orden de reabastecimiento (HU-04). El servidor valida todo lo que llega,
//         aunque la pantalla ya lo haya revisado: si un dato no cumple, no se guarda.
//   GET:  últimas órdenes registradas (comprueba que la orden quedó guardada de verdad).
import { db, SinConexion } from './_supabase.js';
import { MENSAJES, validarFormato } from './_reglas.js';

const CONTROLADOR = 'USR-01';   // sin inicio de sesión en la PoC: el controlador de turno es fijo (queda fuera por ahora)

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') return await listar(res);
    if (req.method === 'POST') return await crear(req, res);
    return res.status(405).json({ ok: false, mensaje: 'Método no permitido.' });
  } catch (e) {
    console.error('ordenes:', e.message);
    if (e instanceof SinConexion) return res.status(503).json({ ok: false, mensaje: MENSAJES.sin_conexion });
    return res.status(500).json({ ok: false, mensaje: 'Ocurrió un error inesperado y la orden no se guardó. Reintente; si se repite, avise al equipo.' });
  }
}

async function listar(res) {
  const ordenes = await db('orden?select=id_orden,emitida_en,estado,alerta(id_camion),sector(nombre),carro(nombre)&order=emitida_en.desc&limit=10');
  return res.status(200).json({ ok: true, ordenes });
}

async function crear(req, res) {
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

  // 1. Formato: los tres campos son obligatorios.
  const errores = validarFormato(body);
  if (Object.keys(errores).length) return res.status(400).json({ ok: false, errores, mensaje: 'Revise los campos marcados.' });

  const id_camion = body.id_camion.trim(), id_sector = body.id_sector.trim(), id_carro = body.id_carro.trim();
  const q = encodeURIComponent;

  // 2. Reglas del negocio, contra la base de datos.
  const [camiones, alertas, sectores, carros] = await Promise.all([
    db(`camion?select=id_camion&id_camion=eq.${q(id_camion)}`),
    db(`alerta?select=id_alerta,orden(id_orden)&id_camion=eq.${q(id_camion)}&activa=is.true&order=creada_en.desc`),
    db(`sector?select=id_sector&id_sector=eq.${q(id_sector)}`),
    db(`carro?select=id_carro,estado&id_carro=eq.${q(id_carro)}`)
  ]);

  if (!camiones.length) return res.status(400).json({ ok: false, errores: { id_camion: MENSAJES.camion_no_existe }, mensaje: MENSAJES.camion_no_existe });
  if (!sectores.length) return res.status(400).json({ ok: false, errores: { id_sector: MENSAJES.sector_no_existe }, mensaje: MENSAJES.sector_no_existe });
  if (!carros.length) return res.status(400).json({ ok: false, errores: { id_carro: MENSAJES.carro_no_existe }, mensaje: MENSAJES.carro_no_existe });
  if (carros[0].estado !== 'disponible') return res.status(400).json({ ok: false, errores: { id_carro: MENSAJES.carro_no_disponible }, mensaje: MENSAJES.carro_no_disponible });
  if (!alertas.length) return res.status(400).json({ ok: false, errores: { id_camion: MENSAJES.sin_alerta(id_camion) }, mensaje: MENSAJES.sin_alerta(id_camion) });

  const libre = alertas.find(a => !a.orden);   // una alerta origina una sola orden (1:1)
  if (!libre) {
    const existente = alertas[0].orden.id_orden;
    return res.status(409).json({ ok: false, errores: { id_camion: MENSAJES.ya_tiene_orden(id_camion, existente) }, mensaje: MENSAJES.ya_tiene_orden(id_camion, existente) });
  }

  // 3. Guardar. La base de datos genera el folio (ORD-001, ORD-002...).
  try {
    const [orden] = await db('orden', { metodo: 'POST', cuerpo: { id_alerta: libre.id_alerta, id_sector, id_usuario: CONTROLADOR, id_carro } });
    return res.status(201).json({ ok: true, orden: { ...orden, id_camion } });
  } catch (e) {
    if (e.codigo === '23505') {   // dos envíos casi al mismo tiempo: la base de datos rechaza el segundo
      return res.status(409).json({ ok: false, errores: { id_camion: MENSAJES.ya_tiene_orden(id_camion, 'anterior') }, mensaje: MENSAJES.ya_tiene_orden(id_camion, 'anterior') });
    }
    throw e;
  }
}
