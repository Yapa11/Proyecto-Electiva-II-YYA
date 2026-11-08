
import {
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import InicioSesion from "../vistas/InicioSesion";
import Inicio from "../vistas/Inicio";
import Productos from "../vistas/Productos";
import FormularioProducto from "../vistas/FormularioProducto";
import Movimiento from "../vistas/Movimiento";
import Usuarios from "../vistas/Usuarios";
import PanelAdministrador from "../vistas/PanelAdministrador";

export default function RutasAplicacion(props) {
  const {
    sesion,
    negocioActual,
    negocios,
    usuarios,
    empleados,
    iniciarSesion,
    cerrarSesion,
    registrarMovimiento,
    registrarEmpleado,
    designarAdministrador,
    revocarAdministrador,
    eliminarEmpleado
  } = props;

  if (!sesion) {
    return (
      <Routes>
        <Route
          path="/"
          element={
            <InicioSesion iniciarSesion={iniciarSesion} />
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    );
  }

  if (sesion.tipo === "administrador") {
    return (
      <Routes>
        <Route
          path="/administrador"
          element={
            <PanelAdministrador
              negocios={negocios}
              cerrarSesion={cerrarSesion}
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate to="/administrador" replace />
          }
        />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route
        path="/inicio"
        element={
          <Inicio
            sesion={sesion}
          />
        }
      />

      <Route
        path="/productos"
        element={
          <Productos
            codigoNegocio={sesion.codigoNegocio}
            puedeAdministrar={sesion.puedeAdministrar}
            sesion={sesion}
          />
        }
      />

      <Route
        path="/productos/nuevo"
        element={
          <FormularioProducto
            codigoNegocio={sesion.codigoNegocio}
            puedeAdministrar={sesion.puedeAdministrar}
            sesion={sesion}
            cerrarSesion={cerrarSesion}
          />
        }
      />

      <Route
        path="/productos/editar/:id"
        element={
          <FormularioProducto
            codigoNegocio={sesion.codigoNegocio}
            puedeAdministrar={sesion.puedeAdministrar}
            sesion={sesion}
            cerrarSesion={cerrarSesion}
          />
        }
      />

      <Route
        path="/movimientos"
        element={
          <Movimiento
            productos={negocioActual?.productos || []}
            movimientos={negocioActual?.movimientos || []}
            registrarMovimiento={registrarMovimiento}
            puedeAdministrar={sesion.puedeAdministrar}
            sesion={sesion}
          />
        }
      />

      <Route
        path="/usuarios"
        element={
          <Usuarios
            usuarios={usuarios}
            empleados={empleados}
            esDueno={sesion.esDueno}
            registrarEmpleado={registrarEmpleado}
            designarAdministrador={designarAdministrador}
            revocarAdministrador={revocarAdministrador}
            eliminarEmpleado={eliminarEmpleado}
            sesion={sesion}
          />
        }
      />

      <Route
        path="*"
        element={<Navigate to="/inicio" replace />}
      />
    </Routes>
  );
}
