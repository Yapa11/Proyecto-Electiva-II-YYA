import { useEffect, useState } from "react";
import RutasAplicacion from "./rutas/RutasAplicacion";
import { iniciarSesionApi } from "./servicios/autenticacionApi";

const negociosIniciales = [
  {
    codigo: "NEG001",
    nombre: "TecnoQuibdó",
    propietario: {
      nombre: "Dueño TecnoQuibdó",
      correo: "dueno@tecnoquibdo.com",
      password: "123456"
    },
    empleados: [
      {
        id: 1,
        nombre: "Ana",
        apellido: "Empleado",
        correo: "ana@tecnoquibdo.com",
        password: "123456",
        esAdministrador: false
      }
    ],
    productos: [
      {
        id: 1,
        nombre: "Laptop Lenovo",
        categoria: "Computadores",
        cantidad: 10,
        minimo: 3,
        precio: 2500000
      },
      {
        id: 2,
        nombre: "Mouse inalámbrico",
        categoria: "Accesorios",
        cantidad: 25,
        minimo: 5,
        precio: 65000
      },
      {
        id: 3,
        nombre: "Teclado USB",
        categoria: "Accesorios",
        cantidad: 18,
        minimo: 5,
        precio: 85000
      },
      {
        id: 4,
        nombre: "Monitor 24 pulgadas",
        categoria: "Monitores",
        cantidad: 8,
        minimo: 2,
        precio: 720000
      }
    ],
    movimientos: [
      {
        id: 1,
        tipo: "Entrada",
        producto: "Laptop Lenovo",
        cantidad: 5,
        fecha: "2026-09-20",
        usuario: "Dueño TecnoQuibdó"
      },
      {
        id: 2,
        tipo: "Salida",
        producto: "Mouse inalámbrico",
        cantidad: 2,
        fecha: "2026-09-21",
        usuario: "Dueño TecnoQuibdó"
      }
    ]
  },
  {
    codigo: "NEG002",
    nombre: "Comercial Chocó",
    propietario: {
      nombre: "Dueño Comercial Chocó",
      correo: "dueno@comercialchoco.com",
      password: "123456"
    },
    empleados: [
      {
        id: 1,
        nombre: "Carlos",
        apellido: "Empleado",
        correo: "carlos@comercialchoco.com",
        password: "123456",
        esAdministrador: false
      }
    ],
    productos: [
      {
        id: 1,
        nombre: "Impresora Epson",
        categoria: "Impresoras",
        cantidad: 7,
        minimo: 2,
        precio: 850000
      },
      {
        id: 2,
        nombre: "Resma de papel",
        categoria: "Papelería",
        cantidad: 40,
        minimo: 10,
        precio: 18000
      },
      {
        id: 3,
        nombre: "Tinta negra",
        categoria: "Consumibles",
        cantidad: 12,
        minimo: 3,
        precio: 55000
      }
    ],
    movimientos: [
      {
        id: 1,
        tipo: "Entrada",
        producto: "Resma de papel",
        cantidad: 20,
        fecha: "2026-09-20",
        usuario: "Dueño Comercial Chocó"
      }
    ]
  }
];

const claveNegocios = "sgi_negocios";

function obtenerNegociosGuardados() {
  try {
    const datos = localStorage.getItem(claveNegocios);

    if (datos) {
      const negocios = JSON.parse(datos);

      if (Array.isArray(negocios) && negocios.length > 0) {
        return negocios;
      }
    }
  } catch (error) {
    console.error("Error al cargar los negocios:", error);
  }

  return negociosIniciales;
}

