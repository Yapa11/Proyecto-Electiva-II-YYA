export default function ModalConfirmacion({
  mensaje,
  onConfirmar,
  onCancelar
}) {

  return (

    <div className="modal-fondo">

      <div className="modal">

        <h2>
          Confirmar acción
        </h2>

        <p>
          {mensaje}
        </p>

        <div className="acciones">

          <button
            className="boton boton-secundario"
            onClick={onCancelar}
          >
            Cancelar
          </button>

          <button
            className="boton boton-peligro"
            onClick={onConfirmar}
          >
            Eliminar
          </button>

        </div>

      </div>

    </div>

  );
}