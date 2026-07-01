import { useState, useMemo, useRef, useCallback, useEffect } from 'react';

/**
 * Simulador de matrices de rotación en 2D.
 * Usa la convención del manual:
 *   R(θ) = [ cosθ  -sinθ ]      x' = x·cosθ − y·sinθ
 *          [ sinθ   cosθ ]      y' = x·sinθ + y·cosθ
 *
 * Muestra una figura original y su versión rotada, la matriz R con sus
 * valores numéricos en vivo, y permite arrastrar para girar.
 */

const VIEW = 480;

// figuras de ejemplo (puntos en coordenadas mundo, escala ~1)
const FIGURAS = {
  vector: { nombre: 'Vector', puntos: [[0, 0], [2.4, 0.8]], cerrado: false, esVector: true },
  triangulo: { nombre: 'Triángulo', puntos: [[0, 0], [2.2, 0], [1.1, 1.9]], cerrado: true },
  casa: { nombre: 'Casa', puntos: [[-1.2, -1], [1.2, -1], [1.2, 0.8], [0, 1.8], [-1.2, 0.8]], cerrado: true },
  ele: { nombre: 'Letra L', puntos: [[-0.6, -1.5], [0.4, -1.5], [0.4, 0.8], [1.4, 0.8], [1.4, 1.6], [-0.6, 1.6]], cerrado: true },
};

