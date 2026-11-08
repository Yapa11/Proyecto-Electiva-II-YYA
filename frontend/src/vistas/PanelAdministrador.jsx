import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PanelAdministrador({
  negocios,
  cerrarSesion
}) {
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [negocioSeleccionado, setNegocioSeleccionado] =
    useState(null);

  const negociosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return negocios.filter((negocio) => {
      const coincideBusqueda =
        negocio.nombre.toLowerCase().includes(texto) ||
        negocio.codigo.toLowerCase().includes(texto) ||
        negocio.propietario.nombre
          .toLowerCase()
          .includes(texto) ||
        negocio.propietario.correo
          .toLowerCase()
          .includes(texto);

      if (!coincideBusqueda) {
        return false;
      }

      if (filtro === "con-administrador") {
        return negocio.empleados?.some(
          (empleado) => empleado.esAdministrador
        );
      }

      if (filtro === "sin-administrador") {
        return !negocio.empleados?.some(
          (empleado) => empleado.esAdministrador
        );
      }

      return true;
    });
  }, [negocios, busqueda, filtro]);

  function salir() {
    cerrarSesion();
    navigate("/");
  }

  function seleccionarNegocio(negocio) {
    setNegocioSeleccionado(negocio);
  }

  return (
    <div className="aplicacion">
      <header className="encabezado">
        <div className="marca">
          <span className="marca-icono">SGI</span>

          <div>
            <strong>Sistema de Gestión</strong>
            <small>Administrador global</small>
          </div>
        </div>

        <div className="info-admin">
          <span>Administrador del sistema</span>

          <button
            type="button"
            className="boton boton-secundario"
            onClick={salir}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="contenido">
        <div className="titulo-pagina">
          <div>
            <h1>Panel del administrador global</h1>

            <p>
              Consulta la información de los negocios
              registrados en el sistema.
            </p>
          </div>
        </div>

        <div className="tarjeta panel-administrador">
          <div className="cabecera-panel">
            <div>
              <h2>Negocios registrados</h2>

              <p>
                Puedes consultar la información, pero no
                puedes modificar ningún negocio.
              </p>
            </div>

            <div className="contador-negocios">
              {negociosFiltrados.length} negocio(s)
            </div>
          </div>

          <div className="filtros-panel">
            <div className="campo-busqueda">
              <label>Buscar negocio</label>

              <input
                type="text"
                placeholder="Código, nombre, propietario o correo..."
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(e.target.value)
                }
              />
            </div>

            <div>
              <label>Filtro</label>

              <select
                value={filtro}
                onChange={(e) =>
                  setFiltro(e.target.value)
                }
              >
                <option value="todos">
                  Todos los negocios
                </option>

                <option value="con-administrador">
                  Con administrador designado
                </option>

                <option value="sin-administrador">
                  Sin administrador designado
                </option>
              </select>
            </div>
          </div>

          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Negocio</th>
                  <th>Propietario</th>
                  <th>Empleados</th>
                  <th>Administrador</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {negociosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="texto-vacio">
                      No se encontraron negocios.
                    </td>
                  </tr>
                ) : (
                  negociosFiltrados.map((negocio) => {
                    const administrador =
                      negocio.empleados?.find(
                        (empleado) =>
                          empleado.esAdministrador
                      );

                    return (
                      <tr key={negocio.codigo}>
                        <td>
                          <strong>{negocio.codigo}</strong>
                        </td>

                        <td>{negocio.nombre}</td>

                        <td>
                          <div>
                            {negocio.propietario.nombre}
                          </div>

                          <small>
                            {negocio.propietario.correo}
                          </small>
                        </td>

                        <td>
                          {negocio.empleados?.length || 0}
                        </td>

                        <td>
                          {administrador ? (
                            <span className="estado-activo">
                              {administrador.nombre}{" "}
                              {administrador.apellido}
                            </span>
                          ) : (
                            <span className="estado-sin">
                              Sin designar
                            </span>
                          )}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="boton boton-principal"
                            onClick={() =>
                              seleccionarNegocio(negocio)
                            }
                          >
                            Ver negocio
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {negocioSeleccionado && (
          <div className="tarjeta detalle-negocio">
            <div className="cabecera-detalle">
              <div>
                <h2>
                  {negocioSeleccionado.nombre}
                </h2>

                <p>
                  Código:{" "}
                  <strong>
                    {negocioSeleccionado.codigo}
                  </strong>
                </p>
              </div>

              <button
                type="button"
                className="boton boton-secundario"
                onClick={() =>
                  setNegocioSeleccionado(null)
                }
              >
                Cerrar información
              </button>
            </div>

            <div className="estadisticas-admin">
              <div className="tarjeta-estadistica">
                <span>Productos</span>
                <strong>
                  {negocioSeleccionado.productos?.length ||
                    0}
                </strong>
              </div>

              <div className="tarjeta-estadistica">
                <span>Empleados</span>
                <strong>
                  {negocioSeleccionado.empleados?.length ||
                    0}
                </strong>
              </div>

              <div className="tarjeta-estadistica">
                <span>Movimientos</span>
                <strong>
                  {negocioSeleccionado.movimientos?.length ||
                    0}
                </strong>
              </div>
            </div>

            <div className="detalle-seccion">
              <h3>Información del propietario</h3>

              <p>
                <strong>Nombre:</strong>{" "}
                {negocioSeleccionado.propietario.nombre}
              </p>

              <p>
                <strong>Correo:</strong>{" "}
                {negocioSeleccionado.propietario.correo}
              </p>
            </div>

            <div className="detalle-seccion">
              <h3>Empleados</h3>

              {negocioSeleccionado.empleados?.length ===
              0 ? (
                <p>No hay empleados registrados.</p>
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
                      {negocioSeleccionado.empleados.map(
                        (empleado) => (
                          <tr key={empleado.id}>
                            <td>
                              {empleado.nombre}{" "}
                              {empleado.apellido}
                            </td>

                            <td>{empleado.correo}</td>

                            <td>
                              {empleado.esAdministrador
                                ? "Administrador"
                                : "Empleado"}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="detalle-seccion">
              <h3>Productos</h3>

              {negocioSeleccionado.productos?.length ===
              0 ? (
                <p>No hay productos registrados.</p>
              ) : (
                <div className="tabla-contenedor">
                  <table className="tabla">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Cantidad</th>
                        <th>Stock mínimo</th>
                      </tr>
                    </thead>

                    <tbody>
                      {negocioSeleccionado.productos.map(
                        (producto) => (
                          <tr key={producto.id}>
                            <td>{producto.nombre}</td>

                            <td>{producto.categoria}</td>

                            <td>{producto.cantidad}</td>

                            <td>{producto.minimo}</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="aviso-solo-consulta">
              <strong>Modo consulta</strong>

              <p>
                El administrador global puede consultar
                la información de este negocio, pero no
                puede modificar productos, empleados,
                movimientos ni permisos.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}