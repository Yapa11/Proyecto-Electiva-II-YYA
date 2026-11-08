
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InicioSesion({ iniciarSesion }) {
  const navigate = useNavigate();

  const [tipoAcceso, setTipoAcceso] = useState("dueno");
  const [codigoNegocio, setCodigoNegocio] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  function manejarCambioTipo(e) {
    const nuevoTipo = e.target.value;

    setTipoAcceso(nuevoTipo);
    setMensaje("");

    if (nuevoTipo === "administrador") {
      setCodigoNegocio("");
    }
  }

  async function manejarInicioSesion(e) {
    e.preventDefault();

    if (cargando) return;

    setMensaje("");

    if (
      tipoAcceso !== "administrador" &&
      !codigoNegocio.trim()
    ) {
      setMensaje("Debes ingresar el código del negocio.");
      return;
    }

    if (!correo.trim() || !password) {
      setMensaje("Debes ingresar el correo y la contraseña.");
      return;
    }

    setCargando(true);

    try {
      const resultado = await iniciarSesion({
        tipoAcceso,
        codigoNegocio: codigoNegocio.trim().toUpperCase(),
        correo: correo.trim().toLowerCase(),
        password
      });

      if (!resultado) {
        throw new Error(
          "El sistema no recibió una respuesta del inicio de sesión."
        );
      }

      if (resultado.correcto === false) {
        setMensaje(
          resultado.mensaje || "Credenciales incorrectas."
        );
        return;
      }

      if (resultado.ruta) {
        navigate(resultado.ruta);
        return;
      }

      // Compatibilidad con una respuesta que contenga
      // directamente los datos de la sesión.
      if (resultado.tipo === "administrador") {
        navigate("/administrador");
        return;
      }

      if (
        resultado.tipo === "dueno" ||
        resultado.tipo === "empleado"
      ) {
        navigate("/inicio");
        return;
      }

      throw new Error(
        "El inicio de sesión no devolvió una ruta válida."
      );

    } catch (error) {
      console.error("Error al iniciar sesión:", error);

      setMensaje(
        error.message ||
        "No fue posible conectar con el servidor."
      );

    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="pantalla-autenticacion">
      <div className="tarjeta-autenticacion">
        <div className="logo-grande">SGI</div>

        <h1>Sistema de Gestión de Inventario</h1>

        <p className="texto-centro">
          Ingresa con tus credenciales para continuar
        </p>

        <form onSubmit={manejarInicioSesion}>
          <label>Tipo de acceso</label>

          <select
            value={tipoAcceso}
            onChange={manejarCambioTipo}
            required
            disabled={cargando}
          >
            <option value="dueno">
              Dueño del negocio
            </option>

            <option value="empleado">
              Empleado
            </option>

            <option value="administrador">
              Administrador global
            </option>
          </select>

          {tipoAcceso !== "administrador" && (
            <>
              <label>Código del negocio</label>

              <input
                type="text"
                placeholder="Ejemplo: NEG001"
                value={codigoNegocio}
                onChange={(e) =>
                  setCodigoNegocio(
                    e.target.value.toUpperCase()
                  )
                }
                required
                disabled={cargando}
              />
            </>
          )}

          <label>Correo electrónico</label>

          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            disabled={cargando}
          />

          <label>Contraseña</label>

          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={cargando}
          />

          {mensaje && (
            <div className="mensaje-error" role="alert">
              {mensaje}
            </div>
          )}

          <button
            className="boton boton-principal boton-ancho"
            type="submit"
            disabled={cargando}
          >
            {cargando ? "Verificando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
