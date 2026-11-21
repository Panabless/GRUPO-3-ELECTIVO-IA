// Conexión con Supabase (base de datos) usando su API REST. La clave secreta vive solo
// en las variables de entorno de Vercel: nunca en el código ni en el navegador.
export class SinConexion extends Error {}

export async function db(ruta, { metodo = 'GET', cuerpo } = {}) {
  const url = process.env.SUPABASE_URL;
  const clave = process.env.SUPABASE_SECRET_KEY;
  if (!url || !clave) throw new SinConexion('Faltan SUPABASE_URL o SUPABASE_SECRET_KEY');

  const headers = { apikey: clave, 'Content-Type': 'application/json' };
  // Las claves antiguas (JWT) también van en Authorization; las nuevas (sb_secret_...) solo en apikey.
  if (!clave.startsWith('sb_')) headers.Authorization = `Bearer ${clave}`;
  if (metodo === 'POST') headers.Prefer = 'return=representation';

  let r;
  try {
    r = await fetch(`${url.replace(/\/$/, '')}/rest/v1/${ruta}`, {
      method: metodo, headers, body: cuerpo ? JSON.stringify(cuerpo) : undefined,
      signal: AbortSignal.timeout(8000)
    });
  } catch (e) {
    throw new SinConexion(e.message);   // la base de datos no respondió
  }
  const datos = await r.json().catch(() => null);
  if (!r.ok) {
    if (r.status >= 500) throw new SinConexion(`Supabase ${r.status}`);
    const err = new Error((datos && datos.message) || `Supabase ${r.status}`);
    err.codigo = datos && datos.code;   // p. ej. 23505 = registro duplicado
    throw err;
  }
  return datos;
}
