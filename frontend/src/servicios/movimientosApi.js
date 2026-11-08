
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function procesarRespuesta(respuesta, mensajeError) {
  let resultado;

  try {
    resultado = await respuesta.json();
  } catch {
    throw new Error("El servidor devolvió una respuesta inválida.");
  }

  if (!respuesta.ok) {
    throw new Error(resultado.detail || mensajeError);
  }

  return resultado;
}

function normalizarTipo(tipo) {
  const valor = String(tipo || "").trim().toLowerCase();

  if (valor === "entrada") return "Entrada";
  if (valor === "salida") return "Salida";

  return tipo;
}

function normalizarMovimiento(movimiento) {
  return {
    ...movimiento,
    tipo: normalizarTipo(movimiento.tipo),
    cantidad: Number(movimiento.cantidad || 0)
  };
}

export async function obtenerMovimientosApi(
  codigoNegocio,
  idUsuario
) {
  const parametros = new URLSearchParams({
    codigo_negocio: codigoNegocio,
    id_usuario: String(idUsuario)
  });

  const respuesta = await fetch(
    `${API_URL}/api/movimientos/?${parametros.toString()}`
  );

  const resultado = await procesarRespuesta(
    respuesta,
    "No fue posible consultar los movimientos."
  );

  return (resultado.movimientos || []).map(normalizarMovimiento);
}

export async function crearMovimientoApi(
  datos,
  codigoNegocio,
  idUsuario
) {
  const parametros = new URLSearchParams({
    codigo_negocio: codigoNegocio,
    id_usuario: String(idUsuario)
  });

  const respuesta = await fetch(
    `${API_URL}/api/movimientos/?${parametros.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id_producto: datos.productoId,
        tipo: normalizarTipo(datos.tipo),
        cantidad: Number(datos.cantidad),
        observacion: datos.observacion || null
      })
    }
  );

  return procesarRespuesta(
    respuesta,
    "No fue posible registrar el movimiento."
  );
}
