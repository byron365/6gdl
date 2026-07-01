import { useEffect, useState } from 'react';

/**
 * Resumen de progreso para la página de temario.
 * Lee el mismo almacén 'ra-leidos' y, además de mostrar el porcentaje global,
 * pinta un check sobre las filas de capítulo ya leídas (buscándolas por
 * data-slug en el DOM ya renderizado por Astro).
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

export default function ProgresoTemario({ total }) {
  const [completados, setCompletados] = useState(0);

  useEffect(() => {
    const aplicar = () => {
      const set = leerSet();
      setCompletados(set.size);
      // marcar filas leídas en el DOM
      document.querySelectorAll('[data-slug]').forEach((el) => {
        el.classList.toggle('cap-leido', set.has(el.getAttribute('data-slug')));
      });
    };
    aplicar();
    window.addEventListener('ra-leidos-cambio', aplicar);
    window.addEventListener('storage', aplicar);
    return () => {
      window.removeEventListener('ra-leidos-cambio', aplicar);
      window.removeEventListener('storage', aplicar);
    };
  }, []);

  const pct = total > 0 ? Math.round((completados / total) * 100) : 0;

  return (
    <div className="temario-progreso">
      <div className="temario-progreso-info">
        <span className="temario-progreso-num">{completados} de {total} capítulos</span>
        <span className="temario-progreso-pct">{pct}%</span>
      </div>
      <div className="temario-progreso-track">
        <div className="temario-progreso-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
