import { useState, useMemo, useCallback } from 'react';

/**
 * Constructor de tablas Denavit-Hartenberg (convención clásica de Craig).
 *
 * Para cada fila i, la transformación homogénea es:
 *   T_i = [ cosθ  -sinθcosα   sinθsinα   a·cosθ ]
 *         [ sinθ   cosθcosα  -cosθsinα   a·sinθ ]
 *         [  0       sinα        cosα       d    ]
 *         [  0        0           0         1    ]
 *
 * La cinemática directa total es el producto T1·T2·…·Tn.
 * El usuario edita θ, d, a, α por fila y ve la matriz final, la posición
 * del efector y una proyección del brazo en el plano XY.
 */

const VIEW = 460;

// matriz 4x4 identidad
const I4 = () => [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
];

// multiplicación de matrices 4x4
function mul(A, B) {
  const C = I4();
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += A[i][k] * B[k][j];
      C[i][j] = s;
    }
  return C;
}

// matriz DH de una fila (θ, α en grados; d, a en mm)
function dhMatriz(thetaDeg, d, a, alphaDeg) {
  const th = (thetaDeg * Math.PI) / 180;
  const al = (alphaDeg * Math.PI) / 180;
  const ct = Math.cos(th), st = Math.sin(th);
  const ca = Math.cos(al), sa = Math.sin(al);
  return [
    [ct, -st * ca, st * sa, a * ct],
    [st, ct * ca, -ct * sa, a * st],
    [0, sa, ca, d],
    [0, 0, 0, 1],
  ];
}

const FILA_NUEVA = () => ({ theta: 0, d: 0, a: 150, alpha: 0 });

// presets útiles
const PRESETS = {
  rr: {
    nombre: 'Brazo RR (plano)',
    filas: [
      { theta: 30, d: 0, a: 300, alpha: 0 },
      { theta: 45, d: 0, a: 200, alpha: 0 },
    ],
  },
  scara: {
    nombre: 'SCARA (RRP)',
    filas: [
      { theta: 30, d: 0, a: 250, alpha: 0 },
      { theta: 45, d: 0, a: 200, alpha: 180 },
      { theta: 0, d: 80, a: 0, alpha: 0 },
    ],
  },
  antropo: {
    nombre: 'Antropomórfico',
    filas: [
      { theta: 20, d: 100, a: 0, alpha: 90 },
      { theta: 40, d: 0, a: 250, alpha: 0 },
      { theta: 30, d: 0, a: 200, alpha: 0 },
    ],
  },
};

