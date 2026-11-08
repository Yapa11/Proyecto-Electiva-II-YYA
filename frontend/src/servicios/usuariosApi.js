
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function procesarRespuesta(respuesta, mensajeError) {
  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(resultado.detail || mensajeError);
  }

  return resultado;
}

function crearParametros(codigoNegocio, idUsuario) {
  const parametros = new URLSearchParams({
    codigo_negocio: codigoNegocio,
    id_usuario: String(idUsuario)
  });

  return parametros.toString();
}

export async function obtenerUsuariosApi(
  codigoNegocio,
  idUsuario
) {
  const parametros = crearParametros(codigoNegocio, idUsuario);

  const respuesta = await fetch(
    `${API_URL}/api/usuarios/?${parametros}`
  );

  const resultado = await procesarRespuesta(
    respuesta,
    "No fue posible consultar los usuarios."
  );

  return {
    usuarios: resultado.usuarios || [],
    empleados: resultado.empleados || []
  };
}

export async function registrarEmpleadoApi(
  datos,
  codigoNegocio,
  idUsuario
) {
  const parametros = crearParametros(codigoNegocio, idUsuario);

  const respuesta = await fetch(
    `${API_URL}/api/usuarios/empleados?${parametros}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nombre: datos.nombre,
        apellido: datos.apellido,
        correo: datos.correo,
        contrasena: datos.password
      })
    }
  );

  return procesarRespuesta(
    respuesta,
    "No fue posible registrar el empleado."
  );
}

export async function designarAdministradorApi(
  idEmpleado,
  codigoNegocio,
  idUsuario
) {
  const parametros = crearParametros(codigoNegocio, idUsuario);

  const respuesta = await fetch(
    `${API_URL}/api/usuarios/empleados/${idEmpleado}/administrador?${parametros}`,
    {
      method: "PUT"
    }
  );

  return procesarRespuesta(
    respuesta,
    "No fue posible designar al administrador."
  );
}

export async function revocarAdministradorApi(
  idEmpleado,
  codigoNegocio,
  idUsuario
) {
  const parametros = crearParametros(codigoNegocio, idUsuario);

  const respuesta = await fetch(
    `${API_URL}/api/usuarios/empleados/${idEmpleado}/administrador?${parametros}`,
    {
      method: "DELETE"
    }
  );

  return procesarRespuesta(
    respuesta,
    "No fue posible quitar los permisos."
  );
}

export async function eliminarEmpleadoApi(
  idEmpleado,
  codigoNegocio,
  idUsuario
) {
  const parametros = crearParametros(codigoNegocio, idUsuario);

  const respuesta = await fetch(
    `${API_URL}/api/usuarios/empleados/${idEmpleado}?${parametros}`,
    {
      method: "DELETE"
    }
  );

  return procesarRespuesta(
    respuesta,
    "No fue posible desactivar al empleado."
  );
}
