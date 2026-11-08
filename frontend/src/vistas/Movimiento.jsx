import { useEffect, useMemo, useState } from "react";
import DisenoPagina from "../componentes/DisenoPagina";
import { obtenerProductosApi } from "../servicios/productosApi";
import {
  obtenerMovimientosApi,
  crearMovimientoApi
} from "../servicios/movimientosApi";

export default function Movimiento({
  puedeAdministrar,
  sesion
}) {
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);

  const [tipoVista, setTipoVista] = useState("historial");
  const [tipoMovimiento, setTipoMovimiento] = useState("Entrada");
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [observacion, setObservacion] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const codigoNegocio = sesion?.codigoNegocio;
  const idUsuario = sesion?.idUsuario;

  async function cargarDatos() {
    if (!codigoNegocio || !idUsuario) {
      setError("No se encontró la información de la sesión.");
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      setError("");

      const [productosObtenidos, movimientosObtenidos] =
        await Promise.all([
          obtenerProductosApi(codigoNegocio),
          obtenerMovimientosApi(codigoNegocio, idUsuario)
        ]);

      setProductos(productosObtenidos);
      setMovimientos(movimientosObtenidos);
    } catch (err) {
      setError(
        err.message || "No fue posible cargar los movimientos."
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, [codigoNegocio, idUsuario]);

  const movimientosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return movimientos.filter((movimiento) => {
      const coincideBusqueda =
        !texto ||
        String(movimiento.producto || "")
          .toLowerCase()
          .includes(texto) ||
        String(movimiento.usuario || "")
          .toLowerCase()
          .includes(texto) ||
        String(movimiento.observacion || "")
          .toLowerCase()
          .includes(texto);

      const coincideTipo =
        filtroTipo === "todos" ||
        movimiento.tipo === filtroTipo;

      return coincideBusqueda && coincideTipo;
    });
  }, [movimientos, busqueda, filtroTipo]);

  const entradas = movimientos.filter(
    (movimiento) => movimiento.tipo === "Entrada"
  );

  const salidas = movimientos.filter(
    (movimiento) => movimiento.tipo === "Salida"
  );

  const totalEntradas = entradas.reduce(
    (total, movimiento) =>
      total + Number(movimiento.cantidad || 0),
    0
  );

  const totalSalidas = salidas.reduce(
    (total, movimiento) =>
      total + Number(movimiento.cantidad || 0),
    0
  );

  function cambiarTipoMovimiento(tipo) {
    setTipoMovimiento(tipo);
    setTipoVista("registrar");
    setMensaje("");
    setError("");
  }

  async function manejarRegistro(e) {
    e.preventDefault();

    setMensaje("");
    setError("");

    if (!productoId) {
      setError("Selecciona un producto.");
      return;
    }

    if (!cantidad || Number(cantidad) <= 0) {
      setError("La cantidad debe ser mayor que cero.");
      return;
    }

    const producto = productos.find(
      (item) => String(item.id) === String(productoId)
    );

    if (!producto) {
      setError("No se encontró el producto seleccionado.");
      return;
    }

    if (
      tipoMovimiento === "Salida" &&
      Number(cantidad) > Number(producto.cantidad || 0)
    ) {
      setError(
        `No hay suficiente inventario. Existencias actuales: ${producto.cantidad}.`
      );
      return;
    }

    try {
      setGuardando(true);

      await crearMovimientoApi(
        {
          productoId: producto.id,
          tipo: tipoMovimiento,
          cantidad: Number(cantidad),
          observacion
        },
        codigoNegocio,
        idUsuario
      );

      await cargarDatos();

      setMensaje(
        `${tipoMovimiento} registrada correctamente.`
      );

      setProductoId("");
      setCantidad("");
      setObservacion("");
      setTipoVista("registrar");
    } catch (err) {
      setError(
        err.message ||
        "No fue posible registrar el movimiento."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <DisenoPagina
      titulo="Movimientos"
      subtitulo={`Control de entradas y salidas de ${
        sesion?.nombreNegocio || "tu negocio"
      }`}
    >
      {/* TARJETAS DE RESUMEN */}

      <div className="tarjetas-resumen">
        <div className="tarjeta-resumen">
          <div className="icono-resumen">
            M
          </div>

          <div>
            <span>Total movimientos</span>
            <strong>{movimientos.length}</strong>
          </div>
        </div>

        <div className="tarjeta-resumen tarjeta-resumen-entrada">
          <div className="icono-resumen icono-entrada">
            E
          </div>

          <div>
            <span>Entradas</span>
            <strong>{entradas.length}</strong>
          </div>
        </div>

        <div className="tarjeta-resumen tarjeta-resumen-salida">
          <div className="icono-resumen icono-salida">
            S
          </div>

          <div>
            <span>Salidas</span>
            <strong>{salidas.length}</strong>
          </div>
        </div>

        <div className="tarjeta-resumen">
          <div className="icono-resumen">
            U
          </div>

          <div>
            <span>Unidades movidas</span>
            <strong>
              {totalEntradas + totalSalidas}
            </strong>
          </div>
        </div>
      </div>

      {/* PANEL PRINCIPAL */}

      <div className="tarjeta">
        <div className="cabecera-seccion">
          <div>
            <h2>Gestión de movimientos</h2>

            <p>
              Registra entradas, salidas o consulta
              el historial del inventario.
            </p>
          </div>
        </div>

        <div className="acciones">
          {puedeAdministrar && (
            <>
              <button
                type="button"
                className={
                  tipoVista === "registrar" &&
                  tipoMovimiento === "Entrada"
                    ? "boton boton-entrada"
                    : "boton boton-secundario"
                }
                onClick={() =>
                  cambiarTipoMovimiento("Entrada")
                }
              >
                + Registrar entrada
              </button>

              <button
                type="button"
                className={
                  tipoVista === "registrar" &&
                  tipoMovimiento === "Salida"
                    ? "boton boton-salida"
                    : "boton boton-secundario"
                }
                onClick={() =>
                  cambiarTipoMovimiento("Salida")
                }
              >
                − Registrar salida
              </button>
            </>
          )}

          <button
            type="button"
            className={
              tipoVista === "historial"
                ? "boton boton-principal"
                : "boton boton-secundario"
            }
            onClick={() => {
              setTipoVista("historial");
              setMensaje("");
              setError("");
            }}
          >
            Ver movimientos
          </button>
        </div>

        {!puedeAdministrar && (
          <div className="aviso-solo-consulta">
            <p>
              Tu usuario tiene permisos de consulta.
              Puedes visualizar el historial, pero no
              registrar entradas ni salidas.
            </p>
          </div>
        )}
      </div>

      {/* FORMULARIO DE REGISTRO */}

      {tipoVista === "registrar" &&
        puedeAdministrar && (
          <div className="tarjeta">
            <div className="cabecera-seccion">
              <div>
                <h2>
                  Registrar{" "}
                  {tipoMovimiento.toLowerCase()}
                </h2>

                <p>
                  Completa la información del movimiento.
                </p>
              </div>

              {tipoMovimiento === "Entrada" ? (
                <span className="movimiento-entrada">
                  Entrada
                </span>
              ) : (
                <span className="movimiento-salida">
                  Salida
                </span>
              )}
            </div>

            {mensaje && (
              <div className="mensaje-exito">
                {mensaje}
              </div>
            )}

            {error && (
              <div className="mensaje-error">
                {error}
              </div>
            )}

            <form onSubmit={manejarRegistro}>
              <div className="formulario-grid">
                <div>
                  <label htmlFor="producto-movimiento">
                    Producto
                  </label>

                  <select
                    id="producto-movimiento"
                    value={productoId}
                    onChange={(e) =>
                      setProductoId(e.target.value)
                    }
                    required
                  >
                    <option value="">
                      Selecciona un producto
                    </option>

                    {productos.map((producto) => (
                      <option
                        key={producto.id}
                        value={producto.id}
                      >
                        {producto.nombre} - Stock:{" "}
                        {producto.cantidad}
                      </option>
                    ))}
                  </select>
                  {productos.length === 0 && (
                    <p>No hay productos disponibles.</p>
                  )}
                </div>

                <div>
                  <label htmlFor="cantidad-movimiento">
                    Cantidad
                  </label>

                  <input
                    id="cantidad-movimiento"
                    type="number"
                    min="1"
                    step="1"
                    value={cantidad}
                    onChange={(e) =>
                      setCantidad(e.target.value)
                    }
                    placeholder="Ejemplo: 10"
                    required
                  />
                </div>
              </div>

              <div className="campo-formulario">
                <label htmlFor="observacion-movimiento">
                  Observación
                </label>

                <textarea
                  id="observacion-movimiento"
                  rows="4"
                  value={observacion}
                  onChange={(e) =>
                    setObservacion(e.target.value)
                  }
                  placeholder="Escribe una observación opcional..."
                />
              </div>

              <div className="acciones-formulario">
                <button
                  type="submit"
                  className={
                    tipoMovimiento === "Entrada"
                      ? "boton boton-entrada"
                      : "boton boton-salida"
                  }
                  disabled={guardando || cargando}
                >
                  {guardando
                    ? "Guardando..."
                    : `Registrar ${tipoMovimiento.toLowerCase()}`}
                </button>

                <button
                  type="button"
                  className="boton boton-secundario"
                  onClick={() => {
                    setTipoVista("historial");
                    setMensaje("");
                    setError("");
                  }}
                  disabled={guardando}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

      {/* HISTORIAL */}

      {tipoVista === "historial" && (
        <>
          <div className="tarjeta">
            <div className="cabecera-seccion">
              <div>
                <h2>Historial de movimientos</h2>

                <p>
                  Consulta las entradas y salidas
                  registradas.
                </p>
              </div>

              <span className="contador-seccion">
                {movimientosFiltrados.length}
              </span>
            </div>

            <div className="filtros-panel">
              <div>
                <label htmlFor="buscar-movimiento">
                  Buscar
                </label>

                <input
                  id="buscar-movimiento"
                  type="text"
                  placeholder="Buscar por producto, usuario u observación..."
                  value={busqueda}
                  onChange={(e) =>
                    setBusqueda(e.target.value)
                  }
                />
              </div>

              <div>
                <label htmlFor="filtro-movimiento">
                  Tipo de movimiento
                </label>

                <select
                  id="filtro-movimiento"
                  value={filtroTipo}
                  onChange={(e) =>
                    setFiltroTipo(e.target.value)
                  }
                >
                  <option value="todos">
                    Todos
                  </option>

                  <option value="Entrada">
                    Entradas
                  </option>

                  <option value="Salida">
                    Salidas
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div className="tarjeta">
            {cargando ? (
              <div className="estado-vacio">
                <h3>Cargando movimientos...</h3>
                <p>Consultando la información del negocio.</p>
              </div>
            ) : error ? (
              <div className="mensaje-error">
                {error}
              </div>
            ) : movimientosFiltrados.length === 0 ? (
              <div className="estado-vacio">
                <div className="estado-vacio-icono">
                  M
                </div>

                <h3>No hay movimientos</h3>

                <p>
                  Todavía no existen movimientos que
                  coincidan con la búsqueda.
                </p>
              </div>
            ) : (
              <div className="tabla-contenedor">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Fecha</th>
                      <th>Usuario</th>
                      <th>Observación</th>
                    </tr>
                  </thead>

                  <tbody>
                    {movimientosFiltrados.map(
                      (movimiento) => (
                        <tr key={movimiento.id}>
                          <td>
                            {movimiento.tipo === "Entrada" ? (
                              <span className="movimiento-entrada">
                                Entrada
                              </span>
                            ) : (
                              <span className="movimiento-salida">
                                Salida
                              </span>
                            )}
                          </td>

                          <td>
                            <strong>
                              {movimiento.producto}
                            </strong>
                          </td>

                          <td>
                            {movimiento.cantidad}
                          </td>

                          <td>
                            {movimiento.fecha}
                          </td>

                          <td>
                            {movimiento.usuario}
                          </td>

                          <td>
                            {movimiento.observacion ||
                              "Sin observación"}
                          </td>
                        </tr>
                      )
                    )}
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