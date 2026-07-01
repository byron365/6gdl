import { useState } from 'react';

/**
 * Quiz de opción múltiple. Muestra una pregunta a la vez, valida la
 * respuesta con retroalimentación inmediata (correcto/incorrecto +
 * explicación), y al terminar muestra la puntuación con opción de repetir.
 */
export default function Quiz({ preguntas = [] }) {
  const [idx, setIdx] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [validada, setValidada] = useState(false);
  const [aciertos, setAciertos] = useState(0);
  const [terminado, setTerminado] = useState(false);

  if (!preguntas.length) return null;

  const p = preguntas[idx];
  const esUltima = idx === preguntas.length - 1;

  function elegir(i) {
    if (validada) return;
    setElegida(i);
  }

  function validar() {
    if (elegida === null) return;
    setValidada(true);
    if (elegida === p.correcta) setAciertos((a) => a + 1);
  }

  function siguiente() {
    if (esUltima) {
      setTerminado(true);
      return;
    }
    setIdx((i) => i + 1);
    setElegida(null);
    setValidada(false);
  }

  function reiniciar() {
    setIdx(0);
    setElegida(null);
    setValidada(false);
    setAciertos(0);
    setTerminado(false);
  }

  if (terminado) {
    const pct = Math.round((aciertos / preguntas.length) * 100);
    const mensaje =
      pct === 100 ? '¡Perfecto! Dominas este capítulo.' :
      pct >= 60 ? 'Buen trabajo. Repasa lo que falló y vuelve a intentarlo.' :
      'Vale la pena releer el capítulo y volver a intentarlo.';
    return (
      <div className="quiz quiz-fin">
        <div className="quiz-resultado-num">{aciertos}<span>/{preguntas.length}</span></div>
        <div className="quiz-resultado-pct">{pct}% de aciertos</div>
        <p className="quiz-resultado-msg">{mensaje}</p>
        <button className="btn btn-primary" onClick={reiniciar}>Intentar de nuevo</button>
      </div>
    );
  }

  return (
    <div className="quiz">
      <div className="quiz-cabecera">
        <span className="quiz-contador">Pregunta {idx + 1} de {preguntas.length}</span>
        <div className="quiz-progreso-mini">
          <div className="quiz-progreso-mini-fill" style={{ width: `${((idx) / preguntas.length) * 100}%` }} />
        </div>
      </div>

      <p className="quiz-pregunta">{p.pregunta}</p>

      <div className="quiz-opciones">
        {p.opciones.map((op, i) => {
          let clase = 'quiz-opcion';
          if (validada) {
            if (i === p.correcta) clase += ' correcta';
            else if (i === elegida) clase += ' incorrecta';
          } else if (i === elegida) {
            clase += ' elegida';
          }
          return (
            <button key={i} className={clase} onClick={() => elegir(i)} disabled={validada}>
              <span className="quiz-letra">{String.fromCharCode(65 + i)}</span>
              <span>{op}</span>
              {validada && i === p.correcta && <span className="quiz-marca">✓</span>}
              {validada && i === elegida && i !== p.correcta && <span className="quiz-marca">✕</span>}
            </button>
          );
        })}
      </div>

      {validada && (
        <div className={`quiz-feedback ${elegida === p.correcta ? 'ok' : 'mal'}`}>
          <strong>{elegida === p.correcta ? 'Correcto' : 'Incorrecto'}.</strong> {p.explicacion}
        </div>
      )}

      <div className="quiz-acciones">
        {!validada ? (
          <button className="btn btn-primary" onClick={validar} disabled={elegida === null}>Comprobar</button>
        ) : (
          <button className="btn btn-primary" onClick={siguiente}>{esUltima ? 'Ver resultado' : 'Siguiente'}</button>
        )}
      </div>
    </div>
  );
}
