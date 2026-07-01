import { useState } from 'react';
import Quiz from './Quiz.jsx';
import Flashcards from './Flashcards.jsx';

/**
 * Bloque de práctica del capítulo con pestañas:
 *  - Quiz: opción múltiple con calificación.
 *  - Tarjetas: flashcards concepto/definición.
 *  - Reflexión: preguntas abiertas del manual con respuesta modelo desplegable.
 */
export default function BloquePractica({ banco }) {
  const tieneQuiz = banco?.quiz?.length;
  const tieneFC = banco?.flashcards?.length;
  const tieneRef = banco?.reflexion?.length;

  // primera pestaña disponible
  const inicial = tieneQuiz ? 'quiz' : tieneFC ? 'fc' : 'ref';
  const [tab, setTab] = useState(inicial);

  if (!tieneQuiz && !tieneFC && !tieneRef) return null;

  return (
    <div className="practica">
      <div className="practica-tabs" role="tablist">
        {tieneQuiz && (
          <button role="tab" aria-selected={tab === 'quiz'} className={tab === 'quiz' ? 'practica-tab activo' : 'practica-tab'} onClick={() => setTab('quiz')}>
            Quiz
          </button>
        )}
        {tieneFC && (
          <button role="tab" aria-selected={tab === 'fc'} className={tab === 'fc' ? 'practica-tab activo' : 'practica-tab'} onClick={() => setTab('fc')}>
            Tarjetas
          </button>
        )}
        {tieneRef && (
          <button role="tab" aria-selected={tab === 'ref'} className={tab === 'ref' ? 'practica-tab activo' : 'practica-tab'} onClick={() => setTab('ref')}>
            Reflexión
          </button>
        )}
      </div>

      <div className="practica-cuerpo">
        {tab === 'quiz' && tieneQuiz && <Quiz preguntas={banco.quiz} />}
        {tab === 'fc' && tieneFC && <Flashcards tarjetas={banco.flashcards} />}
        {tab === 'ref' && tieneRef && (
          <div className="reflexion">
            <p className="reflexion-intro">Preguntas abiertas para pensar. Intenta responderlas tú primero y luego compara con la respuesta modelo.</p>
            {banco.reflexion.map((r, i) => (
              <details key={i} className="reflexion-item">
                <summary>{r.pregunta}</summary>
                <p>{r.respuestaModelo}</p>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
