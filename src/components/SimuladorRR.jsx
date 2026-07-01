import { useState, useRef, useMemo, useCallback, useEffect } from 'react';

/**
 * Simulador de brazo RR de 2 grados de libertad.
 * Aplica la cinemática directa del manual:
 *   x = L1·cos(θ1) + L2·cos(θ1+θ2)
 *   y = L1·sin(θ1) + L2·sin(θ1+θ2)
 *
 * El usuario ajusta θ1, θ2, L1 y L2 con sliders o arrastrando las
 * articulaciones. Se dibuja en un canvas SVG con ejes, espacio de
 * trabajo (anillo alcanzable) y la posición del efector en tiempo real.
 */

const VIEW = 520; // tamaño del lienzo SVG

export default function SimuladorRR() {
  const [theta1, setTheta1] = useState(30); // grados
  const [theta2, setTheta2] = useState(45);
  const [L1, setL1] = useState(300); // mm
  const [L2, setL2] = useState(200);
  const [mostrarTrabajo, setMostrarTrabajo] = useState(true);
  const [rastro, setRastro] = useState([]); // [{x, y, t}]

  const svgRef = useRef(null);
  const arrastrandoRef = useRef(null); // 'j1' | 'j2' | null

  // --- cinemática directa -------------------------------------------------
  const cinematica = useMemo(() => {
    const t1 = (theta1 * Math.PI) / 180;
    const t2 = (theta2 * Math.PI) / 180;
    // codo (fin del eslabón 1)
    const codo = { x: L1 * Math.cos(t1), y: L1 * Math.sin(t1) };
    // efector final
    const efector = {
      x: L1 * Math.cos(t1) + L2 * Math.cos(t1 + t2),
      y: L1 * Math.sin(t1) + L2 * Math.sin(t1 + t2),
    };
    return { codo, efector, t1, t2 };
  }, [theta1, theta2, L1, L2]);

  // --- escala mundo -> pantalla -------------------------------------------
  // El alcance máximo es L1+L2. Escalamos para que quepa con margen.
  const escala = useMemo(() => {
    const alcance = L1 + L2;
    const margen = 1.15;
    return (VIEW / 2) / (alcance * margen);
  }, [L1, L2]);

  // origen en el centro-inferior del lienzo
  const origen = { x: VIEW / 2, y: VIEW * 0.62 };

  const aPantalla = useCallback(
    (p) => ({
      x: origen.x + p.x * escala,
      y: origen.y - p.y * escala, // invertir Y (pantalla crece hacia abajo)
    }),
    [escala, origen.x, origen.y]
  );

  const codoPx = aPantalla(cinematica.codo);
  const efectorPx = aPantalla(cinematica.efector);
  const basePx = origen;

  // rastro automático del efector: registra cada posición con su tiempo
  useEffect(() => {
    const t = performance.now();
    setRastro((r) => {
      const ultimo = r[r.length - 1];
      // evitar duplicados si no se movió
      if (ultimo && Math.abs(ultimo.x - efectorPx.x) < 0.5 && Math.abs(ultimo.y - efectorPx.y) < 0.5) {
        return r;
      }
      return [...r, { x: efectorPx.x, y: efectorPx.y, t }].slice(-80);
    });
  }, [efectorPx.x, efectorPx.y]);

  // desvanecer el rastro: re-renderiza para ir bajando la opacidad y purgar puntos viejos
  const [, forzar] = useState(0);
  useEffect(() => {
    if (rastro.length === 0) return;
    const id = setInterval(() => {
      const ahora = performance.now();
      setRastro((r) => r.filter((p) => ahora - p.t < 2000));
      forzar((n) => n + 1);
    }, 80);
    return () => clearInterval(id);
  }, [rastro.length]);

  // --- arrastrar articulaciones -------------------------------------------
  const onPointerDown = (cual) => (e) => {
    e.preventDefault();
    arrastrandoRef.current = cual;
  };

  const onPointerMove = useCallback(
    (e) => {
      if (!arrastrandoRef.current || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * VIEW;
      const py = ((e.clientY - rect.top) / rect.height) * VIEW;
      // a coordenadas mundo
      const wx = (px - origen.x) / escala;
      const wy = -(py - origen.y) / escala;

      if (arrastrandoRef.current === 'j1') {
        // θ1 apunta del origen hacia el cursor
        const ang = (Math.atan2(wy, wx) * 180) / Math.PI;
        setTheta1(Math.round(ang));
      } else if (arrastrandoRef.current === 'j2') {
        // θ2 es el ángulo del segundo eslabón relativo al primero
        const angAbs = Math.atan2(wy - cinematica.codo.y, wx - cinematica.codo.x);
        let rel = (angAbs * 180) / Math.PI - theta1;
        // normalizar a [-180, 180]
        while (rel > 180) rel -= 360;
        while (rel < -180) rel += 360;
        setTheta2(Math.round(rel));
      }
    },
    [escala, origen.x, origen.y, cinematica.codo.x, cinematica.codo.y, theta1]
  );

  const onPointerUp = useCallback(() => {
    arrastrandoRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [onPointerMove, onPointerUp]);

  // --- espacio de trabajo (anillo alcanzable) -----------------------------
  const rMax = (L1 + L2) * escala;
  const rMin = Math.abs(L1 - L2) * escala;

  // --- presets ------------------------------------------------------------
  function preset(t1, t2) {
    setTheta1(t1);
    setTheta2(t2);
  }
  function reiniciar() {
    setTheta1(30);
    setTheta2(45);
    setL1(300);
    setL2(200);
    setRastro([]);
  }

  // valores mostrados
  const ex = cinematica.efector.x;
  const ey = cinematica.efector.y;
  const distancia = Math.sqrt(ex * ex + ey * ey);

  return (
    <div className="sim-rr">
      <div className="sim-rr-canvas">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          className="sim-rr-svg"
          role="img"
          aria-label="Simulador de brazo RR de dos grados de libertad"
        >
          {/* rejilla */}
          <defs>
            <pattern id="simgrid" width="26" height="26" patternUnits="userSpaceOnUse">
              <path d="M26 0H0V26" fill="none" stroke="var(--axis-soft)" strokeWidth="0.4" opacity="0.3" />
            </pattern>
          </defs>
          <rect width={VIEW} height={VIEW} fill="url(#simgrid)" />

          {/* espacio de trabajo */}
          {mostrarTrabajo && (
            <>
              <circle cx={basePx.x} cy={basePx.y} r={rMax} fill="var(--accent-glow)" stroke="var(--accent)" strokeWidth="1" strokeDasharray="4 4" opacity="0.55" />
              {rMin > 1 && (
                <circle cx={basePx.x} cy={basePx.y} r={rMin} fill="var(--bg)" stroke="var(--axis)" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
              )}
            </>
          )}

          {/* ejes */}
          <line x1="20" y1={basePx.y} x2={VIEW - 20} y2={basePx.y} stroke="var(--axis)" strokeWidth="1" opacity="0.45" />
          <line x1={basePx.x} y1="20" x2={basePx.x} y2={VIEW - 20} stroke="var(--axis)" strokeWidth="1" opacity="0.45" />
          <text x={VIEW - 28} y={basePx.y - 8} className="sim-axis-label">x</text>
          <text x={basePx.x + 8} y="30" className="sim-axis-label">y</text>

          {/* rastro del efector que se desvanece */}
          {rastro.length > 1 && rastro.slice(1).map((p, i) => {
            const prev = rastro[i];
            const edad = (performance.now() - p.t) / 2000; // 0 nuevo, 1 viejo
            const op = Math.max(0, 0.6 * (1 - edad));
            return (
              <line key={p.t + '-' + i} x1={prev.x} y1={prev.y} x2={p.x} y2={p.y}
                stroke="var(--axis)" strokeWidth="2.5" strokeLinecap="round" opacity={op} />
            );
          })}

          {/* eslabón 1 */}
          <line x1={basePx.x} y1={basePx.y} x2={codoPx.x} y2={codoPx.y} stroke="var(--accent)" strokeWidth="9" strokeLinecap="round" />
          {/* eslabón 2 */}
          <line x1={codoPx.x} y1={codoPx.y} x2={efectorPx.x} y2={efectorPx.y} stroke="var(--accent-soft)" strokeWidth="8" strokeLinecap="round" />

          {/* etiqueta eslabón 1: longitud + ángulo, en el punto medio */}
          <g transform={`translate(${(basePx.x + codoPx.x) / 2}, ${(basePx.y + codoPx.y) / 2})`}>
            <g transform="translate(8, -6)">
              <rect className="sim-tag-bg" x="-2" y="-12" width="92" height="17" rx="4" />
              <text className="sim-tag-text">L₁={Math.round(L1)} · θ₁={Math.round(theta1)}°</text>
            </g>
          </g>
          {/* etiqueta eslabón 2 */}
          <g transform={`translate(${(codoPx.x + efectorPx.x) / 2}, ${(codoPx.y + efectorPx.y) / 2})`}>
            <g transform="translate(8, -6)">
              <rect className="sim-tag-bg" x="-2" y="-12" width="92" height="17" rx="4" />
              <text className="sim-tag-text">L₂={Math.round(L2)} · θ₂={Math.round(theta2)}°</text>
            </g>
          </g>

          {/* base */}
          <circle cx={basePx.x} cy={basePx.y} r="13" fill="var(--bg-elevated)" stroke="var(--accent)" strokeWidth="3" />

          {/* junta 1 (arrastrable) */}
          <circle
            cx={basePx.x} cy={basePx.y} r="20"
            fill="transparent" style={{ cursor: 'grab' }}
            onPointerDown={onPointerDown('j1')}
          />

          {/* junta 2 / codo (arrastrable) */}
          <circle cx={codoPx.x} cy={codoPx.y} r="10" fill="var(--bg-elevated)" stroke="var(--accent)" strokeWidth="3" />
          <circle
            cx={codoPx.x} cy={codoPx.y} r="20"
            fill="transparent" style={{ cursor: 'grab' }}
            onPointerDown={onPointerDown('j2')}
          />

          {/* efector final (arrastrable: mueve el codo indirectamente vía θ2) */}
          <circle cx={efectorPx.x} cy={efectorPx.y} r="9" fill="var(--axis)" stroke="var(--bg)" strokeWidth="2" />
          <circle
            cx={efectorPx.x} cy={efectorPx.y} r="18"
            fill="transparent" style={{ cursor: 'grab' }}
            onPointerDown={onPointerDown('j2')}
          />

          {/* etiqueta de posición */}
          <g transform={`translate(${efectorPx.x + 14}, ${efectorPx.y - 10})`}>
            <text className="sim-pos-label">
              ({Math.round(ex)}, {Math.round(ey)})
            </text>
          </g>
        </svg>
      </div>

      {/* panel de control */}
      <div className="sim-rr-panel">
        <div className="sim-grupo">
          <div className="sim-slider">
            <label>
              <span>θ₁ (hombro)</span>
              <span className="sim-val">{theta1}°</span>
            </label>
            <input type="range" min="-180" max="180" value={theta1} onChange={(e) => setTheta1(+e.target.value)} />
          </div>
          <div className="sim-slider">
            <label>
              <span>θ₂ (codo)</span>
              <span className="sim-val">{theta2}°</span>
            </label>
            <input type="range" min="-180" max="180" value={theta2} onChange={(e) => setTheta2(+e.target.value)} />
          </div>
          <div className="sim-slider">
            <label>
              <span>L₁ (mm)</span>
              <span className="sim-val">{L1}</span>
            </label>
            <input type="range" min="80" max="400" step="10" value={L1} onChange={(e) => setL1(+e.target.value)} />
          </div>
          <div className="sim-slider">
            <label>
              <span>L₂ (mm)</span>
              <span className="sim-val">{L2}</span>
            </label>
            <input type="range" min="80" max="400" step="10" value={L2} onChange={(e) => setL2(+e.target.value)} />
          </div>
        </div>

        {/* lectura de cinemática directa */}
        <div className="sim-lectura">
          <p className="sim-lectura-titulo">Cinemática directa</p>
          <div className="sim-ec">
            x = {L1}·cos({theta1}°) + {L2}·cos({theta1 + theta2}°) = <b>{Math.round(ex)} mm</b>
          </div>
          <div className="sim-ec">
            y = {L1}·sin({theta1}°) + {L2}·sin({theta1 + theta2}°) = <b>{Math.round(ey)} mm</b>
          </div>
          <div className="sim-ec sim-ec-faint">
            distancia al origen = {Math.round(distancia)} mm · alcance máx = {L1 + L2} mm
          </div>
        </div>

        {/* acciones */}
        <div className="sim-acciones">
          <button className="sim-btn" onClick={() => preset(0, 0)}>Extendido</button>
          <button className="sim-btn" onClick={() => preset(90, 90)}>Plegado</button>
          <button className="sim-btn" onClick={() => preset(45, -90)}>Codo arriba</button>
          <button className="sim-btn" onClick={() => setRastro([])}>
            Limpiar rastro
          </button>
          <button className="sim-btn" onClick={() => setMostrarTrabajo((v) => !v)}>
            {mostrarTrabajo ? 'Ocultar alcance' : 'Ver alcance'}
          </button>
          <button className="sim-btn" onClick={reiniciar}>Reiniciar</button>
        </div>

        <p className="sim-ayuda">
          Mueve los sliders o arrastra las articulaciones directamente sobre el dibujo.
        </p>
      </div>
    </div>
  );
}
