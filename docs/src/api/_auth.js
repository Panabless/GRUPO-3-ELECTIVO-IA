// Denegar por defecto: toda petición a las órdenes pasa por aquí antes de hacer cualquier cosa.
// 1) ¿Trae un token? 2) ¿Supabase dice que es válido? 3) ¿La cuenta tiene un rol en el sistema?
import { db, usuarioDelToken, ErrorDB } from './_supabase.js';

export class NoAutorizado extends Error { constructor(status, mensaje) { super(mensaje); this.status = status; } }

export async function exigirSesion(req) {
  const h = req.headers.authorization || req.headers.Authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7).trim() : '';
  if (!token) throw new NoAutorizado(401, 'Debe iniciar sesión para usar el sistema.');
  try {
    await usuarioDelToken(token);
  } catch (e) {
    if (e instanceof ErrorDB) throw new NoAutorizado(401, 'Su sesión expiró o no es válida. Vuelva a iniciar sesión.');
    throw e;
  }
  const [yo] = await db('rpc/yo', token, { metodo: 'POST', cuerpo: {} });
  if (!yo) throw new NoAutorizado(403, 'Su cuenta no tiene un rol asignado en el sistema. Pida acceso al administrador.');
  return { token, yo };   // yo = { id_usuario, nombre, rol }
}
