// POST /api/login  { correo, clave }  ->  { token, usuario }
// El navegador nunca habla directo con Supabase: el servidor inicia la sesión y devuelve el token.
import { iniciarSesion, db, ErrorDB, SinConexion } from './_supabase.js';
import { MENSAJES, validarLogin } from './_reglas.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, mensaje: 'Método no permitido.' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

  const errores = validarLogin(body);
  if (Object.keys(errores).length) return res.status(400).json({ ok: false, errores, mensaje: 'Revise los campos marcados.' });

  try {
    const sesion = await iniciarSesion(body.correo.trim().toLowerCase(), body.clave);
    const [yo] = await db('rpc/yo', sesion.access_token, { metodo: 'POST', cuerpo: {} });
    if (!yo) return res.status(403).json({ ok: false, mensaje: 'Su cuenta no tiene un rol asignado en el sistema. Pida acceso al administrador.' });
    return res.status(200).json({ ok: true, token: sesion.access_token, expira_en: sesion.expires_in, usuario: yo });
  } catch (e) {
    if (e instanceof ErrorDB && (e.status === 400 || e.status === 401)) return res.status(401).json({ ok: false, mensaje: MENSAJES.credenciales });
    console.error('login:', e.message);
    if (e instanceof SinConexion) return res.status(503).json({ ok: false, mensaje: 'No pudimos conectar con el sistema de cuentas. Reintente en unos segundos.' });
    return res.status(500).json({ ok: false, mensaje: MENSAJES.inesperado });
  }
}
