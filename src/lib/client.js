// Renderiza diagramas Mermaid y maneja la barra de progreso de lectura.
// Se importa solo en páginas que lo necesitan.
import mermaid from 'mermaid';

function themeFor() {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  return isLight ? 'neutral' : 'dark';
}

function initMermaid() {
  mermaid.initialize({
    startOnLoad: false,
    theme: themeFor(),
    securityLevel: 'strict',
    fontFamily: 'Inter, system-ui, sans-serif',
    themeVariables: {
      primaryColor: '#16202f',
      primaryTextColor: '#e8eef5',
      primaryBorderColor: '#ff9e2c',
      lineColor: '#38d9c4',
      fontSize: '15px',
    },
  });
}

async function renderAll() {
  // El plugin rehype produce <pre class="mermaid-src" data-mermaid="true">CÓDIGO</pre>
  const blocks = document.querySelectorAll('pre.mermaid-src[data-mermaid]');
  let i = 0;
  for (const block of blocks) {
    const source = block.textContent || '';
    if (!source.trim()) continue;
    const container = document.createElement('div');
    container.className = 'mermaid-container';
    try {
      const { svg } = await mermaid.render(`mmd-${i++}`, source);
      container.innerHTML = svg;
      // botón de ampliar
      const btn = document.createElement('button');
      btn.className = 'mermaid-zoom-btn';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Ampliar diagrama');
      btn.title = 'Ampliar diagrama';
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>';
      container.appendChild(btn);
      container.classList.add('mermaid-ampliable');
      const abrir = () => abrirLightbox(container.querySelector('svg'));
      btn.addEventListener('click', (e) => { e.stopPropagation(); abrir(); });
      container.addEventListener('click', abrir);
      block.replaceWith(container);
    } catch (e) {
      // si falla, dejamos el bloque original visible
      console.warn('Mermaid render error:', e);
    }
  }
}

// Lightbox: amplía un diagrama centrado en pantalla
function abrirLightbox(svgEl) {
  if (!svgEl) return;
  let overlay = document.getElementById('mermaid-lightbox');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'mermaid-lightbox';
    overlay.className = 'mermaid-lightbox';
    overlay.innerHTML =
      '<div class="mermaid-lightbox-inner"><button class="mermaid-lightbox-cerrar" aria-label="Cerrar y volver">' +
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
      '<span>Volver</span></button><div class="mermaid-lightbox-svg"></div></div>';
    document.body.appendChild(overlay);
    const cerrar = () => overlay.classList.remove('abierto');
    overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrar(); });
    overlay.querySelector('.mermaid-lightbox-cerrar').addEventListener('click', cerrar);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(); });
  }
  const cont = overlay.querySelector('.mermaid-lightbox-svg');
  cont.innerHTML = '';
  const clon = svgEl.cloneNode(true);
  // quitar restricciones de tamaño que Mermaid pone inline, para que escale
  clon.removeAttribute('height');
  clon.removeAttribute('width');
  clon.style.maxWidth = 'none';
  clon.style.maxHeight = 'none';
  clon.style.width = '100%';
  clon.style.height = '100%';
  // asegurar viewBox para que conserve proporción al escalar
  if (!clon.getAttribute('viewBox')) {
    const vb = svgEl.viewBox && svgEl.viewBox.baseVal;
    if (vb && vb.width) clon.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.width} ${vb.height}`);
  }
  clon.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  cont.appendChild(clon);
  overlay.classList.add('abierto');
}

export function setupDiagrams() {
  initMermaid();
  renderAll();
}

export function setupReadProgress() {
  const bar = document.querySelector('.read-progress');
  if (!bar) return;
  const update = () => {
    const h = document.documentElement;
    const scrollable = h.scrollHeight - h.clientHeight;
    const pct = scrollable > 0 ? (h.scrollTop / scrollable) * 100 : 0;
    bar.style.width = `${pct}%`;
  };
  document.addEventListener('scroll', update, { passive: true });
  update();
}
