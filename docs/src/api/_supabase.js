// Conexión con Supabase. El servidor usa SIEMPRE el token de la persona que inició sesión:
// así la base de datos aplica sus políticas (RLS) y nadie puede saltárselas desde aquí.
// La clave secreta de Supabase no se usa en ningún lado. La clave pública (publishable) vive
// en las variables de Vercel y nunca se envía al navegador.
export class SinConexion extends Error {}
export class ErrorDB extends Error {
  constructor(status, datos) {
    super((datos && (datos.message || datos.msg || datos.error_description)) || `Supabase ${status}`);
    this.status = status;
    this.codigo = datos && (datos.code || datos.error_code);
  }
}

function config() {
  const url = process.env.SUPABASE_URL, clave = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !clave) throw new SinConexion('Faltan SUPABASE_URL o SUPABASE_PUBLISHABLE_KEY');
  return { url: url.replace(/\/+$/, '').replace(/\/rest\/v1$/, ''), clave };
}

async function llamar(ruta, { metodo = 'GET', cuerpo, token, prefer } = {}) {
  const { url, clave } = config();
  const headers = { apikey: clave, 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (prefer) headers.Prefer = prefer;
  let r;
  try {
    r = await fetch(`${url}${ruta}`, { method: metodo, headers, body: cuerpo ? JSON.stringify(cuerpo) : undefined, signal: AbortSignal.timeout(8000) });
  } catch (e) {
    throw new SinConexion(e.message);            // la base de datos no respondió
  }
  const datos = await r.json().catch(() => null);
  if (r.status >= 500) throw new SinConexion(`Supabase ${r.status}`);
  if (!r.ok) throw new ErrorDB(r.status, datos);
  return datos;
}

// Tablas (REST de Supabase), siempre con el token del usuario.
export const db = (ruta, token, opciones = {}) =>
  llamar(`/rest/v1/${ruta}`, { ...opciones, token, prefer: opciones.metodo && opciones.metodo !== 'GET' ? 'return=representation' : undefined });

// Inicio de sesión con correo y contraseña (Supabase Auth).
export const iniciarSesion = (correo, clave) =>
  llamar('/auth/v1/token?grant_type=password', { metodo: 'POST', cuerpo: { email: correo, password: clave } });

// Pregunta a Supabase si el token es válido y de quién es.
export const usuarioDelToken = (token) => llamar('/auth/v1/user', { token });
