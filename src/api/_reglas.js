// Reglas de validación de la orden (HU-04). Una sola definición: el servidor las aplica
// y la pantalla recibe los mismos mensajes desde /api/opciones.
export const MENSAJES = {
  id_camion: 'Elija el camión que necesita combustible.',
  id_sector: 'Elija el sector donde el operador se encontrará con el camión.',
  id_carro: 'Elija el camión de combustible que irá; la orden le llega a su operador.',
  camion_no_existe: 'Ese camión no existe en la flota. Vuelva a elegirlo de la lista.',
  sin_alerta: (c) => `${c} no tiene una alerta activa: no corresponde asignarle una orden.`,
  ya_tiene_orden: (c, o) => `${c} ya tiene la orden ${o} registrada. No se creó otra.`,
  sector_no_existe: 'Ese sector no existe. Vuelva a elegirlo de la lista.',
  carro_no_existe: 'Ese camión de combustible no existe. Vuelva a elegirlo de la lista.',
  carro_no_disponible: 'Ese camión de combustible no está disponible. Elija uno disponible.',
  sin_conexion: 'No pudimos guardar la orden porque la base de datos no responde. Lo que eligió sigue en el formulario: reintente en unos segundos o avise al operador por radio.'
};

// Campos obligatorios: texto no vacío, de hasta 20 caracteres (los códigos son del tipo CAM-07).
const CAMPOS = ['id_camion', 'id_sector', 'id_carro'];

export function validarFormato(body) {
  const errores = {};
  for (const campo of CAMPOS) {
    const v = body && body[campo];
    if (typeof v !== 'string' || v.trim() === '' || v.length > 20) errores[campo] = MENSAJES[campo];
  }
  return errores;
}
