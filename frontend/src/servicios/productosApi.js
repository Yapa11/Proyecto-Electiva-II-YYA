
const API_URL = `${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/api/productos`;

async function procesarRespuesta(respuesta) {
  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    const detalle =
      datos.detail ||
      datos.mensaje ||
      "Ocurrió un error al comunicarse con la API.";

    throw new Error(
      Array.isArray(detalle)
        ? detalle.map((error) => error.msg).join(", ")
        : detalle
    );
  }

  return datos;
}

function parametrosNegocio(codigoNegocio) {
  if (!codigoNegocio) {
    throw new Error(
      "No se encontró el código del negocio en la sesión."
    );
  }

  return new URLSearchParams({
    codigo_negocio: codigoNegocio
  });
}

export async function obtenerProductosApi(codigoNegocio) {
  const parametros = parametrosNegocio(codigoNegocio);

  const datos = await procesarRespuesta(
    await fetch(`${API_URL}/?${parametros}`)
  );

  return datos.productos || [];
}

export async function obtenerCategoriasApi(codigoNegocio) {
  const parametros = parametrosNegocio(codigoNegocio);

  return procesarRespuesta(
    await fetch(`${API_URL}/categorias?${parametros}`)
  );
}

export async function crearProductoApi(producto, codigoNegocio) {
  const parametros = parametrosNegocio(codigoNegocio);

  return procesarRespuesta(
    await fetch(`${API_URL}/?${parametros}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(producto)
    })
  );
}

export async function actualizarProductoApi(
  id,
  producto,
  codigoNegocio
) {
  const parametros = parametrosNegocio(codigoNegocio);

  return procesarRespuesta(
    await fetch(`${API_URL}/${id}?${parametros}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(producto)
    })
  );
}

export async function eliminarProductoApi(id, codigoNegocio) {
  const parametros = parametrosNegocio(codigoNegocio);

  return procesarRespuesta(
    await fetch(`${API_URL}/${id}?${parametros}`, {
      method: "DELETE"
    })
  );
}
