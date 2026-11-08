
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams
} from "react-router-dom";

import DisenoPagina from "../componentes/DisenoPagina";

import {
  actualizarProductoApi,
  crearProductoApi,
  obtenerCategoriasApi,
  obtenerProductosApi
} from "../servicios/productosApi";

const formularioInicial = {
  codigo: "",
  nombre: "",
  categoria: "",
  descripcion: "",
  precio: "",
  cantidad: "",
  minimo: ""
};

export default function FormularioProducto({
  sesion,
  cerrarSesion,
  puedeAdministrar,
  codigoNegocio
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const editar = Boolean(id);

  const [form, setForm] = useState(formularioInicial);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      try {
        const listaCategorias =
          await obtenerCategoriasApi(codigoNegocio);

        if (!activo) return;

        setCategorias(listaCategorias);

        if (editar) {
          const listaProductos =
            await obtenerProductosApi(codigoNegocio);

          const producto = listaProductos.find(
            (item) => Number(item.id) === Number(id)
          );

          if (!producto) {
            throw new Error(
              "No se encontró el producto que deseas editar en este negocio."
            );
          }

          setForm({
            codigo: producto.codigo || "",
            nombre: producto.nombre || "",
            categoria:
              producto.categoria === "Sin categoría"
                ? ""
                : producto.categoria,
            descripcion: producto.descripcion || "",
            precio: producto.precio ?? "",
            cantidad: producto.cantidad ?? "",
            minimo: producto.minimo ?? ""
          });
        }
      } catch (e) {
        if (activo) {
          setError(e.message);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarDatos();

    return () => {
      activo = false;
    };
  }, [codigoNegocio, editar, id]);

  function cambiar(e) {
    setForm((actual) => ({
      ...actual,
      [e.target.name]: e.target.value
    }));
  }

  async function guardar(e) {
    e.preventDefault();

    if (!puedeAdministrar) {
      setError("No tienes permisos para modificar productos.");
      return;
    }

    setGuardando(true);
    setError("");

    const datos = {
      codigo: form.codigo.trim() || null,
      nombre: form.nombre.trim(),
      categoria: form.categoria || null,
      descripcion: form.descripcion.trim() || null,
      precio: Number(form.precio),
      cantidad: Number(form.cantidad),
      stock_minimo: Number(form.minimo)
    };

    try {
      if (editar) {
        await actualizarProductoApi(
          Number(id),
          datos,
          codigoNegocio
        );
      } else {
        await crearProductoApi(
          datos,
          codigoNegocio
        );
      }

      navigate("/productos");
    } catch (e) {
      setError(
        e.message || "No fue posible guardar el producto."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <DisenoPagina
      titulo={editar ? "Editar producto" : "Registrar producto"}
      subtitulo="Completa la información del producto."
      sesion={sesion}
      cerrarSesion={cerrarSesion}
    >
      <div className="tarjeta formulario">
        {cargando ? (
          <p>Cargando información del producto...</p>
        ) : (
          <form onSubmit={guardar}>
            {error && (
              <div className="aviso-solo-consulta">
                <p>{error}</p>
              </div>
            )}

            <div className="grid-2">
              <div>
                <label htmlFor="codigo">
                  Código del producto
                </label>

                <input
                  id="codigo"
                  name="codigo"
                  value={form.codigo}
                  onChange={cambiar}
                  maxLength="50"
                  placeholder="Ej. TEC006"
                />
              </div>

              <div>
                <label htmlFor="nombre">
                  Nombre del producto
                </label>

                <input
                  id="nombre"
                  name="nombre"
                  value={form.nombre}
                  onChange={cambiar}
                  required
                  maxLength="150"
                />
              </div>

              <div>
                <label htmlFor="categoria">
                  Categoría
                </label>

                <select
                  id="categoria"
                  name="categoria"
                  value={form.categoria}
                  onChange={cambiar}
                >
                  <option value="">Sin categoría</option>

                  {categorias.map((categoria) => (
                    <option
                      key={categoria.id}
                      value={categoria.nombre}
                    >
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label htmlFor="descripcion">
              Descripción
            </label>

            <textarea
              id="descripcion"
              name="descripcion"
              value={form.descripcion}
              onChange={cambiar}
              rows="4"
            />

            <div className="grid-2">
              <div>
                <label htmlFor="precio">Precio</label>

                <input
                  id="precio"
                  type="number"
                  name="precio"
                  value={form.precio}
                  onChange={cambiar}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label htmlFor="cantidad">Existencias</label>

                <input
                  id="cantidad"
                  type="number"
                  name="cantidad"
                  value={form.cantidad}
                  onChange={cambiar}
                  min="0"
                  step="1"
                  required
                />
              </div>

              <div>
                <label htmlFor="minimo">Stock mínimo</label>

                <input
                  id="minimo"
                  type="number"
                  name="minimo"
                  value={form.minimo}
                  onChange={cambiar}
                  min="0"
                  step="1"
                  required
                />
              </div>
            </div>

            <div className="acciones">
              <Link
                className="boton boton-secundario"
                to="/productos"
              >
                Cancelar
              </Link>

              <button
                className="boton boton-principal"
                type="submit"
                disabled={guardando}
              >
                {guardando
                  ? "Guardando..."
                  : editar
                    ? "Guardar cambios"
                    : "Registrar producto"}
              </button>
            </div>
          </form>
        )}
      </div>
    </DisenoPagina>
  );
}
