export default function TarjetaEstadistica({
  titulo,
  valor,
  detalle
}) {

  return (

    <article className="tarjeta-estadistica">

      <span>
        {titulo}
      </span>

      <strong>
        {valor}
      </strong>

      <small>
        {detalle}
      </small>

    </article>

  );
}