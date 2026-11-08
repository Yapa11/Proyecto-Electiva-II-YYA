
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DisenoPagina from "../componentes/DisenoPagina";
import {
  eliminarProductoApi,
  obtenerProductosApi
} from "../servicios/productosApi";

export default function Productos({
  puedeAdministrar,
  sesion,
  codigoNegocio
}) {
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function cargarProductos() {
    setCargando(true);
    setError("");

    try {
      const datos = await obtenerProductosApi(codigoNegocio);
      setProductos(datos);
    } catch (e) {
      console.error("Error al consultar productos:", e);
      setError(e.message || "No fue posible cargar los productos.");
      setProductos([]);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarProductos();
  }, [codigoNegocio]);

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return productos.filter((producto) => {
      const coincideBusqueda =
        !texto ||
        [
          producto.nombre,
          producto.codigo,
          producto.categoria
        ].some((valor) =>
          String(valor || "").toLowerCase().includes(texto)
        );

      const cantidad = Number(producto.cantidad || 0);
      const minimo = Number(producto.minimo || 0);

      let coincideEstado = true;

      if (filtro === "disponibles") {
        coincideEstado = cantidad > minimo;
      }

      if (filtro === "stock-bajo") {
        coincideEstado = cantidad <= minimo;
      }

      return coincideBusqueda && coincideEstado;
    });
  }, [productos, busqueda, filtro]);

  async function manejarEliminar(producto) {
    const confirmar = window.confirm(
      `¿Deseas eliminar el producto "${producto.nombre}"?`
    );

    if (!confirmar) return;

    try {
      await eliminarProductoApi(
        producto.id,
        codigoNegocio
      );

      await cargarProductos();
    } catch (e) {
      window.alert(e.message);
    }
  }

  const totalUnidades = productos.reduce(
    (total, producto) =>
      total + Number(producto.cantidad || 0),
    0
  );

  const productosStockBajo = productos.filter(
    (producto) =>
      Number(producto.cantidad || 0) <=
      Number(producto.minimo || 0)
  ).length;

  return (
    <DisenoPagina
      titulo="Productos"
      subtitulo={`Inventario de ${
        sesion?.nombreNegocio || "tu negocio"
      }`}
      sesion={sesion}
    >
      <div className="tarjeta">
        <div className="cabecera-seccion">
          <div>
            <h2>Productos registrados</h2>
            <p>
              Consulta y administra los productos guardados
              en la base de datos de tu negocio.
            </p>
          </div>

          {puedeAdministrar && (
            <div className="acciones">
              <button
                type="button"
                className="boton boton-principal"
                onClick={() => navigate("/productos/nuevo")}
              >
                + Nuevo producto
              </button>
            </div>
          )}
        </div>

        <div className="aviso-solo-consulta">
          <p>
            {puedeAdministrar
              ? "Tienes permisos para registrar, modificar y eliminar productos."
              : "Estás en modo de consulta. Puedes visualizar los productos, pero no modificarlos."}
          </p>
        </div>
      </div>

      <div className="tarjeta">
        <div className="cabecera-seccion">
          <div>
            <h2>Buscar productos</h2>
            <p>
              Utiliza el buscador o el filtro para encontrar
              productos de tu negocio.
            </p>
          </div>

          <span className="contador-seccion">
            {productosFiltrados.length}
          </span>
        </div>

        <div className="filtros-panel">
          <div>
            <label htmlFor="buscar-producto">Buscar</label>
            <input
              id="buscar-producto"
              type="text"
              placeholder="Buscar por nombre, código o categoría..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="filtro-producto">
              Filtrar por estado
            </label>

            <select
              id="filtro-producto"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="disponibles">Stock disponible</option>
              <option value="stock-bajo">Stock bajo</option>
            </select>
          </div>
        </div>
      </div>

      <div className="tarjeta">
        <div className="cabecera-seccion">
          <div>
            <h2>Inventario</h2>
            <p>
              Lista de productos consultados directamente
              desde nuestra API.
            </p>
          </div>
        </div>

        {cargando ? (
          <div className="estado-vacio">
            <h3>Cargando productos...</h3>
            <p>Consultando la base de datos del negocio.</p>
          </div>
        ) : error ? (
          <div className="estado-vacio">
            <h3>No fue posible cargar el inventario</h3>
            <p>{error}</p>

            <button
              type="button"
              className="boton boton-principal"
              onClick={cargarProductos}
            >
              Volver a intentar
            </button>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="estado-vacio">
            <div className="estado-vacio-icono">P</div>

            <h3>No se encontraron productos</h3>

            <p>
              No hay productos que coincidan con la búsqueda
              o el filtro seleccionado.
            </p>

            {puedeAdministrar && productos.length === 0 && (
              <button
                type="button"
                className="boton boton-principal"
                onClick={() => navigate("/productos/nuevo")}
                style={{ marginTop: "15px" }}
              >
                Registrar primer producto
              </button>
            )}
          </div>
        ) : (
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Existencias</th>
                  <th>Stock mínimo</th>
                  <th>Estado</th>
                  {puedeAdministrar && <th>Acciones</th>}
                </tr>
              </thead>

              <tbody>
                {productosFiltrados.map((producto) => {
                  const cantidad = Number(producto.cantidad || 0);
                  const minimo = Number(producto.minimo || 0);
                  const stockBajo = cantidad <= minimo;

                  return (
                    <tr key={producto.id}>
                      <td>
                        {producto.codigo || `PRO-${producto.id}`}
                      </td>

                      <td>
                        <strong>{producto.nombre}</strong>
                      </td>

                      <td>
                        {producto.categoria || "Sin categoría"}
                      </td>

                      <td>
                        $
                        {Number(producto.precio || 0).toLocaleString(
                          "es-CO"
                        )}
                      </td>

                      <td>
                        <strong>{cantidad}</strong>
                      </td>

                      <td>{minimo}</td>

                      <td>
                        {stockBajo ? (
                          <span className="estado-stock-bajo">
                            Stock bajo
                          </span>
                        ) : (
                          <span className="estado-stock-ok">
                            Disponible
                          </span>
                        )}
                      </td>

                      {puedeAdministrar && (
                        <td>
                          <div className="acciones-tabla">
                            <button
                              type="button"
                              className="boton boton-secundario"
                              onClick={() =>
                                navigate(
                                  `/productos/editar/${producto.id}`
                                )
                              }
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              className="boton boton-peligro"
                              onClick={() => manejarEliminar(producto)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="tarjetas-resumen">
        <div className="tarjeta-resumen">
          <div className="icono-resumen">P</div>
          <div>
            <span>Total de productos</span>
            <strong>{productos.length}</strong>
          </div>
        </div>

        <div className="tarjeta-resumen">
          <div className="icono-resumen">U</div>
          <div>
            <span>Total de unidades</span>
            <strong>{totalUnidades.toLocaleString("es-CO")}</strong>
          </div>
        </div>

        <div className="tarjeta-resumen">
          <div className="icono-resumen">!</div>
          <div>
            <span>Productos con stock bajo</span>
            <strong>{productosStockBajo}</strong>
          </div>
        </div>
      </div>
    </DisenoPagina>
  );
}
