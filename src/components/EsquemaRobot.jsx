/**
 * Esquema SVG de la configuración de grados de libertad de cada tipo de robot.
 * Complementa la animación 3D: ésta muestra el movimiento, el esquema muestra
 * los ejes y articulaciones (P = prismática, R = rotacional) de forma técnica.
 *
 * No usa estado ni animación: es un diagrama estático ligero.
 * Prop: tipo = 'cartesiano' | 'cilindrico' | 'polar' | 'scara' | 'articulado'
 */
export default function EsquemaRobot({ tipo = 'cartesiano' }) {
  return (
    <figure className="esquema-robot">
      <svg viewBox="0 0 260 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={`Esquema de grados de libertad: robot ${tipo}`}>
        <Grid />
        {DIBUJOS[tipo] ? DIBUJOS[tipo]() : DIBUJOS.cartesiano()}
      </svg>
      <figcaption>{NOTAS[tipo]}</figcaption>
    </figure>
  );
}

const NOTAS = {
  cartesiano: 'Tres ejes prismáticos perpendiculares (P-P-P).',
  cilindrico: 'Una rotación de base (R) más dos prismáticas (P): vertical y radial.',
  polar: 'Dos rotaciones (R-R) más una prismática (P) de extensión.',
  scara: 'Dos ejes rotacionales paralelos (R-R) más una prismática vertical (P).',
  articulado: 'Tres ejes rotacionales (R-R-R), como hombro, codo y muñeca.',
};

function Grid() {
  return (
    <>
      <defs>
        <pattern id="esq-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="var(--axis-soft)" strokeWidth="0.4" opacity="0.22" />
        </pattern>
        <marker id="esq-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0 0L8 4L0 8z" fill="var(--axis)" />
        </marker>
        <marker id="esq-arrow-a" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0 0L8 4L0 8z" fill="var(--accent)" />
        </marker>
      </defs>
      <rect width="260" height="200" fill="url(#esq-grid)" />
    </>
  );
}

// etiqueta de articulación (R o P) en un punto
function Junta({ x, y, t }) {
  return (
    <g>
      <circle cx={x} cy={y} r="11" fill="var(--bg-elevated)" stroke="var(--accent)" strokeWidth="2" />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--accent)" fontFamily="monospace">{t}</text>
    </g>
  );
}
// flecha de eje prismático (doble punta = deslizamiento)
function EjeP({ x1, y1, x2, y2 }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--axis)" strokeWidth="2" markerStart="url(#esq-arrow)" markerEnd="url(#esq-arrow)" />;
}

const DIBUJOS = {
  cartesiano() {
    return (
      <g>
        {/* tres ejes prismáticos */}
        <EjeP x1={40} y1={150} x2={150} y2={150} />
        <EjeP x1={60} y1={170} x2={60} y2={60} />
        <line x1={50} y1={160} x2={110} y2={110} stroke="var(--axis)" strokeWidth="2" markerStart="url(#esq-arrow)" markerEnd="url(#esq-arrow)" />
        <text x={158} y={154} fontSize="13" fill="var(--ink-soft)" fontFamily="monospace">X</text>
        <text x={50} y={52} fontSize="13" fill="var(--ink-soft)" fontFamily="monospace">Z</text>
        <text x={112} y={108} fontSize="13" fill="var(--ink-soft)" fontFamily="monospace">Y</text>
        <text x={150} y={185} fontSize="11" fill="var(--accent)" fontFamily="monospace">P · P · P</text>
        <circle cx={60} cy={150} r="5" fill="var(--accent)" />
      </g>
    );
  },
  cilindrico() {
    return (
      <g>
        {/* base con rotación */}
        <ellipse cx={90} cy={170} rx={34} ry={10} fill="var(--surface)" stroke="var(--line-strong)" />
        <path d="M64 170 A 30 10 0 0 1 116 170" fill="none" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#esq-arrow-a)" />
        {/* prismática vertical */}
        <EjeP x1={90} y1={160} x2={90} y2={60} />
        {/* prismática radial */}
        <EjeP x1={90} y1={80} x2={180} y2={80} />
        <Junta x={90} y={170} t="R" />
        <text x={96} y={56} fontSize="12" fill="var(--ink-soft)" fontFamily="monospace">P</text>
        <text x={184} y={84} fontSize="12" fill="var(--ink-soft)" fontFamily="monospace">P</text>
        <text x={88} y={195} fontSize="11" fill="var(--accent)" fontFamily="monospace" textAnchor="middle">R · P · P</text>
      </g>
    );
  },
  polar() {
    return (
      <g>
        <ellipse cx={80} cy={170} rx={32} ry={9} fill="var(--surface)" stroke="var(--line-strong)" />
        {/* rotación base */}
        <path d="M56 170 A 28 9 0 0 1 104 170" fill="none" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#esq-arrow-a)" />
        {/* tronco */}
        <line x1={80} y1={170} x2={80} y2={110} stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" />
        {/* rotación hombro */}
        <path d="M64 110 A 18 18 0 0 1 96 100" fill="none" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#esq-arrow-a)" />
        {/* prismática de extensión */}
        <EjeP x1={90} y1={102} x2={185} y2={70} />
        <Junta x={80} y={170} t="R" />
        <Junta x={80} y={110} t="R" />
        <text x={188} y={70} fontSize="12" fill="var(--ink-soft)" fontFamily="monospace">P</text>
        <text x={78} y={195} fontSize="11" fill="var(--accent)" fontFamily="monospace" textAnchor="middle">R · R · P</text>
      </g>
    );
  },
  scara() {
    return (
      <g>
        {/* dos eslabones horizontales (vista superior) */}
        <line x1={60} y1={90} x2={130} y2={90} stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" />
        <line x1={130} y1={90} x2={185} y2={120} stroke="var(--accent-soft)" strokeWidth="6" strokeLinecap="round" />
        <path d="M48 78 A 16 16 0 0 1 72 74" fill="none" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#esq-arrow-a)" />
        <path d="M120 80 A 14 14 0 0 1 142 80" fill="none" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#esq-arrow-a)" />
        {/* prismática vertical en el efector */}
        <EjeP x1={185} y1={100} x2={185} y2={150} />
        <Junta x={60} y={90} t="R" />
        <Junta x={130} y={90} t="R" />
        <text x={192} y={128} fontSize="12" fill="var(--ink-soft)" fontFamily="monospace">P</text>
        <text x={120} y={185} fontSize="11" fill="var(--accent)" fontFamily="monospace" textAnchor="middle">R · R · P</text>
      </g>
    );
  },
  articulado() {
    return (
      <g>
        <ellipse cx={70} cy={175} rx={28} ry={8} fill="var(--surface)" stroke="var(--line-strong)" />
        <line x1={70} y1={175} x2={100} y2={120} stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" />
        <line x1={100} y1={120} x2={160} y2={95} stroke="var(--accent-soft)" strokeWidth="5" strokeLinecap="round" />
        <line x1={160} y1={95} x2={195} y2={120} stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
        <Junta x={70} y={175} t="R" />
        <Junta x={100} y={120} t="R" />
        <Junta x={160} y={95} t="R" />
        <circle cx={195} cy={120} r="6" fill="var(--axis)" />
        <text x={66} y={197} fontSize="11" fill="var(--accent)" fontFamily="monospace" textAnchor="middle">R · R · R</text>
      </g>
    );
  },
};
