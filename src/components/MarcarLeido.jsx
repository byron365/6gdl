import { useEffect, useState } from 'react';

/**
 * Botón "Marcar como leído" con progreso guardado en localStorage.
 * Cada capítulo se identifica por su slug. El progreso total se comparte
 * con el resto del sitio mediante el mismo almacén ('ra-leidos').
 *
 * Props:
 *   slug: identificador del capítulo
 *   total: número total de capítulos (para el % global)
 */
const CLAVE = 'ra-leidos';

function leerSet() {
  try {
    const raw = localStorage.getItem(CLAVE);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function guardarSet(set) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify([...set]));
    // avisar a otras partes de la página (mismo documento)
    window.dispatchEvent(new CustomEvent('ra-leidos-cambio'));
  } catch {
    /* almacenamiento no disponible */
  }
}

export default function MarcarLeido({ slug, total }) {
  const [leido, setLeido] = useState(false);
  const [completados, setCompletados] = useState(0);

  useEffect(() => {
    const set = leerSet();
    setLeido(set.has(slug));
    setCompletados(set.size);

    const onCambio = () => {
      const s = leerSet();
      setLeido(s.has(slug));
      setCompletados(s.size);
    };
    window.addEventListener('ra-leidos-cambio', onCambio);
    return () => window.removeEventListener('ra-leidos-cambio', onCambio);
  }, [slug]);

  function alternar() {
    const set = leerSet();
    if (set.has(slug)) set.delete(slug);
    else set.add(slug);
    guardarSet(set);
    setLeido(set.has(slug));
    setCompletados(set.size);
  }

  const pct = total > 0 ? Math.round((completados / total) * 100) : 0;

  return (
    <div className="leido-barra">
      <button
        className={leido ? 'leido-btn hecho' : 'leido-btn'}
        onClick={alternar}
        aria-pressed={leido}
      >
        {leido ? (
          <>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>Leído</span>
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
            </svg>
            <span>Marcar como leído</span>
          </>
        )}
      </button>

      <div className="leido-progreso" title={`${completados} de ${total} capítulos`}>
        <div className="leido-track">
          <div className="leido-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="leido-texto">{completados}/{total} · {pct}%</span>
      </div>
    </div>
  );
}
