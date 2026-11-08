
import { useEffect, useState } from "react";
import DisenoPagina from "../componentes/DisenoPagina";

import {
  obtenerUsuariosApi,
  registrarEmpleadoApi,
  designarAdministradorApi,
  revocarAdministradorApi,
  eliminarEmpleadoApi
} from "../servicios/usuariosApi";

export default function Usuarios({ sesion }) {
  const [usuarios, setUsuarios] = useState([]);
  const [empleados, setEmpleados] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const esDueno =
    sesion?.tipo === "dueno" || sesion?.esDueno;

  const codigoNegocio = sesion?.codigoNegocio;
  const idUsuario = sesion?.idUsuario;

  async function cargarUsuarios() {
    if (!codigoNegocio || !idUsuario) {
      setError("No se encontró la información de tu sesión.");
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      setError("");

      const datos = await obtenerUsuariosApi(
        codigoNegocio,
        idUsuario
      );

      setUsuarios(datos.usuarios || []);
      setEmpleados(datos.empleados || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarUsuarios();
  }, [codigoNegocio, idUsuario]);

  function limpiarFormulario() {
    setNombre("");
    setApellido("");
    setCorreo("");
    setPassword("");
  }

  async function guardarEmpleado(e) {
    e.preventDefault();
    setMensaje("");
    setError("");

    try {
      setProcesando(true);

      await registrarEmpleadoApi(
        { nombre, apellido, correo, password },
        codigoNegocio,
        idUsuario
      );

      limpiarFormulario();
      setMostrarFormulario(false);
      setMensaje("Empleado registrado correctamente.");

      await cargarUsuarios();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  }

  async function convertirAdministrador(id) {
    setMensaje("");
    setError("");

    try {
      setProcesando(true);

      await designarAdministradorApi(
        id,
        codigoNegocio,
        idUsuario
      );

      setMensaje(
        "El empleado ahora es administrador del negocio."
      );

      await cargarUsuarios();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  }

  async function quitarAdministrador(id) {
    setMensaje("");
    setError("");

    try {
      setProcesando(true);

      await revocarAdministradorApi(
        id,
        codigoNegocio,
        idUsuario
      );

      setMensaje("Se quitaron los permisos de administrador.");

      await cargarUsuarios();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  }

  async function eliminar(id) {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este empleado?"
    );

    if (!confirmar) return;

    setMensaje("");
    setError("");

    try {
      setProcesando(true);

      await eliminarEmpleadoApi(
        id,
        codigoNegocio,
        idUsuario
      );

      setMensaje("Empleado eliminado correctamente.");

      await cargarUsuarios();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  }

  return (
    <DisenoPagina
      titulo="Usuarios"
      subtitulo="Consulta y administración de usuarios del negocio"
    >
      {mensaje && (
        <div className="mensaje-exito">{mensaje}</div>
      )}

      {error && (
        <div className="mensaje-error">{error}</div>
      )}

      {esDueno && (
        <div className="acciones-pagina">
          <button
            type="button"
            className="boton boton-principal"
            onClick={() =>
              setMostrarFormulario(!mostrarFormulario)
            }
            disabled={procesando}
          >
            {mostrarFormulario
              ? "Cancelar"
              : "Registrar empleado"}
          </button>
        </div>
      )}

      {mostrarFormulario && esDueno && (
        <div className="tarjeta formulario-empleado">
          <h2>Registrar nuevo empleado</h2>

          <form onSubmit={guardarEmpleado}>
            <div className="formulario-grid">
              <div>
                <label>Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              <div>
                <label>Apellido</label>
                <input
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  required
                />
              </div>

              <div>
                <label>Correo</label>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
              </div>

              <div>
                <label>Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div className="acciones-formulario">
              <button
                type="submit"
                className="boton boton-principal"
                disabled={procesando}
              >
                {procesando
                  ? "Guardando..."
                  : "Guardar empleado"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="tarjeta">
        <div className="cabecera-panel">
          <div>
            <h2>Usuarios registrados</h2>
            <p>
              Aquí se muestran los usuarios asociados al negocio.
            </p>
          </div>
        </div>

        {cargando ? (
          <p className="texto-vacio">Cargando usuarios...</p>
        ) : (
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                </tr>
              </thead>

              <tbody>
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan="3">
                      No hay usuarios registrados.
                    </td>
                  </tr>
                ) : (
                  usuarios.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>
                        {usuario.nombre} {usuario.apellido}
                      </td>
                      <td>{usuario.correo}</td>
                      <td>
                        {usuario.rol === "empleado" &&
                        usuario.esAdministrador
                          ? "Empleado administrador"
                          : usuario.rol === "empleado"
                            ? "Empleado"
                            : usuario.rol === "dueno"
                              ? "Dueño"
                              : usuario.rol}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="tarjeta">
        <div className="cabecera-panel">
          <div>
            <h2>Empleados</h2>
            <p>
              El dueño puede designar un empleado como
              administrador del negocio.
            </p>
          </div>
        </div>

        {cargando ? (
          <p className="texto-vacio">Cargando empleados...</p>
        ) : empleados.length === 0 ? (
          <p className="texto-vacio">
            No hay empleados registrados.
          </p>
        ) : (
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Tipo de empleado</th>
                  {esDueno && <th>Acciones</th>}
                </tr>
              </thead>

              <tbody>
                {empleados.map((empleado) => (
                  <tr key={empleado.id}>
                    <td>
                      {empleado.nombre} {empleado.apellido}
                    </td>

                    <td>{empleado.correo}</td>

                    <td>
                      {empleado.esAdministrador ? (
                        <span className="estado-activo">
                          Empleado administrador
                        </span>
                      ) : (
                        <span className="estado-sin">
                          Empleado
                        </span>
                      )}
                    </td>

                    {esDueno && (
                      <td>
                        <div className="acciones-tabla">
                          {empleado.esAdministrador ? (
                            <button
                              type="button"
                              className="boton boton-secundario"
                              onClick={() =>
                                quitarAdministrador(empleado.id)
                              }
                              disabled={procesando}
                            >
                              Quitar permisos
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="boton boton-principal"
                              onClick={() =>
                                convertirAdministrador(empleado.id)
                              }
                              disabled={procesando}
                            >
                              Designar administrador
                            </button>
                          )}

                          <button
                            type="button"
                            className="boton boton-peligro"
                            onClick={() => eliminar(empleado.id)}
                            disabled={procesando}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!esDueno && (
        <div className="aviso-solo-consulta">
          <strong>Modo de consulta</strong>
          <p>
            Tu cuenta puede consultar la información del negocio.
            Las funciones administrativas están disponibles
            únicamente para el dueño y para el empleado designado
            como administrador.
          </p>
        </div>
      )}

      {sesion?.esAdministrador && !esDueno && (
        <div className="aviso-administrador">
          <strong>Administrador del negocio</strong>
          <p>
            Tienes permisos para administrar productos y registrar
            movimientos porque el dueño te designó como
            administrador.
          </p>
        </div>
      )}
    </DisenoPagina>
  );
}
