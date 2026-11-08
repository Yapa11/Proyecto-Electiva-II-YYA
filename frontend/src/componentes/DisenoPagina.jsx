import Encabezado from "./Encabezado";

export default function DisenoPagina({
  titulo,
  subtitulo,
  children
}) {
  return (
    <div className="aplicacion">
      <Encabezado />

      <main className="contenido">
        <div className="titulo-pagina">
          <div>
            <h1>{titulo}</h1>

            {subtitulo && (
              <p>{subtitulo}</p>
            )}
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}