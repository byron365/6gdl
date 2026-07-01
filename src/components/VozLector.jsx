import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Lector por voz para capítulos.
 * Usa la Web Speech API (SpeechSynthesis) del navegador: sin dependencias
 * ni servidor. Lee el contenido del artículo dividido en fragmentos para
 * poder pausar, avanzar y resaltar el párrafo que se está leyendo.
 *
 * Props:
 *   targetSelector: selector del contenedor cuyo texto se leerá (.prose)
 */
export default function VozLector({ targetSelector = '.prose' }) {
  const [soportado, setSoportado] = useState(true);
  const [estado, setEstado] = useState('idle'); // idle | playing | paused
  const [voces, setVoces] = useState([]);
  const [vozId, setVozId] = useState('');
  const [velocidad, setVelocidad] = useState(1);
  const [progreso, setProgreso] = useState(0);
  const [flotanteVisible, setFlotanteVisible] = useState(false);

  const fragmentosRef = useRef([]); // [{ texto, el }]
  const indiceRef = useRef(0);
  const elResaltadoRef = useRef(null);
  const reproduciendoRef = useRef(false); // control fiable del flujo
  const tokenRef = useRef(0); // identifica el utterance vigente
  const barraRef = useRef(null); // barra original (en flujo)

  // mostrar el panel flotante solo cuando la barra original sale de vista
  useEffect(() => {
    const barra = barraRef.current;
    if (!barra) return;
    const obs = new IntersectionObserver(
      ([entry]) => setFlotanteVisible(!entry.isIntersecting),
      { rootMargin: '-8px 0px 0px 0px', threshold: 0 }
    );
    obs.observe(barra);
    return () => obs.disconnect();
  }, [soportado]);

  // --- comprobar soporte y cargar voces ----------------------------------
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSoportado(false);
      return;
    }

    const cargarVoces = () => {
      const todas = window.speechSynthesis.getVoices();
      // priorizar español
      const es = todas.filter((v) => v.lang.toLowerCase().startsWith('es'));
      const ordenadas = [...es, ...todas.filter((v) => !v.lang.toLowerCase().startsWith('es'))];
      setVoces(ordenadas);
      if (ordenadas.length && !vozId) {
        setVozId(ordenadas[0].voiceURI);
      }
    };

    cargarVoces();
    window.speechSynthesis.onvoiceschanged = cargarVoces;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- extraer fragmentos legibles del artículo --------------------------
  const construirFragmentos = useCallback(() => {
    const cont = document.querySelector(targetSelector);
    if (!cont) return [];
    // elementos de texto que tienen sentido leer, en orden de aparición
    const seleccion = cont.querySelectorAll(
      'h2, h3, h4, p, li, blockquote, th, td'
    );
    const frags = [];
    seleccion.forEach((el) => {
      // saltar fórmulas y bloques de código
      if (el.closest('pre') || el.classList.contains('katex-display')) return;
      const texto = limpiarTexto(el.textContent || '');
      if (texto.length < 2) return;
      frags.push({ texto, el });
    });
    return frags;
  }, [targetSelector]);

  function limpiarTexto(s) {
    return s.replace(/\s+/g, ' ').trim();
  }

  function quitarResaltado() {
    if (elResaltadoRef.current) {
      elResaltadoRef.current.classList.remove('voz-leyendo');
      elResaltadoRef.current = null;
    }
  }

  function resaltar(el) {
    quitarResaltado();
    if (!el) return;
    el.classList.add('voz-leyendo');
    elResaltadoRef.current = el;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // --- reproducir un fragmento y encadenar el siguiente ------------------
  const hablarDesde = useCallback(
    (i) => {
      const frags = fragmentosRef.current;
      if (i >= frags.length) {
        finalizar();
        return;
      }
      indiceRef.current = i;
      setProgreso(Math.round((i / frags.length) * 100));

      const { texto, el } = frags[i];
      resaltar(el);

      // token para identificar este utterance; si se cancela, su onend se ignora
      const miToken = ++tokenRef.current;

      const u = new SpeechSynthesisUtterance(texto);
      u.rate = velocidad;
      u.lang = 'es-ES';
      const voz = voces.find((v) => v.voiceURI === vozId);
      if (voz) {
        u.voice = voz;
        u.lang = voz.lang;
      }
      u.onend = () => {
        // sólo avanza si: seguimos reproduciendo Y este es el utterance vigente
        if (reproduciendoRef.current && miToken === tokenRef.current) {
          hablarDesde(i + 1);
        }
      };
      u.onerror = () => {
        if (reproduciendoRef.current && miToken === tokenRef.current) {
          hablarDesde(i + 1);
        }
      };
      window.speechSynthesis.speak(u);
    },
    [velocidad, voces, vozId]
  );

  function finalizar() {
    reproduciendoRef.current = false;
    tokenRef.current++; // invalida cualquier onend pendiente
    quitarResaltado();
    setEstado('idle');
    setProgreso(0);
    indiceRef.current = 0;
    window.speechSynthesis.cancel();
  }

  // --- controles ---------------------------------------------------------
  function reproducir() {
    if (estado === 'paused') {
      // reanudar = volver a hablar desde el fragmento donde se pausó.
      // (no usamos resume() nativo porque Chrome reinicia el fragmento)
      reproduciendoRef.current = true;
      setEstado('playing');
      hablarDesde(indiceRef.current);
      return;
    }
    window.speechSynthesis.cancel();
    fragmentosRef.current = construirFragmentos();
    if (!fragmentosRef.current.length) return;
    reproduciendoRef.current = true;
    setEstado('playing');
    hablarDesde(0);
  }

  function pausar() {
    // detenemos el habla pero conservamos el índice para reanudar luego
    reproduciendoRef.current = false;
    tokenRef.current++; // invalida el onend del fragmento en curso
    window.speechSynthesis.cancel();
    setEstado('paused');
  }

  function detener() {
    finalizar();
  }

  function saltar(dir) {
    const next = Math.max(0, indiceRef.current + dir);
    reproduciendoRef.current = true;
    tokenRef.current++; // invalida el onend del fragmento actual
    window.speechSynthesis.cancel();
    setEstado('playing');
    hablarDesde(next);
  }

  // limpiar al desmontar
  useEffect(() => () => finalizar(), []);

  if (!soportado) {
    return (
      <div className="voz-barra voz-no-soporte">
        <span>Tu navegador no admite lectura por voz. Prueba con Chrome, Edge o Safari.</span>
      </div>
    );
  }

  // bloque de controles reutilizable (barra y flotante comparten el mismo)
  const Controles = () => (
    <>
      <div className="voz-controles">
        {estado !== 'playing' ? (
          <button className="voz-btn voz-btn-main" onClick={reproducir} aria-label="Escuchar capítulo">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            <span className="voz-btn-txt">{estado === 'paused' ? 'Reanudar' : 'Escuchar'}</span>
          </button>
        ) : (
          <button className="voz-btn voz-btn-main" onClick={pausar} aria-label="Pausar">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>
            <span className="voz-btn-txt">Pausar</span>
          </button>
        )}

        <button className="voz-btn" onClick={() => saltar(-1)} aria-label="Párrafo anterior" disabled={estado === 'idle'}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
        </button>
        <button className="voz-btn" onClick={() => saltar(1)} aria-label="Párrafo siguiente" disabled={estado === 'idle'}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z"/></svg>
        </button>
        <button className="voz-btn" onClick={detener} aria-label="Detener" disabled={estado === 'idle'}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>
        </button>
      </div>

      <div className="voz-ajustes">
        <label className="voz-campo">
          <span className="voz-label">Voz</span>
          <select value={vozId} onChange={(e) => setVozId(e.target.value)}>
            {voces.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </label>

        <label className="voz-campo">
          <span className="voz-label">Velocidad {velocidad.toFixed(1)}×</span>
          <input
            type="range"
            min="0.6"
            max="1.6"
            step="0.1"
            value={velocidad}
            onChange={(e) => setVelocidad(parseFloat(e.target.value))}
          />
        </label>
      </div>

      {estado !== 'idle' && (
        <div className="voz-progreso" aria-hidden="true">
          <div className="voz-progreso-barra" style={{ width: `${progreso}%` }} />
        </div>
      )}
    </>
  );

  return (
    <>
      {/* barra original, en su sitio al inicio del capítulo */}
      <div className="voz-barra" ref={barraRef} role="region" aria-label="Lector por voz del capítulo">
        <Controles />
      </div>

      {/* panel flotante: aparece al hacer scroll más allá de la barra */}
      <div
        className={`voz-flotante ${flotanteVisible ? 'mostrar' : ''} ${estado !== 'idle' ? 'activo' : ''}`}
        aria-hidden={!flotanteVisible}
      >
        <Controles />
      </div>
    </>
  );
}
