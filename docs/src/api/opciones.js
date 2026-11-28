// GET /api/opciones: listas para el formulario y los mensajes de validación. Exige sesión.
import { db } from './_supabase.js';
import { exigirSesion, NoAutorizado } from './_auth.js';
import { MENSAJES } from './_reglas.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, mensaje: 'Método no permitido.' });
  try {
    const { token, yo } = await exigirSesion(req);
    const [camiones, sectores, carros] = await Promise.all([
      db('camion?select=id_camion,nivel_combustible,estado&order=id_camion', token),
      db('sector?select=id_sector,nombre&order=id_sector', token),
      db('carro?select=id_carro,nombre,estado,id_operador,usuario(nombre)&order=id_carro', token)
    ]);
    return res.status(200).json({ ok: true, usuario: yo, camiones, sectores, carros, mensajes: {
      id_camion: MENSAJES.id_camion, id_sector: MENSAJES.id_sector, id_carro: MENSAJES.id_carro, motivo: MENSAJES.motivo } });
  } catch (e) {
    if (e instanceof NoAutorizado) return res.status(e.status).json({ ok: false, mensaje: e.message });
    console.error('opciones:', e.message);
    return res.status(503).json({ ok: false, mensaje: 'No pudimos cargar los datos de la flota porque la base de datos no responde. Reintente en unos segundos.' });
  }
}
