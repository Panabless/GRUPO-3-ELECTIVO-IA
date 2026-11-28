// Reglas de validación (docs/robustecimiento.md). Una sola definición: el servidor las aplica
// y la pantalla recibe los mismos mensajes desde /api/opciones.
export const MENSAJES = {
  correo: 'Escriba su correo, por ejemplo nombre@ejemplo.cl.',
  clave: 'Escriba su contraseña.',
  credenciales: 'Correo o contraseña incorrectos. Revíselos e intente de nuevo.',
  id_camion: 'Elija el camión que necesita combustible.',
  id_sector: 'Elija el sector donde el operador se encontrará con el camión.',
  id_carro: 'Elija el camión de combustible que irá; la orden le llega a su operador.',
  motivo: 'Escriba el motivo de la anulación (entre 5 y 200 caracteres).',
  camion_no_existe: 'Ese camión no existe en la flota. Vuelva a elegirlo de la lista.',
  sin_alerta: (c) => `${c} no tiene una alerta activa: no corresponde asignarle una orden.`,
  ya_tiene_orden: (c, o) => `${c} ya tiene la orden ${o} vigente. No se creó otra.`,
  sector_no_existe: 'Ese sector no existe. Vuelva a elegirlo de la lista.',
  carro_no_existe: 'Ese camión de combustible no existe. Vuelva a elegirlo de la lista.',
  carro_no_disponible: 'Ese camión de combustible no está disponible. Elija uno disponible.',
  no_existe: (id) => `La orden ${id} no existe o no tiene permiso para verla. Vuelva al listado y elija una orden de la lista.`,
  rol_no_permite: (rol, accion) => `Su rol (${rol}) no permite ${accion}.`,
  no_es_suya: 'Solo puede anular las órdenes que usted emitió.',
  estado_no_permite: (id, estado, accion) => `La orden ${id} está «${estado}»: no se puede ${accion}. Recargue para ver su estado actual.`,
  accion_invalida: 'Acción no reconocida. Use los botones de la orden.',
  sin_conexion: 'No pudimos guardar porque la base de datos no responde. Lo que escribió sigue en el formulario: reintente en unos segundos o avise por radio.',
  inesperado: 'Ocurrió un error del sistema y no se guardó nada. Reintente; si se repite, avise al equipo.'
};

const texto = (v, max) => typeof v === 'string' && v.trim() !== '' && v.length <= max;

// Orden nueva: tres listas obligatorias, códigos de hasta 20 caracteres.
export function validarOrden(body) {
  const errores = {};
  for (const campo of ['id_camion', 'id_sector', 'id_carro']) if (!texto(body?.[campo], 20)) errores[campo] = MENSAJES[campo];
  return errores;
}

// Inicio de sesión: correo con formato válido (hasta 100) y contraseña (hasta 72).
export function validarLogin(body) {
  const errores = {};
  const c = body?.correo;
  if (!texto(c, 100) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.trim())) errores.correo = MENSAJES.correo;
  if (!texto(body?.clave, 72)) errores.clave = MENSAJES.clave;
  return errores;
}

// Motivo de anulación: obligatorio, entre 5 y 200 caracteres sin contar espacios de los extremos.
export function validarMotivo(motivo) {
  const m = typeof motivo === 'string' ? motivo.trim() : '';
  return m.length >= 5 && m.length <= 200 ? null : MENSAJES.motivo;
}

export const ID_ORDEN = /^ORD-\d{3,6}$/;