export default function ConstructorDH() {
  const [filas, setFilas] = useState(PRESETS.rr.filas.map((f) => ({ ...f })));

  // --- cálculo de transformaciones ----------------------------------------
  const { matrices, acumuladas, total } = useMemo(() => {
    const matrices = filas.map((f) => dhMatriz(f.theta, f.d, f.a, f.alpha));
    const acumuladas = [];
    let acc = I4();
    for (const m of matrices) {
      acc = mul(acc, m);
      acumuladas.push(acc);
    }
    const total = acumuladas.length ? acumuladas[acumuladas.length - 1] : I4();
    return { matrices, acumuladas, total };
  }, [filas]);

  // posiciones de cada marco (origen acumulado) proyectadas a XY
  const puntos = useMemo(() => {
    const pts = [{ x: 0, y: 0, z: 0 }];
    for (const T of acumuladas) {
      pts.push({ x: T[0][3], y: T[1][3], z: T[2][3] });
    }
    return pts;
  }, [acumuladas]);

  // escala para el dibujo
  const escala = useMemo(() => {
    const maxR = Math.max(
      120,
      ...puntos.map((p) => Math.hypot(p.x, p.y))
    );
    return (VIEW / 2) / (maxR * 1.2);
  }, [puntos]);

  const origen = { x: VIEW / 2, y: VIEW / 2 };
  const aPantalla = useCallback(
    (p) => ({ x: origen.x + p.x * escala, y: origen.y - p.y * escala }),
    [escala, origen.x, origen.y]
  );

  // --- edición de filas ---------------------------------------------------
  const editar = (idx, campo, valor) => {
    setFilas((fs) => fs.map((f, i) => (i === idx ? { ...f, [campo]: clampNum(valor) } : f)));
  };
  const agregar = () => setFilas((fs) => [...fs, FILA_NUEVA()]);
  const quitar = (idx) => setFilas((fs) => (fs.length > 1 ? fs.filter((_, i) => i !== idx) : fs));
  const cargarPreset = (key) => setFilas(PRESETS[key].filas.map((f) => ({ ...f })));

  function clampNum(v) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }

  const fmt = (n) => (Math.abs(n) < 0.001 ? '0.000' : n.toFixed(3));
  const efector = { x: total[0][3], y: total[1][3], z: total[2][3] };

  const ptsPantalla = puntos.map(aPantalla);

  return (
    <div className="dh">
      {/* presets */}
      <div className="dh-presets">
        <span className="dh-presets-label">Cargar ejemplo:</span>
        {Object.entries(PRESETS).map(([k, p]) => (
          <button key={k} className="sim-btn" onClick={() => cargarPreset(k)}>{p.nombre}</button>
        ))}
      </div>

      <div className="dh-grid">
        {/* tabla editable */}
        <div className="dh-tabla-wrap">
          <table className="dh-tabla">
            <thead>
              <tr>
                <th>i</th>
                <th>θ<sub>i</sub> (°)</th>
                <th>d<sub>i</sub> (mm)</th>
                <th>a<sub>i</sub> (mm)</th>
                <th>α<sub>i</sub> (°)</th>
                <th aria-label="acciones"></th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f, i) => (
                <tr key={i}>
                  <td className="dh-idx">{i + 1}</td>
                  <td><input type="number" value={f.theta} onChange={(e) => editar(i, 'theta', e.target.value)} /></td>
                  <td><input type="number" value={f.d} onChange={(e) => editar(i, 'd', e.target.value)} /></td>
                  <td><input type="number" value={f.a} onChange={(e) => editar(i, 'a', e.target.value)} /></td>
                  <td><input type="number" value={f.alpha} onChange={(e) => editar(i, 'alpha', e.target.value)} /></td>
                  <td>
                    <button className="dh-quitar" onClick={() => quitar(i)} aria-label={`Quitar fila ${i + 1}`} disabled={filas.length <= 1}>×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="sim-btn dh-agregar" onClick={agregar}>+ Añadir articulación</button>
        </div>

        {/* dibujo del brazo */}
        <div className="dh-canvas">
          <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="dh-svg" role="img" aria-label="Proyección del brazo según la tabla DH">
            <defs>
              <pattern id="dhgrid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M30 0H0V30" fill="none" stroke="var(--axis-soft)" strokeWidth="0.4" opacity="0.3" />
              </pattern>
            </defs>
            <rect width={VIEW} height={VIEW} fill="url(#dhgrid)" />
            {/* ejes */}
            <line x1="12" y1={origen.y} x2={VIEW - 12} y2={origen.y} stroke="var(--axis)" strokeWidth="1" opacity="0.4" />
            <line x1={origen.x} y1="12" x2={origen.x} y2={VIEW - 12} stroke="var(--axis)" strokeWidth="1" opacity="0.4" />

            {/* eslabones */}
            {ptsPantalla.slice(0, -1).map((p, i) => {
              const q = ptsPantalla[i + 1];
              const col = i % 2 === 0 ? 'var(--accent)' : 'var(--accent-soft)';
              return <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={col} strokeWidth="7" strokeLinecap="round" />;
            })}
            {/* etiquetas de parámetros DH sobre cada eslabón */}
            {ptsPantalla.slice(0, -1).map((p, i) => {
              const q = ptsPantalla[i + 1];
              const f = filas[i];
              if (!f) return null;
              const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
              return (
                <g key={'tag' + i} transform={`translate(${mx + 8}, ${my - 6})`}>
                  <rect className="sim-tag-bg" x="-2" y="-12" width="86" height="17" rx="4" />
                  <text className="sim-tag-text">θ{i + 1}={Math.round(f.theta)}° · a={Math.round(f.a)}</text>
                </g>
              );
            })}
            {/* articulaciones */}
            {ptsPantalla.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={i === 0 ? 9 : 7}
                fill="var(--bg-elevated)" stroke={i === ptsPantalla.length - 1 ? 'var(--axis)' : 'var(--accent)'} strokeWidth="2.5" />
            ))}
            {/* efector */}
            <circle cx={ptsPantalla[ptsPantalla.length - 1].x} cy={ptsPantalla[ptsPantalla.length - 1].y} r="4" fill="var(--axis)" />
            <text x={ptsPantalla[ptsPantalla.length - 1].x + 12} y={ptsPantalla[ptsPantalla.length - 1].y - 8} className="sim-pos-label">
              ({Math.round(efector.x)}, {Math.round(efector.y)})
            </text>
          </svg>
          <p className="dh-nota">Proyección en el plano XY · z = {Math.round(efector.z)} mm</p>
        </div>
      </div>

      {/* matriz total */}
      <div className="dh-resultado">
        <p className="sim-lectura-titulo">Transformación total ⁰T{filas.length} = T₁·T₂{filas.length > 2 ? '···' : ''}{filas.length > 1 ? `T${filas.length}` : ''}</p>
        <div className="dh-matriz">
          {total.map((fila, i) => (
            <div className="dh-matriz-fila" key={i}>
              {fila.map((v, j) => (
                <span key={j} className={`dh-celda ${j === 3 ? 'pos' : 'rot'}`}>{fmt(v)}</span>
              ))}
            </div>
          ))}
        </div>
        <div className="dh-lectura">
          <span>Posición del efector: <b>x={Math.round(efector.x)}</b>, <b>y={Math.round(efector.y)}</b>, <b>z={Math.round(efector.z)}</b> mm</span>
        </div>
      </div>
    </div>
  );
}