export default function SimuladorRotacion() {
  const [theta, setTheta] = useState(45); // grados
  const [figuraId, setFiguraId] = useState('triangulo');
  const [verOriginal, setVerOriginal] = useState(true);
  const svgRef = useRef(null);
  const arrastrando = useRef(false);

  const figura = FIGURAS[figuraId];
  const t = (theta * Math.PI) / 180;
  const cos = Math.cos(t);
  const sin = Math.sin(t);

  // escala mundo -> pantalla
  const escala = 70;
  const origen = { x: VIEW / 2, y: VIEW / 2 };
  const aPantalla = useCallback(
    ([x, y]) => ({ x: origen.x + x * escala, y: origen.y - y * escala }),
    [origen.x, origen.y]
  );

  // aplicar R(θ) a cada punto
  const rotar = useCallback(
    ([x, y]) => [x * cos - y * sin, x * sin + y * cos],
    [cos, sin]
  );

  const puntosOrig = figura.puntos.map(aPantalla);
  const puntosRot = figura.puntos.map(rotar).map(aPantalla);

  const pathDe = (pts, cerrado) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + (cerrado ? ' Z' : '');

  // --- arrastrar para girar ----------------------------------------------
  const onDown = (e) => { e.preventDefault(); arrastrando.current = true; };
  const onMove = useCallback((e) => {
    if (!arrastrando.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * VIEW;
    const py = ((e.clientY - rect.top) / rect.height) * VIEW;
    const ang = Math.atan2(-(py - origen.y), px - origen.x);
    let deg = Math.round((ang * 180) / Math.PI);
    if (deg < 0) deg += 360;
    setTheta(deg);
  }, [origen.x, origen.y]);
  const onUp = useCallback(() => { arrastrando.current = false; }, []);

  useEffect(() => {
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [onMove, onUp]);

  const fmt = (n) => (Math.abs(n) < 0.001 ? '0.00' : n.toFixed(2));

  // punto guía para arrastrar (extremo del vector rotado o un punto de referencia)
  const guia = aPantalla(rotar([2.2, 0]));

  return (
    <div className="sim-rot">
      <div className="sim-rot-canvas">
        <svg ref={svgRef} viewBox={`0 0 ${VIEW} ${VIEW}`} className="sim-rot-svg" role="img" aria-label="Simulador de matriz de rotación 2D">
          <defs>
            <pattern id="rotgrid" width="35" height="35" patternUnits="userSpaceOnUse">
              <path d="M35 0H0V35" fill="none" stroke="var(--axis-soft)" strokeWidth="0.4" opacity="0.3" />
            </pattern>
            <marker id="flecha" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto">
              <path d="M0 0L9 4.5L0 9z" fill="var(--accent)" />
            </marker>
            <marker id="flechaO" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto">
              <path d="M0 0L9 4.5L0 9z" fill="var(--ink-faint)" />
            </marker>
          </defs>
          <rect width={VIEW} height={VIEW} fill="url(#rotgrid)" />

          {/* ejes */}
          <line x1="15" y1={origen.y} x2={VIEW - 15} y2={origen.y} stroke="var(--axis)" strokeWidth="1" opacity="0.5" />
          <line x1={origen.x} y1="15" x2={origen.x} y2={VIEW - 15} stroke="var(--axis)" strokeWidth="1" opacity="0.5" />
          <text x={VIEW - 24} y={origen.y - 8} className="sim-axis-label">x</text>
          <text x={origen.x + 8} y="26" className="sim-axis-label">y</text>

          {/* arco del ángulo */}
          <path
            d={`M ${origen.x + 45} ${origen.y} A 45 45 0 ${theta > 180 ? 1 : 0} 0 ${origen.x + 45 * cos} ${origen.y - 45 * sin}`}
            fill="none" stroke="var(--axis)" strokeWidth="1.5" opacity="0.7"
          />
          <text x={origen.x + 52} y={origen.y - 14} className="sim-theta-label">θ={theta}°</text>

          {/* figura original (tenue) */}
          {verOriginal && (
            figura.esVector ? (
              <line x1={puntosOrig[0].x} y1={puntosOrig[0].y} x2={puntosOrig[1].x} y2={puntosOrig[1].y}
                stroke="var(--ink-faint)" strokeWidth="3" markerEnd="url(#flechaO)" opacity="0.6" />
            ) : (
              <path d={pathDe(puntosOrig, figura.cerrado)} fill="var(--ink-faint)" fillOpacity="0.12"
                stroke="var(--ink-faint)" strokeWidth="2" strokeDasharray="5 4" opacity="0.7" />
            )
          )}

          {/* figura rotada (acento) */}
          {figura.esVector ? (
            <line x1={puntosRot[0].x} y1={puntosRot[0].y} x2={puntosRot[1].x} y2={puntosRot[1].y}
              stroke="var(--accent)" strokeWidth="4" markerEnd="url(#flecha)" />
          ) : (
            <path d={pathDe(puntosRot, figura.cerrado)} fill="var(--accent)" fillOpacity="0.18"
              stroke="var(--accent)" strokeWidth="2.5" />
          )}

          {/* manija de arrastre */}
          <circle cx={guia.x} cy={guia.y} r="7" fill="var(--axis)" stroke="var(--bg)" strokeWidth="2" />
          <circle cx={guia.x} cy={guia.y} r="16" fill="transparent" style={{ cursor: 'grab' }} onPointerDown={onDown} />
        </svg>
      </div>

      <div className="sim-rot-panel">
        {/* matriz R en vivo */}
        <div className="sim-matriz">
          <p className="sim-lectura-titulo">Matriz de rotación R(θ)</p>
          <div className="sim-matriz-grid">
            <span className="sim-bracket">[</span>
            <div className="sim-matriz-celdas">
              <span className="sim-celda cos">{fmt(cos)}</span>
              <span className="sim-celda nsin">{fmt(-sin)}</span>
              <span className="sim-celda sin">{fmt(sin)}</span>
              <span className="sim-celda cos">{fmt(cos)}</span>
            </div>
            <span className="sim-bracket">]</span>
          </div>
          <div className="sim-matriz-leyenda">
            <span><i className="dot cosdot" /> cos θ = {fmt(cos)}</span>
            <span><i className="dot sindot" /> sin θ = {fmt(sin)}</span>
          </div>
        </div>

        {/* slider */}
        <div className="sim-slider">
          <label><span>Ángulo θ</span><span className="sim-val">{theta}°</span></label>
          <input type="range" min="0" max="360" value={theta} onChange={(e) => setTheta(+e.target.value)} />
        </div>

        {/* ecuaciones de transformación de un punto */}
        <div className="sim-lectura">
          <p className="sim-lectura-titulo">Transformación de un punto</p>
          <div className="sim-ec">x′ = x·cos θ − y·sin θ</div>
          <div className="sim-ec">y′ = x·sin θ + y·cos θ</div>
        </div>

        {/* figuras */}
        <div className="sim-figuras">
          {Object.entries(FIGURAS).map(([id, f]) => (
            <button key={id} className={id === figuraId ? 'sim-btn activo' : 'sim-btn'} onClick={() => setFiguraId(id)}>
              {f.nombre}
            </button>
          ))}
        </div>

        <div className="sim-acciones">
          <button className="sim-btn" onClick={() => setTheta(90)}>90°</button>
          <button className="sim-btn" onClick={() => setTheta(180)}>180°</button>
          <button className="sim-btn" onClick={() => setTheta(270)}>270°</button>
          <button className={verOriginal ? 'sim-btn activo' : 'sim-btn'} onClick={() => setVerOriginal((v) => !v)}>
            Ver original
          </button>
          <button className="sim-btn" onClick={() => setTheta(0)}>Reiniciar</button>
        </div>

        <p className="sim-ayuda">Mueve el slider o arrastra el punto cian para girar la figura.</p>
      </div>
    </div>
  );
}
