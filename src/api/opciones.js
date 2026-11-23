// GET /api/opciones: listas para el formulario (camiones, sectores y camiones de combustible).
import { db } from './_supabase.js';
import { MENSAJES } from './_reglas.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, mensaje: 'Método no permitido.' });
  try {
    const [camiones, sectores, carros] = await Promise.all([
      db('camion?select=id_camion,nivel_combustible,estado&order=id_camion'),
      db('sector?select=id_sector,nombre&order=id_sector'),
      db('carro?select=id_carro,nombre,estado,usuario(nombre)&order=id_carro')
    ]);
    return res.status(200).json({ ok: true, camiones, sectores, carros, mensajes: {
      id_camion: MENSAJES.id_camion, id_sector: MENSAJES.id_sector, id_carro: MENSAJES.id_carro } });
  } catch (e) {
    console.error('opciones:', e.message);
    return res.status(503).json({ ok: false, mensaje: 'No pudimos cargar los datos de la flota porque la base de datos no responde. Reintente en unos segundos.' });
  }
}
