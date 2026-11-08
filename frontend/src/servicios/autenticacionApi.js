
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function iniciarSesionApi(datos) {
  const controlador = new AbortController();

  const tiempoLimite = setTimeout(() => {
    controlador.abort();
  }, 15000);

  try {
    const respuesta = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      signal: controlador.signal,
      body: JSON.stringify({
        correo: datos.correo.trim().toLowerCase(),
        contrasena: datos.password,
        codigo_negocio:
          datos.tipoAcceso === "administrador"
            ? null
            : datos.codigoNegocio.trim().toUpperCase()
      })
    });

    let resultado;

    try {
      resultado = await respuesta.json();
    } catch {
      throw new Error("El servidor devolvió una respuesta inválida.");
    }

    if (!respuesta.ok) {
      throw new Error(
        resultado.detail || "Correo, contraseña o código de negocio incorrectos."
      );
    }

    if (!resultado.usuario) {
      throw new Error("El servidor no devolvió los datos del usuario.");
    }

    return resultado.usuario;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        "El servidor tardó demasiado en responder. Comprueba que el backend esté funcionando."
      );
    }

    if (error instanceof TypeError) {
      throw new Error(
        "No se pudo conectar con el servidor. Comprueba que el backend esté iniciado."
      );
    }

    throw error;
  } finally {
    clearTimeout(tiempoLimite);
  }
}