export default function App() {
  const [negocios, setNegocios] = useState(obtenerNegociosGuardados);
  const [sesion, setSesion] = useState(null);
  const [negocioActual, setNegocioActual] = useState(null);

  /*
   * Guarda permanentemente los negocios en el navegador.
   */
  useEffect(() => {
    localStorage.setItem(claveNegocios, JSON.stringify(negocios));
  }, [negocios]);

  /*
   * Recupera la sesión guardada.
   */
  useEffect(() => {
    try {
      const sesionGuardada = sessionStorage.getItem("sesion");

      if (sesionGuardada) {
        const datos = JSON.parse(sesionGuardada);

        setSesion(datos);

        if (datos.codigoNegocio) {
          const negocio = negocios.find(
            (item) => item.codigo === datos.codigoNegocio
          );

          setNegocioActual(negocio || null);
        }
      }
    } catch (error) {
      console.error("Error al recuperar la sesión:", error);
      sessionStorage.removeItem("sesion");
    }
  }, []);

  /*
   * Iniciar sesión mediante FastAPI.
   *
   * Tipos de usuario:
   * 1. Administrador global.
   * 2. Dueño.
   * 3. Empleado.
   */
  async function iniciarSesion(datos) {
    try {
      const usuario = await iniciarSesionApi(datos);

      let nuevaSesion;
      let ruta;

      // ADMINISTRADOR GLOBAL
      if (usuario.rol === "admin_global") {
        if (datos.tipoAcceso !== "administrador") {
          return {
            correcto: false,
            mensaje:
              "Selecciona el tipo de acceso de administrador global."
          };
        }

        nuevaSesion = {
          idUsuario: usuario.id_usuario,
          tipo: "administrador",
          nombre: `${usuario.nombre} ${usuario.apellido || ""}`.trim(),
          correo: usuario.correo,
          puedeConsultarNegocios: true,
          puedeModificarNegocios: false
        };

        setNegocioActual(null);
        ruta = "/administrador";
      }

      // DUEÑO DEL NEGOCIO
      else if (usuario.rol === "dueno") {
        if (datos.tipoAcceso !== "dueno") {
          return {
            correcto: false,
            mensaje: "Selecciona el tipo de acceso de dueño."
          };
        }

        const codigoNegocio = String(
          usuario.codigo_negocio || ""
        ).toUpperCase();

        const negocio = negocios.find(
          (item) =>
            String(item.codigo).toUpperCase() === codigoNegocio
        );

        if (!negocio) {
          return {
            correcto: false,
            mensaje:
              "El negocio no se encuentra registrado en los datos actuales del sistema."
          };
        }

        nuevaSesion = {
          idUsuario: usuario.id_usuario,
          tipo: "dueno",
          codigoNegocio: usuario.codigo_negocio,
          nombre: `${usuario.nombre} ${usuario.apellido || ""}`.trim(),
          correo: usuario.correo,
          esDueno: true,
          puedeAdministrar: true,
          puedeConsultarNegocios: true,
          puedeModificarNegocios: true
        };

        setNegocioActual(negocio);
        ruta = "/inicio";
      }

      // EMPLEADO
      else if (usuario.rol === "empleado") {
        if (datos.tipoAcceso !== "empleado") {
          return {
            correcto: false,
            mensaje: "Selecciona el tipo de acceso de empleado."
          };
        }

        const codigoNegocio = String(
          usuario.codigo_negocio || ""
        ).toUpperCase();

        const negocio = negocios.find(
          (item) =>
            String(item.codigo).toUpperCase() === codigoNegocio
        );

        if (!negocio) {
          return {
            correcto: false,
            mensaje:
              "El negocio no se encuentra registrado en los datos actuales del sistema."
          };
        }

        const esAdministrador =
          usuario.es_administrador === true ||
          usuario.es_administrador === 1;

        nuevaSesion = {
          idUsuario: usuario.id_usuario,
          tipo: "empleado",
          codigoNegocio: usuario.codigo_negocio,
          nombre: `${usuario.nombre} ${usuario.apellido || ""}`.trim(),
          correo: usuario.correo,
          esDueno: false,
          puedeAdministrar: esAdministrador,
          esAdministrador,
          puedeConsultarNegocios: true,
          puedeModificarNegocios: esAdministrador
        };

        setNegocioActual(negocio);
        ruta = "/inicio";
      } else {
        return {
          correcto: false,
          mensaje: "El tipo de usuario no está autorizado."
        };
      }

      setSesion(nuevaSesion);

      sessionStorage.setItem(
        "sesion",
        JSON.stringify(nuevaSesion)
      );

      return {
        correcto: true,
        ruta
      };
    } catch (error) {
      console.error("Error al iniciar sesión:", error);

      return {
        correcto: false,
        mensaje:
          error.message ||
          "No fue posible conectar con el servidor."
      };
    }
  }

  /*
   * Cerrar sesión.
   * No elimina los datos guardados del inventario.
   */
  function cerrarSesion() {
    setSesion(null);
    setNegocioActual(null);

    sessionStorage.removeItem("sesion");
  }

  /*
   * Actualiza un negocio y lo guarda en localStorage.
   */
  function actualizarNegocio(codigo, cambios) {
    setNegocios((anteriores) =>
      anteriores.map((negocio) =>
        negocio.codigo === codigo
          ? {
              ...negocio,
              ...cambios
            }
          : negocio
      )
    );
  }

  /*
   * Guardar producto.
   */
  function guardarProducto(producto) {
    if (!sesion?.puedeAdministrar || !negocioActual) {
      return false;
    }

    const productosActualizados = [
      ...(negocioActual.productos || [])
    ];

    const indice = productosActualizados.findIndex(
      (item) => Number(item.id) === Number(producto.id)
    );

    if (indice >= 0) {
      productosActualizados[indice] = {
        ...productosActualizados[indice],
        ...producto
      };
    } else {
      productosActualizados.push({
        ...producto,
        id: Date.now()
      });
    }

    actualizarNegocio(negocioActual.codigo, {
      productos: productosActualizados
    });

    setNegocioActual({
      ...negocioActual,
      productos: productosActualizados
    });

    return true;
  }

  /*
   * Eliminar producto.
   */
  function eliminarProducto(id) {
    if (!sesion?.puedeAdministrar || !negocioActual) {
      return false;
    }

    const productosActualizados = (
      negocioActual.productos || []
    ).filter(
      (producto) => Number(producto.id) !== Number(id)
    );

    actualizarNegocio(negocioActual.codigo, {
      productos: productosActualizados
    });

    setNegocioActual({
      ...negocioActual,
      productos: productosActualizados
    });

    return true;
  }

  /*
   * Registrar entrada o salida.
   */
  function registrarMovimiento(movimiento) {
    if (!sesion?.puedeAdministrar || !negocioActual) {
      return false;
    }

    const productosActualizados = [
      ...(negocioActual.productos || [])
    ];

    const producto = productosActualizados.find(
      (item) =>
        String(item.nombre).toLowerCase() ===
        String(movimiento.producto).toLowerCase()
    );

    if (!producto) {
      return false;
    }

    const cantidad = Number(movimiento.cantidad);

    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      return false;
    }

    if (
      movimiento.tipo === "Salida" &&
      producto.cantidad < cantidad
    ) {
      return false;
    }

    if (movimiento.tipo === "Entrada") {
      producto.cantidad += cantidad;
    }

    if (movimiento.tipo === "Salida") {
      producto.cantidad -= cantidad;
    }

    const nuevoMovimiento = {
      ...movimiento,
      id: Date.now(),
      cantidad,
      fecha:
        movimiento.fecha ||
        new Date().toISOString().slice(0, 10),
      usuario: sesion.nombre
    };

    const movimientosActualizados = [
      nuevoMovimiento,
      ...(negocioActual.movimientos || [])
    ];

    actualizarNegocio(negocioActual.codigo, {
      productos: productosActualizados,
      movimientos: movimientosActualizados
    });

    setNegocioActual({
      ...negocioActual,
      productos: productosActualizados,
      movimientos: movimientosActualizados
    });

    return true;
  }

  /*
   * Registrar empleado.
   * Solo puede hacerlo el dueño.
   */
  function registrarEmpleado(empleado) {
    if (!sesion?.esDueno || !negocioActual) {
      return false;
    }

    const nuevoEmpleado = {
      ...empleado,
      id: Date.now(),
      esAdministrador: false
    };

    const empleadosActualizados = [
      ...(negocioActual.empleados || []),
      nuevoEmpleado
    ];

    actualizarNegocio(negocioActual.codigo, {
      empleados: empleadosActualizados
    });

    setNegocioActual({
      ...negocioActual,
      empleados: empleadosActualizados
    });

    return true;
  }

  /*
   * Designar administrador.
   * Solo puede existir un administrador de negocio.
   */
  function designarAdministrador(idEmpleado) {
    if (!sesion?.esDueno || !negocioActual) {
      return false;
    }

    const empleadosActualizados = (
      negocioActual.empleados || []
    ).map((empleado) => ({
      ...empleado,
      esAdministrador:
        Number(empleado.id) === Number(idEmpleado)
    }));

    actualizarNegocio(negocioActual.codigo, {
      empleados: empleadosActualizados
    });

    setNegocioActual({
      ...negocioActual,
      empleados: empleadosActualizados
    });

    return true;
  }

  /*
   * Quitar permisos de administrador.
   */
  function revocarAdministrador(idEmpleado) {
    if (!sesion?.esDueno || !negocioActual) {
      return false;
    }

    const empleadosActualizados = (
      negocioActual.empleados || []
    ).map((empleado) =>
      Number(empleado.id) === Number(idEmpleado)
        ? {
            ...empleado,
            esAdministrador: false
          }
        : empleado
    );

    actualizarNegocio(negocioActual.codigo, {
      empleados: empleadosActualizados
    });

    setNegocioActual({
      ...negocioActual,
      empleados: empleadosActualizados
    });

    return true;
  }

  /*
   * Eliminar empleado.
   */
  function eliminarEmpleado(idEmpleado) {
    if (!sesion?.esDueno || !negocioActual) {
      return false;
    }

    const empleadosActualizados = (
      negocioActual.empleados || []
    ).filter(
      (empleado) =>
        Number(empleado.id) !== Number(idEmpleado)
    );

    actualizarNegocio(negocioActual.codigo, {
      empleados: empleadosActualizados
    });

    setNegocioActual({
      ...negocioActual,
      empleados: empleadosActualizados
    });

    return true;
  }

  /*
   * Usuarios del negocio.
   */
  const usuarios = negocioActual
    ? [
        {
          id: "dueno",
          nombre: negocioActual.propietario.nombre,
          correo: negocioActual.propietario.correo,
          rol: "Dueño"
        },
        ...(negocioActual.empleados || []).map(
          (empleado) => ({
            id: empleado.id,
            nombre: `${empleado.nombre} ${empleado.apellido}`,
            correo: empleado.correo,
            rol: empleado.esAdministrador
              ? "Administrador"
              : "Empleado"
          })
        )
      ]
    : [];

  const empleados = negocioActual?.empleados || [];

  return (
    <RutasAplicacion
      sesion={sesion}
      negocioActual={negocioActual}
      negocios={negocios}
      usuarios={usuarios}
      empleados={empleados}
      iniciarSesion={iniciarSesion}
      cerrarSesion={cerrarSesion}
      guardarProducto={guardarProducto}
      eliminarProducto={eliminarProducto}
      registrarMovimiento={registrarMovimiento}
      registrarEmpleado={registrarEmpleado}
      designarAdministrador={designarAdministrador}
      revocarAdministrador={revocarAdministrador}
      eliminarEmpleado={eliminarEmpleado}
    />
  );
}