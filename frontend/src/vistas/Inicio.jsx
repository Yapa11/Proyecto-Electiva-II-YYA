
import { useEffect, useState } from "react";
import DisenoPagina from "../componentes/DisenoPagina";

import { obtenerProductosApi } from "../servicios/productosApi";
import { obtenerMovimientosApi } from "../servicios/movimientosApi";
import { obtenerUsuariosApi } from "../servicios/usuariosApi";

export default function Inicio({ sesion }) {
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const codigoNegocio = sesion?.codigoNegocio;
  const idUsuario = sesion?.idUsuario;

  useEffect(() => {
    async function cargarInformacion() {
      if (!codigoNegocio || !idUsuario) {
        setError("No se encontró la información de la sesión.");
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError("");

        const [datosProductos, datosMovimientos, datosUsuarios] =
          await Promise.all([
            obtenerProductosApi(codigoNegocio),
            obtenerMovimientosApi(codigoNegocio, idUsuario),
            obtenerUsuariosApi(codigoNegocio, idUsuario)
          ]);

        setProductos(datosProductos || []);
        setMovimientos(datosMovimientos || []);
        setEmpleados(datosUsuarios.empleados || []);
      } catch (err) {
        setError(
          err.message || "No fue posible cargar la información."
        );
      } finally {
        setCargando(false);
      }
    }

    cargarInformacion();
  }, [codigoNegocio, idUsuario]);

  const productosBajoStock = productos.filter(
    (producto) =>
      Number(producto.cantidad) <= Number(producto.minimo)
  );

  const totalUnidades = productos.reduce(
    (total, producto) =>
      total + Number(producto.cantidad || 0),
    0
  );

  const entradas = movimientos.filter(
    (movimiento) =>
      movimiento.tipo?.toLowerCase() === "entrada"
  );

  const salidas = movimientos.filter(
    (movimiento) =>
      movimiento.tipo?.toLowerCase() === "salida"
  );

  const movimientosRecientes = [...movimientos]
    .sort(
      (a, b) =>
        new Date(b.fecha).getTime() -
        new Date(a.fecha).getTime()
    )
    .slice(0, 5);

  function mostrarFecha(fecha) {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleDateString("es-CO");
  }

  return (
    <DisenoPagina
      titulo="Inicio"
      subtitulo="Resumen general de la gestión de inventario"
    >
      {error && (
        <div className="mensaje-error">
          {error}
        </div>
      )}

      {cargando ? (
        <div className="tarjeta">
          <p className="texto-vacio">
            Cargando información desde la base de datos...
          </p>
        </div>
      ) : (
        <>
          <div className="informacion-negocio">
            <h2>
              {sesion?.nombreNegocio ||
                sesion?.negocio?.nombre ||
                sesion?.codigoNegocio}
            </h2>

            <p>
              Código del negocio: {codigoNegocio}
            </p>
          </div>

          <div className="tarjetas-resumen">
            <div className="tarjeta tarjeta-resumen">
              <div className="icono-resumen">📦</div>
              <h3>Productos registrados</h3>
              <p>{productos.length}</p>
            </div>

            <div className="tarjeta tarjeta-resumen">
              <div className="icono-resumen">📊</div>
              <h3>Unidades disponibles</h3>
              <p>{totalUnidades}</p>
            </div>

            <div className="tarjeta tarjeta-resumen">
              <div className="icono-resumen">🟢</div>
              <h3>Entradas registradas</h3>
              <p>{entradas.length}</p>
            </div>

            <div className="tarjeta tarjeta-resumen">
              <div className="icono-resumen">🔴</div>
              <h3>Salidas registradas</h3>
              <p>{salidas.length}</p>
            </div>
          </div>

          <div className="grid-inicio">
            <div className="tarjeta">
              <div className="cabecera-seccion">
                <h2>Productos registrados</h2>
                <span className="contador-seccion">
                  {productos.length}
                </span>
              </div>

              {productos.length === 0 ? (
                <p className="estado-vacio">
                  No hay productos registrados.
                </p>
              ) : (
                <div className="tabla-contenedor">
                  <table className="tabla">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Stock mínimo</th>
                      </tr>
                    </thead>

                    <tbody>
                      {productos.slice(0, 5).map((producto) => (
                        <tr key={producto.id}>
                          <td>{producto.codigo}</td>
                          <td>{producto.nombre}</td>
                          <td>{producto.cantidad}</td>
                          <td>{producto.minimo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="tarjeta">
              <div className="cabecera-seccion">
                <h2>Productos con stock bajo</h2>
                <span className="contador-seccion">
                  {productosBajoStock.length}
                </span>
              </div>

              {productosBajoStock.length === 0 ? (
                <p className="estado-vacio">
                  No hay productos con stock bajo.
                </p>
              ) : (
                <div className="lista-productos">
                  {productosBajoStock.map((producto) => (
                    <div
                      className="item-producto-alerta"
                      key={producto.id}
                    >
                      <div>
                        <strong>{producto.nombre}</strong>
                        <p>
                          Existencias: {producto.cantidad}
                        </p>
                      </div>

                      <span className="estado-stock-bajo">
                        Stock bajo
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="tarjeta">
            <div className="cabecera-seccion">
              <h2>Empleados del negocio</h2>
              <span className="contador-seccion">
                {empleados.length}
              </span>
            </div>

            {empleados.length === 0 ? (
              <p className="estado-vacio">
                No hay empleados registrados.
              </p>
            ) : (
              <div className="lista-usuarios">
                {empleados.map((empleado) => (
                  <div
                    className="item-usuario"
                    key={empleado.id}
                  >
                    <div>
                      <strong>
                        {empleado.nombre} {empleado.apellido}
                      </strong>

                      <p>{empleado.correo}</p>

                      <span
                        className={
                          empleado.esAdministrador
                            ? "estado-activo"
                            : "estado-sin"
                        }
                      >
                        {empleado.esAdministrador
                          ? "Empleado administrador"
                          : "Empleado"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="tarjeta">
            <div className="cabecera-seccion">
              <h2>Movimientos recientes</h2>
              <span className="contador-seccion">
                {movimientos.length}
              </span>
            </div>

            {movimientosRecientes.length === 0 ? (
              <p className="estado-vacio">
                No hay movimientos registrados.
              </p>
            ) : (
              <div className="tabla-contenedor">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Producto</th>
                      <th>Tipo</th>
                      <th>Cantidad</th>
                      <th>Usuario</th>
                    </tr>
                  </thead>

                  <tbody>
                    {movimientosRecientes.map((movimiento) => (
                      <tr key={movimiento.id}>
                        <td>{mostrarFecha(movimiento.fecha)}</td>
                        <td>{movimiento.producto}</td>
                        <td>
                          <span
                            className={
                              movimiento.tipo?.toLowerCase() === "entrada"
                                ? "movimiento-entrada"
                                : "movimiento-salida"
                            }
                          >
                            {movimiento.tipo}
                          </span>
                        </td>
                        <td>{movimiento.cantidad}</td>
                        <td>{movimiento.usuario}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </DisenoPagina>
  );
}
