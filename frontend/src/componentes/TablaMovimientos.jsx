export default function TablaMovimientos({
  movimientos
}) {

  return (

    <div className="tabla-contenedor">

      <table>

        <thead>

          <tr>
            <th>Tipo</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Fecha</th>
          </tr>

        </thead>

        <tbody>

          {movimientos.map((movimiento) => (

            <tr key={movimiento.id}>

              <td>

                <span
                  className={
                    `etiqueta ${
                      movimiento.tipo === "Entrada"
                        ? "entrada"
                        : "salida"
                    }`
                  }
                >
                  {movimiento.tipo}
                </span>

              </td>

              <td>
                {movimiento.producto}
              </td>

              <td>
                {movimiento.cantidad}
              </td>

              <td>
                {movimiento.fecha}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );
}