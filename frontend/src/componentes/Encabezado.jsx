import { NavLink } from "react-router-dom";

export default function Encabezado() {
  function cerrarSesion() {
    /*
     * Eliminamos únicamente la sesión.
     *
     * NO eliminamos sgi_negocios porque ahí están
     * guardados los productos, empleados, movimientos
     * y la designación del administrador.
     */
    sessionStorage.removeItem("sesion");

    /*
     * Recargamos completamente la aplicación.
     *
     * Esto es importante porque App.jsx también tiene
     * el estado de la sesión en React.
     */
    window.location.href = "/";
  }

  let sesion = null;

  try {
    const datos = sessionStorage.getItem("sesion");

    if (datos) {
      sesion = JSON.parse(datos);
    }
  } catch (error) {
    console.error(
      "No se pudo leer la sesión:",
      error
    );
  }

  return (
    <header className="encabezado">
      <div className="marca">
        <div className="marca-icono">
          SGI
        </div>

        <div className="marca-texto">
          <strong>Sistema de Gestión</strong>
          <small>Inventario</small>
        </div>
      </div>

      <nav className="navegacion">
        <NavLink to="/inicio">
          Inicio
        </NavLink>

        <NavLink to="/productos">
          Productos
        </NavLink>

        <NavLink to="/movimientos">
          Movimientos
        </NavLink>

        <NavLink to="/usuarios">
          Usuarios
        </NavLink>
      </nav>

      <div className="zona-usuario">
        {sesion && (
          <div className="usuario-actual">
            <strong>
              {sesion.nombre}
            </strong>

            <small>
              {sesion.esDueno
                }
            </small>
          </div>
        )}

        <button
          type="button"
          className="boton boton-secundario"
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}