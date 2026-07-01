import { useState } from 'react';

/**
 * Flashcards: tarjetas que muestran un concepto y, al voltearlas,
 * su definición. Navegación con botones y barajado opcional.
 */
export default function Flashcards({ tarjetas = [] }) {
  const [orden, setOrden] = useState(tarjetas.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [volteada, setVolteada] = useState(false);
  const [vistas, setVistas] = useState(() => new Set());

  if (!tarjetas.length) return null;

  const idx = orden[pos];
  const t = tarjetas[idx];

  function voltear() {
    setVolteada((v) => !v);
    setVistas((s) => new Set(s).add(idx));
  }
  function ir(dir) {
    setVolteada(false);
    setPos((p) => {
      const n = p + dir;
      if (n < 0) return tarjetas.length - 1;
      if (n >= tarjetas.length) return 0;
      return n;
    });
  }
  function barajar() {
    const nuevo = [...orden];
    for (let i = nuevo.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nuevo[i], nuevo[j]] = [nuevo[j], nuevo[i]];
    }
    setOrden(nuevo);
    setPos(0);
    setVolteada(false);
  }

  return (
    <div className="fc">
      <div className="fc-cabecera">
        <span className="fc-contador">{pos + 1} / {tarjetas.length}</span>
        <span className="fc-vistas">{vistas.size} repasadas</span>
      </div>

      <button
        className={`fc-tarjeta ${volteada ? 'volteada' : ''}`}
        onClick={voltear}
        aria-label={volteada ? 'Ver concepto' : 'Ver definición'}
      >
        <div className="fc-cara fc-frente">
          <span className="fc-etiqueta">Concepto</span>
          <span className="fc-concepto">{t.concepto}</span>
          <span className="fc-pista">Toca para ver la definición</span>
        </div>
        <div className="fc-cara fc-dorso">
          <span className="fc-etiqueta">Definición</span>
          <span className="fc-definicion">{t.definicion}</span>
        </div>
      </button>

      <div className="fc-acciones">
        <button className="sim-btn" onClick={() => ir(-1)} aria-label="Anterior">← Anterior</button>
        <button className="sim-btn" onClick={barajar}>Barajar</button>
        <button className="sim-btn" onClick={() => ir(1)} aria-label="Siguiente">Siguiente →</button>
      </div>
    </div>
  );
}
