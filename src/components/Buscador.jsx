import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Buscador del manual. Descarga /search-index.json una sola vez (al abrir),
 * y filtra en cliente por título de capítulo, encabezado y texto.
 * Se abre con el botón o con la tecla "/". Navegación con flechas + Enter.
 */
export default function Buscador() {
  const [abierto, setAbierto] = useState(false);
  const [indice, setIndice] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [consulta, setConsulta] = useState('');
  const [resultados, setResultados] = useState([]);
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);

  // abrir/cerrar con teclado
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !abierto && !esCampoTexto(e.target)) {
        e.preventDefault();
        abrir();
      } else if (e.key === 'Escape' && abierto) {
        cerrar();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [abierto]);

  const cargarIndice = useCallback(async () => {
    if (indice || cargando) return;
    setCargando(true);
    try {
      const res = await fetch('/search-index.json');
      const data = await res.json();
      setIndice(data);
    } catch {
      setIndice([]);
    } finally {
      setCargando(false);
    }
  }, [indice, cargando]);

  function abrir() {
    setAbierto(true);
    cargarIndice();
    setTimeout(() => inputRef.current?.focus(), 30);
  }
  function cerrar() {
    setAbierto(false);
    setConsulta('');
    setResultados([]);
    setSel(0);
  }

  // búsqueda con puntuación simple por relevancia
  useEffect(() => {
    if (!consulta.trim() || !indice) {
      setResultados([]);
      return;
    }
    const terminos = normalizar(consulta).split(/\s+/).filter(Boolean);
    const puntuados = [];

    for (const reg of indice) {
      const enc = normalizar(reg.encabezado);
      const cap = normalizar(reg.capTitulo);
      const txt = normalizar(reg.texto);
      let score = 0;
      for (const t of terminos) {
        if (enc.includes(t)) score += 8;
        if (cap.includes(t)) score += 5;
        if (txt.includes(t)) score += 2;
      }
      if (score > 0) puntuados.push({ reg, score });
    }

    puntuados.sort((a, b) => b.score - a.score);
    setResultados(puntuados.slice(0, 12).map((p) => p.reg));
    setSel(0);
  }, [consulta, indice]);

  function onKeyInput(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSel((s) => Math.min(s + 1, resultados.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSel((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter' && resultados[sel]) {
      irA(resultados[sel]);
    }
  }

  function irA(reg) {
    const url = reg.ancla
      ? `/capitulos/${reg.slug}#${reg.ancla}`
      : `/capitulos/${reg.slug}`;
    window.location.href = url;
  }

  return (
    <>
      <button className="buscar-trigger" onClick={abrir} aria-label="Buscar (tecla /)">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="buscar-trigger-txt">Buscar</span>
        <kbd>/</kbd>
      </button>

      {abierto && (
        <div className="buscar-overlay" onClick={cerrar} role="dialog" aria-modal="true" aria-label="Buscar en el manual">
          <div className="buscar-panel" onClick={(e) => e.stopPropagation()}>
            <div className="buscar-input-row">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar conceptos, capítulos, fórmulas…"
                value={consulta}
                onChange={(e) => setConsulta(e.target.value)}
                onKeyDown={onKeyInput}
                aria-label="Texto de búsqueda"
              />
              <button className="buscar-cerrar" onClick={cerrar} aria-label="Cerrar">Esc</button>
            </div>

            <div className="buscar-resultados">
              {cargando && <p className="buscar-info">Cargando índice…</p>}
              {!cargando && consulta && resultados.length === 0 && (
                <p className="buscar-info">Sin resultados para «{consulta}».</p>
              )}
              {!consulta && (
                <p className="buscar-info">Escribe para buscar en los 16 capítulos.</p>
              )}
              {resultados.map((r, i) => (
                <button
                  key={`${r.slug}-${r.ancla}-${i}`}
                  className={i === sel ? 'buscar-item activo' : 'buscar-item'}
                  onClick={() => irA(r)}
                  onMouseEnter={() => setSel(i)}
                >
                  <span className="buscar-item-cap">Cap {r.capNumero}</span>
                  <span className="buscar-item-enc">{r.encabezado}</span>
                  <span className="buscar-item-frag">{recorte(r.texto, consulta)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function esCampoTexto(el) {
  const t = (el.tagName || '').toLowerCase();
  return t === 'input' || t === 'textarea' || el.isContentEditable;
}

function normalizar(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function recorte(texto, consulta) {
  if (!texto) return '';
  const t = normalizar(texto);
  const termino = normalizar(consulta).split(/\s+/)[0];
  const idx = t.indexOf(termino);
  if (idx < 0) return texto.slice(0, 90) + (texto.length > 90 ? '…' : '');
  const ini = Math.max(0, idx - 30);
  const fin = Math.min(texto.length, idx + 60);
  return (ini > 0 ? '…' : '') + texto.slice(ini, fin) + (fin < texto.length ? '…' : '');
}
